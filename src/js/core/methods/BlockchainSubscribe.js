/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import * as BLOCKCHAIN from '../../constants/blockchain';
import { NO_COIN_INFO } from '../../constants/errors';

import BlockBook, { create as createBackend } from '../../backend';
import { getCoinInfoByCurrency, getEthereumNetwork } from '../../data/CoinInfo';
import { BlockchainMessage } from '../../message/builder';
import type { CoinInfo, EthereumNetworkInfo } from 'flowtype';
import type { CoreMessage } from '../../types';

type Params = {
    accounts: Array<string>,
    coinInfo: CoinInfo | EthereumNetworkInfo,
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

        let coinInfo: ?(CoinInfo | EthereumNetworkInfo) = getCoinInfoByCurrency(payload.coin);
        if (!coinInfo) {
            coinInfo = getEthereumNetwork(payload.coin);
        }

        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            accounts: payload.accounts,
            coinInfo,
        };
    }

    async run(): Promise<{ subscribed: true }> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);

        this.backend.subscribe(
            this.params.accounts,
            (hash, height) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.params.coinInfo,
                    hash,
                    height,
                }));
            },
            notification => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                    coin: this.params.coinInfo,
                    notification,
                }));
            },
            error => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                    coin: this.params.coinInfo,
                    error: error.message,
                }));
            }
        );

        this.postMessage(new BlockchainMessage(BLOCKCHAIN.CONNECT, {
            coin: this.params.coinInfo,
        }));

        return {
            subscribed: true,
        };
    }
}
