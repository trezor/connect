import { HD_HARDENED } from '../utils/constants';
import { serializePath } from '../utils/path';
import { showAlert } from './common';

export { showSelectionFees, CHANGE_ACCOUNT } from './select-fee';
export { showSelectionAccounts, restoreSelectionAccounts } from './select-account';
export { promptNEMAddressPermission } from './nem-permission';
export { showAlert } from './common';


var bip44 = require('bip44-constants');

export const xpubKeyLabel = (path) => {
    const hardened = (i) => path[i] & ~HD_HARDENED;
    if (hardened(0) === 44) {
        let coinName = getCoinName(path[1]);
        if (coinName === 'Bitcoin' || coinName === 'Litecoin') {
            coinName += ' legacy';
        }
        return `${coinName} account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 48) {
        return `Multisig account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 49) {
        let coinName = getCoinName(path[1]);
        return `${coinName} account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 45342) {
        if (hardened(1) === 44) {
            return `Copay ID of account #${hardened(2) + 1}`;
        }
        if (hardened(1) === 48) {
            return `Copay ID of multisig account #${hardened(2) + 1}`;
        }
    }
    return 'm/' + serializePath(path);
}

export const getCoinName = (n) => {
    for (let name of Object.keys(bip44)) {
        let number = parseInt(bip44[name]);
        if (number === n) {
            return name;
        }
    };
    return 'Unknown coin';
}


export const promptInfoPermission = (path) => {
    return new Promise((resolve, reject) => {
        let element = document.getElementById('accountinfo_id');
        element.innerHTML = xpubKeyLabel(path);
        element.callback = (exportInfo) => {
            showAlert(global.alert);
            if (exportInfo) {
                resolve();
            } else {
                reject(new Error('Cancelled'));
            }
        };
        showAlert('#alert_accountinfo');
    });
}

function exportInfo() {
    document.querySelector('#accountinfo_id').callback(true);
}

global.exportInfo = exportInfo;

function cancelInfo() {
    document.querySelector('#accountinfo_id').callback(false);
}

global.cancelInfo = cancelInfo;



export const promptXpubKeyPermission = (path) => {
    return new Promise((resolve, reject) => {
        let e = document.getElementById('xpubkey_id');
        e.textContent = xpubKeyLabel(path);
        e.callback = (exportXpub) => {
            showAlert(global.alert);
            if (exportXpub) {
                resolve(path);
            } else {
                reject(new Error('Cancelled'));
            }
        };
        showAlert('#alert_xpubkey');
    });
}

function exportXpubKey() {
    document.querySelector('#xpubkey_id').callback(true);
}

window.exportXpubKey = exportXpubKey;

function cancelXpubKey() {
    document.querySelector('#xpubkey_id').callback(false);
}

window.cancelXpubKey = cancelXpubKey;