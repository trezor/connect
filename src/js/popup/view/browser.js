/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { BrowserMessage } from '../../types/ui-request';

export const initBrowserView = (payload: $PropertyType<BrowserMessage, 'payload'>): void => {
    showView(!payload.supported && payload.mobile ? 'smartphones-not-supported' : 'browser');

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    if (!payload.supported && !payload.mobile) {
        h3.innerText = 'Browser is not supported';
    } else if (payload.outdated) {
        h3.innerText = 'Browser is outdated';
    }
};
