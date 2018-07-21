/* @flow */
'use strict';
import { container, showView } from './common';
import type { DeviceMessage } from '../../types/ui-request';

export const initPassphraseOnDeviceView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('passphrase-on-device');

    const deviceName: HTMLElement = container.getElementsByClassName('device-name')[0];
    deviceName.innerText = payload.device.label;
};
