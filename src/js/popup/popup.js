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
    // ignore messages from origin other then parent.window or white listed
    if (getOrigin(event.origin) !== getOrigin(document.referrer) && DataManager.config.whitelist.indexOf(event.origin) < 0) return;

    console.log('handleMessage', event.data);

    const message: CoreMessage = parseMessage(event.data);

    // TODO parse incoming strings to avoid string injections !!!

    switch (message.type) {
        case UI.LOADING :
            // showView('loader');
            initLoaderView(message.data);
            break;
        case UI.SET_OPERATION :
            if (typeof message.data === 'string') { setOperation(message.data, true); }
            break;
        case UI.TRANSPORT :
            showView('transport');
            break;
        case UI.CONNECT :
            showView('connect');
            break;
        case UI.SELECT_DEVICE :
            view.selectDevice(message.data);
            break;
        case UI.SELECT_ACCOUNT :
            view.selectAccount(message.data);
            break;
        case UI.SELECT_FEE :
            view.selectFee(message.data);
            break;
        case UI.UPDATE_CUSTOM_FEE :
            view.updateCustomFee(message.data);
            break;
        case UI.INSUFFICIENT_FUNDS :
            showView('insufficient_funds');
            break;
        case UI.REQUEST_BUTTON :
            view.requestButton(message.data);
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
            view.initPermissionsView(message.data, event.origin);
            break;
        case UI.REQUEST_CONFIRMATION :
            view.initConfirmationView(message.data);
            break;
        case UI.REQUEST_PIN :
            view.initPinView();
            break;
        case UI.INVALID_PIN :
            showView('invalid_pin');
            break;
        case UI.REQUEST_PASSPHRASE :
            view.initPassphraseView();
            break;
    }
};

window.addEventListener('load', async () => {
    view.init();

    await DataManager.loadConfig( parseSettings({}) );

    console.log("DATAMAN", DataManager.config.whitelist)

    window.addEventListener('message', handleMessage);
    postMessage(new UiMessage(POPUP.HANDSHAKE));

    // pass popup console to iframe
    popupConsole(POPUP.LOG, postMessage);

    // view.selectFee({ list: [] });

    // global method used in html-inline elements
    window.closeWindow = () => {
        window.close();
    };
}, false);

