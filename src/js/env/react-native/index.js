/* @flow */
import EventEmitter from 'events';

import { parse as parseSettings } from '../../data/ConnectSettings';
import Log, { init as initLog } from '../../utils/debug';
import { errorMessage } from '../../message';
import { Core, init as initCore, initTransport } from '../../core/Core';
import { create as createDeferred } from '../../utils/deferred';

import {
    CORE_EVENT,
    UI_EVENT,
    DEVICE_EVENT,
    RESPONSE_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
    POPUP,
    IFRAME,
    UI,
    ERRORS,
} from '../../constants';

import * as $T from '../../types';

export const eventEmitter = new EventEmitter();
const _log: Log = initLog('[trezor-connect.js]');

let _settings: $T.ConnectSettings;
let _core: Core;

let _messageID: number = 0;
export const messagePromises: { [key: number]: $T.Deferred<any> } = {};

export const manifest = (data: $T.Manifest) => {
    _settings = parseSettings({
        manifest: data,
    });
};

export const dispose = () => {
    // iframe.dispose();
    // if (_popupManager) {
    //     _popupManager.close();
    // }
};

// handle message received from iframe
const handleMessage = (message: $T.CoreMessage): void => {
    const { event, type, payload } = message;
    const id = message.id || 0;

    if (type === UI.REQUEST_UI_WINDOW) {
        _core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE }, true);
        return;
    }

    _log.log('handleMessage', message);

    switch (event) {
        case RESPONSE_EVENT :
            if (messagePromises[id]) {
                // resolve message promise (send result of call method)
                messagePromises[id].resolve({
                    id,
                    success: message.success,
                    payload,
                });
                delete messagePromises[id];
            } else {
                _log.warn(`Unknown message id ${id}`);
            }
            break;

        case DEVICE_EVENT :
            // pass DEVICE event up to html
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload); // DEVICE_EVENT also emit single events (connect/disconnect...)
            break;

        case TRANSPORT_EVENT :
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);
            break;

        case BLOCKCHAIN_EVENT :
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);
            break;

        case UI_EVENT :
            // pass UI event up
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);
            break;

        default:
            _log.log('Undefined message', event, message);
    }
};

const postMessage = (message: any, usePromise: boolean = true) => {
    if (!_core) {
        throw ERRORS.TypedError('Runtime', 'postMessage: _core not found');
    }
    if (usePromise) {
        _messageID++;
        message.id = _messageID;
        messagePromises[_messageID] = createDeferred();
        const { promise } = messagePromises[_messageID];
        _core.handleMessage(message, true);
        return promise;
    }

    _core.handleMessage(message, true);
    return null;
};

export const init = async (settings: $Shape<$T.ConnectSettings> = {}): Promise<void> => {
    if (!_settings) {
        _settings = parseSettings(settings);
    }
    // set defaults for node
    _settings.origin = 'http://node.trezor.io/';
    _settings.popup = false;
    _settings.env = 'react-native';

    if (!_settings.manifest) {
        throw ERRORS.TypedError('Init_ManifestMissing');
    }

    if (_settings.lazyLoad) {
        // reset "lazyLoad" after first use
        _settings.lazyLoad = false;
        return;
    }

    _log.enabled = !!_settings.debug;

    _core = await initCore(_settings);
    _core.on(CORE_EVENT, handleMessage);

    await initTransport(_settings);
};

export const call = async (params: Object): Promise<Object> => {
    if (!_core) {
        _settings = parseSettings({ debug: false, popup: false });

        // auto init with default settings
        try {
            await init(_settings);
        } catch (error) {
            return errorMessage(error);
        }
    }

    try {
        const response: ?Object = await postMessage({ type: IFRAME.CALL, payload: params });
        if (response) {
            return response;
        } else {
            return errorMessage(ERRORS.TypedError('Method_NoResponse'));
        }
    } catch (error) {
        _log.error('__call error', error);
        return errorMessage(error);
    }
};

const customMessageResponse = (payload: ?{ message: string; params?: Object }): void => {
    _core.handleMessage({
        event: UI_EVENT,
        type: UI.CUSTOM_MESSAGE_RESPONSE,
        payload,
    }, true);
};

export const uiResponse = (response: $T.UiResponse): void => {
    const { type, payload } = response;
    _core.handleMessage({ event: UI_EVENT, type, payload }, true);
};

export const renderWebUSBButton = (className: ?string): void => {
    // webUSBButton(className, _settings.webusbSrc, iframe.origin);
};

export const getSettings = async (): $T.Response<$T.ConnectSettings> => {
    if (!_core) {
        return errorMessage(ERRORS.TypedError('Init_NotInitialized'));
    }
    return await call({ method: 'getSettings' });
};

export const customMessage: $PropertyType<$T.API, 'customMessage'> = async (params) => {
    if (typeof params.callback !== 'function') {
        return errorMessage(ERRORS.TypedError('Method_CustomMessage_Callback'));
    }

    // TODO: set message listener only if iframe is loaded correctly
    const callback = params.callback;
    const customMessageListener = async (event: $T.PostMessageEvent) => {
        const data = event.data;
        if (data && data.type === UI.CUSTOM_MESSAGE_REQUEST) {
            const payload = await callback(data.payload);
            if (payload) {
                customMessageResponse(payload);
            } else {
                customMessageResponse({ message: 'release' });
            }
        }
    };
    _core.on(CORE_EVENT, customMessageListener);

    const response = await call({ method: 'customMessage', ...params, callback: null });
    _core.removeListener(CORE_EVENT, customMessageListener);
    return response;
};

export const requestLogin: $PropertyType<$T.API, 'requestLogin'> = async (params) => {
    // $FlowIssue: property callback not found
    if (typeof params.callback === 'function') {
        const callback = params.callback;

        // TODO: set message listener only if iframe is loaded correctly
        const loginChallengeListener = async (event: $T.PostMessageEvent) => {
            const data = event.data;
            if (data && data.type === UI.LOGIN_CHALLENGE_REQUEST) {
                try {
                    const payload = await callback();
                    _core.handleMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload,
                    }, true);
                } catch (error) {
                    _core.handleMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload: error.message,
                    }, true);
                }
            }
        };

        _core.on(CORE_EVENT, loginChallengeListener);

        const response = await call({ method: 'requestLogin', ...params, asyncChallenge: true, callback: null });
        _core.removeListener(CORE_EVENT, loginChallengeListener);
        return response;
    } else {
        return await call({ method: 'requestLogin', ...params });
    }
};

export const cancel = (error?: string) => {
    postMessage({
        type: POPUP.CLOSED,
        payload: error ? { error } : null,
    }, false);
};

export const disableWebUSB = () => {
    throw ERRORS.TypedError('Method_InvalidPackage');
};
