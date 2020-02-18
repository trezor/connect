/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { DeviceMessage } from '../../types/events';

export const initInvalidPassphraseView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('invalid-passphrase');

    const retryButton: HTMLElement = container.getElementsByClassName('retry')[0];
    const useCurrentButton: HTMLElement = container.getElementsByClassName('useCurrent')[0];

    retryButton.onclick = () => {
        postMessage(UiMessage(UI.INVALID_PASSPHRASE_ACTION, true));
        showView('loader');
    };

    useCurrentButton.onclick = () => {
        postMessage(UiMessage(UI.INVALID_PASSPHRASE_ACTION, false));
        showView('loader');
    };
};
