/* @flow */
'use strict';

import { getCoinName } from '../data/CoinInfo';
import { invalidParameter } from '../constants/errors';
import createKeccakHash from 'keccak';
import type { CoinInfo } from 'flowtype';

export const HD_HARDENED: number = 0x80000000;
export const toHardened = (n: number): number => (n | HD_HARDENED) >>> 0;
export const fromHardened = (n: number): number => (n & ~HD_HARDENED) >>> 0;

const PATH_NOT_VALID = invalidParameter('Not a valid path.');
const PATH_NEGATIVE_VALUES = invalidParameter('Path cannot contain negative values.');

export const stripHexPrefix = (str: string): string => {
    return hasHexPrefix(str) ? str.slice(2) : str;
};

const hasHexPrefix = (str: string): boolean => {
    return str.slice(0, 2) === '0x';
}

export const toChecksumAddress = (address: string, chainId: number = 0): string => {
    let clean = stripHexPrefix(address);
    if (chainId) clean = chainId + '0x' + address;
    const hash = createKeccakHash('keccak256').update(clean).digest('hex');
    let ret = '0x';
    for (var i = 0; i < address.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
          ret += address[i].toUpperCase()
        } else {
          ret += address[i]
        }
    }
    return ret;
}
