/* @flow */
'use strict';

// eslint-disable-next-line no-unused-vars
import styles from '../../styles/webusb.less';


 // handle message received from connect.js
const handleMessage = (event: MessageEvent): void => {

    if (!event.data) return;
    const data: any = event.data;

    const exists = document.getElementsByTagName('button');
    if (exists && exists.length > 0) {
        return;
    }

    const button = document.createElement('button');

    if (data.style) {
        const css = JSON.parse(data.style);
        for (let key of Object.keys(css)) {
            if (button.style.hasOwnProperty(key)) {
                button.style[key] = css[key];
            }
        }
    } else {
        button.className = 'default';
    }

    button.onclick = async () => {
        // TODO: get it from config.json
        const TREZOR_DESCS = [
            // TREZOR v1
            { vendorId: 0x534c, productId: 0x0001 },
            // TREZOR v2 Bootloader
            { vendorId: 0x1209, productId: 0x53c0 },
            // TREZOR v2 Firmware
            { vendorId: 0x1209, productId: 0x53c1 },
        ];

        const usb = navigator.usb;
        if (usb){
            try {
                await usb.requestDevice({filters: TREZOR_DESCS});
            } catch (error) {
                console.log("Webusb", error);
            }
        }
    }

    if (document.body)
        document.body.append(button);
}

window.addEventListener('message', handleMessage);
