/* @flow */
'use strict';

import { legacyBitcoreHandler } from './legacy';
import { smartBitcoreHandler } from './smart';
import { preloadedHandler } from './preloaded';

import BlockBook from '../../../../backend';
// import {getCoinInfo, waitForCoinInfo} from '../../../common/CoinInfo';
// import * as ang from '../../../angularHelper';

import type { CoinInfo } from 'flowtype';
import type { FeeLevel, FeeLevelInfo } from 'flowtype/fee';

type CustomFeeLevelInfo = {
    +type: 'custom',
    fee: string,
}

// refreshHack is a "counter", that tells angular, that refresh happened,
// so it needs to repaint what it can.
//
// It is a terrible hack, and at this point it makes no sense to not have the satb directly
// in the fee level (since it is being re-set by fees anyway), but I don't want to do another rewrite
export type CustomFeeLevel = {
    +name: string,
    +id: number,
    +info: CustomFeeLevelInfo,
}

export type FeeHandler = {
    refresh(backend: BlockBook): Promise<any>,
    detectWorking(backend: BlockBook, coinInfo: CoinInfo): Promise<boolean>, // should not reject
    getFeeList(): $ReadOnlyArray<FeeLevel>,
    getFee(level: FeeLevelInfo): number,
    getBlocks(fee: number): ?number,
}

let feeHandler: ?FeeHandler = null;

const handlers: Array<FeeHandler> = [
    smartBitcoreHandler,
    legacyBitcoreHandler,
    preloadedHandler,
];

const findWorkingHandler = async (backend: BlockBook, coinInfo: CoinInfo): Promise<FeeHandler> => {
    for (const handler of handlers) {
        if (await handler.detectWorking(backend, coinInfo)) {
            handler.getFeeList().forEach(level => {
                // level.refreshHack = 0;
            });
            return handler;
        }
    }
    throw new Error('No handler working');
};

export const init = async (backend: BlockBook, coinInfo: CoinInfo): Promise<void> => {
    feeHandler = await findWorkingHandler(backend, coinInfo);

    // TODO: remove interval
    // setInterval(() => {
    //     if (feeHandler != null) {
    //         feeLevels().forEach( (level: FeeLevel) => {
    //             level.refreshHack = level.refreshHack == null ? 1 : level.refreshHack + 1;
    //         });
    //         feeHandler.refresh(backend);
    //     }
    // }, 20 * 60 * 1000);
};

export const getFeeLevels = (): $ReadOnlyArray<FeeLevel> => {
    if (feeHandler == null) {
        return [];
    }
    return feeHandler.getFeeList();
};
// bad

export const getActualFee = (level: FeeLevel, coinInfo: CoinInfo): number => {
    if (feeHandler == null) {
        throw new Error('No fee hander');
    }
    const info: FeeLevelInfo = level.info;
    if (info.type === 'custom') {
        if (!(/^\d+$/.test(info.fee))) {
            throw new Error('');
        }
        if ((+(info.fee)) < coinInfo.minFee) {
            throw new Error('');
        }
        return +(info.fee);
    }
    return feeHandler.getFee(info);
};

export const getBlocks = (fee: number): ?number => {
    if (feeHandler == null) {
        throw new Error('');
    }
    return feeHandler.getBlocks(fee);
};
