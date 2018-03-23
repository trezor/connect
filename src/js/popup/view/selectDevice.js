/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, iframe, showView, postMessage } from './common';
import DataManager from '../../data/DataManager';


const initWebUsbButton = (webusb: boolean): void => {
    if (!webusb || !iframe) return;

    const webusbContainer: HTMLElement = container.getElementsByClassName('webusb')[0];
    webusbContainer.style.display = 'block';
    const button: HTMLButtonElement = webusbContainer.getElementsByTagName('button')[0];
    button.onclick = async () => {
        const x = window.screenLeft;
        const y = window.screenTop;
        const restorePosition = (): void => {
            window.resizeTo(640, 500);
            window.moveTo(x, y);
            window.focus();
        }

        window.resizeTo(100, 100);
        window.moveTo(screen.width, screen.height);

        var usb = iframe.clientInformation.usb;
        try {
            await usb.requestDevice( { filters: DataManager.getConfig().webusb } );
            restorePosition();
        } catch (error) {
            restorePosition();
        }
    }
}

export const selectDevice = (payload: ?Object): void => {
    if (!payload) return;

    if (payload.devices.length === 0) {
        showView('connect');
        initWebUsbButton(payload.webusb);
        return;
    }

    showView('select-device');
    initWebUsbButton(payload.webusb);

    const buttonsContainer: HTMLElement = container.getElementsByClassName('select-device-list')[0];
    buttonsContainer.innerHTML = '';

    const checkbox: ?HTMLElement = container.querySelector('input[type=checkbox]');


    const handleClick = (event: MouseEvent) => {
        if (event.target instanceof HTMLElement) {

        }

    };
    for (const dev of payload.devices) {
        const button: HTMLButtonElement = document.createElement('button');
        button.innerHTML = dev.label;
        button.onclick = (event: MouseEvent) => {
            postMessage(new UiMessage(UI.RECEIVE_DEVICE, {
                remember: (checkbox && checkbox.checked),
                device: dev
            }));
            showView('loader');
        }
        button.className = 'white';
        if (dev.features && dev.features.major_version === 2) {
            button.className = 'white trezorT';
        }
        // button.setAttribute('data-path', dev.path);

        // create new device button
        const div: HTMLDivElement = document.createElement('div');
        div.className = 'device';
        div.appendChild(button);

        buttonsContainer.appendChild(div);
    }
};
