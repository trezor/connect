/* @flow */
'use strict';

import BlockBook from './BlockBook';

import type { BitcoinNetworkInfo, EthereumNetworkInfo } from '../types';

const instances: Array<BlockBook> = [];

export const remove = (backend: BlockBook): void => {
    const index: number = instances.indexOf(backend);
    if (index >= 0) {
        instances.splice(index, 1);
    }
};

export const find = (name: string): ?BlockBook => {
    for (let i: number = 0; i < instances.length; i++) {
        if (instances[i].options.coinInfo.name === name) {
            if (instances[i].error) {
                remove(instances[i]);
            } else {
                return instances[i];
            }
        }
    }
    return null;
};

export const create = async (coinInfo: BitcoinNetworkInfo | EthereumNetworkInfo): Promise<BlockBook> => {
    let backend: ?BlockBook = find(coinInfo.name);
    if (!backend) {
        backend = new BlockBook({ urls: [ ...coinInfo.blockbook, ...coinInfo.bitcore ], coinInfo });
        try {
            await backend.loadCoinInfo(coinInfo);
        } catch (error) {
            remove(backend);
            throw error;
        }
        instances.push(backend);
    }
    return backend;
};

export default BlockBook;
