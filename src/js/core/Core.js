/* @flow */
'use strict';

import EventEmitter from 'events';
import DataManager from '../data/DataManager';
import DeviceList, { getDeviceList } from '../device/DeviceList';
import Device from '../device/Device';


import * as TRANSPORT from '../constants/transport';
import * as DEVICE from '../constants/device';
import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';

import { RESPONSE_EVENT, UiMessage, DeviceMessage, TransportMessage, ResponseMessage } from './CoreMessage';

import AbstractMethod from './methods/AbstractMethod';
import { find as findMethod } from './methods';

import { create as createDeferred } from '../utils/deferred';

import { resolveAfter } from '../utils/promiseUtils'; // TODO: just tmp. remove
import { getPathFromIndex } from '../utils/pathUtils';
import { state as browserState } from '../utils/browser';

import Log, { init as initLog, enable as enableLog } from '../utils/debug';

import { parse as parseSettings } from '../entrypoints/ConnectSettings';

import type { Device as DeviceTyped } from 'trezor-connect';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';
import type { Deferred, UiPromiseResponse, CoreMessage } from 'flowtype';

// Public variables
let _core: Core; // Class with event emitter
let _deviceList: ?DeviceList; // Instance of DeviceList
let _popupPromise: ?Deferred<void>; // Waiting for popup handshake
let _uiPromises: Array<Deferred<UiPromiseResponse>> = []; // Waiting for ui response
const _callMethods: Array<AbstractMethod> = [];
let _preferredDevice: any; // TODO: type

export const CORE_EVENT: string = 'CORE_EVENT';

// custom log
const _log: Log = initLog('Core');

/**
 * Creates an instance of _popupPromise.
 * If Core is used without popup this promise should be always resolved
 * @returns {Promise<void>}
 * @memberof Core
 */
const getPopupPromise = (requestWindow: boolean = true): Deferred<void> => {
    // request ui window (used with modal)
    if (requestWindow) { postMessage(new UiMessage(UI.REQUEST_UI_WINDOW)); }
    if (!_popupPromise) { _popupPromise = createDeferred(); }
    return _popupPromise;
};

/**
 * Creates an instance of uiPromise.
 * @returns {Promise<string>}
 * @memberof Core
 */

const findUiPromise = (callId: number, promiseEvent: string): ?Deferred<UiPromiseResponse> => {
    return _uiPromises.find(p => p.id === promiseEvent);
};

const createUiPromise = (promiseEvent: string, device?: Device): Deferred<UiPromiseResponse> => {
    const uiPromise: Deferred<UiPromiseResponse> = createDeferred(promiseEvent, device);
    _uiPromises.push(uiPromise);
    return uiPromise;
};

const removeUiPromise = (promise: Deferred<UiPromiseResponse>): void => {
    _uiPromises = _uiPromises.filter(p => p !== promise);
};

/**
 * Emit message to listener (parent).
 * @param {CoreMessage} message
 * @returns {void}
 * @memberof Core
 */
const postMessage = (message: CoreMessage): void => {
    if (message.event === RESPONSE_EVENT) {
        const index: number = _callMethods.findIndex(call => call && call.responseID === message.id);
        if (index >= 0)
            _callMethods.splice(index, 1);
    }
    _core.emit(CORE_EVENT, message);
};

/**
 * Handle incoming message.
 * @param {Object} data
 * @returns {void}
 * @memberof Core
 */
