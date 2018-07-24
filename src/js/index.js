/* @flow */
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * GPLv3
 */

import EventEmitter from 'events';
import 'babel-polyfill'; // for unsupported browsers

import { UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT, TRANSPORT_EVENT } from './constants';
import * as TRANSPORT from './constants/transport';
import * as POPUP from './constants/popup';
import * as IFRAME from './constants/iframe';
import * as UI from './constants/ui';
import * as DEVICE from './constants/device';
import { NO_IFRAME, IFRAME_INITIALIZED, DEVICE_CALL_IN_PROGRESS } from './constants/errors';

import PopupManager from './popup/PopupManager';
import * as iframe from './iframe/builder';
import webUSBButton from './webusb/button';
import Log, { init as initLog } from './utils/debug';
import { parseMessage } from './message';
import { parse as parseSettings } from './data/ConnectSettings';

import type { ConnectSettings } from './data/ConnectSettings';

import * as $T from './types';

const eventEmitter: EventEmitter = new EventEmitter();
const _log: Log = initLog('[trezor-connect.js]');

let _settings: ConnectSettings;
let _popupManager: PopupManager;

const initPopupManager = (): PopupManager => {
    const pm: PopupManager = new PopupManager(_settings);
    pm.on(POPUP.CLOSED, () => {
        iframe.postMessage({ type: POPUP.CLOSED }, false);
    });
    return pm;
};

// handle message received from iframe
const handleMessage = (messageEvent: $T.PostMessageEvent): void => {
    // ignore messages from domain other then iframe origin
    if (messageEvent.origin !== iframe.origin) return;

    const message: $T.CoreMessage = parseMessage(messageEvent.data);
    // TODO: destructuring with type
    // https://github.com/Microsoft/TypeScript/issues/240
    // const { id, event, type, data, error }: CoreMessage = message;
    const id: number = message.id || 0;
    const event: string = message.event;
    const type: string = message.type;
    const payload: any = message.payload;

    _log.log('handleMessage', message);

    switch (event) {
        case RESPONSE_EVENT :
            if (iframe.messagePromises[id]) {
                // clear unnecessary fields from message object
                delete message.type;
                delete message.event;
                // delete message.id;
                // message.__id = id;
                // resolve message promise (send result of call method)
                iframe.messagePromises[id].resolve(message);
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
            eventEmitter.emit(type, payload); // DEVICE_EVENT also emit single events (connect/disconnect...)
            break;

        case UI_EVENT :
            // pass UI event up
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);

            if (type === UI.IFRAME_HANDSHAKE) {
                if (payload.error) {
                    iframe.initPromise.reject(new Error(payload.error));
                } else {
                    iframe.initPromise.resolve();
                }
            } else if (type === POPUP.CANCEL_POPUP_REQUEST) {
                _popupManager.cancel();
            } else if (type === UI.CLOSE_UI_WINDOW) {
                _popupManager.close();
            }
            break;

        default:
            _log.log('Undefined message', event, messageEvent);
    }
};

const init = async (settings: Object = {}): Promise<void> => {
    if (iframe.instance) { throw IFRAME_INITIALIZED; }

    if (!_settings) {
        _settings = parseSettings(settings);
    }

    if (!_settings.supportedBrowser) {
        throw new Error('Unsupported browser');
    }

    if (!_popupManager) {
        _popupManager = initPopupManager();
    }

    _log.enabled = _settings.debug;

    window.addEventListener('message', handleMessage);
    window.addEventListener('beforeunload', () => {
        if (_popupManager) {
            _popupManager.onBeforeUnload();
        }

        iframe.dispose();
    });

    await iframe.init(_settings);
};

