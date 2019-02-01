import { httpRequest } from './utils';
import { showAlert } from '../view/common';
import { HD_HARDENED } from './constants';

const fromHardened = (n: number): number => (n & ~HD_HARDENED) >>> 0;
export const FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old');

let config;
const getConfig = () => {
    if (config) return config;
    return httpRequest('./config.json?v=' + new Date().getTime(), true)
    .then(file => {
        config = file;
        return config;
    }).catch(error => {
        return null;
    });
};

const getMethod = (config, event) => {
    if (event.data.type === 'xpubkey') {
        // xpubkey is the only method used by ethereum-like and bitcoin-like coins
        // check slip44 and validate against known ethereum networks (ETH_SLIP44)
        // if true replace 'xpubkey' by 'ethxpubkey' config
        const slip44 = fromHardened(event.data.path[1]);
        if (config.eth.find(network => network.slip44 === slip44)) {
            return config.supportedFirmware['ethxpubkey'];
        }
    }
    return config.supportedFirmware[event.data.type];
}

const validate = (device, event) => {
    return getConfig().then(config => {

        // config not found.
        // resolve without error (skip check)
        if (!config) {
            resolve(device);
            return;
        }

        const model = device.features ? device.features.major_version - 1 : null;
        const method = getMethod(config, event);

        // method or model not found.
        // resolve without error (skip check)
        if (!model || !method) {
            resolve(device);
            return;
        }

        if (method.min && !device.atLeast(method.min[model])) {
            throw FIRMWARE_IS_OLD;
        }
        if (method.max && device.atLeast(method.max[model])) {
            return promptWarning(device, event);
        }

        return device;
    });
};

export const promptWarning = (device, event) => {
    return new Promise((resolve, reject) => {
        showAlert('#alert_firmware_not_compatible');
        const container = document.getElementById('alert_firmware_not_compatible');
        container.callback = (proceed) => {
            showAlert('#alert_loading');
            if (proceed) {
                resolve();
            } else {
                reject(new Error('Cancelled'));
            }
        };

        document.getElementById('fw_version').innerText = device.getVersion();
        document.getElementById('fw_identity').innerText = event.data.identity.host;
        
    });
};

window.proceedWithFirmware = (proceed) => {
    document.getElementById('alert_firmware_not_compatible').callback(proceed);
};

export default validate;

