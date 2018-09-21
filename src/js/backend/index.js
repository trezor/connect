/* @flow */
'use strict';

import BlockBook from './BlockBook';

import type { CoinInfo } from 'flowtype';

const instances: Array<BlockBook> = [];

export const find = (name: string): ?BlockBook => {
    for (let i: number = 0; i < instances.length; i++) {
        if (instances[i].options.coinInfo.name === name) {
            return instances[i];
        }
    }
    return null;
};

export const remove = (backend: BlockBook): void => {
    const index: number = instances.indexOf(backend);
    if (index >= 0) {
        instances.splice(index, 1);
    }
};

export const createFromCoinInfo = async (coinInfo: CoinInfo): Promise<BlockBook> => {
    let backend: ?BlockBook = find(coinInfo.name);
    if (!backend) {
        backend = new BlockBook({ urls: [ ...coinInfo.blockbook, ...coinInfo.bitcore ], coinInfo });
        instances.push(backend);
    }
    try {
        await backend.loadCoinInfo(coinInfo);
    } catch (error) {
        remove(backend);
        throw error;
    }
    return backend;
};
export const create = async (coinInfo: CoinInfo): Promise<BlockBook> => {
    return await createFromCoinInfo(coinInfo);
};

export default BlockBook;
