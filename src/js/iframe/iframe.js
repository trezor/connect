/* @flow */
'use strict';

import { LOG } from '../constants/popup';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as TRANSPORT from '../constants/transport';

import { parse as parseSettings } from '../entrypoints/ConnectSettings';
import DataManager from '../data/DataManager';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';

import { Core, CORE_EVENT, init as initCore, initTransport } from '../core/Core';
import { parseMessage, UiMessage, ErrorMessage, ResponseMessage, TransportMessage, CoreMessage, UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT, DeviceMessage } from '../core/CoreMessage';

import Log, { init as initLog, getLog } from '../utils/debug';
import { checkBrowser, state as browserState } from '../utils/browser';
import { getOrigin } from '../utils/networkUtils';
import { load as loadStorage, PERMISSIONS_KEY } from './storage';

let _core: Core;

// custom log
const _log: Log = initLog('IFrame');
const _logFromPopup: Log = initLog('Popup');

// Wrapper which listen events from Core

// since iframe.html needs to send message via window.postMessage
// we need to listen events from Core and convert it to simple objects possible to send over window.postMessage

const handleMessage = (event: MessageEvent): void => {
    // ignore messages from myself (chrome bug?)
    if (event.source === window) return;

    // respond to call
    if (!_core && event.data && event.data.type === IFRAME.CALL && typeof event.data.id === 'number') {
        postMessage(new ResponseMessage(event.data.id, false, { error: "Core not initialized yet!"} ) );
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        return;
    }

    // catch first message from connect.js (parent window)
    if (!DataManager.getSettings('origin') && event.data && event.data.type === IFRAME.HANDSHAKE && event.data.settings) {
        init(event.data.settings, event.origin);
        return;
    }

    // ignore not trusted (not working in FF)
    // if (!event.isTrusted) return;

    // is message from popup or extension
    const isTrustedDomain: boolean = (event.origin === window.location.origin || DataManager.isWhitelisted(event.origin));

    // ignore messages from domain other then parent.window or popup.window or chrome extension
    if (getOrigin(event.origin) !== getOrigin(document.referrer) && !isTrustedDomain) return;

    const message: CoreMessage = parseMessage(event.data);

    // prevent from passing event up
    event.preventDefault();
    event.stopImmediatePropagation();

    switch (message.type) {
        // utility: print log from popup window

        case 'getlog' :
            postMessage(new ResponseMessage(message.id || 0, true, getLog()));
            break;
        case LOG :
            if (typeof message.args === 'string') {
                const args = JSON.parse(message.args);
                // console[message.level].apply(this, args);
                // _log.debug.apply(this, args);
                _logFromPopup.debug(...args);
            }
            break;
    }

    // pass data to Core
    _core.handleMessage(message, isTrustedDomain);
};

// communication with parent window
const postMessage = (message: CoreMessage): void => {
    if (!window.top) {
        _log.error('Cannot reach window.top');
        return;
    }
    // check if permissions to read is granted
    const trustedHost: boolean = DataManager.getSettings('trustedHost');
    const handshake: boolean = message.type === IFRAME.HANDSHAKE;
    if (!trustedHost && !handshake && (message.event === TRANSPORT_EVENT)) {
        return;
    }
    if (!trustedHost && message instanceof DeviceMessage && !filterDeviceEvent(message)) {
        return;
    }
    _log.debug('postMessage', message);
    window.top.postMessage(message, DataManager.getSettings('origin'));
};

const filterDeviceEvent = (message: DeviceMessage): boolean => {
    if (message.payload && message.payload.features) {
        const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY);
        const features: any = message.payload.features;
        if (savedPermissions && Array.isArray(savedPermissions)) {
            const devicePermissions: Array<Object> = savedPermissions.filter(p => {
                return (p.origin === DataManager.getSettings('origin') && p.type === 'read' && p.device === features.device_id)
            });
            return (devicePermissions.length > 0);
        }
    }
    return false;
}

const init = async (settings: any, origin: string) => {
    try {
        const parsedSettings: ConnectSettings = parseSettings(settings);
        parsedSettings.origin = origin; // set origin manually to avoid injection from settings

        _log.enabled = _logFromPopup.enabled = parsedSettings.debug;
        _core = await initCore(parsedSettings);
        _core.on(CORE_EVENT, postMessage);
        checkBrowser();
        await initTransport(parsedSettings);
        postMessage(new UiMessage(IFRAME.HANDSHAKE, {
            browser: browserState
        }));
    } catch (error) {
        // TODO: kill app
        postMessage(new UiMessage(IFRAME.HANDSHAKE, {
            browser: browserState
        }));
        postMessage(new TransportMessage(TRANSPORT.ERROR, error.message || error));
    }
}

window.addEventListener('message', handleMessage, false);
window.addEventListener('beforeunload', () => {
    if (_core) {
        _core.onBeforeUnload();
    }
});
