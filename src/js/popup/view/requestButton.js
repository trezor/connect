/* @flow */
'use strict';

import { container, showView } from './common';
import type { ButtonRequestMessage } from '../../types/ui-request';

const showAddressValidation = (payload: $PropertyType<ButtonRequestMessage, 'payload'>) => {
    showView('check-address');
    const data = payload.data;
    const dataContainer: HTMLElement = container.querySelectorAll('.button-request-data')[0];
    if (!data || data.type !== 'address') {
        container.removeChild(dataContainer);
        return;
    }

    const path: HTMLElement = container.querySelectorAll('.path-value')[0];
    const address: HTMLElement = container.querySelectorAll('.address-value')[0];
    const clipboard: HTMLElement = container.querySelectorAll('.clipboard-button')[0];

    path.innerText = data.serializedPath;
    address.innerText = data.address;
    clipboard.onclick = () => {
        const el = document.createElement('textarea');
        el.value = data.address;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        dataContainer.appendChild(el);
        el.select();
        document.execCommand('copy');
        dataContainer.removeChild(el);
    };
};

export const requestButton = (payload: $PropertyType<ButtonRequestMessage, 'payload'>): void => {
    if (payload.code === 'ButtonRequest_Address') {
        showAddressValidation(payload);
    } else if (payload.code === 'ButtonRequest_ConfirmOutput') {
        showView('confirm-output');
    } else {
        showView('follow-device');
    }
};
