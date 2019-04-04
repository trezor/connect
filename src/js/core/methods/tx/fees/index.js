/* @flow */

import { legacyBitcoreHandler } from './legacy';
import { smartBitcoreHandler } from './smart';
import { preloadedHandler } from './preloaded';

import BlockBook from '../../../../backend';

import type { BitcoinNetworkInfo } from '../../../../types';
import type { FeeLevel, FeeLevelInfo } from '../../../../types/fee';

export type FeeHandler = {
    refresh(backend: BlockBook): Promise<any>,
    detectWorking(backend: BlockBook, coinInfo: BitcoinNetworkInfo): Promise<boolean>, // should not reject
    getFeeList(): $ReadOnlyArray<FeeLevel>,
    getFee(level: FeeLevelInfo): string,
    getBlocks(fee: string): ?number,
}

let feeHandler: ?FeeHandler = null;

const handlers: Array<FeeHandler> = [
    smartBitcoreHandler,
    legacyBitcoreHandler,
    preloadedHandler,
];

const findWorkingHandler = async (backend: BlockBook, coinInfo: BitcoinNetworkInfo): Promise<FeeHandler> => {
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

export const init = async (backend: BlockBook, coinInfo: BitcoinNetworkInfo): Promise<void> => {
    feeHandler = await findWorkingHandler(backend, coinInfo);
};

export const getFeeLevels = (): $ReadOnlyArray<FeeLevel> => {
    if (feeHandler == null) {
        return [];
    }
    return feeHandler.getFeeList();
};

export const getActualFee = (level: FeeLevel, coinInfo: BitcoinNetworkInfo): string => {
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
        return info.fee;
    }
    return feeHandler.getFee(info);
};

export const getBlocks = (fee: string): ?number => {
    if (feeHandler == null) {
        throw new Error('');
    }
    return feeHandler.getBlocks(fee);
};
