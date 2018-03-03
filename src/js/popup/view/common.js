/* @flow */
'use strict';

import type { CoreMessage } from '../../core/CoreMessage';
import { getOrigin } from '../../utils/networkUtils';

export const header: HTMLElement = document.getElementsByTagName('header')[0];
export const container: HTMLElement = (document.getElementById('container'): any);
export const views: HTMLElement = (document.getElementById('views'): any);
export let iframe: any; // Window type

export const setOperation = (operation: string, update: boolean = false): void => {
    const label: HTMLElement = header.getElementsByClassName('operation')[0];
    let value: string;
    if (update) {
        label.innerHTML = operation;
        return;
    }

    switch (operation) {
        case 'getxpub' :
            value = 'Export public key';
            break;
        case 'composetx' :
            value = 'Payment request';
            break;
        default:
            value = '';
    }
    label.innerHTML = value;
};

export const init = (): void => {
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

        const originLabel: HTMLElement = header.getElementsByClassName('origin')[0];
        originLabel.innerHTML = getOrigin(document.referrer); // window.opener.location.origin;

        setOperation(window.name);
    }
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

    if (iframe) {
        // iframe.postMessage(message, '*');
        iframe.postMessage(message, window.location.origin);
        // _iframe.contentWindow.postMessage(message, '*');
    } else {
        // TODO: post CoreMessage
        window.opener.postMessage({ type: 'error', message: "Popup couldn't establish connection with iframe." }, '*');
    }
};

