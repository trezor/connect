/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const initPermissionsView = (data: any, origin: string): void => {
    showView('permissions');

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const hostName: HTMLElement = h3.getElementsByTagName('span')[0];
    const list: HTMLElement = container.getElementsByClassName('permissions_list')[0];
    const confirmButton: HTMLElement = container.getElementsByClassName('confirm_button')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel_button')[0];

    hostName.innerHTML = origin;
    if (data && Array.isArray(data)) {
        const ul: HTMLUListElement = document.createElement('ul');
        ul.className = 'permissions_list';
        for (const p of data) {
            const li: HTMLLIElement = document.createElement('li');
            li.innerHTML = p;
            ul.append(li);
        }
        list.append(ul);
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
