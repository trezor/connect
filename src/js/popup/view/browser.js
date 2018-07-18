/* @flow */
'use strict';

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { BrowserMessage } from '../../types/ui-request';

export const initBrowserView = (payload: $PropertyType<BrowserMessage, 'payload'>): void => {
    showView(!payload.supported && payload.mobile ? 'smartphones-not-supported' : 'browser');

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const p: HTMLElement = container.getElementsByTagName('p')[0];
    if (!payload.supported && !payload.mobile) {
        h3.innerText = 'Unsupported browser';
        p.innerText = 'Please use one of the supported browsers.'
    } else if (payload.outdated) {
        h3.innerText = 'Outdated browser';
        p.innerText = 'Please update your browser.'
    }
};
