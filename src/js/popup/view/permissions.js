/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import DataManager from '../../data/DataManager';
import { container, showView, postMessage, createTooltip } from './common';
import type { RequestPermission } from '../../types/events';

const getPermissionText = (permissionType: string, deviceName: string): string => {
    let text: string = '';

    switch (permissionType) {
        case 'read':
            text = 'Read public keys from Trezor device';
            break;
        case 'read-meta':
            text = 'Read metadata from Trezor device';
            break;
        case 'write':
            text = 'Prepare Trezor device for transaction and data signing';
            break;
        case 'write-meta':
            text = 'Write metadata to Trezor device';
            break;
        case 'management':
            text = 'Modify device settings';
            break;
        case 'custom-message':
            text = 'Run custom operations';
            break;
    }
    return text;
};

const getPermissionTooltipText = (permissionType: string): string => {
    let text: string = '';

    switch (permissionType) {
        case 'read':
            text = 'Permission needed to load public information from your device.';
            break;
        case 'write':
            text = 'Permission needed to execute operations, such as composing a transaction, after your confirmation.';
            break;
        case 'management':
            text = 'Permission needed to change device settings, such as PIN, passphrase, label or seed.';
            break;
        case 'custom-message':
            text = 'Development tool. Use at your own risk. Allows service to send arbitrary data to your Trezor device.';
            break;
    }
    return text;
};

const createPermissionItem = (permissionText: string, tooltipText: string): HTMLDivElement => {
    const permissionItem = document.createElement('div');
    permissionItem.className = 'permission-item';

    // Tooltip
    if (tooltipText !== '') {
        const tooltip = createTooltip(tooltipText);
        permissionItem.appendChild(tooltip);
    }
    //

    // Permission content (icon & text)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    const infoIcon = document.createElement('span');
    infoIcon.className = 'info-icon';

    const permissionTextSpan = document.createElement('span');
    permissionTextSpan.innerText = permissionText;
    contentDiv.appendChild(infoIcon);
    contentDiv.appendChild(permissionTextSpan);
    permissionItem.appendChild(contentDiv);
    //

    return permissionItem;
};

export const initPermissionsView = (payload: $PropertyType<RequestPermission, 'payload'>): void => {
    showView('permissions');

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const hostName: HTMLElement = h3.getElementsByClassName('host-name')[0];
    const permissionsList: HTMLElement = container.getElementsByClassName('permissions-list')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel')[0];
    const rememberCheckbox: HTMLInputElement = (container.getElementsByClassName('remember-permissions')[0]: any);

    hostName.innerText = DataManager.getSettings('hostLabel') || DataManager.getSettings('origin');
    if (payload && Array.isArray(payload.permissions)) {
        payload.permissions.forEach(p => {
            const permissionText = getPermissionText(p, payload.device.label);
            const tooltipText = getPermissionTooltipText(p);

            const permissionItem = createPermissionItem(permissionText, tooltipText);
            permissionsList.appendChild(permissionItem);
        });
    }

    confirmButton.onclick = () => {
        postMessage(UiMessage(UI.RECEIVE_PERMISSION, {
            remember: (rememberCheckbox && rememberCheckbox.checked),
            granted: true,
        }));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(UiMessage(UI.RECEIVE_PERMISSION, {
            remember: (rememberCheckbox && rememberCheckbox.checked),
            granted: false,
        }));
        showView('loader');
    };

    rememberCheckbox.onchange = (e) => {
        confirmButton.innerText = e.target.checked ? 'Always allow for this service' : 'Allow once for this session';
    };
};
