/* @flow */

import { container, showView } from './common';
import type { ButtonRequestMessage } from '../../types/events';

let toastTimeout;

const showToast = () => {
    const toast: HTMLElement = container.querySelectorAll('.toast')[0];
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
    toast.classList.add('visible');
};

const showAddressValidation = (payload: $PropertyType<ButtonRequestMessage, 'payload'>) => {
    showView('check-address');
    const data = payload.data;
    const dataContainer: HTMLElement = container.querySelectorAll('.button-request-data')[0];
    if (!data || data.type !== 'address') {
        if (dataContainer.parentNode) {
            dataContainer.parentNode.removeChild(dataContainer);
        }
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

        showToast();
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
