/* @flow */
'use strict';

import BlockBook from '../../../../backend';
import type { FeeHandler } from './index';
import type { CoinInfo } from 'flowtype';
import type { FeeLevel, FeeLevelInfo } from 'flowtype/fee';

let feeLevels: $ReadOnlyArray<FeeLevel> = [];

async function detectWorking(backend: BlockBook, coinInfo: CoinInfo): Promise<boolean> {
    feeLevels = Object.keys(coinInfo.defaultFees)
        .sort((levelA, levelB) =>
            coinInfo.defaultFees[levelB] - coinInfo.defaultFees[levelA]
        ).map((level, i) => {
            return {
                name: level.toLowerCase(),
                id: i,
                info: {
                    type: 'preloaded',
                    fee: coinInfo.defaultFees[level],
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

function getFee(level: FeeLevelInfo): number {
    if (level.type === 'preloaded') {
        return level.fee;
    }
    throw new Error('Wrong level type');
}

function getBlocks(fee: number): ?number {
    return null;
}

export const preloadedHandler: FeeHandler = {
    refresh,
    detectWorking,
    getFeeList,
    getFee,
    getBlocks,
};
