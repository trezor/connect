/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import * as POPUP from '../../constants/popup';
import { container, iframe, showView, postMessage } from './common';
import DataManager from '../../data/DataManager';
import type { SelectDevice } from '../../types/events';

const initWebUsbButton = (webusb: boolean, showLoader: boolean): void => {
    if (!webusb) return;

    const webusbContainer: HTMLElement = container.getElementsByClassName('webusb')[0];
    webusbContainer.style.display = 'flex';
    const button: HTMLButtonElement = webusbContainer.getElementsByTagName('button')[0];

    if (!iframe) {
        button.innerHTML = '<span class="plus"></span><span class="text">Pair devices</span>';
    }

    const usb = iframe ? iframe.clientInformation.usb : null;
    const onClick = async () => {
        if (!usb) {
            window.postMessage({ type: POPUP.EXTENSION_USB_PERMISSIONS }, window.location.origin);
            return;
        }
        try {
            await usb.requestDevice({ filters: DataManager.getConfig().webusb });
            if (showLoader) { showView('loader'); }
        } catch (error) {
            // empty, do nothing
        }
    };

    button.onclick = onClick;
};

export const selectDevice = (payload: $PropertyType<SelectDevice, 'payload'>): void => {
    if (!payload) return;

    if (!payload.devices || !Array.isArray(payload.devices) || payload.devices.length === 0) {
        // No device connected
        showView('connect');
        initWebUsbButton(payload.webusb, true);
        return;
    }

    showView('select-device');
    initWebUsbButton(payload.webusb, false);

    // If only 'remember device for now' toggle and no webusb button is available
    // show it right under the table
    if (!payload.webusb) {
        const wrapper = container.getElementsByClassName('wrapper')[0];
        wrapper.style.justifyContent = 'normal';
    }

    // Populate device list
    const deviceList: HTMLElement = container.getElementsByClassName('select-device-list')[0];
    // deviceList.innerHTML = '';
    const rememberCheckbox: HTMLInputElement = (container.getElementsByClassName('remember-device')[0]: any);

    // Show readable devices first
    payload.devices.sort((d1, d2) => {
        if (d1.type === 'unreadable' && d2.type !== 'unreadable') {
            return 1;
        } else if (d1.type !== 'unreadable' && d2.type === 'unreadable') {
            return -1;
        }
        return 0;
    });

    payload.devices.forEach(device => {
        const deviceButton: HTMLButtonElement = document.createElement('button');
        deviceButton.className = 'list';
        if (device.type !== 'unreadable') {
            deviceButton.addEventListener('click', () => {
                postMessage(UiMessage(UI.RECEIVE_DEVICE, {
                    remember: (rememberCheckbox && rememberCheckbox.checked),
                    device,
                }));
                showView('loader');
            });
        }

        const deviceIcon: HTMLSpanElement = document.createElement('span');
        deviceIcon.className = 'icon';

        if (device.features) {
            if (device.features.major_version === 2) {
                deviceIcon.classList.add('model-t');
            }
        }

        const deviceName: HTMLSpanElement = document.createElement('span');
        deviceName.className = 'device-name';
        deviceName.textContent = device.label;

        const wrapper: HTMLDivElement = document.createElement('div');
        wrapper.className = 'wrapper';
        wrapper.appendChild(deviceIcon);
        wrapper.appendChild(deviceName);
        deviceButton.appendChild(wrapper);

        // device {
        //     status: 'available' | 'occupied' | 'used';
        //     type: 'acquired' | 'unacquired' | 'unreadable';
        // }
        // if (device.status !== 'available') {
        if (device.type !== 'acquired' || device.status === 'occupied') {
            deviceButton.classList.add('device-explain');

            const explanation: HTMLDivElement = document.createElement('div');
            explanation.className = 'explain';

            const htmlUnreadable: string = 'Please install <a href="https://wallet.trezor.io" target="_blank" rel="noreferrer noopener" onclick="window.closeWindow();">Bridge</a> to use Trezor device.';
            const htmlUnacquired: string = 'Click to activate. This device is used by another application.';

            if (device.type === 'unreadable') {
                deviceButton.disabled = true;
                deviceIcon.classList.add('unknown');
                deviceName.textContent = 'Unrecognized device';
                explanation.innerHTML = htmlUnreadable;
            }

            if (device.type === 'unacquired' || device.status === 'occupied') {
                deviceName.textContent = 'Inactive device';
                deviceButton.classList.add('unacquired');
                explanation.classList.add('unacquired');
                explanation.innerHTML = htmlUnacquired;

                if (device.type === 'acquired') {
                    deviceName.textContent = device.label;
                }
            }

            deviceButton.appendChild(explanation);
        }

        deviceList.appendChild(deviceButton);
    });
};
