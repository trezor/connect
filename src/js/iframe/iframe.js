/* @flow */
'use strict';

import { CORE_EVENT, UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT } from '../constants';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';

import { parse as parseSettings } from '../data/ConnectSettings';
import DataManager from '../data/DataManager';
import type { ConnectSettings } from '../data/ConnectSettings';

import { Core, init as initCore, initTransport } from '../core/Core';
import { parseMessage } from '../message';
import { UiMessage, ResponseMessage } from '../message/builder';

import type { CoreMessage, PostMessageEvent } from '../types';

import Log, { init as initLog } from '../utils/debug';
import { sendMessage } from '../utils/windowsUtils';
import { checkBrowser, state as browserState } from '../utils/browser';
import { getOrigin } from '../utils/networkUtils';
import { load as loadStorage, PERMISSIONS_KEY } from './storage';
let _core: Core;

// custom log
const _log: Log = initLog('IFrame');
const _logFromPopup: Log = initLog('Popup');

let _popupMessagePort: ?(MessagePort | BroadcastChannel);

// Wrapper which listen events from Core

// since iframe.html needs to send message via window.postMessage
// we need to listen events from Core and convert it to simple objects possible to send over window.postMessage

const handleMessage = (event: PostMessageEvent): void => {
    // ignore messages from myself (chrome bug?)
    if (event.source === window || !event.data) return;
    const data = event.data;

    // respond to call
    // TODO: instead of error _core should be initialized automatically
    if (!_core && data.type === IFRAME.CALL && typeof data.id === 'number') {
        // eslint-disable-next-line no-use-before-define
        postMessage(new ResponseMessage(data.id, false, { error: 'Core not initialized yet!' }));
        // eslint-disable-next-line no-use-before-define
        postMessage(new UiMessage(POPUP.CANCEL_POPUP_REQUEST));
        return;
    }

    // catch first message from connect.js (parent window)
    if (!DataManager.getSettings('origin') && data.type === UI.IFRAME_HANDSHAKE) {
        // eslint-disable-next-line no-use-before-define
        init(data.payload, event.origin);
        return;
    }

    // handle popup handshake event to get reference to popup MessagePort
    if (data.type === POPUP.OPENED && event.origin === window.location.origin) {
        if (_popupMessagePort && _popupMessagePort instanceof BroadcastChannel) {
            const method = _core.getCurrentMethod()[0];
            // eslint-disable-next-line no-use-before-define
            postMessage(new UiMessage(POPUP.HANDSHAKE, {
                settings: DataManager.getSettings(),
                transport: _core.getTransportInfo(),
                method: method ? method.info : null,
            }));
        } else {
            // $FlowIssue
            if (event.ports.length > 0) {
                if (!_core) {
                    event.ports[0].postMessage(POPUP.CLOSE);
                    return;
                }

                // $FlowIssue
                _popupMessagePort = event.ports[0];
                const method = _core.getCurrentMethod()[0];

                // eslint-disable-next-line no-use-before-define
                postMessage(new UiMessage(POPUP.HANDSHAKE, {
                    settings: DataManager.getSettings(),
                    transport: _core.getTransportInfo(),
                    method: method ? method.info : null,
                }));
            } else {
                console.warn('POPUP.OPENED: popupMessagePort not found');
            }
        }
    }

    // clear reference to popup MessagePort
    if (data.type === POPUP.CLOSED) {
        if (_popupMessagePort instanceof MessagePort) { _popupMessagePort = null; }
    }

    // is message from popup or extension
    const whitelist = DataManager.isWhitelisted(event.origin);
    const isTrustedDomain: boolean = (event.origin === window.location.origin || !!whitelist);

    // ignore messages from domain other then parent.window or popup.window or chrome extension
    const eventOrigin: string = getOrigin(event.origin);
    if (!isTrustedDomain && eventOrigin !== DataManager.getSettings('origin') && eventOrigin !== getOrigin(document.referrer)) return;

    const message: CoreMessage = parseMessage(data);

    // prevent from passing event up
    event.preventDefault();
    event.stopImmediatePropagation();

    // pass data to Core
    _core.handleMessage(message, isTrustedDomain);
};

// communication with parent window
const postMessage = (message: CoreMessage): void => {
    _log.debug('postMessage', message);

    const usingPopup: boolean = DataManager.getSettings('popup');
    const trustedHost: boolean = DataManager.getSettings('trustedHost');
    const handshake: boolean = message.type === UI.IFRAME_HANDSHAKE;

    // popup handshake is resolved automatically
    if (!usingPopup) {
        if (message.type === UI.REQUEST_UI_WINDOW) {
            _core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE }, true);
            return;
        } else if (message.type === POPUP.CANCEL_POPUP_REQUEST) {
            return;
        }
    }

    if (!trustedHost && !handshake && message.event === TRANSPORT_EVENT) {
        return;
    }
    // check if permissions to read from device is granted
    // eslint-disable-next-line no-use-before-define
    if (!trustedHost && message.event === DEVICE_EVENT && !filterDeviceEvent(message)) {
        return;
    }

    // eslint-disable-next-line no-use-before-define
    if (usingPopup && targetUiEvent(message)) {
        if (_popupMessagePort) {
            _popupMessagePort.postMessage(message);
        } else {
            console.warn('iframe postMessage: popupMessagePort not found');
        }
    } else {
        let origin: ?string = DataManager.getSettings('origin');
        if (!origin || origin.indexOf('file://') >= 0) origin = '*';
        sendMessage(message, origin);
    }
};

const targetUiEvent = (message: CoreMessage): boolean => {
    const whitelistedMessages = [
        UI.IFRAME_HANDSHAKE,
        UI.CLOSE_UI_WINDOW,
        POPUP.CANCEL_POPUP_REQUEST,
        UI.CUSTOM_MESSAGE_REQUEST,
        UI.LOGIN_CHALLENGE_REQUEST,
        UI.BUNDLE_PROGRESS,
    ];
    return (message.event === UI_EVENT && whitelistedMessages.indexOf(message.type) < 0);
};

const filterDeviceEvent = (message: CoreMessage): boolean => {
    if (message.payload && message.payload.features) {
        const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY) || loadStorage(PERMISSIONS_KEY, true);
        const features: any = message.payload.features;
        if (savedPermissions && Array.isArray(savedPermissions)) {
            const devicePermissions: Array<Object> = savedPermissions.filter(p => {
                return (p.origin === DataManager.getSettings('origin') && p.type === 'read' && p.device === features.device_id);
            });
            return (devicePermissions.length > 0);
        }
    }
    return false;
};

const init = async (payload: any, origin: string) => {
    const parsedSettings: ConnectSettings = parseSettings({ ...payload.settings, extension: payload.extension });
    // set origin manually
    parsedSettings.origin = !origin || origin === 'null' ? payload.settings.origin : origin;

    let broadcast: ?string;
    if (parsedSettings.popup && payload.extension) {
        broadcast = `${payload.extension}-${ new Date().getTime() }`;
        _popupMessagePort = new BroadcastChannel(broadcast);
        _popupMessagePort.onmessage = message => handleMessage(message);
    }

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
            browser: browserState,
            broadcast,
        }));
    } catch (error) {
        postMessage(new UiMessage(UI.IFRAME_HANDSHAKE, {
            browser: browserState,
            error: error.message,
        }));
    }
};

window.addEventListener('message', handleMessage, false);
window.addEventListener('beforeunload', () => {
    if (_core) {
        _core.onBeforeUnload();
    }
});
