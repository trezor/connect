/* @flow */
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import TrezorBase, { eventEmitter } from '../index';

import { UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT, TRANSPORT_EVENT } from '../constants';
import * as TRANSPORT from '../constants/transport';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';
import * as DEVICE from '../constants/device';

import { NO_IFRAME, IFRAME_INITIALIZED, DEVICE_CALL_IN_PROGRESS, IFRAME_TIMEOUT } from '../constants/errors';
import PopupManager from '../popup/PopupManager';
import Log, { init as initLog, getLog } from '../utils/debug';
import css from '../iframe/inline-styles';

import { create as createDeferred } from '../utils/deferred';

import { parseMessage, UiMessage } from '../core/CoreMessage';

import { parse as parseSettings } from './ConnectSettings';
import type { ConnectSettings } from './ConnectSettings';
import type { Deferred, CoreMessage } from 'flowtype';

const _log: Log = initLog('[trezor-connect.js]');

let _settings: ConnectSettings;
let _popupManager: PopupManager;
let _iframe: HTMLIFrameElement;
let _iframeOrigin: string;
let _iframePromise: Deferred<void>;
let _iframeTimeout: number;
let _iframeError: ?string;
let _messageID: number = 0;

// every postMessage to iframe has its own promise to resolve
const _messagePromises: { [key: number]: Deferred<any> } = {};

const initIframe = async (settings: Object): Promise<void> => {
    const existedFrame: HTMLIFrameElement = (document.getElementById('trezorconnect'): any);
    if (existedFrame) {
        _iframe = existedFrame;
    } else {
        _iframe = document.createElement('iframe');
        _iframe.frameBorder = '0';
        _iframe.width = '0px';
        _iframe.height = '0px';
        _iframe.style.position = 'absolute';
        _iframe.style.display = 'none';
        _iframe.style.border = '0px';
        _iframe.style.width = '0px';
        _iframe.style.height = '0px';
        _iframe.id = 'trezorconnect';
    }
    if (!_settings)
        _settings = parseSettings(settings);
    if (!_popupManager)
        _popupManager = initPopupManager();
    _log.enabled = _settings.debug;

    const src: string = `${_settings.iframeSrc}?${ Date.now() }`;
    _iframe.setAttribute('src', src);
    if (_settings.webusb) {
        _iframe.setAttribute('allow', 'usb');
    }

    // eslint-disable-next-line no-irregular-whitespace
    const iframeSrcHost: ?Array<string> = _iframe.src.match(/^.+\:\/\/[^\‌​/]+/);
    if (iframeSrcHost && iframeSrcHost.length > 0) { _iframeOrigin = iframeSrcHost[0]; }

    _iframe.onload = () => {
        // TODO: check if loaded iframe is not 404/500 etc.
        if (typeof window.chrome !== 'undefined' && window.chrome.runtime && window.chrome.runtime.onConnect) {
            window.chrome.runtime.onConnect.addListener(() => {
                _log.log('chrome.runtime.onConnect');
            });
        }

        _iframe.contentWindow.postMessage({
            type: UI.IFRAME_HANDSHAKE,
            payload: _settings,
        }, _iframeOrigin);

        _iframe.onload = undefined;
    }

    if (document.body) {
        document.body.appendChild(_iframe);
    }

    _iframePromise = createDeferred();
    _iframeTimeout = window.setTimeout(() => {
        _iframePromise.reject( IFRAME_TIMEOUT );
    }, 10000);

    try {
        await _iframePromise.promise;
    } catch(error) {
        _iframeError = error.message;
        throw error;
    } finally {
        window.clearTimeout(_iframeTimeout);
        _iframeTimeout = 0;
    }

};

const injectStyleSheet = (): void => {
    const doc: Document = _iframe.ownerDocument;
    const head: HTMLElement = doc.head || doc.getElementsByTagName('head')[0];
    const style: HTMLStyleElement = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'TrezorConnectStylesheet');

    // $FlowIssue
    if (style.styleSheet) { // IE
        // $FlowIssue
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.append(style);
};

const initPopupManager = (): PopupManager => {
    const pm: PopupManager = new PopupManager(_settings);
    pm.on(POPUP.CLOSED, () => {
        postMessage({ type: POPUP.CLOSED }, false);
    });
    return pm;
};

// post messages to iframe
const postMessage = (message: any, usePromise: boolean = true): ?Promise<void> => {

    if (usePromise) {
        _messageID++;
        message.id = _messageID;
        _messagePromises[_messageID] = createDeferred();
        _iframe.contentWindow.postMessage(message, _iframeOrigin);
        return _messagePromises[_messageID].promise;
    }

    _iframe.contentWindow.postMessage(message, _iframeOrigin);
    return null;
};

