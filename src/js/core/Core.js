/* @flow */
'use strict';

import EventEmitter from 'events';
import DataManager from '../data/DataManager';
import DeviceList, { getDeviceList } from '../device/DeviceList';
import Device from '../device/Device';
import type { DeviceDescription } from '../device/Device';

import * as TRANSPORT from '../constants/transport';
import * as DEVICE from '../constants/device';
import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';

import { UiMessage, DeviceMessage, TransportMessage, ResponseMessage } from './CoreMessage';
import type { CoreMessage, UiPromiseResponse } from './CoreMessage';

import { parse as parseParams, parseGeneral as parseGeneralParams } from './methods/parameters';
import type { GeneralParams, MethodParams, MethodCallbacks } from './methods/parameters';
import { requestPermissions } from './methods/permissions';

import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import { resolveAfter } from '../utils/promiseUtils'; // TODO: just tmp. remove
import { getPathFromIndex } from '../utils/pathUtils';

import Log, { init as initLog, enable as enableLog } from '../utils/debug';

import { parse as parseSettings } from '../entrypoints/ConnectSettings';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';

// Public variables
let _core: Core; // Class with event emitter
let _deviceList: ?DeviceList; // Instance of DeviceList
let _popupPromise: ?Deferred<void>; // Waiting for popup handshake
let _uiPromises: Array<Deferred<UiPromiseResponse>> = []; // Waiting for ui response
let _waitForFirstRun: boolean = false; // used in corner-case, where device.isRunning() === true but it isn't loaded yet.
const _callParameters: Array<GeneralParams> = [];

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

    const safeMessages: Array<string> = [ IFRAME.CALL, POPUP.CLOSED, UI.CHANGE_SETTINGS, TRANSPORT.REQUEST ];

    if (!isTrustedOrigin && safeMessages.indexOf(message.type) === -1) {
        console.error('Message not trusted', message);
        return;
    }

    switch (message.type) {
        // case TRANSPORT.REQUEST :
        //     _deviceList.requestUSBDevice().then(response => {
        //         postMessage(new ResponseMessage(message.id, true, response));
        //     });
        //     break;

        case POPUP.HANDSHAKE :
            getPopupPromise(false).resolve();
            break;
        case POPUP.CLOSED :
            onPopupClosed();
            break;

        case UI.CHANGE_SETTINGS :
            enableLog(parseSettings(message.data).debug);
            break;

        // TODO: webusb response from popup
        // case 'WEBUSB' :
        //     navigator.usb.getDevices().then((d) => {
        //         console.warn("GETDEVICES!", d)
        //     })
        //     console.warn("WEBUSB! Reload device list", _deviceList.getWebUsbPlugin() );
        //     break;

        // messages from UI (popup/modal...)
        case UI.RECEIVE_DEVICE :
        case UI.RECEIVE_CONFIRMATION :
        case UI.RECEIVE_PERMISSION :
        case UI.RECEIVE_PIN :
        case UI.RECEIVE_PASSPHRASE :
        case UI.RECEIVE_ACCOUNT :
        case UI.CHANGE_ACCOUNT :
        case UI.RECEIVE_FEE :
            // TODO: throw error if not string
            const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, message.type);
            if (uiPromise) {
                uiPromise.resolve({ event: message.type, data: message.data });
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
const initDevice = async (parameters: GeneralParams): Promise<Device> => {
    if (!_deviceList) {
        throw ERROR.NO_TRANSPORT;
    }

    let device: ?Device;
    if (parameters.deviceHID) {
        device = _deviceList.getDevice(parameters.deviceHID);
    } else {
        let devicesCount: number = _deviceList.length();
        let selectedDevicePath: string;
        if (devicesCount === 1) {
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
            if (devicesCount === 1) {
                // there is one device available. use it
                selectedDevicePath = _deviceList.getFirstDevicePath();
                device = _deviceList.getDevice(selectedDevicePath);
            } else {
                // request select device view
                postMessage(new UiMessage(UI.SELECT_DEVICE, _deviceList.asArray()));

                // wait for device selection
                const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(parameters.responseID, UI.RECEIVE_DEVICE);
                if (uiPromise) {
                    const uiResp: UiPromiseResponse = await uiPromise.promise;
                    selectedDevicePath = uiResp.data;
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

    // request 0 xpub
    const path: Array<number> = getPathFromIndex(1, 0, 0);
    const response = await device.getCommands().getPublicKey(path, 'Bitcoin');

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
    if (!message.id || !message.data) {
        throw ERROR.INVALID_PARAMETERS;
    }

    const responseID: number = message.id;

    // parse incoming params

    let parameters: MethodParams;
    try {
        parameters = parseParams(message);
    } catch (error) {
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        postMessage(new ResponseMessage(responseID, false, { error: ERROR.INVALID_PARAMETERS.message + ': ' + error.message }));
        throw ERROR.INVALID_PARAMETERS;
    }

    const gParameters: GeneralParams = parseGeneralParams(message, parameters);
    _callParameters[responseID] = gParameters;

    let messageResponse: ?ResponseMessage;

    // if method is using device (there could be just calls to backend or hd-wallet)
    if (!parameters.useDevice) {
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
        device = await initDevice(gParameters);
    } catch (error) {
        if (error === ERROR.NO_TRANSPORT) {
            // wait for popup handshake
            await getPopupPromise().promise;
            // show message about transport
            postMessage(new UiMessage(UI.TRANSPORT));
        } else {
            postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        }
        postMessage(new ResponseMessage(responseID, false, { error: error.message }));
        throw error;
    }

    parameters.deviceHID = device.getDevicePath();

    let unexpectedStateVerified: boolean = false;
    if (!device.isUnacquired()) {
        const unexpectedState: ?string = await checkUnexpectedState(device, parameters.requiredFirmware);
        if (unexpectedState) {
            // wait for popup handshake
            await getPopupPromise().promise;
            // show unexpected state information
            postMessage(new UiMessage(unexpectedState));

            await createUiPromise(DEVICE.DISCONNECT, device).promise;

            postMessage(new ResponseMessage(responseID, false, { error: unexpectedState }));
            throw unexpectedState;
        }
        unexpectedStateVerified = true;
    }

    // TODO: nicer
    device.setInstance(gParameters.deviceInstance);

    // if device is currently busy
    if (device.isRunning()) {
        // corner case
        // device didn't finish loading for the first time. @see DeviceList._createAndSaveDevice
        // wait for self-release and then carry on
        if (!_waitForFirstRun && !device.isLoaded()) {
            _waitForFirstRun = true;
            await device.waitForFirstRun();
            _waitForFirstRun = false;
        } else {
            if (gParameters.overridePreviousCall) {
                // resolve previous call before this one
                // const previous: ?GeneralParams = _callParameters.find(p => p && p.methodParams.deviceHID === device.getDevicePath());
                await device.override(new Error('Override!'));
            } else {
                postMessage(new ResponseMessage(responseID, false, { error: ERROR.DEVICE_CALL_IN_PROGRESS.message }));
                throw ERROR.DEVICE_CALL_IN_PROGRESS;
            }
        }
    }

    // device is available
    // set public variables, listeners and run method
    device.on(DEVICE.PIN, onDevicePinHandler);
    device.on(DEVICE.PASSPHRASE, parameters.useEmptyPassphrase ? onEmptyPassphraseHandler : onDevicePassphraseHandler);
    // device.on(DEVICE.PASSPHRASE, onDevicePassphraseHandler);
    device.on(DEVICE.BUTTON, onDeviceButtonHandler);
    device.on(DEVICE.AUTHENTICATED, () => {
        if (!parameters.useUi) { postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST)); }
    });

    // before acquire session, check if UI will be needed in future
    // and if device is already authenticated
    if (!parameters.useUi && device.isAuthenticated(parameters.useEmptyPassphrase)) {
        // TODO ???
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
    }

    try {
        // This function will run inside Device.run() after device will be acquired and initialized
        const inner = async (): Promise<void> => {
            // check if device is in unexpected state (bootloader, not-initialized, old firmware)
            const unexpectedState: ?string = await checkUnexpectedState(device, parameters.requiredFirmware);
            if (unexpectedState) {
                // wait for popup handshake
                await getPopupPromise().promise;
                // show unexpected state information
                postMessage(new UiMessage(unexpectedState));

                device.clearPassphrase();

                await createUiPromise(DEVICE.DISCONNECT, device).promise;

                // interrupt running process and go to "final" block
                return Promise.resolve();
            }

            // device is ready
            // set parameters as public variable, from now on this is reference to work with
            // this variable will be cleared in cleanup()

            // check if device state is correct (correct checksum)
            const correctState: boolean = await checkDeviceState(device, gParameters.deviceState);
            if (!correctState) {
                // wait for popup handshake
                await getPopupPromise().promise;

                device.clearPassphrase();

                messageResponse = new ResponseMessage(gParameters.responseID, false, { error: 'Device state is incorrect' });
                closePopup();
                // interrupt running process and go to "final" block
                return Promise.resolve();
            }

            // create callbacks collection
            // this will be used inside methods to communicate with Device or UI
            const callbacks: MethodCallbacks = {
                device,
                postMessage,
                getPopupPromise,
                createUiPromise,
                findUiPromise,
                removeUiPromise,
            };

            const trustedHost: boolean = DataManager.getSettings('trustedHost');

            // check and request permissions
            if (parameters.requiredPermissions.length > 0 && !trustedHost) {
                // show permissions in UI
                const permitted: boolean = await requestPermissions(parameters.requiredPermissions, callbacks);
                if (!permitted) {
                    postMessage(new ResponseMessage(parameters.responseID, false, { error: ERROR.PERMISSIONS_NOT_GRANTED.message }));
                    closePopup();

                    device.clearPassphrase();

                    return Promise.resolve();
                }
            }

            // before authentication, ask for confirmation if needed [export xpub, sign message]
            if (typeof parameters.confirmation === 'function' && !trustedHost) {
                // show confirmation in UI
                const confirmed: boolean = await parameters.confirmation.apply(this, [ parameters, callbacks ]);
                if (!confirmed) {
                    postMessage(new ResponseMessage(parameters.responseID, false, { error: 'Cancelled' }));
                    closePopup();

                    device.clearPassphrase();

                    return Promise.resolve();
                }
            }

            if (!device.isAuthenticated(parameters.useEmptyPassphrase)) { // TODO: check if auth is needed (getFeatures)
                try {
                    await requestAuthentication(device);
                } catch (error) {
                    // catch wrong pin
                    if (error.message === ERROR.INVALID_PIN_ERROR_MESSAGE) {
                        postMessage(new UiMessage(UI.INVALID_PIN, { device: device.toMessageObject() }));
                        return inner();
                    } else {
                        postMessage(new ResponseMessage(parameters.responseID, false, { error: error.message }));
                        closePopup();

                        device.clearPassphrase();

                        return Promise.resolve();
                    }
                }
            }

            // wait for popup handshake
            if (parameters.useUi) {
                await getPopupPromise().promise;
            }

            // run method
            try {
                const response: Object = await parameters.method.apply(this, [ parameters, callbacks ]);
                messageResponse = new ResponseMessage(parameters.responseID, true, response);
            } catch (error) {
                // device.clearPassphrase();

                if (!parameters) {
                    return Promise.resolve();
                }

                if (error.custom) {
                    delete error.custom;
                    postMessage(new ResponseMessage(parameters.responseID, false, error));
                } else {
                    postMessage(new ResponseMessage(parameters.responseID, false, { error: error.message }));
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

        await device.run(inner, { keepSession: parameters.keepSession });
    } catch (error) {
        if (parameters) {
            postMessage(new ResponseMessage(parameters.responseID, false, { error: error.message || error }));
        }
    } finally {
        // Work done
        _log.log('onCall::finally', messageResponse);
        device.release();
        device.removeAllListeners();
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
    const pin: string = uiResp.data;
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
    const pass: string = uiResp.data.value;
    const save: boolean = uiResp.data.save;
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
                    uiPromise.resolve({ event: ERROR.POPUP_CLOSED.message, data: null });
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
const handleDeviceSelectionChanges = (interruptDevice: ?DeviceDescription = null): void => {
    // update list of devices in popup
    const uiPromise: ?Deferred<UiPromiseResponse> = findUiPromise(0, UI.RECEIVE_DEVICE);
    if (uiPromise && _deviceList) {
        const list: Array<Object> = _deviceList.asArray();
        if (list.length === 1) {
            // there is only one device. use it
            // resolve uiPromise to looks like it's a user choice (see: handleMessage function)
            uiPromise.resolve({ event: UI.RECEIVE_DEVICE, data: list[0].path });
            removeUiPromise(uiPromise);
        } else {
            // update device selection list view
            postMessage(new UiMessage(UI.SELECT_DEVICE, list));
        }
    }

    // device was disconnected, interrupt pending uiPromises for this device
    if (interruptDevice !== null) {
        const path: string = interruptDevice.path;
        let shouldClosePopup: boolean = false;
        _uiPromises.forEach((p: Deferred<UiPromiseResponse>) => {
            if (p.device && p.device.getDevicePath() === path) {
                if (p.id === DEVICE.DISCONNECT) {
                    p.resolve({ event: DEVICE.DISCONNECT, data: null });
                }
                shouldClosePopup = true;
            }
        });

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

        postMessage(new TransportMessage(TRANSPORT.START, `${_deviceList.transportType()} ${_deviceList.transportVersion()}`));

        _deviceList.on(DEVICE.CONNECT, (device: DeviceDescription) => {
            handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.CONNECT, device));
        });

        _deviceList.on(DEVICE.CONNECT_UNACQUIRED, (device: DeviceDescription) => {
            handleDeviceSelectionChanges();
            postMessage(new DeviceMessage(DEVICE.CONNECT_UNACQUIRED, device));
        });

        _deviceList.on(DEVICE.DISCONNECT, (device: DeviceDescription) => {
            handleDeviceSelectionChanges(device);
            postMessage(new DeviceMessage(DEVICE.DISCONNECT, device));
        });

        _deviceList.on(DEVICE.DISCONNECT_UNACQUIRED, (device: DeviceDescription) => {
            postMessage(new DeviceMessage(DEVICE.DISCONNECT_UNACQUIRED, device));
        });

        _deviceList.on(DEVICE.CHANGED, (device: DeviceDescription) => {
            postMessage(new DeviceMessage(DEVICE.CHANGED, device));
        });

        _deviceList.on(TRANSPORT.ERROR, async (error) => {
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
const initCore = (): Core => {
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
        if (!settings.transportReconnect) {
            // try only once, if it fails kill and throw initialization error
            await initDeviceList(settings);
        } else {
            // don't wait for DeviceList result, further communication will be thru TRANSPORT events
            initDeviceList(settings);
        }
        return _core;
    } catch (error) {
        // TODO: kill app
        _log.log('init error', error);
        throw error;
    }
};
