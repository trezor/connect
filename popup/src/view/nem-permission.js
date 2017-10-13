import { HD_HARDENED } from '../utils/constants';
import { serializePath } from '../utils/path';
import { showAlert } from './common';

var bip44 = require('bip44-constants');

const NEM_MAINNET = 0x68;
const NEM_TESTNET = 0x98;
const NEM_MIJIN = 0x60;

export const promptNEMAddressPermission = (address_n, network) => {
    return new Promise((resolve, reject) => {
        document.getElementById('nem_account').textContent = nemAddressLabel(address_n, network);
        document.getElementById('nem_network').textContent = nemNetworkName(network);
        document.getElementById('operation_nemaddress').callback = (exportAddress) => {
            showAlert(global.alert);
            if (exportAddress) {
                resolve();
            } else {
                reject(new Error('Cancelled'));
            }
        };
        showAlert('#alert_nemaddress');
    });
}

function nemAccountNumber(address_n, network) {
    const coinType = (network) => {
        switch (network) {
            case NEM_MAINNET:
            case NEM_MIJIN:
                console.log("NEM", bip44['NEM'], parseInt(bip44['NEM']))
                return parseInt(bip44['NEM']);
            case NEM_TESTNET:
                return parseInt(bip44['Testnet']);
            default:
                return null;
        }
    };

    const hardened = (i) => (i | HD_HARDENED) >>> 0;
    const unhardened = (i) => (i & ~HD_HARDENED) >>> 0;

    if (address_n.length == 5 &&
        address_n[0] == hardened(44) &&
        address_n[1] == coinType(network) &&
        address_n[3] == hardened(0) &&
        address_n[4] == hardened(0)) {
        return unhardened(address_n[2]) + 1;
    } else {
        return -1;
    }
}

function nemAddressLabel(address_n, network) {
    const account = nemAccountNumber(address_n, network);
    console.log("NEM2", account);
    if (account < 0) {
        return 'm/' + serializePath(address_n);
    } else {
        return `account #${account}`;
    }
}

function nemNetworkName(network) {
    switch (network) {
    case NEM_MAINNET:
        return 'Mainnet';
    case NEM_TESTNET:
        return 'Testnet';
    case NEM_MIJIN:
        return 'Mijin';
    default:
        return `0x${network.toString(16)}`;
    }
}

function exportNEMAddress() {
    document.querySelector('#operation_nemaddress').callback(true);
}

window.exportNEMAddress = exportNEMAddress;

function cancelNEMAddress() {
    document.querySelector('#operation_nemaddress').callback(false);
}

window.cancelNEMAddress = cancelNEMAddress;