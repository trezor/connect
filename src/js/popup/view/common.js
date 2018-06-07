/* @flow */
'use strict';

import type { CoreMessage } from 'flowtype';
import { getOrigin } from '../../utils/networkUtils';
import DataManager from '../../data/DataManager';
import * as POPUP from '../../constants/popup';

export const header: HTMLElement = document.getElementsByTagName('header')[0];
export const container: HTMLElement = (document.getElementById('container'): any);
export const views: HTMLElement = (document.getElementById('views'): any);
export let iframe: any; // Window type

export const channel = new MessageChannel();

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

        // const originLabel: HTMLElement = header.getElementsByClassName('origin')[0];
        // originLabel.innerHTML = DataManager.getSettings('origin');

        // setOperation(window.name);
    }
};

export const clearView = (): void => {
    container.innerHTML = '';
};

const shouldShowFirmwareUpdateInfo = (shouldShow: boolean): void => {
    const updateContainer: HTMLElement = document.getElementsByClassName('firmware-update-info')[0];
    const isEmpty: boolean = updateContainer.childElementCount === 0;
    if (!shouldShow || !isEmpty) {
        return;
    }

    const left: HTMLElement = document.createElement('left');
    left.className= 'left';
    left.innerHTML = `<span class="warning-icon"></span><h3>New firmware update</h3>`;

    const closeIcon: HTMLElement = document.createElement('span');
    closeIcon.className = 'close-icon';
    closeIcon.addEventListener('click', () => {
        updateContainer.style.display = 'none';
    });

    const text: HTMLElement = document.createElement('p');
    text.innerText = 'New firmware for your device is available';

    const updateButton: HTMLElement = document.createElement('a');
    updateButton.classList.add('button', 'firmware');
    updateButton.appendChild(
        document.createTextNode('Update my firmware')
    )

    const header: HTMLElement = document.createElement('div');
    header.className = 'header';
    header.appendChild(left);
    header.appendChild(closeIcon);

    updateContainer.appendChild(header);
    updateContainer.appendChild(text);
    updateContainer.appendChild(updateButton);

    updateContainer.style.display = 'flex';
};

export const showView = (className: string): HTMLElement => {
    clearView();

    // TODO: Check if new firmware is available
    const isNewFirmware: boolean = true;
    shouldShowFirmwareUpdateInfo(isNewFirmware);

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
        if (message.type && message.type === POPUP.OPENED) {
            iframe.postMessage(message, window.location.origin, [channel.port2]);
        } else {
            iframe.postMessage(message, window.location.origin);
        }
        // iframe.postMessage(message, window.location.origin);
    } else {
        // TODO: post CoreMessage
        window.opener.postMessage({ type: 'error', message: "Popup couldn't establish connection with iframe." }, '*');
    }
};

