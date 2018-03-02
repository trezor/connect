/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const initConfirmationView = (data: any): void => {
    showView(data.view);

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm_button')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel_button')[0];

    h3.innerHTML = `Export ${ data.accountType.label }`; // public key for

    confirmButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'true'));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_CONFIRMATION, 'false'));
        showView('loader');
    };
};
