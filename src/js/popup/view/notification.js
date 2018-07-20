/* @flow */
'use strict';

import { views } from './common';

export const showFirmwareUpdateNotification = (): void => {
    const container: HTMLElement = document.getElementsByClassName('notification')[0];
    const warning: ?HTMLElement = container.querySelector('.firmware-update-notification');
    if (warning) {
        // already exists
        return;
    }

    const view = views.getElementsByClassName('firmware-update-notification');
    const notification = document.createElement('div');
    notification.className = 'firmware-update-notification notification-item';
    notification.innerHTML = view.item(0).innerHTML;

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
