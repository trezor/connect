/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const initBrowserView = (data: Object): void => {

    if (data.outdated) {
        showView('browser-outdated');

        const button = container.getElementsByTagName('button')[0];
        button.onclick = () => {
            postMessage(new UiMessage(UI.RECEIVE_BROWSER));
            showView('loader');
        }
    } else {
        if (data.mobile) {
            showView('browser-mobile');
        } else {
            showView('browser-not-supported');
        }
    }
};
