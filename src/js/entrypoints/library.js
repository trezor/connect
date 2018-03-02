// @flow
'use strict';

/**
 * (C) 2017 SatoshiLabs
 * TODO: description
 * GPLv3
 */

import TrezorBase, { eventEmitter } from '../index';

import * as TRANSPORT from '../constants/transport';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as ERROR from '../constants/errors';
import * as UI from '../constants/ui';
import * as DEVICE from '../constants/device';

import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import { Core, CORE_EVENT, init as initCore } from '../core/Core';
import { UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT } from '../core/CoreMessage';
import type { CoreMessage } from '../core/CoreMessage';

import { parse as parseSettings } from './ConnectSettings';

import Log from '../utils/debug';

export {
    TRANSPORT,
    UI,
    DEVICE,
    UI_EVENT,
    DEVICE_EVENT,
    RESPONSE_EVENT,
};

let _core: Core;
let _messageID: number = 0;
const _messagePromises: { [key: number]: Deferred<any> } = {};
const _log: Log = new Log('[trezor-library.js]', true);

// Outgoing messages
const postMessage = (message: any): ?Promise<void> => {
    _messageID++;

    message.id = _messageID;

    _messagePromises[_messageID] = createDeferred();

    return _messagePromises[_messageID].promise;
};

// Incoming messages
const handleMessage = (message: CoreMessage) => {
    _log.log('[index.js]', 'onMessage', message);

    // TODO: destructuring with type
    // https://github.com/Microsoft/TypeScript/issues/240
    // const { id, event, type, data, error }: CoreMessage = message;
    const id: number = message.id || 0;
    const event: string = message.event;
    const type: string = message.type;
    const data: any = message.data;
    const error: any = message.error;

    switch (event) {

        case RESPONSE_EVENT :
            if (_messagePromises[id]) {
                // _messagePromises[id].resolve(data);
                _messagePromises[id].resolve(message);
                delete _messagePromises[id];
            } else {
                _log.warn(`Unknown message promise id ${id}`, _messagePromises);
            }
            break;

        case DEVICE_EVENT :
            // pass DEVICE event up to interpreter
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, data); // DEVICE_EVENT also emit single events (device_connect/device_disconnect...)
            break;

        case UI_EVENT :
            // filter and pass UI event up
            if (type === UI.REQUEST_UI_WINDOW) {
                // popup handshake is resolved automatically
                _core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE });
            } else if (type !== POPUP.CANCEL_POPUP_REQUEST) {
                eventEmitter.emit(event, type, data);
            }
            break;

        default:
            _log.warn('Undefined message ', event, message);
    }
};

export default class TrezorConnect extends TrezorBase {

    static async init(settings: Object): Promise<void> {
        if (_core) { throw ERROR.IFRAME_INITIALIZED; }

        if (!settings) settings = {};
        // settings.hostname = document.location.hostname;

        _core = await initCore(parseSettings(settings));
        _core.on(CORE_EVENT, handleMessage);

        window.addEventListener('beforeunload', () => {
            if (_core) {
                _core.onBeforeUnload();
            }
        });
    }

    static changeSettings(settings: Object) {
        _core.handleMessage({ type: UI.CHANGE_SETTINGS, data: parseSettings(settings) });
    }

    // static async getPublicKey(params: Object): Promise<Object> {
    //     return await TrezorConnect.__call( { method: 'getxpub', ...params } );
    // }

    // // TODO
    // static async customCall(params: Object): Promise<Object> {
    //     return await TrezorConnect.__call(params);
    // }

    static async accountDiscovery(params: Object): Promise<Object> {
        return await this.__call({ method: 'discovery', ...params });
    }

    static uiMessage(message: Object): void {
        // TODO: parse and validate incoming data injections
        //
        _core.handleMessage({ event: UI_EVENT, ...message });
    }

    static async __call(params: Object): Promise<Object> {
        // post message to iframe
        try {
            if (!_core) {
                return { success: false, message: 'Core not initialized yet' };
            }

            _messageID++;
            // make sure that promise reference is present before sending to Core
            _messagePromises[_messageID] = createDeferred();
            const promise: Promise<Object> = _messagePromises[_messageID].promise;

            // send to Core
            _core.handleMessage({ id: _messageID, type: IFRAME.CALL, data: params });

            // wait for response (handled in handleMessage function)
            const response: ?Object = await promise;
            if (response) {
                return response;
            } else {
                // TODO
                return { success: false };
            }
        } catch (error) {
            _log.error('__call error', error);
            return error;
        }
    }

    static dispose(): void {
        // TODO
        // super.dispose();
    }

    static getVersion(): Object {
        return {
            type: 'library',
        };
    }

}

// module.exports = TrezorConnect;
// module.exports = TrezorConnect;

// (function (root, factory) {

//     console.log("AAAAAAAAA", typeof exports, typeof define, root)

    // if (typeof define === 'function' && define.amd) {
    //     // AMD
    //     define("TrezorConnect", [], Trezor);
    // } else if(typeof exports === 'object' && typeof module === 'object') {
    //     module.exports = Trezor;
    // } else if (typeof exports === 'object') {
    //     // Node, CommonJS-like
    //     exports["TrezorConnect"] = Trezor;
    // } else {
    //     // Browser globals (root is window)
    //     window["TrezorConnect"] = Trezor;
    // }

    // window.TrezorConnect = Trezor;
// }(this, function() {
//     console.log("AAAA", Trezor)
//     return Trezor;
// }));
