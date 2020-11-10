/* @flow */

import { showView } from './common';
import type { UnexpectedDeviceMode } from '../../types/events';

export const firmwareRequiredUpdate = (device: $PropertyType<UnexpectedDeviceMode, 'payload'>): void => {
    const view = showView('firmware-update');
    if (!device.features) return;
    if (!device.firmwareRelease) return;

    const button = view.getElementsByClassName('confirm')[0];
    button.setAttribute('href', 'https://suite.trezor.io/web/firmware/');
};
