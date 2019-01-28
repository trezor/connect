/* @flow */
'use strict';

import { container, showView } from './common';
import type { ButtonRequestMessage } from '../../types/ui-request';

const showAddressValidation = (payload: $PropertyType<ButtonRequestMessage, 'payload'>) => {
    // TODO: display different text for exporting bundle, handle bundle_progress
    showView('check-address');
    const addressContainer: HTMLElement = container.querySelectorAll('.address-list')[0];
    const html = (payload.data || []).map(item => {
        return `<h3>${ item.address }</h3>`;
    });
    addressContainer.innerHTML = html.join('');
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
