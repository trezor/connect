/* @flow */
import { container, showView, postMessage } from './common';
import { UiMessage } from '../../message/builder';
import DataManager from '../../data/DataManager';
import * as POPUP from '../../constants/popup';
import { load as loadStorage, save as saveStorage, BROWSER_KEY } from '../../storage';
import { getBrowserState } from '../../env/browser/browserUtils';

const validateBrowser = () => {
    const state = getBrowserState(DataManager.getConfig().supportedBrowsers);
    if (!state.supported) {
        const permitted = loadStorage(BROWSER_KEY);
        return !permitted ? state : null;
    }
    return;
};

export const initBrowserView = (validation: boolean = true) => {
    if (!validation) {
        showView('browser-not-supported');
        const buttons: HTMLElement = container.getElementsByClassName('buttons')[0];
        if (buttons && buttons.parentNode) {
            buttons.parentNode.removeChild(buttons);
        }
        return;
    }
    const state = validateBrowser();
    if (!state) {
        postMessage(UiMessage(POPUP.HANDSHAKE));
        return;
    }
    if (state.mobile) {
        showView('smartphones-not-supported');
        return;
    }

    showView('browser-not-supported');

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const ackButton: HTMLElement = container.getElementsByClassName('cancel')[0];
    const rememberCheckbox: HTMLInputElement = (container.getElementsByClassName('remember-permissions')[0]: any);

    if (state.outdated) {
        h3.innerText = 'Outdated browser';
    }

    ackButton.onclick = () => {
        if (rememberCheckbox && rememberCheckbox.checked) {
            saveStorage(BROWSER_KEY, true);
        }

        postMessage(UiMessage(POPUP.HANDSHAKE));
        showView('loader');
    };
};
