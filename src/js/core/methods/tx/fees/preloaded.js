/* @flow */

import BlockBook from '../../../../backend';
import type { FeeHandler } from './index';
import type { BitcoinNetworkInfo } from '../../../../types';
import type { FeeLevel, FeeLevelInfo } from '../../../../types/fee';

let feeLevels: $ReadOnlyArray<FeeLevel> = [];

async function detectWorking(backend: BlockBook, coinInfo: BitcoinNetworkInfo): Promise<boolean> {
    feeLevels = Object.keys(coinInfo.defaultFees)
        .sort((levelA, levelB) =>
            coinInfo.defaultFees[levelB] - coinInfo.defaultFees[levelA]
        ).map((level, i) => {
            return {
                name: level.toLowerCase(),
                id: i,
                info: {
                    type: 'preloaded',
                    fee: coinInfo.defaultFees[level].toString(),
                },
            };
        });
    return feeLevels.length > 0;
}

async function refresh(): Promise<any> {
    return true;
}

function getFeeList(): $ReadOnlyArray<FeeLevel> {
    return feeLevels;
}

function getFee(level: FeeLevelInfo): string {
    if (level.type === 'preloaded') {
        return level.fee;
    }
    throw new Error('Wrong level type');
}

function getBlocks(fee: string): ?number {
    return null;
}

export const preloadedHandler: FeeHandler = {
    refresh,
    detectWorking,
    getFeeList,
    getFee,
    getBlocks,
};
