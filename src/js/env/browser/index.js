/* @flow */

import EventEmitter from 'events';

import PopupManager from '../../popup/PopupManager';
import * as iframe from '../../iframe/builder';
import webUSBButton from '../../webusb/button';

import { parseMessage } from '../../message';
import { parse as parseSettings } from '../../data/ConnectSettings';
import Log, { init as initLog } from '../../utils/debug';

import { UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT, TRANSPORT_EVENT, BLOCKCHAIN_EVENT } from '../../constants';
import * as POPUP from '../../constants/popup';
import * as IFRAME from '../../constants/iframe';
import * as UI from '../../constants/ui';
import * as ERROR from '../../constants/errors';
import * as TRANSPORT from '../../constants/transport';

import type { ConnectSettings } from '../../data/ConnectSettings';
import * as $T from '../../types';

export const eventEmitter = new EventEmitter();
const _log: Log = initLog('[trezor-connect.js]');

let _settings: ConnectSettings;
let _popupManager: ?PopupManager;

const initPopupManager = (): PopupManager => {
    const pm = new PopupManager(_settings);
    pm.on(POPUP.CLOSED, (error?: string) => {
        iframe.postMessage({
            type: POPUP.CLOSED,
            payload: error ? { error } : null,
        }, false);
    });
    return pm;
};

export const manifest = (data: any) => {
    _settings = parseSettings({
        manifest: data,
    });
};

export const dispose = () => {
    iframe.dispose();
    if (_popupManager) {
        _popupManager.close();
    }
};

export const cancel = (error?: string) => {
    if (_popupManager) {
        _popupManager.emit(POPUP.CLOSED, error);
    }
};

// handle message received from iframe
const handleMessage = (messageEvent: $T.PostMessageEvent): void => {
    // ignore messages from domain other then iframe origin
    if (messageEvent.origin !== iframe.origin) return;

    const message = parseMessage(messageEvent.data);
    const { event, type, payload } = message;
    const id = message.id || 0;

    _log.log('handleMessage', message);

    switch (event) {
        case RESPONSE_EVENT :
            if (iframe.messagePromises[id]) {
                // resolve message promise (send result of call method)
                iframe.messagePromises[id].resolve({
                    id,
                    success: message.success,
                    payload,
                });
                delete iframe.messagePromises[id];
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
            if (type === IFRAME.BOOTSTRAP) {
                iframe.clearTimeout();
                break;
            }
            if (type === IFRAME.LOADED) {
                iframe.initPromise.resolve();
            }
            if (type === IFRAME.ERROR) {
                iframe.initPromise.reject(new Error(payload.error));
            }

            // pass UI event up
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);
            break;

        default:
            _log.log('Undefined message', event, messageEvent);
    }
};

export const init = async (settings: Object = {}): Promise<void> => {
    if (iframe.instance) { throw ERROR.IFRAME_INITIALIZED; }

    if (!_settings) {
        _settings = parseSettings(settings);
    }

    if (!_settings.manifest) {
        throw ERROR.MANIFEST_NOT_SET;
    }

    if (_settings.lazyLoad) {
        // reset "lazyLoad" after first use
        _settings.lazyLoad = false;
        return;
    }

    if (!_popupManager) {
        _popupManager = initPopupManager();
    }

    _log.enabled = _settings.debug;

    window.addEventListener('message', handleMessage);
    window.addEventListener('beforeunload', dispose);

    await iframe.init(_settings);
};

export const call = async (params: Object): Promise<Object> => {
    if (!iframe.instance && !iframe.timeout) {
        // init popup with lazy loading before iframe initialization
        _settings = parseSettings(_settings);

        if (!_settings.manifest) {
            return { success: false, payload: { error: ERROR.MANIFEST_NOT_SET.message } };
        }

        if (!_popupManager) {
            _popupManager = initPopupManager();
        }
        _popupManager.request(true);

        // auto init with default settings
        try {
            await init(_settings);
        } catch (error) {
            if (_popupManager) {
                _popupManager.close();
            }
            return { success: false, payload: { error } };
        }
    }

    if (iframe.timeout) {
        // this.init was called, but iframe doesn't return handshake yet
        return { success: false, payload: { error: ERROR.NO_IFRAME.message } };
    } else if (iframe.error) {
        // iframe was initialized with error
        return { success: false, payload: { error: iframe.error } };
    }

    // request popup window it might be used in the future
    if (_settings.popup && _popupManager) { _popupManager.request(); }

    // post message to iframe
    try {
        const response: ?Object = await iframe.postMessage({ type: IFRAME.CALL, payload: params });
        if (response) {
            // TODO: unlock popupManager request only if there wasn't error "in progress"
            if (response.payload.error !== ERROR.DEVICE_CALL_IN_PROGRESS.message && _popupManager) { _popupManager.unlock(); }
            return response;
        } else {
            if (_popupManager) {
                _popupManager.unlock();
            }
            return { success: false, payload: { error: 'No response from iframe' } };
        }
    } catch (error) {
        _log.error('__call error', error);
        return error;
    }
};

const customMessageResponse = (payload: ?{ message: string, params?: Object }): void => {
    iframe.postMessage({
        event: UI_EVENT,
        type: UI.CUSTOM_MESSAGE_RESPONSE,
        payload,
    });
};

export const uiResponse = (response: $T.UiResponse): void => {
    iframe.postMessage({ event: UI_EVENT, ...response });
};

export const renderWebUSBButton = (className: ?string): void => {
    webUSBButton(className, _settings.webusbSrc, iframe.origin);
};

export const getSettings: $T.GetSettings = async () => {
    if (!iframe.instance) {
        return { success: false, payload: { error: 'Iframe not initialized yet, you need to call TrezorConnect.init or any other method first.' } };
    }
    return await call({ method: 'getSettings' });
};

export const customMessage: $T.CustomMessage = async (params) => {
    if (typeof params.callback !== 'function') {
        return {
            success: false,
            payload: {
                error: 'Parameter "callback" is not a function',
            },
        };
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
    window.addEventListener('message', customMessageListener, false);

    const response = await call({ method: 'customMessage', ...params, callback: null });
    window.removeEventListener('message', customMessageListener);
    return response;
};

export const requestLogin: $T.RequestLogin = async (params) => {
    // $FlowIssue: property callback not found
    if (typeof params.callback === 'function') {
        const callback = params.callback;

        // TODO: set message listener only if iframe is loaded correctly
        const loginChallengeListener = async (event: $T.PostMessageEvent) => {
            const data = event.data;
            if (data && data.type === UI.LOGIN_CHALLENGE_REQUEST) {
                try {
                    const payload = await callback();
                    iframe.postMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload,
                    });
                } catch (error) {
                    iframe.postMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload: error.message,
                    });
                }
            }
        };

        window.addEventListener('message', loginChallengeListener, false);

        const response = await call({ method: 'requestLogin', ...params, asyncChallenge: true, callback: null });
        window.removeEventListener('message', loginChallengeListener);
        return response;
    } else {
        return await call({ method: 'requestLogin', ...params });
    }
};

export const disableWebUSB = () => {
    iframe.postMessage({
        event: UI_EVENT,
        type: TRANSPORT.DISABLE_WEBUSB,
    });
};
