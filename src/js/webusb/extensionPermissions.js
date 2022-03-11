/* @flow */

// import type { Config } from '@trezor/connect-common/lib/data/DataManager';
import { sendMessage } from '../utils/windowsUtils';
// eslint-disable-next-line no-unused-vars
import styles from '../../styles/popup.less';

let config: any;

const onLoad = async () => {
    // todo: ?
    // eslint-disable-next-line global-require
    config = await require('@trezor/connect-common/lib/files/config.json');
    sendMessage('usb-permissions-init', '*');
};

const init = (label: string) => {
    const extensionName = document.getElementsByClassName('extension-name')[0];
    extensionName.innerText = label;

    const usbButton = document.getElementsByClassName('confirm')[0];
    const cancelButton = document.getElementsByClassName('cancel')[0];

    usbButton.onclick = async () => {
        const filters = config.webusb.map(desc => ({
            vendorId: parseInt(desc.vendorId, 16),
            productId: parseInt(desc.productId, 16),
        }));

        const { usb } = navigator;
        if (usb) {
            try {
                await usb.requestDevice({ filters });
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

const handleMessage = ({ data, origin }: any) => {
    if (data && data.type === 'usb-permissions-init') {
        window.removeEventListener('message', handleMessage, false);
        const knownHost = config.knownHosts.find(host => host.origin === data.extension);
        const label = knownHost && knownHost.label ? knownHost.label : origin;
        init(label);
    }
};

window.addEventListener('load', onLoad, false);
window.addEventListener('message', handleMessage, false);
