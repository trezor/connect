/* @flow */

import { showView } from './common';
import type { UnexpectedDeviceMode } from '../../types/uiRequest';

export const firmwareRequiredUpdate = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>): void => {
    const view = showView('firmware-update');
    if (!device.features) return;
    const release = device.firmwareRelease;
    if (!release) return;

    const button = view.getElementsByClassName('confirm')[0];
    const url = release.channel === 'beta' ? 'https://beta-wallet.trezor.io/' : 'https://wallet.trezor.io/';
    const version = release.version.join('.');
    button.setAttribute('href', `${url}?fw=${version}`);
};
