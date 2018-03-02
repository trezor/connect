/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const selectDevice = (list: ?Object): void => {
    if (!list) return;

    if (list.length === 0) {
        showView('connect');
        return;
    }
    showView('select_device');

    const buttonsContainer: HTMLElement = container.getElementsByClassName('select_device_list')[0];

    const handleClick = (event: MouseEvent) => {
        if (event.target instanceof HTMLElement) {
            postMessage(new UiMessage(UI.RECEIVE_DEVICE, event.target.getAttribute('data-path')));
        }
        showView('loader');
    };
    for (const dev of list) {
        const button: HTMLButtonElement = document.createElement('button');
        button.innerHTML = dev.label;
        button.onclick = handleClick;
        button.setAttribute('data-path', dev.path);

        // create new device button
        const div: HTMLDivElement = document.createElement('div');
        div.className = 'device';
        div.appendChild(button);

        buttonsContainer.appendChild(div);
    }
};
