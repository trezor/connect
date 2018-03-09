/* @flow */
'use strict';

import { LOG } from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as TRANSPORT from '../constants/transport';

import { parse as parseSettings } from '../entrypoints/ConnectSettings';
import DataManager from '../data/DataManager';

import { Core, CORE_EVENT, init as initCore } from '../core/Core';
import { parseMessage, UiMessage, ErrorMessage, ResponseMessage, TransportMessage } from '../core/CoreMessage';
import type { CoreMessage } from '../core/CoreMessage';

import Log, { init as initLog, getLog } from '../utils/debug';
import { getOrigin } from '../utils/networkUtils';

let _core: Core;
let _origin: string;

// custom log
const logger: Log = initLog('IFrame');
const loggerPopup: Log = initLog('Popup');

// Wrapper which listen events from Core

// since iframe.html needs to send message via window.postMessage
// we need to listen events from Core and convert it to simple objects possible to send over window.postMessage

const handleMessage = (event: MessageEvent): void => {
    // ignore messages from myself (chrome bug?)
    if (event.source === window) return;

    // first message from connect.js (parent window)
    if (!_origin && event.data && event.data.type === IFRAME.HANDSHAKE) {
        _origin = event.origin;
        init(event.data.settings);
        return;
    }

    // ignore not trusted (not working in FF)
    // if (!event.isTrusted) return;

    // is message from popup or extension
    // const isTrustedDomain: boolean = (event.origin === window.location.origin || event.origin === 'chrome-extension://imloifkgjagghnncjkhggdhalmcnfklk');
    const isTrustedDomain: boolean = (event.origin === window.location.origin || DataManager.config.whitelist.indexOf(event.origin) >= 0);

    // ignore messages from domain other then parent.window or popup.window or chrome extension
    // if (event.origin !== window.top.location.origin && event.origin !== window.location.origin) return;
    // if (getOrigin(event.origin) !== getOrigin(document.referrer) && event.origin !== window.location.origin && event.origin !== 'chrome-extension://imloifkgjagghnncjkhggdhalmcnfklk') return;
    if (getOrigin(event.origin) !== getOrigin(document.referrer) && !isTrustedDomain) return;

    const message: CoreMessage = parseMessage(event.data);

    // prevent from passing event up
    event.preventDefault();
    event.stopImmediatePropagation();

    switch (message.type) {
        // utility: print log from popup window

        case 'getlog' :
            postMessage(new ResponseMessage(message.id, true, getLog()));
            break;
        case LOG :
            if (typeof message.args === 'string') {
                const args = JSON.parse(message.args);
                // console[message.level].apply(this, args);
                // logger.debug.apply(this, args);
                loggerPopup.debug(...args);
            }
            break;
    }

    // pass data to Core
    _core.handleMessage(message, isTrustedDomain);
};

// communication with parent window
const postMessage = (message: CoreMessage): void => {
    if (!window.top) {
        logger.error('Cannot reach window.top');
        return;
    }
    logger.debug('postMessage', message);
    window.top.postMessage(message, _origin);
};

const init = async (settings: any) => {
    try {
        _core = await initCore(parseSettings(settings));
        _core.on(CORE_EVENT, postMessage);
        postMessage(new UiMessage(IFRAME.HANDSHAKE));
    } catch (error) {
        // TODO: kill app
        postMessage(new UiMessage(IFRAME.HANDSHAKE));
        postMessage(new TransportMessage(TRANSPORT.ERROR, error.message || error));
    }
}

window.addEventListener('message', handleMessage, false);

