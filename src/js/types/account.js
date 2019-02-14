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

// TODO: refactor in blockchain-link
export type EthereumAccount = {
    address: string,
    block: number,
    transactions: number,
    balance: string,
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
