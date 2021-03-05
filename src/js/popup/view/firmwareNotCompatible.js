/* @flow */

import { UiMessage } from '../../message/builder';
import DataManager from '../../data/DataManager';
import * as UI from '../../constants/ui';
import { showView, postMessage } from './common';
import type { UnexpectedDeviceMode } from '../../types/events';

export const firmwareNotCompatible = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>) => {
    const view = showView('firmware-not-compatible');
    if (!device.features) return;
    const { features } = device;

    const fwVersion = view.getElementsByClassName('fw-version')[0];
    const identity = view.getElementsByClassName('fw-identity');
    const developer =
        DataManager.getSettings('hostLabel') ||
        DataManager.getSettings('origin') ||
        'this application';
    const confirmButton = view.getElementsByClassName('confirm')[0];
    const cancelButton = view.getElementsByClassName('cancel')[0];

    fwVersion.innerHTML = `${features.major_version}.${features.minor_version}.${features.patch_version}`;
    for (let i = 0; i < identity.length; i++) {
        identity[i].innerText = developer;
    }

    confirmButton.onclick = () => {
        postMessage(UiMessage(UI.RECEIVE_CONFIRMATION, true));
        showView('loader');
    };

    cancelButton.onclick = () => {
        postMessage(UiMessage(UI.RECEIVE_CONFIRMATION, false));
        showView('loader');
    };
};