export const handleMessage = (message: CoreMessage, isTrustedOrigin: boolean = false): void => {
    _log.log('handle message in core', isTrustedOrigin, message);

    const safeMessages: Array<string> = [
        IFRAME.CALL,
        POPUP.CLOSED,
        UI.CHANGE_SETTINGS,
        TRANSPORT.RECONNECT
    ];

    if (!isTrustedOrigin && safeMessages.indexOf(message.type) === -1) {
        console.error('Message not trusted', message);
        return;
    }

    switch (message.type) {
        case POPUP.HANDSHAKE :
            getPopupPromise(false).resolve();
            break;
        case POPUP.CLOSED :
            onPopupClosed();
            break;

        case UI.CHANGE_SETTINGS :
            enableLog(parseSettings(message.payload).debug);
            break;

        case TRANSPORT.RECONNECT :
            reconnectTransport();
            break;

        // messages from UI (popup/modal...)
        case UI.RECEIVE_DEVICE :
        case UI.RECEIVE_CONFIRMATION :
        case UI.RECEIVE_PERMISSION :
        case UI.RECEIVE_PIN :
        case UI.RECEIVE_PASSPHRASE :
        case UI.RECEIVE_ACCOUNT :
        case UI.CHANGE_ACCOUNT :
        case UI.RECEIVE_FEE :
        case UI.RECEIVE_BROWSER :
            const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, message.type);
            if (uiPromise) {
                uiPromise.resolve({ event: message.type, payload: message.payload });
                removeUiPromise(uiPromise);
            }
            break;

        // message from index
        case IFRAME.CALL :
            onCall(message).catch(error => {
                _log.debug('onCall error', error);
            });
            break;
    }
};

/**
 * Find device by device path. Returned device may be unacquired.
 * @param {string|undefined} devicePath
 * @returns {Promise<Device>}
 * @memberof Core
 */
const initDevice = async (method: AbstractMethod): Promise<Device> => {
    if (!_deviceList) {
        throw ERROR.NO_TRANSPORT;
    }

    const isWebUsb: boolean = _deviceList.transportVersion().indexOf('webusb') >= 0;

    let device: ?Device;
    if (method.devicePath) {
        device = _deviceList.getDevice(method.devicePath);
    } else {
        let devicesCount: number = _deviceList.length();
        let selectedDevicePath: string;
        if (devicesCount === 1 && !isWebUsb) {
            // there is only one device available. use it
            selectedDevicePath = _deviceList.getFirstDevicePath();
            device = _deviceList.getDevice(selectedDevicePath);
        } else {
            // no devices available

            // initialize uiPromise instance which will catch changes in _deviceList (see: handleDeviceSelectionChanges function)
            // but do not wait for resolve yet
            createUiPromise(UI.RECEIVE_DEVICE);

            // wait for popup handshake
            await getPopupPromise().promise;

            // check again for available devices
            // there is a possible race condition before popup open
            devicesCount = _deviceList.length();
            if (devicesCount === 1 && !isWebUsb) {
                // there is one device available. use it
                selectedDevicePath = _deviceList.getFirstDevicePath();
                device = _deviceList.getDevice(selectedDevicePath);
            } else {
                // request select device view
                postMessage(new UiMessage(UI.SELECT_DEVICE, {
                    webusb: isWebUsb,
                    devices: _deviceList.asArray()
                }));

                // wait for device selection
                const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(method.responseID, UI.RECEIVE_DEVICE);
                if (uiPromise) {
                    const uiResp: UiPromiseResponse = await uiPromise.promise;
                    if (uiResp.payload.remember) {
                        _preferredDevice = uiResp.payload.device;
                    }
                    selectedDevicePath = uiResp.payload.device.path;
                    device = _deviceList.getDevice(selectedDevicePath);
                }
            }
        }
    }

    if (!device) {
        throw ERROR.DEVICE_NOT_FOUND;
    }
    return device;
};

/**
 * Check device state.
 * @param {Device} device
 * @param {string} requiredFirmware
 * @returns {string|null}
 * @memberof Core
 */
const checkUnexpectedState = (device: Device, requiredFirmware: string): ?string => {
    if (device.isBootloader()) {
        return UI.BOOTLOADER;
    }
    if (!device.isInitialized()) {
        return UI.INITIALIZE;
    }
    if (!device.atLeast(requiredFirmware)) {
        return UI.FIRMWARE;
    }
    return null;
};

/**
 * Force authentication by getting public key of first account
 * @param {Device} device
 * @returns {Promise<void>}
 * @memberof Core
 */
const requestAuthentication = async (device: Device): Promise<void> => {
    // wait for popup handshake
    await getPopupPromise().promise;

    // show pin and passphrase
    const path: Array<number> = getPathFromIndex(1, 0, 0);
    const response = await device.getCommands().getPublicKey(path, 'Bitcoin');
};

/**
 * Force authentication by getting public key of first account
 * @param {Device} device
 * @returns {Promise<void>}
 * @memberof Core
 */