const call = async (params: Object): Promise<Object> => {
    if (!iframe.instance && !iframe.timeout) {
        // init popup with lazy loading before iframe initialization
        _settings = parseSettings({});
        _popupManager = initPopupManager();
        _popupManager.request(true);

        if (!_settings.supportedBrowser) {
            return { success: false, message: 'Unsupported browser' };
        }

        // auto init with default settings

        try {
            await init(_settings);
            _popupManager.resolveLazyLoad();
        } catch (error) {
            _popupManager.close();
            return { success: false, message: error };
        }
    }

    if (iframe.timeout) {
        // this.init was called, but iframe doesn't return handshake yet
        return { success: false, message: NO_IFRAME.message };
    } else if (iframe.error) {
        // iframe was initialized with error
        return { success: false, message: iframe.error };
    }

    // request popup window it might be used in the future
    // if (eventEmitter.listeners(UI_EVENT).length < 1) { _popupManager.request(params); }
    if (_settings.popup) { _popupManager.request(); }

    // post message to iframe
    try {
        const response: ?Object = await iframe.postMessage({ type: IFRAME.CALL, payload: params });
        if (response) {
            // TODO: unlock popupManager request only if there wasn't error "in progress"
            if (response.payload.error !== DEVICE_CALL_IN_PROGRESS.message) { _popupManager.unlock(); }
            return response;
        } else {
            _popupManager.unlock();
            // TODO
            return { success: false };
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

class TrezorConnect {
    static init = async (settings: $T.Settings): Promise<void> => {
        return await init(settings);
    }

    static on: $T.EventListener = (type, fn): void => {
        eventEmitter.on(type, fn);
    }

    static off: $T.EventListener = (type, fn): void => {
        eventEmitter.removeListener(type, fn);
    }

    static uiResponse = (response: $T.UiResponse): void => {
        iframe.postMessage({ event: UI_EVENT, ...response });
    }

    // deprecated
    static changeSettings = (settings: $T.Settings): void => {
        const parsedSettings: ConnectSettings = parseSettings(settings);
        _log.enabled = parsedSettings.debug;
        iframe.postMessage({ type: UI.CHANGE_SETTINGS, payload: parsedSettings }, false);
    }

    static customMessage = async (params: $T.$CustomMessage): Promise<$T.CustomMessage$> => {
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
        window.addEventListener('message', customMessageListener, false);

        const response = await call({ method: 'customMessage', ...params });
        window.removeEventListener('message', customMessageListener);
        return response;
    }

    static requestLogin = async (params: $T.$RequestLogin): Promise<$T.RequestLogin$> => {
        // $FlowIssue: property callback not found
        if (typeof params.callback === 'function') {
            const callback = params.callback;
            delete params.callback; // delete callback value. this field cannot be sent using postMessage function

            // TODO: set message listener only if iframe is loaded correctly
            const loginChallengeListener = async (event: $T.PostMessageEvent) => {
                const data = event.data;
                if (data && data.type === UI.LOGIN_CHALLENGE_REQUEST) {
                    const payload = await callback();
                    iframe.postMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload,
                    });
                }
            };

            window.addEventListener('message', loginChallengeListener, false);

            const response = await call({ method: 'requestLogin', ...params, asyncChallenge: true });
            window.removeEventListener('message', loginChallengeListener);
            return response;
        } else {
            return await call({ method: 'requestLogin', ...params });
        }
    }

    static cipherKeyValue = async (params: $T.$CipherKeyValue): Promise<$T.CipherKeyValue$> => {
        return await call({ method: 'cipherKeyValue', ...params });
    }

    static composeTransaction = async (params: $T.$ComposeTransaction): Promise<$T.ComposeTransaction$> => {
        return await call({ method: 'composeTransaction', ...params });
    }

    static ethereumGetAddress = async (params: $T.$EthereumGetAddress): Promise<$T.EthereumGetAddress$> => {
        return await call({ method: 'ethereumGetAddress', ...params });
    }

    static ethereumSignMessage = async (params: $T.$EthereumSignMessage): Promise<$T.EthereumSignMessage$> => {
        return await call({ method: 'ethereumSignMessage', ...params });
    }

    static ethereumSignTransaction = async (params: $T.$EthereumSignTransaction): Promise<$T.EthereumSignTransaction$> => {
        return await call({ method: 'ethereumSignTransaction', ...params });
    }

    static ethereumVerifyMessage = async (params: $T.$EthereumVerifyMessage): Promise<$T.EthereumVerifyMessage$> => {
        return await call({ method: 'ethereumVerifyMessage', ...params });
    }

    static tronGetAddress = async (params) => {
        return await call({ method: 'tronGetAddress', ...params });
    }

    static tronSignTx = async (params) => {
        return await call({ method: 'tronSignTx', ...params });
    }

    static getAccountInfo = async (params: $T.$GetAccountInfo): Promise<$T.GetAccountInfo$> => {
        return await call({ method: 'getAccountInfo', ...params });
    }

    static getAddress = async (params: $T.$GetAddress): Promise<$T.GetAddress$> => {
        return await call({ method: 'getAddress', ...params });
    }

    static getDeviceState = async (params: $T.$GetDeviceState): Promise<$T.GetDeviceState$> => {
        return await call({ method: 'getDeviceState', ...params });
    }

    static getFeatures = async (params: $T.$GetFeatures): Promise<$T.GetFeatures$> => {
        return await call({ method: 'getFeatures', ...params });
    }

    static getPublicKey = async (params: $T.$GetPublicKey): Promise<$T.GetPublicKey$> => {
        return await call({ method: 'getPublicKey', ...params });
    }

    static nemGetAddress = async (params: $T.$NEMGetAddress): Promise<$T.NEMGetAddress$> => {
        return await call({ method: 'nemGetAddress', ...params });
    }

    static nemSignTransaction = async (params: $T.$NEMSignTransaction): Promise<$T.NEMSignTransaction$> => {
        return await call({ method: 'nemSignTransaction', ...params });
    }

    static pushTransaction = async (params: $T.$PushTransaction): Promise<$T.PushTransaction$> => {
        return await call({ method: 'pushTransaction', ...params });
    }

    static signMessage = async (params: $T.$SignMessage): Promise<$T.SignMessage$> => {
        return await call({ method: 'signMessage', ...params });
    }

    static signTransaction = async (params: $T.$SignTransaction): Promise<$T.SignTransaction$> => {
        return await call({ method: 'signTransaction', ...params });
    }

    static stellarGetAddress = async (params: $T.$StellarGetAddress): Promise<$T.StellarGetAddress$> => {
        return await call({ method: 'stellarGetAddress', ...params });
    }

    // deprecated
    static stellarGetPublicKey = async (params: $T.$StellarGetAddress): Promise<$T.StellarGetAddress$> => {
        return await call({ method: 'stellarGetPublicKey', ...params });
    }

    static stellarSignTransaction = async (params: $T.$StellarSignTransaction): Promise<$T.StellarSignTransaction$> => {
        return await call({ method: 'stellarSignTransaction', ...params });
    }

    static verifyMessage = async (params: $T.$VerifyMessage): Promise<$T.VerifyMessage$> => {
        return await call({ method: 'verifyMessage', ...params });
    }

    static dispose = (): void => {
        // TODO
    }

    static renderWebUSBButton = (className: ?string): void => {
        webUSBButton(className, _settings.webusbSrc, iframe.origin);
    }
}

export default TrezorConnect;

export {
    TRANSPORT,
    UI,
    DEVICE,
    UI_EVENT,
    DEVICE_EVENT,
    TRANSPORT_EVENT,
    // RESPONSE_EVENT,
};

export type {
    Device,
    Features,
    DeviceMessageType,
    DeviceMessage,
    UiMessageType,
    UiMessage,
    TransportMessageType,
    TransportMessage,
} from './types';
