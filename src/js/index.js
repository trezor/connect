/* @flow */
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * GPLv3
 */

import EventEmitter from 'events';

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
import Log, { init as initLog, getLog } from './utils/debug';
import { parseMessage, UiMessage } from './core/CoreMessage';
import { parse as parseSettings } from './data/ConnectSettings';

import type { ConnectSettings } from './data/ConnectSettings';
import type { CoreMessage } from 'flowtype';

import type {
    P_CipherKeyValue,
    P_ComposeTransaction,
    P_CustomMessage,
    P_EthereumGetAddress,
    P_EthereumSignMessage,
    P_EthereumSignTransaction,
    P_EthereumVerifyMessage,
    P_GetAccountInfo,
    P_GetAddress,
    P_GetDeviceState,
    P_GetFeatures,
    P_GetPublicKey,
    P_RequestLogin,
    P_NEMGetAddress,
    P_NEMSignTransaction,
    P_SignMessage,
    P_SignTransaction,
    P_StellarGetAddress,
    P_StellarSignTransaction,
    P_VerifyMessage
} from 'flowtype/params';

import type {
    R_CipherKeyValue,
    R_ComposeTransaction,
    R_CustomMessage,
    R_EthereumGetAddress,
    R_EthereumSignMessage,
    R_EthereumSignTransaction,
    R_EthereumVerifyMessage,
    R_GetAccountInfo,
    R_GetAddress,
    R_GetDeviceState,
    R_GetFeatures,
    R_GetPublicKey,
    R_RequestLogin,
    R_NEMGetAddress,
    R_NEMSignTransaction,
    R_SignMessage,
    R_SignTransaction,
    R_StellarGetAddress,
    R_StellarSignTransaction,
    R_VerifyMessage
} from 'flowtype/response';


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
const handleMessage = (messageEvent: Message): void => {
    // ignore messages from domain other then iframe origin
    if (messageEvent.origin !== iframe.origin) return;

    const message: CoreMessage = parseMessage(messageEvent.data);
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
                    iframe.initPromise.reject( new Error(payload.error) );
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

class TrezorConnect {

    static async init(settings: Object = {}): Promise<void> {

        if (iframe.instance) { throw IFRAME_INITIALIZED; }

        if (!_settings) {
            _settings = parseSettings(settings);
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

        await iframe.init(settings);
    }

    static on(type: string, fn: Function): void {
        eventEmitter.on(type, fn);
    }

    static off(type: string, fn: Function): void {
        eventEmitter.removeListener(type, fn);
    }

    static uiResponse(message: Object): void {
        iframe.postMessage({ event: UI_EVENT, ...message });
    }

    static changeSettings(settings: Object) {
        const parsedSettings: ConnectSettings = parseSettings(settings);
        _log.enabled = parsedSettings.debug;
        iframe.postMessage({ type: UI.CHANGE_SETTINGS, payload: parsedSettings }, false);
    }

    static async customMessage(params: Object): Promise<Object | void> {
        if (typeof params.callback !== 'function') {
            return {
                success: false,
                payload: {
                    error: 'Parameter "callback" is not a function'
                }
            }
        }

        // TODO: set message listener only if iframe is loaded correctly
        const callback = params.callback;
        delete params.callback;
        const customMessageListener = async (event: Message) => {
            const data = event.data;
            if (data && data.type == UI.CUSTOM_MESSAGE_REQUEST) {
                const response = await callback(data.payload);
                if (response) {
                    this.__customMessageResponse(response);
                } else {
                    this.__customMessageResponse({ message: 'release' });
                }
            }
        }
        window.addEventListener('message', customMessageListener, false);
        const response = await this.__call({ method: 'customMessage', ...params });
        window.removeEventListener('message', customMessageListener);
        return response;
    }

    static __customMessageResponse(message: Object): void {
        iframe.postMessage({
            event: UI_EVENT,
            type: UI.CUSTOM_MESSAGE_RESPONSE,
            payload: message
        });
    }

    static async requestLogin(params: Object): Promise<Object> {

        if (typeof params.callback === 'function') {
            const callback: Function = params.callback;
            delete params.callback;
            params.asyncChallenge = true; // replace value for callback (this field cannot be function)

            // TODO: set message listener only if iframe is loaded correctly
            const loginChallengeListener = async (event: Message) => {
                const data = event.data;
                if (data && data.type == UI.LOGIN_CHALLENGE_REQUEST) {
                    const response = await callback();
                    iframe.postMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload: response
                    });
                }
            }

            window.addEventListener('message', loginChallengeListener, false);
            const response = await this.__call({ method: 'requestLogin', ...params });
            window.removeEventListener('message', loginChallengeListener);
            return response;
        } else {
            return await this.__call({ method: 'requestLogin', ...params });
        }
    }

    static async __call(params: Object): Promise<Object> {


        if (!iframe.instance && !iframe.timeout) {
            // init popup with lazy loading before iframe initialization
            _settings = parseSettings({});
            _popupManager = initPopupManager();
            _popupManager.request(true);
            // auto init with default settings
            try {
                await this.init(_settings);
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
    }

    static async cipherKeyValue(params: P_CipherKeyValue): Promise<R_CipherKeyValue> {
        return await this.__call({ method: 'cipherKeyValue', ...params });
    }

    static async composeTransaction(params: P_ComposeTransaction): Promise<R_ComposeTransaction> {
        return await this.__call({ method: 'composeTransaction', ...params });
    }

    static async ethereumGetAddress(params: P_EthereumGetAddress): Promise<R_EthereumGetAddress> {
        return await this.__call({ method: 'ethereumGetAddress', ...params });
    }

    static async ethereumSignMessage(params: P_EthereumSignMessage): Promise<Object> {
        return await this.__call({ method: 'ethereumSignMessage', ...params });
    }

    static async ethereumSignTransaction(params: P_EthereumSignTransaction): Promise<R_EthereumSignTransaction> {
        return await this.__call({ method: 'ethereumSignTransaction', ...params });
    }

    static async ethereumVerifyMessage(params: P_EthereumVerifyMessage): Promise<Object> {
        return await this.__call({ method: 'ethereumVerifyMessage', ...params });
    }

    static async getAccountInfo(params: P_GetAccountInfo): Promise<R_GetAccountInfo> {
        return await this.__call({ method: 'getAccountInfo', ...params });
    }

    static async getAddress(params: P_GetAddress): Promise<R_GetAddress> {
        return await this.__call({ method: 'getAddress', ...params });
    }

    static async getDeviceState(params: P_GetDeviceState): Promise<R_GetDeviceState> {
        return await this.__call({ method: 'getDeviceState', ...params });
    }

    static async getFeatures(params: P_GetFeatures): Promise<R_GetFeatures> {
        return await this.__call({ method: 'getFeatures', ...params });
    }

    static async getPublicKey(params: P_GetPublicKey): Promise<R_GetPublicKey> {
        return await this.__call({ method: 'getPublicKey', ...params });
    }

    static async nemGetAddress(params: P_NEMGetAddress): Promise<R_NEMGetAddress> {
        return await this.__call({ method: 'nemGetAddress', ...params });
    }

    static async nemSignTransaction(params: P_NEMSignTransaction): Promise<R_NEMSignTransaction> {
        return await this.__call({ method: 'nemSignTransaction', ...params });
    }

    static async signMessage(params: P_SignMessage): Promise<R_SignMessage> {
        return await this.__call({ method: 'signMessage', ...params });
    }

    static async signTransaction(params: P_SignTransaction): Promise<R_SignTransaction> {
        return await this.__call({ method: 'signTransaction', ...params });
    }

    static async stellarGetAddress(params: P_StellarGetAddress): Promise<R_StellarGetAddress> {
        return await this.__call({ method: 'stellarGetAddress', ...params });
    }

    static async stellarGetPublicKey(params: Object): Promise<Object> {
        return await this.__call({ method: 'stellarGetPublicKey', ...params });
    }

    static async stellarSignTransaction(params: P_StellarSignTransaction): Promise<R_StellarSignTransaction> {
        return await this.__call({ method: 'stellarSignTransaction', ...params });
    }

    static async verifyMessage(params: P_VerifyMessage): Promise<R_VerifyMessage> {
        return await this.__call({ method: 'verifyMessage', ...params });
    }

    static dispose(): void {
        // TODO
    }

    static renderWebUSBButton(className: ?string): void {
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
    RESPONSE_EVENT,
};

// expose as window
window.TrezorConnect = TrezorConnect;