const checkDeviceState = async (device: Device, state: ?string): Promise<boolean> => {
    if (!state) return true;

    // wait for popup handshake
    await getPopupPromise().promise;

    // request 0 xpub (same as in GetDeviceState method)
    const response = await device.getCommands().getPublicKey([1, 0, 0], 'Bitcoin');

    // console.warn("::::STATE COMPARE:", response.message.xpub, "expected to be:", state)

    return response.message.xpub === state;
};

/**
 * Processing incoming message.
 * This method is async that's why it returns Promise but the real response is passed by postMessage(new ResponseMessage)
 * @param {Object} incomingData
 * @returns {Promise<void>}
 * @memberof Core
 */
export const onCall = async (message: CoreMessage): Promise<void> => {
    if (!message.id || !message.payload) {
        throw ERROR.INVALID_PARAMETERS;
    }

    if (_preferredDevice && !message.payload.device) {
        message.payload.device = _preferredDevice;
    }

    const responseID: number = message.id;
    const trustedHost: boolean = DataManager.getSettings('trustedHost');
    const isUsingPopup: boolean = DataManager.getSettings('popup');

    // find method and parse incoming params
    let method: AbstractMethod;
    try {
        method = findMethod(message);
        // bind callbacks
        method.postMessage = postMessage;
        method.getPopupPromise = getPopupPromise;
        method.createUiPromise = createUiPromise;
        method.findUiPromise = findUiPromise;
        method.removeUiPromise = removeUiPromise;
    } catch (error) {
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        postMessage(new ResponseMessage(responseID, false, { error: ERROR.INVALID_PARAMETERS.message + ': ' + error.message }));
        throw ERROR.INVALID_PARAMETERS;
    }

    //_callMethods[responseID] = method;
    _callMethods.push(method);

    let messageResponse: ?ResponseMessage;

    if (!browserState.supported) {
        // wait for popup handshake
        await getPopupPromise().promise;
        // show message about browser
        postMessage(new UiMessage(UI.BROWSER_NOT_SUPPORTED, browserState));
        throw ERROR.BROWSER;
    } else if (browserState.outdated) {
        if (isUsingPopup) {
            // wait for popup handshake
            await getPopupPromise().promise;
            // show message about browser
            postMessage(new UiMessage(UI.BROWSER_OUTDATED, browserState));
            // wait for user interaction
            const uiPromise: Deferred<UiPromiseResponse> = createUiPromise(UI.RECEIVE_BROWSER);
            const uiResp: UiPromiseResponse = await uiPromise.promise;
        } else {
            // just show message about browser
            postMessage(new UiMessage(UI.BROWSER_OUTDATED, browserState));
        }
    }

    // this method is not using device, there is no need to acquire
    if (!method.useDevice) {
        // TODO: call function and handle interruptions
        // const response: Object = await _parameters.method.apply(this, [ parameters, callbacks ]);
        // messageResponse = new ResponseMessage(_parameters.responseID, true, response);
        // try {
        //     const callbacks2: MethodCallbacks = {
        //         device,
        //         postMessage,
        //         getPopupPromise,
        //         createUiPromise,
        //         findUiPromise,
        //         removeUiPromise
        //     };
        //     const response: Object = await parameters.method.apply(this, [ parameters, callbacks2 ]);
        //     var messageResponse2 = new ResponseMessage(parameters.responseID, true, response);
        //     postMessage(messageResponse2);
        //     return Promise.resolve();

        // } catch (error1) {
        //     console.error("WEBUS", error1);
        // }
    }

    // find device
    let device: Device;
    try {
        device = await initDevice(method);
    } catch (error) {
        if (error === ERROR.NO_TRANSPORT) {
            // wait for popup handshake
            await getPopupPromise().promise;
            // show message about transport
            postMessage(new UiMessage(UI.TRANSPORT));
        } else {
            // cancel popup request
            postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        }
        // TODO: this should not be returned here before user agrees on "read" perms...
        postMessage(new ResponseMessage(responseID, false, { error: error.message }));
        throw error;
    }

    method.device = device;
    method.devicePath = device.getDevicePath();

    // find pending calls to this device
    const previousCall: Array<AbstractMethod> = _callMethods.filter(call => call && call !== method && call.devicePath === method.devicePath);
    if (previousCall.length > 0 && method.overridePreviousCall) {
        // set flag for each pending method
        previousCall.forEach(call => { call.overridden = true } );
        // interrupt potential communication with device. this should throw error in try/catch block below
        // this error will apply to the last item of pending methods
        await device.override(ERROR.CALL_OVERRIDE);
        // if current method was overridden while waiting for device.override result
        // return response with status false
        if (method.overridden) {
            postMessage(new ResponseMessage(method.responseID, false, { error: ERROR.CALL_OVERRIDE.message, code: ERROR.CALL_OVERRIDE.code }));
            throw ERROR.CALL_OVERRIDE;
        }
    } else if (device.isRunning()) {
        if (!device.isLoaded()) {
            // corner case
            // device didn't finish loading for the first time. @see DeviceList._createAndSaveDevice
            // wait for self-release and then carry on
            await device.waitForFirstRun();
        } else {
            postMessage(new ResponseMessage(responseID, false, { error: ERROR.DEVICE_CALL_IN_PROGRESS.message }));
            throw ERROR.DEVICE_CALL_IN_PROGRESS;
        }
    }

    // TODO: nicer
    //if (method.deviceInstance) {
        device.setInstance(method.deviceInstance);
    //}

    if (method.expectedDeviceState) {
        device.setExpectedState(method.deviceState);
        // reset state (for T2) and reset cachedPassphrase
        if (!method.deviceState) {
            device.setState(null);
            device.setPassphrase(null);
        }

    }

    // device is available
    // set public variables, listeners and run method
    device.on(DEVICE.PIN, onDevicePinHandler);
    device.on(DEVICE.PASSPHRASE, method.useEmptyPassphrase ? onEmptyPassphraseHandler : onDevicePassphraseHandler);
    device.on(DEVICE.PASSPHRASE_ON_DEVICE, () => {
        postMessage(new UiMessage(UI.REQUEST_PASSPHRASE_ON_DEVICE, { device: device.toMessageObject() }));
    });
    // device.on(DEVICE.PASSPHRASE, onDevicePassphraseHandler);
    device.on(DEVICE.BUTTON, onDeviceButtonHandler);
    device.on(DEVICE.AUTHENTICATED, () => {
        if (!method.useUi) { postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST)); }
    });

    // before acquire session, check if UI will be needed in future
    // and if device is already authenticated
    if (!method.useUi && device.isAuthenticated(method.useEmptyPassphrase)) {
        // TODO ???
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
    }

    try {
        // This function will run inside Device.run() after device will be acquired and initialized
        const inner = async (): Promise<void> => {
            // check if device is in unexpected mode (bootloader, not-initialized, old firmware)
            const unexpectedMode: ?(typeof UI.BOOTLOADER | typeof UI.INITIALIZE | typeof UI.FIRMWARE) = device.hasUnexpectedMode(method.requiredFirmware);
            if (unexpectedMode) {
                // wait for popup handshake
                await getPopupPromise().promise;
                // show unexpected state information
                postMessage(new UiMessage(unexpectedMode, device.toMessageObject()));

                // wait for device disconnect
                await createUiPromise(DEVICE.DISCONNECT, device).promise;
                // interrupt running process and go to "final" block
                return Promise.resolve();
            }

            // device is ready to go

            // check if device state is correct (correct checksum)
            // const correctState: boolean = await checkDeviceState(device, method.deviceState);
            // if (!correctState) {
                // wait for popup handshake
                // await getPopupPromise().promise;

                // device.clearPassphrase();

                // messageResponse = new ResponseMessage(responseID, false, { error: 'Device state is incorrect' });
                // closePopup();
                // // interrupt running process and go to "final" block
                // return Promise.resolve();
            // }



            // check and request permissions
            method.checkPermissions();
            if (!trustedHost && method.requiredPermissions.length > 0) {
                // show permissions in UI
                const permitted: boolean = await method.requestPermissions();
                if (!permitted) {
                    postMessage(new ResponseMessage(method.responseID, false, { error: ERROR.PERMISSIONS_NOT_GRANTED.message }));
                    closePopup();

                    return Promise.resolve();
                }
            }

            // before authentication, ask for confirmation if needed [export xpub, sign message]
            if (!trustedHost && typeof method.confirmation === 'function') {
                // show confirmation in UI
                const confirmed: boolean = await method.confirmation();
                if (!confirmed) {
                    postMessage(new ResponseMessage(method.responseID, false, { error: 'Cancelled' }));
                    closePopup();

                    return Promise.resolve();
                }
            }

            // Make sure that device will display pin/passphrase
            if (method.useUi && (method.deviceState || !device.isAuthenticated(method.useEmptyPassphrase))) {
                // wait for popup handshake
                await getPopupPromise().promise;

                try {
                    const deviceState: string = await device.getCommands().getDeviceState();
                    // validate expected state (fallback for T1. T2 will throw this error in DeviceCommands 'PassphraseStateRequest')
                    const isT1: boolean = (device.features && device.features.major_version === 1)
                    if (isT1 && method.deviceState && method.deviceState !== deviceState) {
                        throw new Error('Passphrase is incorrect');
                    }
                } catch (error) {
                    // catch wrong pin
                    if (error.message === ERROR.INVALID_PIN_ERROR_MESSAGE) {
                        postMessage(new UiMessage(UI.INVALID_PIN, { device: device.toMessageObject() }));
                        return inner();
                    } else {
                        // other error
                        postMessage(new ResponseMessage(method.responseID, false, { error: error.message }));
                        closePopup();
                        // clear cached passphrase. its nod valid
                        device.clearPassphrase();
                        device.setState(null);

                        return Promise.resolve();
                    }
                }
            }

            // make sure that popup is opened
            if (method.useUi) {
                await getPopupPromise().promise;
            }

            // run method
            try {
                const response: Object = await method.run();
                messageResponse = new ResponseMessage(method.responseID, true, response);
            } catch (error) {
                // device.clearPassphrase();

                if (!method) {
                    return Promise.resolve();
                }

                if (error.custom) {
                    delete error.custom;
                    postMessage(new ResponseMessage(method.responseID, false, error));
                } else {
                    postMessage(new ResponseMessage(method.responseID, false, { error: error.message, code: error.code }));
                }

                // device.release();
                device.removeAllListeners();
                closePopup();
                cleanup();

                return Promise.resolve();
            }
            closePopup();
        };

        // run inner function
        await device.run(inner, { keepSession: method.keepSession, useEmptyPassphrase: method.useEmptyPassphrase });

    } catch (error) {
        if (method) {
            postMessage(new ResponseMessage(method.responseID, false, { error: error.message || error, code: error.code }));
        }
    } finally {
        // Work done
        _log.log('onCall::finally', messageResponse);
        // device.release();
        // device.removeAllListeners();
        device.cleanup();
        cleanup();

        if (messageResponse) {
            postMessage(messageResponse);
        }
    }
};

