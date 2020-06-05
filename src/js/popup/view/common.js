/* @flow */

import type { CoreMessage } from '../../types';
import DataManager from '../../data/DataManager';
import { POPUP, ERRORS } from '../../constants';

export const header: HTMLElement = document.getElementsByTagName('header')[0];
export const container: HTMLElement = (document.getElementById('container'): any);
export const views: HTMLElement = (document.getElementById('views'): any);

export let iframe: any; // TODO: Window type
const channel = new MessageChannel(); // used in direct element communication (iframe.postMessage)
let broadcast: ?BroadcastChannel = null;

export const setOperation = (operation: string): void => {
    const infoPanel: HTMLElement = document.getElementsByClassName('info-panel')[0];
    const operationEl: HTMLElement = infoPanel.getElementsByClassName('operation')[0];
    const originEl: HTMLElement = infoPanel.getElementsByClassName('origin')[0];
    operationEl.innerHTML = operation;
    originEl.innerText = DataManager.getSettings('hostLabel') || DataManager.getSettings('origin');

    const icon: ?string = DataManager.getSettings('hostIcon');
    if (icon) {
        const iconContainers: HTMLCollection<HTMLElement> = document.getElementsByClassName('service-info');
        for (let i = 0; i < iconContainers.length; i++) {
            iconContainers[i].innerHTML = `<img src="${ icon }" alt="" />`;
        }
    }
};

export const createTooltip = (text: string): HTMLDivElement => {
    const tooltip = document.createElement('div');
    tooltip.setAttribute('tooltip', text);
    tooltip.setAttribute('tooltip-position', 'bottom');

    return tooltip;
};

export const clearView = (): void => {
    container.innerHTML = '';
};

export const showView = (className: string): HTMLElement => {
    clearView();

    const view: HTMLCollection<HTMLElement> = views.getElementsByClassName(className);
    if (view) {
        const viewItem = view.item(0);
        if (viewItem) {
            container.innerHTML = viewItem.outerHTML;
        }
    } else {
        const unknown: HTMLCollection<HTMLElement> = views.getElementsByClassName('unknown-view');
        const unknownItem = unknown.item(0);
        if (unknownItem) {
            container.innerHTML = unknownItem.outerHTML;
        }
    }
    return container;
};

export const getIframeElement = (): any => {
    // try find iframe in opener window
    if (!window.opener) return null;
    const frames: ?HTMLCollection<any> = window.opener.frames;
    if (!frames) return null; // electron will return undefined
    for (let i = 0; i < frames.length; i++) {
        try {
            // try to get iframe origin, this action will not fail ONLY if the origins of iframe and popup are the same
            if (frames[i].location.host === window.location.host) {
                iframe = frames[i];
            }
        } catch (error) {
            // do nothing, try next entry
        }
    }
    return iframe;
};

// initialize message channel with iframe element
export const initMessageChannel = (id: string, handler: any): void => {
    const hasIframe = getIframeElement();
    if (typeof BroadcastChannel !== 'undefined') {
        broadcast = new BroadcastChannel(id);
        broadcast.onmessage = handler;
        return;
    }
    if (!hasIframe) {
        throw ERRORS.TypedError('Popup_ConnectionMissing');
    }
    channel.port1.onmessage = handler;
};

// this method can be used from anywhere
export const postMessage = (message: CoreMessage): void => {
    if (!broadcast && !iframe) {
        throw ERRORS.TypedError('Popup_ConnectionMissing');
    }

    if (broadcast) {
        broadcast.postMessage(message);
        return;
    }

    // First message to iframe, MessageChannel port needs to set here
    if (message.type && message.type === POPUP.HANDSHAKE) {
        iframe.postMessage(message, window.location.origin, [channel.port2]);
        return;
    }
    iframe.postMessage(message, window.location.origin);
};

export const postMessageToParent = (message: CoreMessage): void => {
    if (window.opener) {
        // post message to parent and wait for POPUP.INIT message
        window.opener.postMessage(message, '*');
    } else {
        // webextensions doesn't have "window.opener" reference and expect this message in "content-script" above popup [see: ./src/plugins/webextension/trezor-content-script.js]
        // future communication channel with webextension iframe will be "ChromePort"

        // and electron (electron which uses connect hosted outside)
        // https://github.com/electron/electron/issues/7228
        window.postMessage(message, window.location.origin);
    }
};
