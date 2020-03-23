/* @flow */

import { showView } from './common';
import type { UnexpectedDeviceMode } from '../../types/events';

export const firmwareRequiredUpdate = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>): void => {
    const view = showView('firmware-update');
    if (!device.features) return;
    if (!device.firmwareRelease) return;
    const { release } = device.firmwareRelease;

    const button = view.getElementsByClassName('confirm')[0];
    const url = release.channel === 'beta' ? 'https://beta-wallet.trezor.io/' : 'https://wallet.trezor.io/';
    const version = release.version.join('.');
    button.setAttribute('href', `${url}?fw=${version}`);
};