/**
 * Clean up all variables and references.
 * @returns {void}
 * @memberof Core
 */
const cleanup = (): void => {
    // closePopup(); // this causes problem when action is interrupted (example: bootloader mode)
    _popupPromise = null;
    _uiPromises = []; // TODO: remove only promises with params callId
    _log.log('Cleanup...');
};

/**
 * Force close popup.
 * @returns {void}
 * @memberof Core
 */
const closePopup = (): void => {
    postMessage(new UiMessage(UI.CLOSE_UI_WINDOW));
};

/**
 * Handle button request from Device.
 * @param {string} code
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDeviceButtonHandler = async (device: Device, code: string): Promise<void> => {
    postMessage(new DeviceMessage(DEVICE.BUTTON, { device: device.toMessageObject(), code: code }));
    postMessage(new UiMessage(UI.REQUEST_BUTTON, { device: device.toMessageObject(), code: code }));
};

/**
 * Handle pin request from Device.
 * @param {string} type
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePinHandler = async (device: Device, type: string, callback: (error: any, success: any) => void): Promise<void> => {
    // request pin view
    postMessage(new UiMessage(UI.REQUEST_PIN, { device: device.toMessageObject() }));
    // wait for pin
    const uiResp: UiPromiseResponse = await createUiPromise(UI.RECEIVE_PIN, device).promise;
    const pin: string = uiResp.payload;
    // callback.apply(null, [null, pin]);
    callback(null, pin);
};

/**
 * Handle pin request from Device.
 * @param {Function} callback // TODO: add params
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePassphraseHandler = async (device: Device, callback: (error: any, success: any) => void): Promise<void> => {
    // request passphrase view
    postMessage(new UiMessage(UI.REQUEST_PASSPHRASE, { device: device.toMessageObject() }));
    // wait for passphrase

    const uiResp: UiPromiseResponse = await createUiPromise(UI.RECEIVE_PASSPHRASE, device).promise;
    const pass: string = uiResp.payload.value;
    const save: boolean = uiResp.payload.save;
    DataManager.isPassphraseCached(save);
    // callback.apply(null, [null, pass]);
    callback(null, pass);
};

const onEmptyPassphraseHandler = async (device: Device, callback: (error: any, success: any) => void): Promise<void> => {
    callback(null, '');
};

/**
 * Handle popup closed by user.
 * @returns {void}
 * @memberof Core
 */
