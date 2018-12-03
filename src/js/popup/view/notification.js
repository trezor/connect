/* @flow */
'use strict';

import { views } from './common';
import { getLatestRelease } from '../../data/FirmwareInfo';
import type { UnexpectedDeviceMode } from '../../types/ui-request';

export const showFirmwareUpdateNotification = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>): void => {
    const container: HTMLElement = document.getElementsByClassName('notification')[0];
    const warning: ?HTMLElement = container.querySelector('.firmware-update-notification');
    if (warning) {
        // already exists
        return;
    }
    if (!device.features) return;
    const { features } = device;
    const release = getLatestRelease([ features.major_version, features.minor_version, features.patch_version ]);
    if (!release) return;

    const view = views.getElementsByClassName('firmware-update-notification');
    const notification = document.createElement('div');
    notification.className = 'firmware-update-notification notification-item';
    notification.innerHTML = view.item(0).innerHTML;

    const button = notification.getElementsByClassName('notification-button')[0];
    const url = release.beta ? 'https://beta-wallet.trezor.io/' : 'https://wallet.trezor.io/';
    const version = release.version.join('.');
    button.setAttribute('href', `${url}?fw=${version}`);

    container.appendChild(notification);

    const close = notification.querySelector('.close-icon');
    if (close) {
        close.addEventListener('click', () => {
            container.removeChild(notification);
        });
    }
};

export const showBridgeUpdateNotification = (): void => {
    const container: HTMLElement = document.getElementsByClassName('notification')[0];
    const warning: ?HTMLElement = container.querySelector('.bridge-update-notification');
    if (warning) {
        // already exists
        return;
    }

    const view = views.getElementsByClassName('bridge-update-notification');
    const notification = document.createElement('div');
    notification.className = 'bridge-update-notification notification-item';
    notification.innerHTML = view.item(0).innerHTML;

    container.appendChild(notification);

    const close = notification.querySelector('.close-icon');
    if (close) {
        close.addEventListener('click', () => {
            container.removeChild(notification);
        });
    }
};
