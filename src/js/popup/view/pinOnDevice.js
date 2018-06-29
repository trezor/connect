/* @flow */
'use strict'
import { container, showView } from './common';
import type { DeviceMessage } from 'flowtype/ui-message';

export const initPinOnDeviceView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('passphrase-on-device');

    const header: HTMLElement = container.getElementsByTagName('h3')[0];
    header.innerHTML = header.innerHTML.replace('#TREZOR', payload.device.label);
}