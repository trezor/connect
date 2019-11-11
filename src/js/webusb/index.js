/* @flow */

import { httpRequest } from '../env/browser/networkUtils';
// eslint-disable-next-line no-unused-vars
import styles from '../../styles/webusb.less';

import type { Config } from '../data/DataManager';

// handle message received from connect.js
const handleMessage = async (event: MessageEvent): Promise<void> => {
    if (!event.data) return;
    const data: any = event.data;

    const exists = document.getElementsByTagName('button');
    if (exists && exists.length > 0) {
        return;
    }

    const config: Config = await httpRequest('./data/config.json', 'json');
    const filters = config.webusb.map(desc => {
        return {
            vendorId: parseInt(desc.vendorId),
            productId: parseInt(desc.productId),
        };
    });

    const button = document.createElement('button');

    if (data.style) {
        const css: {[k: string]: string} = JSON.parse(data.style);
        for (const key of Object.keys(css)) {
            if (Object.prototype.hasOwnProperty.call(button.style, key)) {
                button.style.setProperty(key, css[key]);
            }
        }
    } else {
        button.className = 'default';
    }

    button.onclick = async () => {
        const usb = navigator.usb;
        if (usb) {
            try {
                await usb.requestDevice({filters});
            } catch (error) {
                // empty
            }
        }
    };

    if (document.body) { document.body.append(button); }
};

window.addEventListener('message', handleMessage);
