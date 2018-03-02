/* @flow */
'use strict';

import type { LegacyBitcoreFeeLevelInfo } from './legacy';
import type { SmartBitcoreFeeLevelInfo } from './smart';
import type { PreloadedFeeLevelInfo } from './preloaded';
import BitcoreBackend from '../../backend/BitcoreBackend';
// import {getCoinInfo, waitForCoinInfo} from '../../../common/CoinInfo';
// import * as ang from '../../../angularHelper';

type CustomFeeLevelInfo = {
    +type: 'custom',
    fee: string,
}

export type FeeLevelInfo = LegacyBitcoreFeeLevelInfo | SmartBitcoreFeeLevelInfo | PreloadedFeeLevelInfo | CustomFeeLevelInfo;

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

export type FeeLevel = {
    +name: string,
    +id: number,
    +info: FeeLevelInfo,
}

export type FeeHandler = {
    refresh(): Promise<any>,
    detectWorking(bitcore: BitcoreBackend): Promise<boolean>, // should not reject
    getFeeList(): $ReadOnlyArray<FeeLevel>,
    getFee(level: FeeLevelInfo): number,
    getBlocks(fee: number): ?number,
}

import { legacyBitcoreHandler } from './legacy';
import { smartBitcoreHandler } from './smart';
import { preloadedHandler } from './preloaded';

let feeHandler: ?FeeHandler = null;
let bitcore: BitcoreBackend;

const handlers: Array<FeeHandler> = [
    smartBitcoreHandler,
    legacyBitcoreHandler,
    preloadedHandler,
];

const findWorkingHandler = async (bitcore: BitcoreBackend): Promise<FeeHandler> => {
    for (const handler of handlers) {
        if (await handler.detectWorking(bitcore)) {
            handler.getFeeList().forEach(level => {
                // level.refreshHack = 0;
            });
            return handler;
        }
    }
    throw new Error('No handler working');
};

export const init = async (backend: BitcoreBackend): Promise<void> => {
    bitcore = backend;
    feeHandler = await findWorkingHandler(bitcore);

    // TODO: remove interval
    // setInterval(() => {
    //     if (feeHandler != null) {
    //         feeLevels().forEach( (level: FeeLevel) => {
    //             level.refreshHack = level.refreshHack == null ? 1 : level.refreshHack + 1;
    //         });
    //         feeHandler.refresh(bitcore);
    //     }
    // }, 20 * 60 * 1000);
};

export const feeLevels = (): $ReadOnlyArray<FeeLevel> => {
    if (feeHandler == null) {
        return [];
    }
    return feeHandler.getFeeList();
};
// bad

export const getActualFee = (level: FeeLevel): number => {
    if (feeHandler == null) {
        throw new Error('No fee hander');
    }
    const info: FeeLevelInfo = level.info;
    if (info.type === 'custom') {
        if (!(/^\d+$/.test(info.fee))) {
            throw new Error('');
        }
        if ((+(info.fee)) < bitcore.coinInfo.minFee) {
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
