/* @flow */
'use strict';

import createKeccakHash from 'keccak';
import type { EthereumNetworkInfo } from 'flowtype';

const hasHexPrefix = (str: string): boolean => {
    return str.slice(0, 2) === '0x';
};

export const stripHexPrefix = (str: string): string => {
    return hasHexPrefix(str) ? str.slice(2) : str;
};

export const toChecksumAddress = (address: string, network: ?EthereumNetworkInfo): string => {
    let clean = stripHexPrefix(address);
    // different checksum for RSK
    if (network && network.rskip60) clean = network.chainId + '0x' + address;
    const hash: string = createKeccakHash('keccak256').update(clean).digest('hex');
    let response: string = '0x';
    for (let i = 0; i < address.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            response += address[i].toUpperCase();
        } else {
            response += address[i];
        }
    }
    return response;
};

export const getNetworkLabel = (label: string, network: ?EthereumNetworkInfo): string => {
    if (network) {
        const name: string = network.name.toLowerCase().indexOf('testnet') >= 0 ? 'Testnet' : network.name;
        return label.replace('#NETWORK', name);
    }
    return label.replace('#NETWORK', '');
};
