/* @flow */
'use strict';

import EventEmitter from 'events';
import DataManager from '../data/DataManager';
import DeviceList from '../device/DeviceList';
import Device from '../device/Device';

import { CORE_EVENT, RESPONSE_EVENT } from '../constants';
import * as TRANSPORT from '../constants/transport';
import * as DEVICE from '../constants/device';
import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';

import { UiMessage, DeviceMessage, TransportMessage, ResponseMessage } from '../message/builder';

import AbstractMethod from './methods/AbstractMethod';
import { find as findMethod } from './methods';

import { create as createDeferred } from '../utils/deferred';

import { resolveAfter } from '../utils/promiseUtils';
import { state as browserState } from '../utils/browser';

import Log, { init as initLog, enable as enableLog } from '../utils/debug';

import { parse as parseSettings } from '../data/ConnectSettings';

import type { ConnectSettings } from '../data/ConnectSettings';
import type { UiPromiseResponse } from 'flowtype';
import type { Device as DeviceTyped, Deferred, CoreMessage } from '../types';
import type { TransportInfo } from '../types/ui-request';

// Public variables
// eslint-disable-next-line no-use-before-define
let _core: Core; // Class with event emitter
let _deviceList: ?DeviceList; // Instance of DeviceList
let _popupPromise: ?Deferred<void>; // Waiting for popup handshake
let _uiPromises: Array<Deferred<UiPromiseResponse>> = []; // Waiting for ui response
const _callMethods: Array<AbstractMethod> = [];
let _preferredDevice: any; // TODO: type

// custom log
const _log: Log = initLog('Core');

/**
 * Emit message to listener (parent).
 * Clear method reference from _callMethods
 * @param {CoreMessage} message
 * @returns {void}
 * @memberof Core
 */
const postMessage = (message: CoreMessage): void => {
    if (message.event === RESPONSE_EVENT) {
        const index: number = _callMethods.findIndex(call => call && call.responseID === message.id);
        if (index >= 0) { _callMethods.splice(index, 1); }
    }
    _core.emit(CORE_EVENT, message);
};

/**
 * Creates an instance of _popupPromise.
 * If Core is used without popup this promise should be always resolved automatically
 * @param {boolean} requestWindow
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
 * @param {string} promiseEvent
 * @param {Device} device
 * @returns {Promise<UiPromiseResponse>}
 * @memberof Core
 */
const createUiPromise = (promiseEvent: string, device?: Device): Deferred<UiPromiseResponse> => {
    const uiPromise: Deferred<UiPromiseResponse> = createDeferred(promiseEvent, device);
    _uiPromises.push(uiPromise);
    return uiPromise;
};

/**
 * Finds an instance of uiPromise.
 * @param {number} callId
 * @param {string} promiseEvent
 * @returns {Promise<UiPromiseResponse>}
 * @memberof Core
 */
const findUiPromise = (callId: number, promiseEvent: string): ?Deferred<UiPromiseResponse> => {
    return _uiPromises.find(p => p.id === promiseEvent);
};

const removeUiPromise = (promise: Deferred<UiPromiseResponse>): void => {
    _uiPromises = _uiPromises.filter(p => p !== promise);
};

/**
 * Handle incoming message.
 * @param {CoreMessage} message
 * @param {boolean} isTrustedOrigin
 * @returns {void}
 * @memberof Core
 */
