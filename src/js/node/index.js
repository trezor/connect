/* @flow */
import EventEmitter from 'events';
import path from 'path';
import { CORE_EVENT, UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT, TRANSPORT_EVENT, BLOCKCHAIN_EVENT } from '../constants';
import * as TRANSPORT from '../constants/transport';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';
import * as DEVICE from '../constants/device';
import * as BLOCKCHAIN from '../constants/blockchain';
import { IFRAME_INITIALIZED } from '../constants/errors';

import Log, { init as initLog } from '../utils/debug';
import { parse as parseSettings } from '../data/ConnectSettings';
import { checkBrowser } from '../utils/browser';
import { Core, init as initCore, initTransport } from '../core/Core';
import { create as createDeferred } from '../utils/deferred';

import type { ConnectSettings } from '../data/ConnectSettings';

import * as $T from '../types';

let _core: ?Core;
let _settings: ConnectSettings;

const eventEmitter: EventEmitter = new EventEmitter();
const _log: Log = initLog('[trezor-connect.js]');

let _messageID: number = 0;
export const messagePromises: { [key: number]: Deferred<any> } = {};

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

const init = async (settings: Object = {}): Promise<void> => {
    if (_core) { throw IFRAME_INITIALIZED; }

    if (!_settings) {
        _settings = parseSettings(settings);
    }

    // _settings.configSrc = '/Users/szymon.lesisz/Workspace/SatoshiLabs/trezor-connect/src/data/config.json';
    _settings.configSrc = path.resolve(global.TREZOR_CONNECT_ASSETS, './data/config.json');
    _settings.origin = 'http://node.trezor.io/';

    _log.enabled = _settings.debug;

    checkBrowser();
    _core = await initCore(_settings);
    _core.on(CORE_EVENT, handleMessage);

    await initTransport(_settings);

    // _core.on(CORE_EVENT, (event) => {
    //     if (event.event === DEVICE_EVENT && event.type === 'device-connect') {
    //         console.warn('-----on kor event', event);
    //         _core.handleMessage({
    //             type: 'iframe-call',
    //             id: 1,
    //             payload: {
    //                 method: 'getPublicKey',
    //                 path: "m/44'/0'/0'",
    //             }
    //         }, true);
    //     }
    // });
};

const postMessage = (message: any, usePromise: boolean = true): ?Promise<void> => {
    if (!_core) {
        throw new Error('elo');
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

const call = async (params: Object): Promise<Object> => {
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
        _core.handleMessage({ event: UI_EVENT, ...response });
    }

    // methods

    static blockchainDisconnect: $T.BlockchainDisconnect = async (params) => {
        return await call({ method: 'blockchainDisconnect', ...params });
    }

    static blockchainEstimateFee: $T.BlockchainEstimateFee = async (params) => {
        return await call({ method: 'blockchainEstimateFee', ...params });
    }

    static blockchainSubscribe: $T.BlockchainSubscribe = async (params) => {
        return await call({ method: 'blockchainSubscribe', ...params });
    }

    static blockchainUnsubscribe: $T.BlockchainSubscribe = async (params) => {
        return await call({ method: 'blockchainUnsubscribe', ...params });
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
        const customMessageListener = async (data: $T.CoreMessage) => {
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
        _core.off(CORE_EVENT, customMessageListener);
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
                    _core.handleMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload,
                    });
                }
            };

            _core.on(CORE_EVENT, loginChallengeListener, false);

            const response = await call({ method: 'requestLogin', ...params, asyncChallenge: true });
            _core.off(CORE_EVENT, loginChallengeListener);
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

    static rippleGetAccountInfo: $T.RippleGetAccountInfo = async (params) => {
        return await call({ method: 'rippleGetAccountInfo', ...params });
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

    static tezosGetAddress: $T.TezosGetAddress = async (params) => {
        return await call({ method: 'tezosGetAddress', ...params });
    }

    static tezosGetPublicKey: $T.TezosGetPublicKey = async (params) => {
        return await call({ method: 'tezosGetPublicKey', ...params });
    }

    static tezosSignTransaction: $T.TezosSignTransaction = async (params) => {
        return await call({ method: 'tezosSignTransaction', ...params });
    }

    static verifyMessage: $T.VerifyMessage = async (params) => {
        return await call({ method: 'verifyMessage', ...params });
    }

    static wipeDevice: $T.WipeDevice = async (params) => {
        return await call({ method: 'wipeDevice', ...params });
    }

    static dispose = (): void => {
        // _core
    }

    static cancel = (): void => {

    }

    static renderWebUSBButton = (className: ?string): void => {

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
} from '../types';

export * from '../types/blockchainEvent';
export * from '../types/account';

export type {
    Transaction as EthereumTransaction,
} from '../types/ethereum';

export type {
    Transaction as RippleTransaction,
} from '../types/ripple';

// TrezorConnect.getPublicKey({ path: "m/44'/0'/0/" }).then(r => console.log('r', r));

// TrezorConnect.init();

// import { CORE_EVENT, UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT } from '../constants';
// import { parse as parseSettings } from '../data/ConnectSettings';
// import { Core, init as initCore, initTransport } from '../core/Core';
// import { checkBrowser, state as browserState } from '../utils/browser';

// const parsedSettings: ConnectSettings = parseSettings({
//     configSrc: './data/config.json', // constant
//     debug: true,
//     origin: 'http://localhost/',
//     priority: 1,
//     trustedHost: false,
//     connectSrc: '',
//     iframeSrc: '',
//     popup: false,
//     popupSrc: '',
//     webusbSrc: '',
//     transportReconnect: false,
//     webusb: false,
//     pendingTransportEvent: true,
//     supportedBrowser: true,
//     extension: null,
// });
// // override constants
// parsedSettings.configSrc = '/Users/szymon.lesisz/Workspace/SatoshiLabs/trezor-connect/src/data/config.json';
// parsedSettings.origin = 'http://node.trezor.io/';

// let _core;

// const init = async () => {
//     checkBrowser();
//     _core = await initCore(parsedSettings);
//     _core.on(CORE_EVENT, (event) => {
//         if (event.event === DEVICE_EVENT && event.type === 'device-connect') {
//             console.warn('-----on kor event', event);
//             _core.handleMessage({
//                 type: 'iframe-call',
//                 id: 1,
//                 payload: {
//                     method: 'getPublicKey',
//                     path: "m/44'/0'/0'",
//                 }
//             }, true);
//         }
//     });

//     await initTransport(parsedSettings);
// };

// init();
