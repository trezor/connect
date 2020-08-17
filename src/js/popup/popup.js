/* @flow */

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';

import { parseMessage } from '../message';
import { UiMessage } from '../message/builder';
import DataManager from '../data/DataManager';
import { parse as parseSettings } from '../data/ConnectSettings';
import { escapeHtml } from '../utils/windowsUtils';

import * as view from './view';
import { showView, setOperation, initMessageChannel, postMessageToParent } from './view/common';
import {
    showFirmwareUpdateNotification,
    showBridgeUpdateNotification,
    showBackupNotification,
} from './view/notification';

import type { PostMessageEvent, PopupInit, PopupHandshake } from '../types';

// eslint-disable-next-line no-unused-vars
import styles from '../../styles/popup.less';

// handle messages from window.opener and iframe
const handleMessage = (event: PostMessageEvent) => {
    const data = event.data;
    if (!data) return;

    // This is message from the window.opener
    if (data.type === POPUP.INIT) {
        init(escapeHtml(data.payload)); // eslint-disable-line no-use-before-define
        return;
    }

    // This is message from the window.opener
    if (data.type === UI.IFRAME_FAILURE) {
        showView('iframe-failure');
        return;
    }

    // ignore messages from origin other then MessagePort (iframe)
    const isMessagePort = event.target instanceof MessagePort || (typeof BroadcastChannel !== 'undefined' && event.target instanceof BroadcastChannel);
    if (!isMessagePort) return;

    // catch first message from iframe
    if (data.type === POPUP.HANDSHAKE) {
        handshake(data.payload); // eslint-disable-line no-use-before-define
        return;
    }

    const message = parseMessage(data);

    switch (message.type) {
        case UI.LOADING :
        // case UI.REQUEST_UI_WINDOW :
            showView('loader');
            break;
        case UI.SET_OPERATION :
            if (typeof message.payload === 'string') { setOperation(message.payload); }
            break;
        case UI.TRANSPORT :
            showView('transport');
            break;
        case UI.SELECT_DEVICE :
            view.selectDevice(message.payload);
            break;
        case UI.SELECT_ACCOUNT :
            view.selectAccount(message.payload);
            break;
        case UI.SELECT_FEE :
            view.selectFee(message.payload);
            break;
        case UI.UPDATE_CUSTOM_FEE :
            view.updateCustomFee(message.payload);
            break;
        case UI.INSUFFICIENT_FUNDS :
            showView('insufficient-funds');
            break;
        case UI.REQUEST_BUTTON :
            view.requestButton(message.payload);
            break;
        case UI.BOOTLOADER :
            showView('bootloader');
            break;
        case UI.NOT_IN_BOOTLOADER :
            showView('not-in-bootloader');
            break;
        case UI.INITIALIZE :
            showView('initialize');
            break;
        case UI.SEEDLESS :
            showView('seedless');
            break;
        case UI.FIRMWARE_NOT_INSTALLED :
            showView('firmware-install');
            break;
        case UI.FIRMWARE_OLD :
            view.firmwareRequiredUpdate(message.payload);
            break;
        case UI.FIRMWARE_NOT_SUPPORTED :
            view.firmwareNotSupported(message.payload);
            break;
        case UI.FIRMWARE_NOT_COMPATIBLE :
            view.firmwareNotCompatible(message.payload);
            break;
        case UI.FIRMWARE_OUTDATED :
            showFirmwareUpdateNotification(message.payload);
            break;
        case UI.DEVICE_NEEDS_BACKUP :
            showBackupNotification(message.payload);
            break;
        case UI.REQUEST_PERMISSION :
            view.initPermissionsView(message.payload);
            break;
        case UI.REQUEST_CONFIRMATION :
            view.initConfirmationView(message.payload);
            break;
        case UI.REQUEST_PIN :
            view.initPinView(message.payload);
            break;
        case UI.REQUEST_WORD :
            view.initWordView(message.payload);
            break;
        case UI.INVALID_PIN :
            showView('invalid-pin');
            break;
        case UI.REQUEST_PASSPHRASE :
            view.initPassphraseView(message.payload);
            break;
        case UI.REQUEST_PASSPHRASE_ON_DEVICE :
            view.passphraseOnDeviceView(message.payload);
            break;
        case UI.INVALID_PASSPHRASE :
            view.initInvalidPassphraseView(message.payload);
            break;
    }
};

// handle POPUP.INIT message from window.opener
const init = async (payload?: $PropertyType<PopupInit, 'payload'>) => {
    if (!payload) return;
    const { settings } = payload;

    try {
        // load config only to get supported browsers list
        // settings received from parent (POPUP.INIT) are not considered as "safe" (they could be injected/modified)
        // settings will be replaced later on, after POPUP.HANDSHAKE event from iframe
        await DataManager.load(parseSettings(settings), false);
        // initialize message channel
        const broadcastID = `${settings.env}-${settings.timestamp}`;
        initMessageChannel(broadcastID, handleMessage);
        // reset loading hash
        window.location.hash = '';
        // handshake with iframe
        view.initBrowserView();
    } catch (error) {
        postMessageToParent(UiMessage(POPUP.ERROR, { error: error.message }));
    }
};

// handle POPUP.HANDSHAKE message from iframe
const handshake = async (payload: $PropertyType<PopupHandshake, 'payload'>) => {
    if (!payload) return;
    // replace local settings with values from iframe (parent origin etc.)
    DataManager.settings = payload.settings;
    setOperation(payload.method || '');
    if (payload.transport && payload.transport.outdated) {
        showBridgeUpdateNotification();
    }
};

const onLoad = () => {
    // unsupported browser, this hash was set in parent app (PopupManager)
    // display message and do not continue
    if (window.location.hash === '#unsupported') {
        view.initBrowserView(false);
        return;
    }

    postMessageToParent(UiMessage(POPUP.LOADED));
};

window.addEventListener('load', onLoad, false);
window.addEventListener('message', handleMessage, false);

// global method used in html-inline elements
window.closeWindow = () => {
    setTimeout(() => {
        window.postMessage({ type: POPUP.CLOSE_WINDOW }, window.location.origin);
        window.close();
    }, 100);
};

