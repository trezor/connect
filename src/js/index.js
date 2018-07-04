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
import Log, { init as initLog, getLog } from './utils/debug';
import { parseMessage, UiMessage } from './core/CoreMessage';
import { parse as parseSettings } from './data/ConnectSettings';

import type { ConnectSettings } from './data/ConnectSettings';
import type { CoreMessage } from 'flowtype';
import * as Params from 'flowtype/params';
import * as Response from 'flowtype/response';


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

    static async cipherKeyValue(params: Params.P_CipherKeyValue): Promise<Response.R_CipherKeyValue> {
        return await this.__call({ method: 'cipherKeyValue', ...params });
    }

    static async composeTransaction(params: Params.P_ComposeTransaction): Promise<Response.R_ComposeTransaction> {
        return await this.__call({ method: 'composeTransaction', ...params });
    }

    static async ethereumGetAddress(params: Params.P_EthereumGetAddress): Promise<Response.R_EthereumGetAddress> {
        return await this.__call({ method: 'ethereumGetAddress', ...params });
    }

    static async ethereumSignMessage(params: Params.P_EthereumSignMessage): Promise<Object> {
        return await this.__call({ method: 'ethereumSignMessage', ...params });
    }

    static async ethereumSignTransaction(params: Params.P_EthereumSignTransaction): Promise<Response.R_EthereumSignTransaction> {
        return await this.__call({ method: 'ethereumSignTransaction', ...params });
    }

    static async ethereumVerifyMessage(params: Params.P_EthereumVerifyMessage): Promise<Object> {
        return await this.__call({ method: 'ethereumVerifyMessage', ...params });
    }

    static async getAccountInfo(params: Params.P_GetAccountInfo): Promise<Response.R_GetAccountInfo> {
        return await this.__call({ method: 'getAccountInfo', ...params });
    }

    static async getAddress(params: Params.P_GetAddress): Promise<Response.R_GetAddress> {
        return await this.__call({ method: 'getAddress', ...params });
    }

    static async getDeviceState(params: Params.P_GetDeviceState): Promise<Response.R_GetDeviceState> {
        return await this.__call({ method: 'getDeviceState', ...params });
    }

    static async getFeatures(params: Params.P_GetFeatures): Promise<Response.R_GetFeatures> {
        return await this.__call({ method: 'getFeatures', ...params });
    }

    static async getPublicKey(params: Params.P_GetPublicKey): Promise<Response.R_GetPublicKey> {
        return await this.__call({ method: 'getPublicKey', ...params });
    }

    static async nemGetAddress(params: Params.P_NEMGetAddress): Promise<Response.R_NEMGetAddress> {
        return await this.__call({ method: 'nemGetAddress', ...params });
    }

    static async nemSignTransaction(params: Params.P_NEMSignTransaction): Promise<Response.R_NEMSignTransaction> {
        return await this.__call({ method: 'nemSignTransaction', ...params });
    }

    static async signMessage(params: Params.P_SignMessage): Promise<Response.R_SignMessage> {
        return await this.__call({ method: 'signMessage', ...params });
    }

    static async signTransaction(params: Params.P_SignTransaction): Promise<Response.R_SignTransaction> {
        return await this.__call({ method: 'signTransaction', ...params });
    }

    static async stellarGetAddress(params: Params.P_StellarGetAddress): Promise<Response.R_StellarGetAddress> {
        return await this.__call({ method: 'stellarGetAddress', ...params });
    }

    static async stellarGetPublicKey(params: Object): Promise<Object> {
        return await this.__call({ method: 'stellarGetPublicKey', ...params });
    }

    static async stellarSignTransaction(params: Params.P_StellarSignTransaction): Promise<Response.R_StellarSignTransaction> {
        return await this.__call({ method: 'stellarSignTransaction', ...params });
    }

    static async verifyMessage(params: Params.P_VerifyMessage): Promise<Response.R_VerifyMessage> {
        return await this.__call({ method: 'verifyMessage', ...params });
    }

    static dispose(): void {
        // TODO
    }

    static renderWebUSBButton(className: ?string): void {
        const query = className ? className : '.trezor-webusb-button';
        const buttons = document.querySelectorAll(query);
        const iframeSrc: string = `${_settings.webusbSrc}?${ Date.now() }`;

        buttons.forEach(b => {
            if (b.getElementsByTagName('iframe').length < 1) {
                const bounds = b.getBoundingClientRect();
                const btnIframe = document.createElement('iframe');
                btnIframe.frameBorder = '0';
                btnIframe.width = Math.round(bounds.width) + 'px';
                btnIframe.height = Math.round(bounds.height) + 'px';
                btnIframe.style.position = 'absolute';
                btnIframe.style.top = '0px';
                btnIframe.style.left = '0px';
                btnIframe.style.zIndex = '1';
                btnIframe.style.opacity = '0';
                btnIframe.setAttribute('allow', 'usb');
                btnIframe.setAttribute('scrolling', 'no');
                btnIframe.onload = () => {
                    btnIframe.contentWindow.postMessage({
                        // style: JSON.stringify( window.getComputedStyle(b) ),
                        // outer: b.outerHTML,
                        // inner: b.innerHTML
                    }, iframe.origin);
                }
                btnIframe.src = iframeSrc;

                // inject iframe into button
                b.append(btnIframe);
            }
        });
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
