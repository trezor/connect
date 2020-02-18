/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { RequestConfirmation } from '../../types/events';

export const initConfirmationView = (data: $PropertyType<RequestConfirmation, 'payload'>): void => {
    // Confirmation views:
    // - export xpub
    // - export account info
    // - no backup

    // TODO: Check if correct class names for HTML views
    showView(data.view);

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel')[0];

    const { label, customConfirmButton, customCancelButton } = data;
    if (customConfirmButton) {
        confirmButton.innerText = customConfirmButton.label;
        confirmButton.classList.add(customConfirmButton.className);
    }
    if (customCancelButton) {
        confirmButton.innerText = customCancelButton.label;
        confirmButton.classList.add(customCancelButton.className);
    }

    if (label) {
        h3.innerHTML = label;
    }

    confirmButton.onclick = () => {
        postMessage(UiMessage(UI.RECEIVE_CONFIRMATION, true));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(UiMessage(UI.RECEIVE_CONFIRMATION, false));
        showView('loader');
    };
};
