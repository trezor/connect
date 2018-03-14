/* @flow */
'use strict';

import { popupConsole } from '../utils/debug';
import { parseMessage, UiMessage } from '../core/CoreMessage';
import type { CoreMessage } from '../core/CoreMessage';
import DataManager from '../data/DataManager';
import { parse as parseSettings } from '../entrypoints/ConnectSettings';

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import { getOrigin } from '../utils/networkUtils';

import { showView, postMessage, setOperation } from './view/common';

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

    // first message from connect.js (parent window)
    if (event.data && event.data.type === POPUP.HANDSHAKE && event.data.settings) {
        init(event.data.settings);
        return;
    }

    // ignore messages from origin other then parent.window or white listed
    if (getOrigin(event.origin) !== getOrigin(document.referrer) && DataManager.getConfig().whitelist.indexOf(event.origin) < 0) return;

    console.log('handleMessage', event.data);

    const message: CoreMessage = parseMessage(event.data);

    // TODO parse incoming strings to avoid string injections !!!

    switch (message.type) {
        case 'request-device' :
            view.requestDevice(message.payload);
            break;
        case UI.LOADING :
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
    }
};

const init = async (settings: any) => {
    view.init();
    await DataManager.loadConfig(parseSettings(settings));

    postMessage(new UiMessage(POPUP.HANDSHAKE));

    // pass popup console to iframe
    popupConsole(POPUP.LOG, postMessage);

    // global method used in html-inline elements
    window.closeWindow = () => {
        window.close();
    };
}


window.addEventListener('load', () => {
    // say hello to the window.opener and wait for POPUP.HANDSHAKE with settings
    if (window.opener) {
        window.opener.postMessage(POPUP.OPENED, '*');
    }
}, false);

window.addEventListener('message', handleMessage, false);
window.addEventListener('beforeunload', () => {

});

