/* @flow */

import { showView } from './common';
import { getLatestRelease } from '../../data/FirmwareInfo';
import type { UnexpectedDeviceMode } from '../../types/uiRequest';

export const firmwareRequiredUpdate = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>): void => {
    const view = showView('firmware-update');
    if (!device.features) return;
    const { features } = device;
    const release = getLatestRelease([ features.major_version, features.minor_version, features.patch_version ]);

    if (!release) return;

    const button = view.getElementsByClassName('confirm')[0];
    const url = release.channel === 'beta' ? 'https://beta-wallet.trezor.io/' : 'https://wallet.trezor.io/';
    const version = release.version.join('.');
    button.setAttribute('href', `${url}?fw=${version}`);
};
