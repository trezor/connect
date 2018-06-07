/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { BrowserMessage } from 'flowtype/ui-message';

export const initBrowserView = (payload: $PropertyType<BrowserMessage, 'payload'>): void => {
    console.log(payload);

    showView('browser');



    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    if (!payload.supported) {
        h3.innerText = 'Browser is not supported';
    } else if (payload.outdated) {
        h3.innerText = 'Browser is outdated';
    } else if (payload.mobile) {
        // TODO: ???
    }

    /* const button = container.getElementsByTagName('button')[0];
    button.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_BROWSER));
        showView('loader');
    } */
};
