/* @flow */
'use strict';

import { LOG } from '../constants/popup';
import * as IFRAME from '../constants/iframe';

import { parse as parseSettings } from '../entrypoints/ConnectSettings';

import { Core, CORE_EVENT, init as initCore } from '../core/Core';
import { parseMessage, UiMessage, ErrorMessage } from '../core/CoreMessage';
import type { CoreMessage } from '../core/CoreMessage';

import Log, { init as initLog } from '../utils/debug';
import { getOrigin } from '../utils/networkUtils';

let _core: Core;

// custom log
const logger: Log = initLog('IFrame');
const loggerPopup: Log = initLog('Popup');

// Wrapper which listen events from Core

// since iframe.html needs to send message via window.postMessage
// we need to listen events from Core and convert it to simple objects possible to send over window.postMessage

const handleMessage = (event: MessageEvent): void => {
    // ignore message from myself
    if (event.source === window) return;

    // ignore messages from domain other then parent.window or popup.window
    // if (event.origin !== window.top.location.origin && event.origin !== window.location.origin) return;
    if (getOrigin(event.origin) !== getOrigin(document.referrer) && event.origin !== window.location.origin && event.origin !== 'chrome-extension://imloifkgjagghnncjkhggdhalmcnfklk') return;

    const message: CoreMessage = parseMessage(event.data);

    // prevent from passing event up
    event.preventDefault();
    event.stopImmediatePropagation();

    switch (message.type) {
        // utility: print log from popup window
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
    _core.handleMessage(message);
};

// communication with parent window
const postMessage = (message: CoreMessage): void => {
    if (!window.top) {
        logger.error('Cannot reach window.top');
        return;
    }
    logger.debug('postMessage', message);
    window.top.postMessage(message, '*');
};

// init iframe.html
window.addEventListener('load', async (): Promise<void> => {
    try {
        window.addEventListener('message', handleMessage, false);

        // parse incoming settings stored in <iframe> data attributes
        const iframe: Element = window.frameElement;
        const attrSettings: { [k: string]: string } = {};

        if (iframe) {
            const attrs: Array<Attr> = [].filter.call(iframe.attributes, (a) => { return /^data-/.test(a.name); });
            let attr: Attr;
            for (attr of attrs) {
                attrSettings[ attr.name.replace('data-', '') ] = attr.value;
            }
        }
        _core = await initCore(parseSettings(attrSettings));
        _core.on(CORE_EVENT, postMessage);

        postMessage(new UiMessage(IFRAME.HANDSHAKE));
    } catch (error) {
        // TODO: kill app
        postMessage(new ErrorMessage(IFRAME.ERROR));
    }
}, false);
