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
