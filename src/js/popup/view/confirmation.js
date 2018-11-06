/* @flow */
'use strict';

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { RequestConfirmation } from '../../types/ui-request';

export const initConfirmationView = (data: $PropertyType<RequestConfirmation, 'payload'>): void => {
    // Confirmation views:
    // - export xpub
    // - export account info

    // TODO: Check if correct class names for HTML views
    showView(data.view);

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel')[0];

    const { customConfirmButton } = data;
    if (customConfirmButton) {
        confirmButton.innerHTML = customConfirmButton.label;
        confirmButton.classList.add(customConfirmButton.className);
    }

    h3.innerHTML = data.label;

    confirmButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'true'));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'false'));
        showView('loader');
    };
};
