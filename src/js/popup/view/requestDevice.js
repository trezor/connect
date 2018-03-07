/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const requestDevice = (): void => {

    showView('select_device');
    const handleClick = async (event: MouseEvent) => {
        // if (event.target instanceof HTMLElement) {
        //     postMessage(new UiMessage('WEBUSB'));
        // }
        // showView('loader');

        var TREZOR_DESCS = [
            // TREZOR v1
            { vendorId: 0x534c, productId: 0x0001 },
            // TREZOR v2 Bootloader
            { vendorId: 0x1209, productId: 0x53c0 },
            // TREZOR v2 Firmware
            { vendorId: 0x1209, productId: 0x53c1 },
          ];
        try {
            await navigator.usb.requestDevice({filters: TREZOR_DESCS});

            const devices = await navigator.usb.getDevices();
            console.warn("DEVICESSS", devices);
            postMessage(new UiMessage('WEBUSB'));
        } catch (error) {
            postMessage(new UiMessage('WEBUSB-ERROR'));
        }

    };

    container.onclick = handleClick;
};
