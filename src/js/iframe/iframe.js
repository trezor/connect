/* @flow */

import { CORE_EVENT, UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT } from '../constants';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';

import { parse as parseSettings } from '../data/ConnectSettings';
import DataManager from '../data/DataManager';

import { Core, init as initCore, initTransport } from '../core/Core';
import { parseMessage } from '../message';
import { UiMessage, ResponseMessage } from '../message/builder';

import type { CoreMessage, PostMessageEvent } from '../types';

import Log, { init as initLog } from '../utils/debug';
import { sendMessage } from '../utils/windowsUtils';
import { getOrigin } from '../env/browser/networkUtils';
import { suggestBridgeInstaller } from '../env/browser/browserUtils';
import { load as loadStorage, PERMISSIONS_KEY } from '../storage';
let _core: Core;

// custom log
const _log: Log = initLog('IFrame');
let _popupMessagePort: ?(MessagePort | BroadcastChannel);

// Wrapper which listen events from Core

// since iframe.html needs to send message via window.postMessage
// we need to listen events from Core and convert it to simple objects possible to send over window.postMessage

const handleMessage = (event: PostMessageEvent): void => {
    // ignore messages from myself (chrome bug?)
    if (event.source === window || !event.data) return;
    const data = event.data;
    const id = typeof data.id === 'number' ? data.id : 0;

    const fail = (error: string) => {
        // eslint-disable-next-line no-use-before-define
        postMessage(ResponseMessage(id, false, { error }));
        // eslint-disable-next-line no-use-before-define
        postMessage(UiMessage(POPUP.CANCEL_POPUP_REQUEST));
    };

    // respond to call
    // TODO: instead of error _core should be initialized automatically
    if (!_core && data.type === IFRAME.CALL) {
        fail('Core not initialized yet!');
        return;
    }

    // catch first message from window.opener
    if (data.type === IFRAME.INIT) {
        // eslint-disable-next-line no-use-before-define
        init(data.payload, event.origin);
        return;
    }

    // popup handshake initialization process, get reference to message channel
    if (data.type === POPUP.HANDSHAKE && event.origin === window.location.origin) {
        if (!_popupMessagePort || _popupMessagePort instanceof MessagePort) {
            if (!event.ports || event.ports.length < 1) {
                fail('POPUP.HANDSHAKE: popupMessagePort not found');
                return;
            }
            _popupMessagePort = event.ports[0];
        }

        if (!_core) {
            fail('POPUP.HANDSHAKE: Core not initialized');
            return;
        }

        const method = _core.getCurrentMethod()[0];
        // eslint-disable-next-line no-use-before-define
        postMessage(UiMessage(POPUP.HANDSHAKE, {
            settings: DataManager.getSettings(),
            transport: _core.getTransportInfo(),
            method: method ? method.info : null,
        }));
    }

    // clear reference to popup MessagePort
    if (data.type === POPUP.CLOSED) {
        if (_popupMessagePort instanceof MessagePort) { _popupMessagePort = null; }
    }

    // is message from popup or extension
    const whitelist = DataManager.isWhitelisted(event.origin);
    const isTrustedDomain = (event.origin === window.location.origin || !!whitelist);

    // ignore messages from domain other then parent.window or popup.window or chrome extension
    const eventOrigin = getOrigin(event.origin);
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
    const handshake: boolean = message.type === IFRAME.LOADED;

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

    if (message.event === TRANSPORT_EVENT) {
        // add preferred bridge installer
        message.payload.bridge = suggestBridgeInstaller();
    }

    // eslint-disable-next-line no-use-before-define
    if (usingPopup && targetUiEvent(message)) {
        if (_popupMessagePort) {
            _popupMessagePort.postMessage(message);
        }
    } else {
        let origin: ?string = DataManager.getSettings('origin');
        if (!origin || origin.indexOf('file://') >= 0) origin = '*';
        sendMessage(message, origin);
    }
};

const targetUiEvent = (message: CoreMessage): boolean => {
    const whitelistedMessages = [
        IFRAME.LOADED,
        IFRAME.ERROR,
        POPUP.CANCEL_POPUP_REQUEST,
        UI.CLOSE_UI_WINDOW,
        UI.CUSTOM_MESSAGE_REQUEST,
        UI.LOGIN_CHALLENGE_REQUEST,
        UI.BUNDLE_PROGRESS,
        UI.ADDRESS_VALIDATION,
    ];
    return (message.event === UI_EVENT && whitelistedMessages.indexOf(message.type) < 0);
};

const filterDeviceEvent = (message: CoreMessage): boolean => {
    if (!message.payload) return false;
    // const features: any = message.payload.device ? message.payload.device.features : message.payload.features;
    // exclude button/pin/passphrase events
    const features: any = message.payload.features;
    if (features) {
        const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY) || loadStorage(PERMISSIONS_KEY, true);
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
    if (DataManager.getSettings('origin')) return; // already initialized
    const parsedSettings = parseSettings({ ...payload.settings, extension: payload.extension });
    // set origin manually
    parsedSettings.origin = !origin || origin === 'null' ? payload.settings.origin : origin;

    if (parsedSettings.popup && typeof BroadcastChannel !== 'undefined') { // && parsedSettings.env !== 'web'
        const broadcastID = `${parsedSettings.env}-${parsedSettings.timestamp}`;
        _popupMessagePort = new BroadcastChannel(broadcastID);
        _popupMessagePort.onmessage = message => handleMessage(message);
    }

    _log.enabled = !!parsedSettings.debug;

    try {
        // initialize core
        _core = await initCore(parsedSettings);
        _core.on(CORE_EVENT, postMessage);

        // initialize transport and wait for the first transport event (start or error)
        await initTransport(parsedSettings);

        postMessage(UiMessage(IFRAME.LOADED));
    } catch (error) {
        postMessage(UiMessage(IFRAME.ERROR, { error }));
    }
};

window.addEventListener('message', handleMessage, false);
window.addEventListener('unload', () => {
    if (_core) {
        _core.onBeforeUnload();
    }
});
