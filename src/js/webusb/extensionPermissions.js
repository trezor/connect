/* @flow */

import { httpRequest } from '../env/browser/networkUtils';
import { sendMessage } from '../utils/windowsUtils';
// eslint-disable-next-line no-unused-vars
import styles from '../../styles/popup.less';

import type { Config } from '../data/DataManager';

let config: Config;

const onLoad = async () => {
    config = await httpRequest('./data/config.json', 'json');
    sendMessage('usb-permissions-init', '*');
};

const init = (label: string) => {
    const extensionName: HTMLElement = document.getElementsByClassName('extension-name')[0];
    extensionName.innerText = label;

    const usbButton: HTMLElement = document.getElementsByClassName('confirm')[0];
    const cancelButton: HTMLElement = document.getElementsByClassName('cancel')[0];

    usbButton.onclick = async () => {
        const filters = config.webusb.map(desc => {
            return {
                vendorId: parseInt(desc.vendorId),
                productId: parseInt(desc.productId),
            };
        });

        const usb = navigator.usb;
        if (usb) {
            try {
                await usb.requestDevice({filters});
                sendMessage('usb-permissions-close', '*');
            } catch (error) {
                // empty
            }
        }
    };

    cancelButton.onclick = () => {
        sendMessage('usb-permissions-close', '*');
    };
};

const handleMessage = (message: MessageEvent) => {
    const data: any = message.data;
    if (data && data.type === 'usb-permissions-init') {
        window.removeEventListener('message', handleMessage, false);
        const knownHost = config.knownHosts.find(host => host.origin === data.extension);
        const label: string = knownHost && knownHost.label ? knownHost.label : message.origin;
        init(label);
    }
};

window.addEventListener('load', onLoad, false);
window.addEventListener('message', handleMessage, false);

