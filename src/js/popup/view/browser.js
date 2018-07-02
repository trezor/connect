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
    const p: HTMLElement = container.getElementsByTagName('p')[0];
    if (!payload.supported) {
        h3.innerText = 'Unsupported browser';
        p.innerText = 'Please use one of the supported browsers.';
    } else if (payload.outdated) {
        h3.innerText = 'Outdated browser';
        p.innerText = 'Please use update your browser.';
    } else if (payload.mobile) {
        // TODO: ???
    }

    /* const button = container.getElementsByTagName('button')[0];
    button.onclick = () => {
        postMessage(new UiMessage(UI.RECEIVE_BROWSER));
        showView('loader');
    } */
};
