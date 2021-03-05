/* @flow */
import { container, showView } from './common';
import type { DeviceMessage } from '../../types/events';

export const passphraseOnDeviceView = (payload: $PropertyType<DeviceMessage, 'payload'>) => {
    showView('passphrase-on-device');

    const deviceName = container.getElementsByClassName('device-name')[0];
    deviceName.innerText = payload.device.label;
};
