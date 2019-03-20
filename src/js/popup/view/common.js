/* @flow */

import type { CoreMessage } from '../../types';
import DataManager from '../../data/DataManager';
import * as POPUP from '../../constants/popup';

export const header: HTMLElement = document.getElementsByTagName('header')[0];
export const container: HTMLElement = (document.getElementById('container'): any);
export const views: HTMLElement = (document.getElementById('views'): any);
export let iframe: any; // TODO: Window type

export const channel = new MessageChannel();
export let broadcast: ?BroadcastChannel = null;

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

export const init = (): any => {
    // tye find iframe in opener window
    if (!window.opener) return null;
    const frames: ?HTMLCollection<any> = window.opener.frames;
    if (!frames) return null; // electron will return undefined
    for (let i = 0; i < frames.length; i++) {
        try {
            // try to get iframe origin, this action will not fail ONLY if location of iframe and popup are the same
            if (frames[i].location.host === window.location.host) {
                iframe = frames[i];
            }
        } catch (error) {
            // do nothing, try next entry
        }
    }
    return iframe;
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

export const initBroadcast = (id: string): BroadcastChannel => {
    broadcast = new BroadcastChannel(id);
    return broadcast;
};

export const postMessage = (message: CoreMessage): void => {
    if (broadcast) {
        broadcast.postMessage(message);
        return;
    }

    // deprecated way, remove it later
    if (!window.opener || !iframe) {
        return;
    }

    if (message.type && message.type === POPUP.OPENED) {
        iframe.postMessage(message, window.location.origin, [channel.port2]);
    } else {
        iframe.postMessage(message, window.location.origin);
    }
};