const onPopupClosed = (): void => {
    if (!_popupPromise) return;

    // Device was already acquired. Try to interrupt running action which will throw error from onCall try/catch block
    if (_deviceList && _deviceList.asArray().length > 0) {
        _deviceList.allDevices().forEach(d => {
            if (d.isUsedHere()) {
                d.interruptionFromUser(ERROR.POPUP_CLOSED);
            } else {
                const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, DEVICE.DISCONNECT);
                if (uiPromise) {
                    uiPromise.resolve({ event: ERROR.POPUP_CLOSED.message, payload: null });
                } else {
                    _callMethods.forEach(m => {
                        postMessage(new ResponseMessage(m.responseID, false, { error: ERROR.POPUP_CLOSED.message }));
                    });
                }
            }
        });

        cleanup();
    // Waiting for device. Throw error before onCall try/catch block
    } else {
        if (_uiPromises.length > 0) {
            _uiPromises.forEach(p => {
                p.reject(ERROR.POPUP_CLOSED);
            });
            _uiPromises = [];
        }
        _popupPromise.reject(ERROR.POPUP_CLOSED);
        _popupPromise = null;
        cleanup();
    }
};

/**
 * Handle DeviceList changes.
 * If there is uiPromise waiting for device selection update view.
 * Used in initDevice function
 * @returns {void}
 * @memberof Core
 */
