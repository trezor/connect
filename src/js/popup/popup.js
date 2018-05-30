/* @flow */
'use strict';

import { popupConsole } from '../utils/debug';
import { parseMessage, UiMessage } from '../core/CoreMessage';
import type { CoreMessage } from '../core/CoreMessage';
import DataManager from '../data/DataManager';
import { parse as parseSettings } from '../entrypoints/ConnectSettings';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import { getOrigin } from '../utils/networkUtils';

import { showView, postMessage, setOperation, channel } from './view/common';

import * as view from './view';
// eslint-disable-next-line no-unused-vars
import styles from '../../styles/popup.less';

const initLoaderView = (message: any): void => {
    const container: HTMLElement = showView('loader');

    if (typeof message === 'string') {
        const label: HTMLElement = container.getElementsByTagName('p')[0];
        label.style.display = 'block';
        label.innerHTML = message;
    }
};

const handleMessage = (event: MessageEvent): void => {

    console.log('handleMessage', event.data);

    const isMessagePort: boolean = event.target instanceof MessagePort;

    // catch first message from iframe.js and gain settings
    if (isMessagePort && !DataManager.getSettings('origin') && event.data && event.data.payload && event.data.type === POPUP.HANDSHAKE && event.data.payload.settings) {
        // $FlowIssue
        init(event.data.payload.settings);
        return;
    }

    // ignore messages from origin other then parent.window or white listed
    if (!isMessagePort && getOrigin(event.origin) !== getOrigin(document.referrer) && !DataManager.isWhitelisted(event.origin)) return;

    const message: CoreMessage = parseMessage(event.data);

    // TODO parse incoming strings to avoid string injections !!!

    switch (message.type) {
        case UI.LOADING :
        case UI.REQUEST_UI_WINDOW :
            initLoaderView(message.payload);
            break;
        case UI.SET_OPERATION :
            if (typeof message.payload === 'string') { setOperation(message.payload, true); }
            break;
        case UI.TRANSPORT :
            showView('transport');
            break;
        case UI.CONNECT :
            showView('connect');
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
            showView('firmware');
            break;
        case UI.BROWSER_NOT_SUPPORTED :
        case UI.BROWSER_OUTDATED :
            view.initBrowserView(message.payload);
            break;

        case UI.REQUEST_PERMISSION :
            view.initPermissionsView(message.payload, event.origin);
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
            showView('passphrase-on-device');
            break;
    }
};

const init = async (settings: ConnectSettings) => {

    await DataManager.load(settings);

    postMessage(new UiMessage(POPUP.HANDSHAKE));

    // pass popup console to iframe
    popupConsole(POPUP.LOG, postMessage);

    // global method used in html-inline elements
    window.closeWindow = () => {
        window.close();
    };
}


window.addEventListener('load', () => {

    view.init();

    // $FlowIssue (Event !== MessageEvent)
    channel.port1.onmessage = (event: MessageEvent) => {
        handleMessage(event);
    }

    postMessage(new UiMessage(POPUP.OPENED));

}, false);

window.addEventListener('message', handleMessage, false);
window.addEventListener('beforeunload', () => {

});

