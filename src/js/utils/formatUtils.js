/* @flow */

import BigNumber from 'bignumber.js';
import type { BitcoinNetworkInfo } from '../types';

const currencyUnits = 'btc';

// TODO: change currency units

export const formatAmount = (n: string, coinInfo: BitcoinNetworkInfo): string => {
    const amount = new BigNumber(n).dividedBy(1e8);
    if (coinInfo.isBitcoin && currencyUnits === 'mbtc' && amount.lte(0.1)) {
        const s = new BigNumber(n).dividedBy(1e5).toString();
        return `${s} mBTC`;
    }
    const s = amount.toString();
    return `${s} ${coinInfo.shortcut}`;
};

export const formatTime = (n: number): string => {
    const hours = Math.floor(n / 60);
    const minutes = n % 60;

    if (!n) return 'No time estimate';
    let res = '';
    if (hours !== 0) {
        res += hours + ' hour';
        if (hours > 1) {
            res += 's';
        }
        res += ' ';
    }
    if (minutes !== 0) {
        res += minutes + ' minutes';
    }
    return res;
};

export const btckb2satoshib = (n: string): string => {
    return new BigNumber(n).times(1e5).toFixed(0, BigNumber.ROUND_HALF_UP);
};
