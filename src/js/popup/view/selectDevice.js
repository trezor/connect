/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, iframe, showView, postMessage } from './common';
import DataManager from '../../data/DataManager';
import type { SelectDevice } from 'flowtype/ui-message';

const initWebUsbButton = (webusb: boolean): void => {
    if (!webusb || !iframe) return;

    const webusbContainer: HTMLElement = container.getElementsByClassName('webusb')[0];
    webusbContainer.style.display = 'flex';
    const button: HTMLButtonElement = webusbContainer.getElementsByTagName('button')[0];
    button.onclick = async () => {
        const x = window.screenLeft;
        const y = window.screenTop;

        const currentWidth = window.outerWidth;
        const currentHeight = window.outerHeight;

        const restorePosition = (originalWidth: number, originalHeight: number): void => {
            window.resizeTo(originalWidth, originalHeight);
            window.moveTo(x, y);
            window.focus();
        }

        window.resizeTo(100, 100);
        window.moveTo(screen.width, screen.height);

        const usb = iframe.clientInformation.usb;
        try {
            await usb.requestDevice( { filters: DataManager.getConfig().webusb } );
            restorePosition(currentWidth, currentHeight);
        } catch (error) {
            restorePosition(currentWidth, currentHeight);
        }
    }
}

export const selectDevice = (payload: $PropertyType<SelectDevice, 'payload'>): void => {
    if (!payload) return;

    if (!payload) {
        return;
    }

    if (!payload.devices || !Array.isArray(payload.devices) || payload.devices.length === 0) {
        // No device connected
        showView('connect');
        initWebUsbButton(payload.webusb);
        return;
    }

    showView('select-device');
    initWebUsbButton(payload.webusb);

    const deviceList: HTMLElement = container.getElementsByClassName('select-device-list')[0];
    deviceList.innerHTML = '';
    const rememberCheckbox: HTMLInputElement = (container.getElementsByClassName('remember-device')[0]: any);

    payload.devices.forEach(device => {
        const deviceButton: HTMLButtonElement = document.createElement('button');
        deviceButton.className = 'list';

        deviceButton.addEventListener('click', () => {
            postMessage(new UiMessage(UI.RECEIVE_DEVICE, {
                remember: (rememberCheckbox && rememberCheckbox.checked),
                device
            }));
            showView('loader');
        });

        const deviceIcon: HTMLSpanElement = document.createElement('span');
        deviceIcon.className = 'icon';

        if (device.features) {
            if (device.features.model === 'T') {
                deviceIcon.classList.add('model-t');
            }
        }

        const deviceName: HTMLSpanElement = document.createElement('span');
        deviceName.className = 'device-name';
        deviceName.textContent = device.label;

        deviceButton.appendChild(deviceIcon);
        deviceButton.appendChild(deviceName);

        deviceList.appendChild(deviceButton);
    });
};