// handle message received from iframe
const handleMessage = (messageEvent: Message): void => {
    // ignore messages from domain other then iframe origin
    if (messageEvent.origin !== _iframeOrigin) return;

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
            if (_messagePromises[id]) {
                // _messagePromises[id].resolve(data);
                delete message.type;
                delete message.event;
                _messagePromises[id].resolve(message);
                delete _messagePromises[id];
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
                    _iframePromise.reject( new Error(payload.error) );
                } else {
                    _iframePromise.resolve();
                }
                injectStyleSheet();
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

class TrezorConnect extends TrezorBase {

    static async init(settings: Object = {}): Promise<void> {

        if (_iframe) { throw IFRAME_INITIALIZED; }

        window.addEventListener('message', handleMessage);
        window.addEventListener('beforeunload', () => {
            if (_popupManager) {
                _popupManager.onBeforeUnload();
            }

            if (_iframe) {
                _iframe.setAttribute('src', _iframeOrigin);
            }
        });

        await initIframe(settings);
    }

    static uiResponse(message: Object): void {
        // _core.handleMessage({ event: UI_EVENT, ...message });
        postMessage({ event: UI_EVENT, ...message });
    }

    static changeSettings(settings: Object) {
        const parsedSettings: ConnectSettings = parseSettings(settings);
        _log.enabled = parsedSettings.debug;
        postMessage({ type: UI.CHANGE_SETTINGS, payload: parsedSettings }, false);
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
        postMessage({
            event: UI_EVENT,
            type: UI.CUSTOM_MESSAGE_RESPONSE,
            payload: message
        });
    }

    static async requestLogin(params: Object): Promise<Object> {

        if (typeof params.callback === 'function') {
            const callback: Function = params.callback;
            delete params.callback;
            params.asyncChallenge = true; // replace value for callback (cannot be function)

            const loginChallengeListener = async (event: Message) => {
                const data = event.data;
                if (data && data.type == UI.LOGIN_CHALLENGE_REQUEST) {
                    const response = await callback();
                    postMessage({
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

        if (!_iframe && !_iframePromise) {
            //const dc = { connectSrc: 'https://sisyfos.trezor.io/next/', popup: true, debug: true }
            // const dc = { connectSrc: 'http://localhost:8082/', popup: true, debug: true }
            _settings = parseSettings({});
            _popupManager = initPopupManager();
            _popupManager.request(true);
            try {
                await this.init(_settings);
                _popupManager.resolveLazyLoad();
            } catch (error) {
                _popupManager.close();
                return { success: false, message: error };
            }
        }

        if (_iframeTimeout) {
            // this.init was called, but iframe doesn't return handshake yet
            return { success: false, message: NO_IFRAME.message };
        } else if(_iframeError) {
            // iframe was initialized with error
            return { success: false, message: _iframeError };
        }

        // request popup window it might be used in the future
        // if (eventEmitter.listeners(UI_EVENT).length < 1) { _popupManager.request(params); }
        if (_settings.popup) { _popupManager.request(); }

        // post message to iframe
        try {
            const response: ?Object = await postMessage({ type: IFRAME.CALL, payload: params });
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

    static transportConnect(): void {
        postMessage({ type: TRANSPORT.RECONNECT, payload: {} }, false);
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
                const iframe = document.createElement('iframe');
                iframe.frameBorder = '0';
                iframe.width = Math.round(bounds.width) + 'px';
                iframe.height = Math.round(bounds.height) + 'px';
                iframe.style.position = 'absolute';
                iframe.style.top = '0px';
                iframe.style.left = '0px';
                iframe.style.zIndex = '1';
                iframe.style.opacity = '0';
                iframe.setAttribute('allow', 'usb');
                iframe.setAttribute('scrolling', 'no');
                iframe.onload = () => {
                    iframe.contentWindow.postMessage({
                        // style: JSON.stringify( window.getComputedStyle(b) ),
                        // outer: b.outerHTML,
                        // inner: b.innerHTML
                    }, _iframeOrigin);
                }
                iframe.src = iframeSrc;

                // inject iframe into button
                b.append(iframe);
            }
        });
    }
}

// auto init
const scripts: HTMLCollection<HTMLScriptElement> = document.getElementsByTagName('script');
const index: number = scripts.length - 1;
const myself: HTMLScriptElement = scripts[index];
const queryString: string = myself.src.replace(/^[^\?]+\??/, '');

if (queryString === 'init') {
    TrezorConnect.init();
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
