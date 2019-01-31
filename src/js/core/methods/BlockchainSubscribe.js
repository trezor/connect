/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import * as BLOCKCHAIN from '../../constants/blockchain';
import { NO_COIN_INFO } from '../../constants/errors';

import BlockBook, { create as createBackend } from '../../backend';
import { getCoinInfo } from '../../data/CoinInfo';
import { BlockchainMessage } from '../../message/builder';
import type { CoreMessage, CoinInfo } from '../../types';

type Params = {
    accounts: Array<string>,
    coinInfo: CoinInfo,
}

export default class BlockchainSubscribe extends AbstractMethod {
    params: Params;
    backend: BlockBook;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.info = '';
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            // { name: 'accounts', type: 'array', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        const coinInfo: ?CoinInfo = getCoinInfo(payload.coin);

        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            accounts: payload.accounts,
            coinInfo,
        };
    }

    async run(): Promise<{ subscribed: true }> {
        const { coinInfo } = this.params;
        if (coinInfo.type === 'misc') throw new Error('Invalid CoinInfo object');

        // initialize backend
        this.backend = await createBackend(coinInfo);

        this.backend.subscribe(
            this.params.accounts,
            (hash, height) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: coinInfo,
                    hash,
                    block: 0,
                    height,
                }));
            },
            notification => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                    coin: coinInfo,
                    notification,
                }));
            },
            error => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                    coin: coinInfo,
                    error: error.message,
                }));
            }
        );

        this.postMessage(new BlockchainMessage(BLOCKCHAIN.CONNECT, {
            coin: coinInfo,
            info: {
                fee: '0',
                block: 0,
            },
        }));

        return {
            subscribed: true,
        };
    }
}
