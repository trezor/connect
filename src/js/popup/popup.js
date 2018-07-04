/* @flow */
'use strict';

import { popupConsole } from '../utils/debug';
import { parseMessage, UiMessage, ResponseMessage } from '../core/CoreMessage';
import type { CoreMessage } from 'flowtype';
import DataManager from '../data/DataManager';
import { parse as parseSettings } from '../data/ConnectSettings';
import type { ConnectSettings } from '../data/ConnectSettings';
import type { PopupHandshake } from 'flowtype/ui-message';

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import { getOrigin } from '../utils/networkUtils';

import { showView, postMessage, setOperation, channel } from './view/common';

import * as view from './view';
// eslint-disable-next-line no-unused-vars
import styles from '../../styles/popup.less';

const handleMessage = (event: Message): void => {

    console.log('handleMessage', event.data);

    if (event.data === POPUP.INIT) {
        window.location.hash = '';
        onLoad();
        return;
    }

    const data: any = event.data;
    if (!data) return;

    const isMessagePort: boolean = event.target instanceof MessagePort;

    if (isMessagePort && data === POPUP.CLOSE) {
        if (window.opener) {
            window.opener.postMessage( new ResponseMessage(0, false, "Popup couldn't establish connection with iframe."), '*');
        }
        window.close();
        return;
    }
    // catch first message from iframe.js and gain settings
    if (isMessagePort && !DataManager.getSettings('origin') && data.type === POPUP.HANDSHAKE && data.payload) {
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
        case UI.INITIALIZE :
            showView('initialize');
            break;
        case UI.FIRMWARE :
            showView('firmware-update');
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
        case UI.INVALID_PIN :
            showView('invalid-pin');
            break;
        case UI.REQUEST_PASSPHRASE :
            view.initPassphraseView(message.payload);
            break;
        case UI.REQUEST_PASSPHRASE_ON_DEVICE :
            view.initPinOnDeviceView(message.payload);
            break;
    }
};

//const init = async (settings: ConnectSettings) => {
const init = async (payload: $PropertyType<PopupHandshake, 'payload'>) => {
    if (!payload) return;

    await DataManager.load(payload.settings);
    setOperation(payload.method);

    postMessage(new UiMessage(POPUP.HANDSHAKE));

    // pass popup console to iframe
    popupConsole(POPUP.LOG, postMessage);

    // global method used in html-inline elements
    window.closeWindow = () => {
        window.close();
    };
}

const onLoad = () => {
    if (window.location.hash.length > 0) {
        if (window.opener)
            window.opener.postMessage(POPUP.INIT, '*');
        return;
    }
    window.location.hash = '';
    view.init();
    // $FlowIssue (Event !== MessageEvent)
    channel.port1.onmessage = (event: Message) => {
        handleMessage(event);
    }

    postMessage(new UiMessage(POPUP.OPENED));
}

window.addEventListener('load', onLoad, false);
window.addEventListener('message', handleMessage, false);

window.addEventListener('beforeunload', () => {
    // TODO
});

