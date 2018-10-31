/* @flow */
'use strict';

import EventEmitter from 'events';
import { UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT, TRANSPORT_EVENT, BLOCKCHAIN_EVENT } from './constants';
import * as TRANSPORT from './constants/transport';
import * as POPUP from './constants/popup';
import * as IFRAME from './constants/iframe';
import * as UI from './constants/ui';
import * as DEVICE from './constants/device';
import * as BLOCKCHAIN from './constants/blockchain';
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
            } else if (type === POPUP.BOOTSTRAP) {
                // Popup did open but is still loading JS
                _popupManager.cancelOpenTimeout();
                break;
            }

            // pass UI event up
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);

            if (type === UI.IFRAME_HANDSHAKE) {
                if (payload.error) {
                    iframe.initPromise.reject(new Error(payload.error));
                } else {
                    _popupManager.setBroadcast(payload.broadcast);
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
            return { success: false, payload: { error: 'Unsupported browser' } };
        }

        // auto init with default settings
        try {
            await init(_settings);
            await _popupManager.resolveLazyLoad();
        } catch (error) {
            _popupManager.close();
            return { success: false, payload: { error } };
        }
    }

    if (iframe.timeout) {
        // this.init was called, but iframe doesn't return handshake yet
        return { success: false, payload: { error: NO_IFRAME.message } };
    } else if (iframe.error) {
        // iframe was initialized with error
        return { success: false, payload: { error: iframe.error } };
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

    // methods

    static blockchainDisconnect: $T.BlockchainDisconnect = async (params) => {
        return await call({ method: 'blockchainDisconnect', ...params });
    }

    static blockchainSubscribe: $T.BlockchainSubscribe = async (params) => {
        return await call({ method: 'blockchainSubscribe', ...params });
    }

    static customMessage: $T.CustomMessage = async (params) => {
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

    static requestLogin: $T.RequestLogin = async (params) => {
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

    static resetDevice: $T.ResetDevice = async (params) => {
        return await call({ method: 'resetDevice', ...params });
    }

    static cardanoGetAddress: $T.CardanoGetAddress = async (params) => {
        return await call({ method: 'cardanoGetAddress', ...params });
    }

    static cardanoGetPublicKey: $T.CardanoGetPublicKey = async (params) => {
        return await call({ method: 'cardanoGetPublicKey', ...params });
    }

    static cardanoSignTransaction: $T.CardanoSignTransaction = async (params) => {
        return await call({ method: 'cardanoSignTransaction', ...params });
    }

    static cipherKeyValue: $T.CipherKeyValue = async (params) => {
        return await call({ method: 'cipherKeyValue', ...params });
    }

    static composeTransaction: $T.ComposeTransaction = async (params) => {
        return await call({ method: 'composeTransaction', ...params });
    }

    static ethereumGetAccountInfo: $T.EthereumGetAccountInfo = async (params) => {
        return await call({ method: 'ethereumGetAccountInfo', ...params });
    }

    static ethereumGetAddress: $T.EthereumGetAddress = async (params) => {
        return await call({ method: 'ethereumGetAddress', ...params });
    }

    static ethereumSignMessage: $T.EthereumSignMessage = async (params) => {
        return await call({ method: 'ethereumSignMessage', ...params });
    }

    static ethereumSignTransaction: $T.EthereumSignTransaction = async (params) => {
        return await call({ method: 'ethereumSignTransaction', ...params });
    }

    static ethereumVerifyMessage: $T.EthereumVerifyMessage = async (params) => {
        return await call({ method: 'ethereumVerifyMessage', ...params });
    }

    static getAccountInfo: $T.GetAccountInfo = async (params) => {
        return await call({ method: 'getAccountInfo', ...params });
    }

    static getAddress: $T.GetAddress = async (params) => {
        return await call({ method: 'getAddress', ...params });
    }

    static getDeviceState: $T.GetDeviceState = async (params) => {
        return await call({ method: 'getDeviceState', ...params });
    }

    static getFeatures: $T.GetFeatures = async (params) => {
        return await call({ method: 'getFeatures', ...params });
    }

    static getPublicKey: $T.GetPublicKey = async (params) => {
        return await call({ method: 'getPublicKey', ...params });
    }

    static liskGetAddress: $T.LiskGetAddress = async (params) => {
        return await call({ method: 'liskGetAddress', ...params });
    }

    static liskGetPublicKey: $T.LiskGetPublicKey = async (params) => {
        return await call({ method: 'liskGetPublicKey', ...params });
    }

    static liskSignMessage: $T.LiskSignMessage = async (params) => {
        return await call({ method: 'liskSignMessage', ...params });
    }

    static liskSignTransaction: $T.LiskSignTransaction = async (params) => {
        return await call({ method: 'liskSignTransaction', ...params });
    }

    static liskVerifyMessage: $T.LiskVerifyMessage = async (params) => {
        return await call({ method: 'liskVerifyMessage', ...params });
    }

    static nemGetAddress: $T.NEMGetAddress = async (params) => {
        return await call({ method: 'nemGetAddress', ...params });
    }

    static nemSignTransaction: $T.NEMSignTransaction = async (params) => {
        return await call({ method: 'nemSignTransaction', ...params });
    }

    static pushTransaction: $T.PushTransaction = async (params) => {
        return await call({ method: 'pushTransaction', ...params });
    }

    static rippleGetAddress: $T.RippleGetAddress = async (params) => {
        return await call({ method: 'rippleGetAddress', ...params });
    }

    static rippleSignTransaction: $T.RippleSignTransaction = async (params) => {
        return await call({ method: 'rippleSignTransaction', ...params });
    }

    static signMessage: $T.SignMessage = async (params) => {
        return await call({ method: 'signMessage', ...params });
    }

    static signTransaction: $T.SignTransaction = async (params) => {
        return await call({ method: 'signTransaction', ...params });
    }

    static stellarGetAddress: $T.StellarGetAddress = async (params) => {
        return await call({ method: 'stellarGetAddress', ...params });
    }

    static stellarSignTransaction: $T.StellarSignTransaction = async (params) => {
        return await call({ method: 'stellarSignTransaction', ...params });
    }

    static verifyMessage: $T.VerifyMessage = async (params) => {
        return await call({ method: 'verifyMessage', ...params });
    }

    static wipeDevice: $T.WipeDevice = async (params) => {
        return await call({ method: 'wipeDevice', ...params });
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
    BLOCKCHAIN,
    UI_EVENT,
    DEVICE_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
};

export type {
    Device,
    DeviceStatus,
    DeviceFirmwareStatus,
    DeviceMode,
    Features,
    DeviceMessageType,
    DeviceMessage,
    UiMessageType,
    UiMessage,
    TransportMessageType,
    TransportMessage,
    BlockchainMessageType,
    BlockchainMessage,
} from './types';

export type {
    EthereumAccount,
    Transaction as EthereumTransaction,
} from './types/ethereum';
