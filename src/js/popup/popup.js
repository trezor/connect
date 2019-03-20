/* @flow */

import { parseMessage } from '../message';
import { UiMessage, ResponseMessage } from '../message/builder';
import { getEnv } from '../data/ConnectSettings';
import DataManager from '../data/DataManager';
import type { PopupHandshake } from '../types/uiRequest';

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import { getOrigin } from '../utils/networkUtils';
// import { sendMessageToOpener } from '../utils/windowUtils';

import { showView, postMessage, setOperation, channel, initBroadcast, broadcast } from './view/common';
import { showFirmwareUpdateNotification, showBridgeUpdateNotification, showBackupNotification } from './view/notification';

import * as view from './view';
// eslint-disable-next-line no-unused-vars
import styles from '../../styles/popup.less';

import type { CoreMessage, PostMessageEvent } from '../types';

const handleMessage = (event: PostMessageEvent): void => {
    const data: any = event.data;
    if (!data) return;

    if (data.type === POPUP.INIT) {
        window.location.hash = '';
        if (data.broadcast) {
            const broadcast = initBroadcast(data.broadcast);
            broadcast.onmessage = message => handleMessage(message);
        }
        // eslint-disable-next-line no-use-before-define
        onLoad();
        return;
    } else if (data.type === POPUP.EXTENSION_REQUEST) {
        const broadcast = initBroadcast(data.broadcast);
        broadcast.onmessage = message => handleMessage(message);
        // eslint-disable-next-line no-use-before-define
        onLoad();
        return;
    }

    const isMessagePort: boolean = event.target instanceof MessagePort || event.target instanceof BroadcastChannel;

    if (isMessagePort && data === POPUP.CLOSE) {
        if (window.opener) {
            window.opener.postMessage(new ResponseMessage(0, false, "Popup couldn't establish connection with iframe."), '*');
        }
        window.close();
        return;
    }
    // catch first message from iframe.js and gain settings
    if (isMessagePort && !DataManager.getSettings('origin') && data.type === POPUP.HANDSHAKE && data.payload) {
        // eslint-disable-next-line no-use-before-define
        init(data.payload);
        return;
    }

    // ignore messages from origin other then parent.window or white listed
    if (!isMessagePort && getOrigin(event.origin) !== getOrigin(document.referrer) && !DataManager.isWhitelisted(event.origin)) return;

    const message: CoreMessage = parseMessage(event.data);

    switch (message.type) {
        case UI.LOADING :
        case UI.REQUEST_UI_WINDOW :
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
        case UI.BROWSER_NOT_SUPPORTED :
        case UI.BROWSER_OUTDATED :
            view.initBrowserView(message.payload);
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

const init = async (payload: $PropertyType<PopupHandshake, 'payload'>) => {
    if (!payload) return;

    await DataManager.load(payload.settings);
    setOperation(payload.method || '');

    if (payload.transport && payload.transport.outdated) {
        showBridgeUpdateNotification();
    }

    postMessage(new UiMessage(POPUP.HANDSHAKE));

    // pass popup console to iframe
    // popupConsole(POPUP.LOG, postMessage);
};

const onLoad = () => {
    const env = getEnv();
    if (window.location.hash.length > 0) {
        // this hash is set from opener
        if (window.location.hash.indexOf('unsupported') >= 0) {
            view.initBrowserView({
                name: '',
                osname: '',
                outdated: false,
                supported: false,
                mobile: false,
            });
        } else {
            if (window.opener) {
                window.opener.postMessage(POPUP.INIT, '*');
            } else {
                // webextension is expecting this message in "content-script" which is running in "this window", above this script
                window.postMessage(POPUP.INIT, window.location.origin);
            }
        }
        return;
    }

    // if don't have access to opener
    // request a content-script of extension
    if (!window.opener && !broadcast) {
        window.postMessage(POPUP.EXTENSION_REQUEST, window.location.origin);
        return;
    }

    // request broadcast id (from electron)
    if (window.opener && env === 'electron') {
        window.opener.postMessage(POPUP.EXTENSION_REQUEST, '*');
        return;
    }

    window.location.hash = '';
    view.init();

    if (!broadcast) {
        // future communication will be thru MessageChannel
        // $FlowIssue (Event !== MessageEvent)
        channel.port1.onmessage = event => handleMessage(event);
    }

    postMessage(new UiMessage(POPUP.OPENED));
};

window.addEventListener('load', onLoad, false);
window.addEventListener('message', handleMessage, false);

window.addEventListener('beforeunload', () => {
    // TODO: disable broadcast-channel, cleanup...
});

// global method used in html-inline elements
window.closeWindow = () => {
    setTimeout(() => {
        window.postMessage(POPUP.CLOSE_WINDOW, window.location.origin);
        window.close();
    }, 100);
};

