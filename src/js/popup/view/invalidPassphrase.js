/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { DeviceMessage } from '../../types/uiRequest';

export const initInvalidPassphraseView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('invalid-passphrase');

    const confirmButton: HTMLElement = container.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = container.getElementsByClassName('cancel')[0];

    confirmButton.onclick = () => {
        postMessage(UiMessage(UI.INVALID_PASSPHRASE_ACTION, false));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(UiMessage(UI.INVALID_PASSPHRASE_ACTION, true));
        showView('loader');
    };
};
