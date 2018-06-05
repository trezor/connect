/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const initConfirmationView = (data: any): void => {
    // Confirmation views:
    // - export xpub
    // - export account info

    // TODO: Check if correct class names for HTML views
    showView(data.view);

    const span: HTMLElement = container.getElementsByTagName('span')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel')[0];


    // TODO: Check if data.accountType.label exists --> concrete type for data
    span.innerText = data.accountType.label

    confirmButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'true'));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'false'));
        showView('loader');
    };
};
