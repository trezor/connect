/* @flow */
import EventEmitter from 'events';

import { parse as parseSettings } from '../../data/ConnectSettings';
import Log, { init as initLog } from '../../utils/debug';

import { state as browserState } from '../../utils/browser';
import { Core, init as initCore, initTransport } from '../../core/Core';
import { create as createDeferred } from '../../utils/deferred';

import { CORE_EVENT, UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT, TRANSPORT_EVENT, BLOCKCHAIN_EVENT } from '../../constants';
import * as POPUP from '../../constants/popup';
import * as IFRAME from '../../constants/iframe';
import * as UI from '../../constants/ui';
import * as ERROR from '../../constants/errors';

import type { ConnectSettings } from '../../data/ConnectSettings';
import * as $T from '../../types';

export const eventEmitter = new EventEmitter();
const _log: Log = initLog('[trezor-connect.js]');

let _settings: ConnectSettings;
let _core: Core;

let _messageID: number = 0;
export const messagePromises: { [key: number]: $T.Deferred<any> } = {};

export const manifest = (data: any) => {
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
    // TODO: destructuring with type
    // https://github.com/Microsoft/TypeScript/issues/240
    // const { id, event, type, data, error }: CoreMessage = message;
    const id: number = message.id || 0;
    const event: string = message.event;
    const type: string = message.type;
    const payload: any = message.payload;

    if (type === UI.REQUEST_UI_WINDOW) {
        _core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE }, true);
        return;
    }

    _log.log('handleMessage', message);

    switch (event) {
        case RESPONSE_EVENT :
            if (messagePromises[id]) {
                // clear unnecessary fields from message object
                delete message.type;
                delete message.event;
                // delete message.id;
                // message.__id = id;
                // resolve message promise (send result of call method)
                messagePromises[id].resolve(message);
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

const postMessage = (message: any, usePromise: boolean = true): ?Promise<void> => {
    if (!_core) {
        throw new Error('postMessage: _core not found');
    }
    if (usePromise) {
        _messageID++;
        message.id = _messageID;
        messagePromises[_messageID] = createDeferred();
        _core.handleMessage(message, true);
        return messagePromises[_messageID].promise;
    }

    _core.handleMessage(message, true);
    return null;
};

export const init = async (settings: Object = {}): Promise<void> => {
    if (!_settings) {
        _settings = parseSettings(settings);
    }
    // set defaults for node
    _settings.origin = 'http://node.trezor.io/';
    _settings.popup = false;
    _settings.env = 'node';

    if (!_settings.manifest) {
        throw ERROR.MANIFEST_NOT_SET;
    }

    if (!_settings.supportedBrowser) {
        throw ERROR.BROWSER_NOT_SUPPORTED;
    }

    if (_settings.lazyLoad) {
        // reset "lazyLoad" after first use
        _settings.lazyLoad = false;
        return;
    }

    _log.enabled = _settings.debug;

    // instead of "checkBrowser"
    browserState.name = 'nodejs';
    browserState.supported = true;

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
            return { success: false, payload: { error } };
        }
    }

    try {
        const response: ?Object = await postMessage({ type: IFRAME.CALL, payload: params });
        if (response) {
            return response;
        } else {
            return { success: false, payload: { error: 'No response from iframe' } };
        }
    } catch (error) {
        _log.error('__call error', error);
        return error;
    }
};

const customMessageResponse = (payload: ?{ message: string, params?: Object }): void => {
    _core.handleMessage({
        event: UI_EVENT,
        type: UI.CUSTOM_MESSAGE_RESPONSE,
        payload,
    }, true);
};

export const uiResponse = (response: $T.UiResponse): void => {
    _core.handleMessage({ event: UI_EVENT, ...response }, true);
};

export const renderWebUSBButton = (className: ?string): void => {
    // webUSBButton(className, _settings.webusbSrc, iframe.origin);
};

export const getSettings: $T.GetSettings = async () => {
    if (!_core) {
        return { success: false, payload: { error: 'Core not initialized yet, you need to call TrezorConnect.init or any other method first.' } };
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
    delete params.callback;
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

    const response = await call({ method: 'customMessage', ...params });
    _core.removeListener(CORE_EVENT, customMessageListener);
    return response;
};

export const requestLogin: $T.RequestLogin = async (params) => {
    // $FlowIssue: property callback not found
    if (typeof params.callback === 'function') {
        const callback = params.callback;
        delete params.callback; // delete callback value. this field cannot be sent using postMessage function

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

        const response = await call({ method: 'requestLogin', ...params, asyncChallenge: true });
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
    throw new Error('This version of trezor-connect is not suitable to work without browser');
};
