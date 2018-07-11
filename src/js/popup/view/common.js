/* @flow */
'use strict';

import { ResponseMessage } from '../../message/builder';
import type { CoreMessage } from '../../types';
import { getOrigin } from '../../utils/networkUtils';
import DataManager from '../../data/DataManager';
import * as POPUP from '../../constants/popup';

export const header: HTMLElement = document.getElementsByTagName('header')[0];
export const container: HTMLElement = (document.getElementById('container'): any);
export const views: HTMLElement = (document.getElementById('views'): any);
export let iframe: any; // Window type

export const channel = new MessageChannel();

export const setOperation = (operation: string): void => {
    const infoPanel: HTMLElement = document.getElementsByClassName('info-panel')[0];
    const h2: HTMLElement = infoPanel.getElementsByTagName('h2')[0];
    const p: HTMLElement = infoPanel.getElementsByTagName('p')[0];
    h2.innerHTML = operation;
    p.innerHTML = DataManager.getSettings('origin');
};

export const init = (): any => {
    // find iframe
    if (window.opener) {
        const iframes: HTMLCollection<any> = window.opener.frames;
        for (let i = 0; i < iframes.length; i++) {
            try {
                if (iframes[i].location.host === window.location.host) {
                    iframe = iframes[i];
                }
            } catch (error) {
                // empty
            }
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
        container.innerHTML = view.item(0).outerHTML;
    } else {
        const unknown: HTMLCollection<HTMLElement> = views.getElementsByClassName('unknown-view');
        container.innerHTML = unknown.item(0).outerHTML;
    }
    return container;
};

export const postMessage = (message: CoreMessage): void => {
    if (!window.opener || !iframe) return;

    if (message.type && message.type === POPUP.OPENED) {
        iframe.postMessage(message, window.location.origin, [channel.port2]);
    } else {
        iframe.postMessage(message, window.location.origin);
    }
};
