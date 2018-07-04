/* @flow */
'use strict';

import { CORE_EVENT, UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT } from '../constants';
import { LOG } from '../constants/popup';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';
import * as TRANSPORT from '../constants/transport';

import { parse as parseSettings } from '../data/ConnectSettings';
import DataManager from '../data/DataManager';
import type { ConnectSettings } from '../data/ConnectSettings';

import { Core, init as initCore, initTransport } from '../core/Core';
import { parseMessage, UiMessage, ResponseMessage, TransportMessage } from '../core/CoreMessage';

import type { CoreMessage } from 'flowtype';

import Log, { init as initLog, getLog } from '../utils/debug';
import { checkBrowser, state as browserState } from '../utils/browser';
import { getOrigin } from '../utils/networkUtils';
import { load as loadStorage, PERMISSIONS_KEY } from './storage';
let _core: Core;

// custom log
const _log: Log = initLog('IFrame');
const _logFromPopup: Log = initLog('Popup');

let _popupMessagePort: ?MessagePort;

// Wrapper which listen events from Core

// since iframe.html needs to send message via window.postMessage
// we need to listen events from Core and convert it to simple objects possible to send over window.postMessage

const handleMessage = (event: Message): void => {
    // ignore messages from myself (chrome bug?)
    if (event.source === window || !event.data) return;
    const data = event.data;

    // respond to call
    // TODO: instead of error _core should be initialized automatically
    if (!_core && data.type === IFRAME.CALL && typeof data.id === 'number') {
        postMessage(new ResponseMessage(data.id, false, { error: "Core not initialized yet!"} ) );
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        return;
    }

    // catch first message from connect.js (parent window)
    if (!DataManager.getSettings('origin') && data.type === UI.IFRAME_HANDSHAKE) {
        init(data.payload, event.origin);
        return;
    }

    // handle popup handshake event to get reference to popup MessagePort
    if (data.type === POPUP.OPENED && event.origin === window.location.origin) {
        // $FlowIssue
        if (event.ports.length > 0) {
            if (!_core) {
                event.ports[0].postMessage(POPUP.CLOSE);
                return;
            }

            // $FlowIssue
            _popupMessagePort = event.ports[0];
            const method = _core.getCurrentMethod()[0];

            postMessage(new UiMessage(POPUP.HANDSHAKE, {
                settings: DataManager.getSettings(),
                method: method ? method.info : ""
            }))
        }
    }

    // clear reference to popup MessagePort
    if (data.type === POPUP.CLOSED) {
        _popupMessagePort = null;
    }

    // is message from popup or extension
    const whitelist = DataManager.isWhitelisted(event.origin);
    const isTrustedDomain: boolean = (event.origin === window.location.origin || !!whitelist);

    // ignore messages from domain other then parent.window or popup.window or chrome extension
    if (getOrigin(event.origin) !== getOrigin(document.referrer) && !isTrustedDomain) return;

    const message: CoreMessage = parseMessage(data);

    // prevent from passing event up
    event.preventDefault();
    event.stopImmediatePropagation();

    switch (message.type) {
        // utility: print log from popup window

        case 'getlog' :
            postMessage(new ResponseMessage(message.id || 0, true, getLog()));
            break;
        case LOG :
            // $FlowIssue
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

    if (message.type === UI.REQUEST_UI_WINDOW && !DataManager.getSettings('popup')) {
        // popup handshake is resolved automatically
        _core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE }, true);
        return;
    }
    // check if permissions to read is granted
    const trustedHost: boolean = DataManager.getSettings('trustedHost');
    const handshake: boolean = message.type === UI.IFRAME_HANDSHAKE;
    if (!trustedHost && !handshake && (message.event === TRANSPORT_EVENT)) {
        return;
    }
    if (!trustedHost && message.event === DEVICE_EVENT && !filterDeviceEvent(message)) {
        return;
    }
    _log.debug('postMessage', message);
    // window.top.postMessage(message, DataManager.getSettings('origin'));

    const parentMessages = [ UI.IFRAME_HANDSHAKE, UI.CLOSE_UI_WINDOW, POPUP.CANCEL_POPUP_REQUEST, UI.CUSTOM_MESSAGE_REQUEST, UI.LOGIN_CHALLENGE_REQUEST ];
    if (message.event === UI_EVENT && parentMessages.indexOf(message.type) < 0) {
        if (_popupMessagePort) {
            _popupMessagePort.postMessage(message);
        } else {
            // TODO: communication error
        }
    } else {
        window.top.postMessage(message, DataManager.getSettings('origin'));
    }
};

const filterDeviceEvent = (message: CoreMessage): boolean => {
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
    const parsedSettings: ConnectSettings = parseSettings(settings);
    parsedSettings.origin = origin; // set origin manually to avoid injection from settings

    try {
        _log.enabled = _logFromPopup.enabled = parsedSettings.debug;

        // initialize core
        _core = await initCore(parsedSettings);
        _core.on(CORE_EVENT, postMessage);

        // check if browser is supported
        checkBrowser();
        if (browserState.supported) {
            // initialize transport and wait for the first transport event (start or error)
            await initTransport(parsedSettings);
        }

        postMessage(new UiMessage(UI.IFRAME_HANDSHAKE, {
            browser: browserState
        }));
    } catch (error) {
        postMessage(new UiMessage(UI.IFRAME_HANDSHAKE, {
            browser: browserState,
            error: error.message,
        }));
    }
}

window.addEventListener('message', handleMessage, false);
window.addEventListener('beforeunload', () => {
    if (_core) {
        _core.onBeforeUnload();
    }
});