const handleDeviceSelectionChanges = (interruptDevice: ?DeviceTyped = null): void => {
    // update list of devices in popup
    const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, UI.RECEIVE_DEVICE);
    if (uiPromise && _deviceList) {
        const list: Array<Object> = _deviceList.asArray();
        const isWebUsb: boolean = _deviceList.transportVersion().indexOf('webusb') >= 0;

        if (list.length === 1 && !isWebUsb) {
            // there is only one device. use it
            // resolve uiPromise to looks like it's a user choice (see: handleMessage function)
            uiPromise.resolve({ event: UI.RECEIVE_DEVICE, payload: { device: list[0] } });
            removeUiPromise(uiPromise);
        } else {
            // update device selection list view
            postMessage(new UiMessage(UI.SELECT_DEVICE, {
                webusb: isWebUsb,
                devices: list
            }));
        }
    }

    // device was disconnected, interrupt pending uiPromises for this device
    if (interruptDevice) {
        const path: string = interruptDevice.path;
        let shouldClosePopup: boolean = false;
        _uiPromises.forEach((p: Deferred<UiPromiseResponse>) => {
            if (p.device && p.device.getDevicePath() === path) {
                if (p.id === DEVICE.DISCONNECT) {
                    p.resolve({ event: DEVICE.DISCONNECT, payload: null });
                }
                shouldClosePopup = true;
            }
        });

        if (_preferredDevice && _preferredDevice.path === path) {
            _preferredDevice = null;
        }

        if (shouldClosePopup) {
            closePopup();
            cleanup();
        }
    }
};

/**
 * Start DeviceList with listeners.
 * @returns {Promise<void>}
 * @memberof Core
 */