export const handleMessage = (message: CoreMessage, isTrustedOrigin: boolean = false): void => {
    _log.log('handle message in core', isTrustedOrigin, message);

    const safeMessages: Array<string> = [
        IFRAME.CALL,
        POPUP.CLOSED,
        UI.CHANGE_SETTINGS,
        UI.CUSTOM_MESSAGE_RESPONSE,
        UI.LOGIN_CHALLENGE_RESPONSE,
        TRANSPORT.RECONNECT,
    ];

    if (!isTrustedOrigin && safeMessages.indexOf(message.type) === -1) {
        console.warn('Message not trusted', message);
        return;
    }

    switch (message.type) {
        case POPUP.HANDSHAKE :
            getPopupPromise(false).resolve();
            break;
        case POPUP.CLOSED :
            // eslint-disable-next-line no-use-before-define
            onPopupClosed();
            break;

        case UI.CHANGE_SETTINGS :
            enableLog(parseSettings(message.payload).debug);
            break;

        case TRANSPORT.RECONNECT :
            // eslint-disable-next-line no-use-before-define
            reconnectTransport();
            break;

        // messages from UI (popup/modal...)
        case UI.RECEIVE_DEVICE :
        case UI.RECEIVE_CONFIRMATION :
        case UI.RECEIVE_PERMISSION :
        case UI.RECEIVE_PIN :
        case UI.RECEIVE_PASSPHRASE :
        case UI.INVALID_PASSPHRASE_ACTION :
        case UI.RECEIVE_ACCOUNT :
        case UI.CHANGE_ACCOUNT :
        case UI.RECEIVE_FEE :
        case UI.RECEIVE_BROWSER :
        case UI.CUSTOM_MESSAGE_RESPONSE :
        case UI.LOGIN_CHALLENGE_RESPONSE : {
            const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, message.type);
            if (uiPromise) {
                uiPromise.resolve({ event: message.type, payload: message.payload });
                removeUiPromise(uiPromise);
            }
            break;
        }

        // message from index
        case IFRAME.CALL :
            // eslint-disable-next-line no-use-before-define
            onCall(message).catch(error => {
                _log.debug('onCall error', error);
            });
            break;
    }
};

