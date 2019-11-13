/* @flow */
import createKeccakHash from 'keccak';
import type { EthereumNetworkInfo, CoinInfo } from '../types';

const hasHexPrefix = (str: string): boolean => {
    return str.slice(0, 2).toLowerCase() === '0x';
};

export const stripHexPrefix = (str: string): string => {
    return hasHexPrefix(str) ? str.slice(2) : str;
};

export const toChecksumAddress = (address: string, network: ?EthereumNetworkInfo): string => {
    if (hasHexPrefix(address)) return address;
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

export const getNetworkLabel = (label: string, network: ?CoinInfo): string => {
    if (network) {
        const name: string = network.name.toLowerCase().indexOf('testnet') >= 0 ? 'Testnet' : network.name;
        return label.replace('#NETWORK', name);
    }
    return label.replace('#NETWORK', '');
};

// from (isHexString) https://github.com/ethjs/ethjs-util/blob/master/src/index.js
const isHexString = (value: string, length?: number) => {
    if (typeof value !== 'string' || !value.match(/^(0x|0X)?[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) { return false; }
    return true;
};

// from (toBuffer) https://github.com/ethereumjs/ethereumjs-util/blob/master/index.js
export const messageToHex = (message: string): string => {
    let buffer: Buffer;
    if (isHexString(message)) {
        let clean = stripHexPrefix(message);
        // pad left even
        if (clean.length % 2 !== 0) { clean = '0' + clean; }
        buffer = Buffer.from(clean, 'hex');
    } else {
        buffer = Buffer.from(message);
    }
    return buffer.toString('hex');
};
