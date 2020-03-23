/* @flow */

import { views } from './common';
import type { UnexpectedDeviceMode } from '../../types/events';

export const showFirmwareUpdateNotification = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>): void => {
    const container: HTMLElement = document.getElementsByClassName('notification')[0];
    const warning: ?HTMLElement = container.querySelector('.firmware-update-notification');
    if (warning) {
        // already exists
        return;
    }
    if (!device.features) return;
    if (!device.firmwareRelease) return;

    const { release } = device.firmwareRelease;

    const view = views.getElementsByClassName('firmware-update-notification');
    const notification = document.createElement('div');
    notification.className = 'firmware-update-notification notification-item';
    const viewItem = view.item(0);
    if (viewItem) {
        notification.innerHTML = viewItem.innerHTML;
    }

    const button = notification.getElementsByClassName('notification-button')[0];
    const url = release.channel === 'beta' ? 'https://beta-wallet.trezor.io/' : 'https://wallet.trezor.io/';
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
    const viewItem = view.item(0);
    if (viewItem) {
        notification.innerHTML = viewItem.innerHTML;
    }

    container.appendChild(notification);

    const close = notification.querySelector('.close-icon');
    if (close) {
        close.addEventListener('click', () => {
            container.removeChild(notification);
        });
    }
};

export const showBackupNotification = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>): void => {
    const container: HTMLElement = document.getElementsByClassName('notification')[0];
    const warning: ?HTMLElement = container.querySelector('.backup-notification');
    if (warning) {
        // already exists
        return;
    }

    const view = views.getElementsByClassName('backup-notification');
    const notification = document.createElement('div');
    notification.className = 'backup-notification notification-item';
    const viewItem = view.item(0);
    if (viewItem) {
        notification.innerHTML = viewItem.innerHTML;
    }

    container.appendChild(notification);

    const close = notification.querySelector('.close-icon');
    if (close) {
        close.addEventListener('click', () => {
            container.removeChild(notification);
        });
    }
};