/**
 * Find device by device path. Returned device may be unacquired.
 * @param {AbstractMethod} method
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
                    devices: _deviceList.asArray(),
                }));

                // wait for device selection
                const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(method.responseID, UI.RECEIVE_DEVICE);
                if (uiPromise) {
                    const uiResp: UiPromiseResponse = await uiPromise.promise;
                    if (uiResp.payload.remember) {
                        if (!uiResp.payload.device.state) {
                            delete uiResp.payload.device.state;
                        }
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
 * Processing incoming message.
 * This method is async that's why it returns Promise but the real response is passed by postMessage(new ResponseMessage)
 * @param {CoreMessage} message
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

    if (!_deviceList && !DataManager.getSettings('transportReconnect')) {
        // transport is missing try to initialize it once again
        // eslint-disable-next-line no-use-before-define
        await initTransport(DataManager.getSettings());
    } else if (_deviceList) {
        // restore default messages
        await _deviceList.reconfigure();
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

    _callMethods.push(method);

    let messageResponse: ?ResponseMessage;

    if (!browserState.supported) {
        // wait for popup handshake
        await getPopupPromise().promise;
        // show message about browser
        postMessage(new UiMessage(UI.BROWSER_NOT_SUPPORTED, browserState));
        postMessage(new ResponseMessage(responseID, false, { error: ERROR.BROWSER.message }));
        throw ERROR.BROWSER;
    } else if (browserState.outdated) {
        if (isUsingPopup) {
            // wait for popup handshake
            await getPopupPromise().promise;
            // show message about browser
            postMessage(new UiMessage(UI.BROWSER_OUTDATED, browserState));
            // TODO: wait for user interaction
            // const uiPromise: Deferred<UiPromiseResponse> = createUiPromise(UI.RECEIVE_BROWSER);
            // const uiResp: UiPromiseResponse = await uiPromise.promise;
        } else {
            // just show message about browser
            postMessage(new UiMessage(UI.BROWSER_OUTDATED, browserState));
        }
    }

    // this method is not using the device, there is no need to acquire
    if (!method.useDevice) {
        if (method.useUi) {
            // wait for popup handshake
            await getPopupPromise().promise;
        } else {
            // cancel popup request
            postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        }

        try {
            const response: Object = await method.run();
            messageResponse = new ResponseMessage(method.responseID, true, response);
            postMessage(messageResponse);
            return Promise.resolve();
        } catch (error) {
            postMessage(new ResponseMessage(method.responseID, false, { error: error.message }));
            throw error;
        }
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
        previousCall.forEach(call => { call.overridden = true; });
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

    // set device instance. default is 0
    device.setInstance(method.deviceInstance);

    if (method.hasExpectedDeviceState) {
        device.setExpectedState(method.deviceState);
    }

    // device is available
    // set public variables, listeners and run method
    /* eslint-disable no-use-before-define */
    device.on(DEVICE.BUTTON, onDeviceButtonHandler);
    device.on(DEVICE.PIN, onDevicePinHandler);
    device.on(DEVICE.PASSPHRASE, method.useEmptyPassphrase ? onEmptyPassphraseHandler : onDevicePassphraseHandler);
    device.on(DEVICE.PASSPHRASE_ON_DEVICE, () => {
        postMessage(new UiMessage(UI.REQUEST_PASSPHRASE_ON_DEVICE, { device: device.toMessageObject() }));
    });
    /* eslint-enable no-use-before-define */

    try {
        let PIN_TRIES: number = 1;
        const MAX_PIN_TRIES: number = 3;
        // This function will run inside Device.run() after device will be acquired and initialized
        const inner = async (): Promise<void> => {
            // check if device is in unexpected mode [bootloader, not-initialized, required firmware]
            const unexpectedMode: ?(typeof UI.BOOTLOADER | typeof UI.INITIALIZE | typeof UI.SEEDLESS | typeof UI.FIRMWARE | typeof UI.FIRMWARE_NOT_SUPPORTED) = device.hasUnexpectedMode(method.requiredFirmware, method.allowDeviceMode);
            if (unexpectedMode) {
                if (isUsingPopup) {
                    // wait for popup handshake
                    await getPopupPromise().promise;
                    // show unexpected state information
                    postMessage(new UiMessage(unexpectedMode, device.toMessageObject()));

                    // wait for device disconnect
                    await createUiPromise(DEVICE.DISCONNECT, device).promise;
                    // interrupt process and go to "final" block
                    return Promise.resolve();
                } else {
                    // return error if not using popup
                    postMessage(new ResponseMessage(method.responseID, false, { error: unexpectedMode }));
                    return Promise.resolve();
                }
            }

            // notify if firmware is outdated but not required
            if (device.firmwareStatus === 'outdated') {
                // wait for popup handshake
                await getPopupPromise().promise;
                // show notification
                postMessage(new UiMessage(UI.FIRMWARE_OUTDATED, device.toMessageObject()));
            }

            // check and request permissions [read, write...]
            method.checkPermissions();
            if (!trustedHost && method.requiredPermissions.length > 0) {
                // show permissions in UI
                const permitted: boolean = await method.requestPermissions();
                if (!permitted) {
                    postMessage(new ResponseMessage(method.responseID, false, { error: ERROR.PERMISSIONS_NOT_GRANTED.message }));
                    // eslint-disable-next-line no-use-before-define
                    closePopup();
                    // interrupt process and go to "final" block
                    return Promise.resolve();
                }
            }

            // ask for confirmation [export xpub, export info, sign message]
            if (!trustedHost && typeof method.confirmation === 'function') {
                // show confirmation in UI
                const confirmed: boolean = await method.confirmation();
                if (!confirmed) {
                    postMessage(new ResponseMessage(method.responseID, false, { error: 'Cancelled' }));
                    // eslint-disable-next-line no-use-before-define
                    closePopup();
                    // interrupt process and go to "final" block
                    return Promise.resolve();
                }
            }

            // Make sure that device will display pin/passphrase
            try {
                const deviceState: string = method.useDeviceState ? await device.getCommands().getDeviceState() : 'null';
                const validState: boolean = !method.useDeviceState || method.useEmptyPassphrase || device.validateExpectedState(deviceState);
                if (!validState) {
                    if (isUsingPopup) {
                        // initialize user response promise
                        const uiPromise = createUiPromise(UI.INVALID_PASSPHRASE_ACTION, device);
                        // request action view
                        postMessage(new UiMessage(UI.INVALID_PASSPHRASE, { device: device.toMessageObject() }));
                        // wait for user response
                        const uiResp: UiPromiseResponse = await uiPromise.promise;
                        const resp: boolean = uiResp.payload;
                        if (resp) {
                            // initialize to reset device state
                            await device.getCommands().initialize(method.useEmptyPassphrase);
                            return inner();
                        } else {
                            // set new state as requested
                            device.setState(deviceState);
                        }
                    } else {
                        throw ERROR.INVALID_STATE;
                    }
                }
            } catch (error) {
                // catch wrong pin error
                if (error.message === ERROR.INVALID_PIN_ERROR_MESSAGE && PIN_TRIES < MAX_PIN_TRIES) {
                    PIN_TRIES++;
                    postMessage(new UiMessage(UI.INVALID_PIN, { device: device.toMessageObject() }));
                    return inner();
                } else {
                    // other error
                    postMessage(new ResponseMessage(method.responseID, false, { error: error.message }));
                    // eslint-disable-next-line no-use-before-define
                    closePopup();
                    // clear cached passphrase. it's not valid
                    device.clearPassphrase();
                    device.setState(null);
                    // interrupt process and go to "final" block
                    return Promise.resolve();
                }
            }

            if (method.useUi) {
                // make sure that popup is opened
                await getPopupPromise().promise;
            } else {
                // popup is not required
                postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
            }

            // run method
            try {
                // for CustomMessage method reconfigure transport with custom messages definitions
                const customMessages = method.getCustomMessages();
                if (_deviceList && customMessages) {
                    await _deviceList.reconfigure(customMessages);
                }
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
                // eslint-disable-next-line no-use-before-define
                closePopup();
                // eslint-disable-next-line no-use-before-define
                cleanup();

                return Promise.resolve();
            }
            // eslint-disable-next-line no-use-before-define
            closePopup();
        };

        // run inner function
        await device.run(inner, { keepSession: method.keepSession, useEmptyPassphrase: method.useEmptyPassphrase });
    } catch (error) {
        if (method) {
            // corner case:
            // thrown while acquiring device
            // it's a race condition between two tabs
            // workaround is to enumerate transport again and report changes to get a valid session number
            if (_deviceList && error.message === ERROR.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE) {
                _deviceList.enumerate();
            }
            // cancel popup request
            postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST)); // TODO: should it be here?
            postMessage(new ResponseMessage(method.responseID, false, { error: error.message || error, code: error.code }));

            // eslint-disable-next-line no-use-before-define
            closePopup();
        }
    } finally {
        // Work done
        _log.log('onCall::finally', messageResponse);

        device.cleanup();
        // eslint-disable-next-line no-use-before-define
        cleanup();

        if (method) { method.dispose(); }

        // restore default messages
        if (_deviceList) { await _deviceList.reconfigure(); }

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
 * @param {Device} device
 * @param {string} code
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDeviceButtonHandler = async (device: Device, code: string): Promise<void> => {
    // wait for popup handshake
    await getPopupPromise().promise;
    // request view
    postMessage(new DeviceMessage(DEVICE.BUTTON, { device: device.toMessageObject(), code: code }));
    postMessage(new UiMessage(UI.REQUEST_BUTTON, { device: device.toMessageObject(), code: code }));
};

/**
 * Handle pin request from Device.
 * @param {Device} device
 * @param {string} type
 * @param {Function} callback
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePinHandler = async (device: Device, type: string, callback: (error: any, success: any) => void): Promise<void> => {
    // wait for popup handshake
    await getPopupPromise().promise;
    // request pin view
    postMessage(new UiMessage(UI.REQUEST_PIN, { device: device.toMessageObject() }));
    // wait for pin
    const uiResp: UiPromiseResponse = await createUiPromise(UI.RECEIVE_PIN, device).promise;
    const pin: string = uiResp.payload;
    // callback.apply(null, [null, pin]);
    callback(null, pin);
};

/**
 * Handle passphrase request from Device.
 * @param {Device} device
 * @param {Function} callback
 * @returns {Promise<void>}
 * @memberof Core
 */
const onDevicePassphraseHandler = async (device: Device, callback: (error: any, success: any) => void): Promise<void> => {
    const cachedPassphrase: ?string = device.getPassphrase();
    if (typeof cachedPassphrase === 'string') {
        callback(null, cachedPassphrase);
        return;
    }

    // wait for popup handshake
    await getPopupPromise().promise;
    // request passphrase view
    postMessage(new UiMessage(UI.REQUEST_PASSPHRASE, { device: device.toMessageObject() }));
    // wait for passphrase

    const uiResp: UiPromiseResponse = await createUiPromise(UI.RECEIVE_PASSPHRASE, device).promise;
    const value: string = uiResp.payload.value;
    const cache: boolean = uiResp.payload.save;
    device.setPassphrase(cache ? value : null);
    callback(null, value);
};

/**
 * Handle passphrase request from Device and use empty
 * @param {Device} device
 * @param {Function} callback
 * @returns {Promise<void>}
 * @memberof Core
 */
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
                    _callMethods.splice(0, _callMethods.length);
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
 * @param {DeviceTyped} interruptDevice
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
                devices: list,
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
 * @param {ConnectSettings} settings
 * @returns {Promise<void>}
 * @memberof Core
 */
const initDeviceList = async (settings: ConnectSettings): Promise<void> => {
    try {
        _deviceList = new DeviceList({
            rememberDevicePassphrase: true,
        });

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

        _deviceList.on(DEVICE.CHANGED, (device: DeviceTyped) => {
            postMessage(new DeviceMessage(DEVICE.CHANGED, device));
        });

        _deviceList.on(TRANSPORT.ERROR, async (error) => {
            _log.error('TRANSPORT ERROR', error);
            if (_deviceList) {
                _deviceList.disconnectDevices();
                _deviceList.removeAllListeners();
            }

            _deviceList = null;
            postMessage(new TransportMessage(TRANSPORT.ERROR, {
                error: error.message || error,
                bridge: DataManager.getLatestBridgeVersion(),
            }));
            // if transport fails during app lifetime, try to reconnect
            if (settings.transportReconnect) {
                await resolveAfter(1000, null);
                await initDeviceList(settings);
            }
        });

        _deviceList.on(TRANSPORT.START, (transportType) => postMessage(new TransportMessage(TRANSPORT.START, transportType)));

        await _deviceList.init();
        if (_deviceList) {
            await _deviceList.waitForTransportFirstEvent();
        }
    } catch (error) {
        _deviceList = null;
        if (!settings.transportReconnect) {
            throw error;
        } else {
            postMessage(new TransportMessage(TRANSPORT.ERROR, {
                error: error.message || error,
                bridge: DataManager.getLatestBridgeVersion(),
            }));
            await resolveAfter(3000, null);
            // try to reconnect
            await initDeviceList(settings);
        }
    }
};

/**
 * An event emitter for communication with parent
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

    getCurrentMethod(): Array<AbstractMethod> {
        return _callMethods;
    }

    getTransportInfo(): ?TransportInfo {
        if (_deviceList) {
            return {
                type: _deviceList.transportType(),
                version: _deviceList.transportVersion(),
                outdated: _deviceList.transportOutdated(),
                bridge: DataManager.getLatestBridgeVersion(),
            };
        }
        return null;
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

export const initData = async (settings: ConnectSettings): Promise<void> => {
    try {
        await DataManager.load(settings);
    } catch (error) {
        _log.log('init error', error);
        throw error;
    }
};

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
};

const reconnectTransport = async (): Promise<void> => {
    if (DataManager.getSettings('transportReconnect')) {
        return;
    }

    try {
        await initDeviceList(DataManager.getSettings());
    } catch (error) {
        postMessage(new TransportMessage(TRANSPORT.ERROR, {
            error: error.message || error,
            bridge: DataManager.getLatestBridgeVersion(),
        }));
    }
};
