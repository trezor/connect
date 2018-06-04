/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

const getPermissionText = (permissionType: string, deviceName: string): string => {
    let text: string = '';

    switch (permissionType) {
        case 'read':
            text = `Read data from ${deviceName}`;
            break;
        case 'write':
            text = `Write data to ${deviceName}`;
            break;
    }
    return text;
};

const createTooltip = (text: string): HTMLDivElement => {
    const infoIcon: HTMLDivElement = document.createElement('div');
    infoIcon.className = 'info-icon';

    const tooltip: HTMLDivElement = document.createElement('div');
    tooltip.className = 'tooltip';
    const tooltipText = document.createElement('span')
    tooltipText.appendChild(
        document.createTextNode(text)
    );
    tooltip.appendChild(tooltipText);

    infoIcon.appendChild(tooltip);
    return infoIcon;
};

export const initPermissionsView = (data: any, origin: string): void => {
    showView('permissions');

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const hostName: HTMLElement = h3.getElementsByTagName('span')[0];
    const permissionsList: HTMLElement = container.getElementsByClassName('permissions-list')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel')[0];

    hostName.innerHTML = origin;
    if (data && Array.isArray(data)) {
        data.forEach(p => {
            const listItem: HTMLLIElement = document.createElement('li');

            const tooltip = createTooltip('TODO: Change text here');
            listItem.appendChild(tooltip);

            const permissionText = getPermissionText(p, '#TREZOR');
            listItem.appendChild(
                document.createTextNode(permissionText)
            );
            permissionsList.appendChild(listItem);
        });
    }

    confirmButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_PERMISSION, 'true'));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_PERMISSION, 'false'));
        showView('loader');
    };
};
