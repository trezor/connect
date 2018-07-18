/* @flow */
'use strict';

import createKeccakHash from 'keccak';
import type { EthereumNetworkInfo } from 'flowtype';

export const stripHexPrefix = (str: string): string => {
    return hasHexPrefix(str) ? str.slice(2) : str;
};

const hasHexPrefix = (str: string): boolean => {
    return str.slice(0, 2) === '0x';
}

export const toChecksumAddress = (address: string, network: ?EthereumNetworkInfo): string => {
    let clean = stripHexPrefix(address);
    // different checksum for RSK
    if (network && network.rskip60) clean = network.chainId + '0x' + address;
    const hash: string = createKeccakHash('keccak256').update(clean).digest('hex');
    let response: string = '0x';
    for (var i = 0; i < address.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            response += address[i].toUpperCase()
        } else {
            response += address[i]
        }
    }
    return response;
}

export const getNetworkLabel = (label: string, network: ?EthereumNetworkInfo): string => {
    if (network) {
        return label.replace('#NETWORK', network.name);
    }
    return label.replace('#NETWORK', '');
}
