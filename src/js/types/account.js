/* @flow */

import type { BitcoinNetworkInfo } from './coinInfo';

export type BitcoinAccount = {
    id: number,
    path: Array<number>,
    coinInfo: BitcoinNetworkInfo,
    xpub: string,
    label: string,
    balance: number,
    transactions: number,
};

export type EthereumAccount = {
    descriptor: string,
    path?: Array<number>,
    serializedPath?: string,
    block: number,
    transactions: number,
    balance: string,
    availableBalance: string,
    nonce: number,
};

export type RippleAccount = {
    descriptor: string,
    path?: Array<number>,
    serializedPath?: string,
    block: number,
    transactions: number,
    balance: string,
    availableBalance: string,
    reserve: string,
    sequence: number,
};