const initDeviceList = async (settings: ConnectSettings): Promise<void> => {
    try {
        _deviceList = await getDeviceList();

        // postMessage(new TransportMessage(TRANSPORT.START, {
        //     type: _deviceList.transportType(),
        //     version: _deviceList.transportVersion()
        // }));

        _deviceList.on(DEVICE.CONNECT, (device: DeviceTyped) => {
            handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.CONNECT, device));
        });

        _deviceList.on(DEVICE.CONNECT_UNACQUIRED, (device: DeviceTyped) => {
            handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.CONNECT_UNACQUIRED, device));
        });

        _deviceList.on(DEVICE.DISCONNECT, (device: DeviceTyped) => {
            handleDeviceSelectionChanges(device);
            postMessage(new DeviceMessage(DEVICE.DISCONNECT, device));
        });

        _deviceList.on(DEVICE.DISCONNECT_UNACQUIRED, (device: DeviceTyped) => {
            postMessage(new DeviceMessage(DEVICE.DISCONNECT_UNACQUIRED, device));
        });

        _deviceList.on(DEVICE.CHANGED, (device: DeviceTyped) => {
            postMessage(new DeviceMessage(DEVICE.CHANGED, device));
        });

        _deviceList.on(TRANSPORT.ERROR, async (error) => {
            _log.error('TRANSPORT ERROR', error);
            if (_deviceList)
                _deviceList.disconnectDevices();
            _deviceList = null;
            postMessage(new TransportMessage(TRANSPORT.ERROR, error.message || error));
            // if transport fails during app lifetime, try to reconnect
            if (settings.transportReconnect) {
                await resolveAfter(1000, null);
                await initDeviceList(settings);
            }
        });

        _deviceList.on(TRANSPORT.START, (transportType) => postMessage(new TransportMessage(TRANSPORT.START, transportType)));
        _deviceList.on(TRANSPORT.UNREADABLE, () => postMessage(new TransportMessage(TRANSPORT.UNREADABLE)));
    } catch (error) {
        _deviceList = null;
        if (!settings.transportReconnect) {
            throw error;
        } else {
            postMessage(new TransportMessage(TRANSPORT.ERROR, error.message || error));
            await resolveAfter(3000, null);
            // try to reconnect
            await initDeviceList(settings);
        }
    }
};

/**
 * An event emitter for communication with parent. entrypoint/library.js
 * @extends EventEmitter
 * @memberof Core
 */
export class Core extends EventEmitter {
    constructor() {
        super();
    }
    handleMessage(message: Object, isTrustedOrigin: boolean): void {
        handleMessage(message, isTrustedOrigin);
    }
    onBeforeUnload(): void {
        if (_deviceList) {
            _deviceList.onBeforeUnload();
        }
    }
}

/**
 * Init instance of Core event emitter.
 * @returns {Core}
 * @memberof Core
 */
export const initCore = (): Core => {
    _core = new Core();
    return _core;
};

/**
 * Module initialization.
 * This will download the config.json, start DeviceList, init Core emitter instance.
 * Returns Core, an event emitter instance.
 * @param {Object} settings - optional // TODO
 * @returns {Promise<Core>}
 * @memberof Core
 */
export const init = async (settings: ConnectSettings): Promise<Core> => {
    try {
        _log.enabled = settings.debug;
        await DataManager.load(settings);
        await initCore();
        return _core;
    } catch (error) {
        // TODO: kill app
        _log.log('init error', error);
        throw error;
    }
};

export const initTransport = async (settings: ConnectSettings): Promise<void> => {
    try {
        if (!settings.transportReconnect) {
            // try only once, if it fails kill and throw initialization error
            await initDeviceList(settings);
        } else {
            // don't wait for DeviceList result, further communication will be thru TRANSPORT events
            initDeviceList(settings);
        }
    } catch (error) {
        _log.log('initTransport', error);
        throw error;
    }
}

const reconnectTransport = async (): Promise<void> => {
    if (DataManager.getSettings('transportReconnect')) {
        return;
    }

    try {
        await initDeviceList(DataManager.getSettings());
    } catch (error) {
        postMessage(new TransportMessage(TRANSPORT.ERROR, error.message || error));
    }
}
