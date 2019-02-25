/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import * as BLOCKCHAIN from '../../../constants/blockchain';
import { NO_COIN_INFO } from '../../../constants/errors';

import { create as createBlockbookBackend } from '../../../backend';
import { create as createBlockchainBackend } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import { BlockchainMessage } from '../../../message/builder';
import type { CoreMessage, CoinInfo } from '../../../types';

type Params = {
    accounts: Array<string>,
    coinInfo: CoinInfo,
}

export default class BlockchainSubscribe extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
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
        if (this.params.coinInfo.type === 'misc') {
            return await this.subscribeBlockchain();
        } else {
            return await this.subscribeBlockbook();
        }
    }

    async subscribeBlockchain(): Promise<{ subscribed: true }> {
        const backend = await createBlockchainBackend(this.params.coinInfo, this.postMessage);
        backend.subscribe(this.params.accounts);

        return {
            subscribed: true,
        };
    }

    async subscribeBlockbook(): Promise<{ subscribed: true }> {
        const { coinInfo } = this.params;
        if (coinInfo.type === 'misc') throw new Error('Invalid CoinInfo object');
        // initialize backend

        let backend;
        try {
            backend = await createBlockbookBackend(coinInfo);
        } catch (error) {
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                coin: this.params.coinInfo,
                error: error.message,
            }));
            throw error;
        }

        backend.subscribe(
            this.params.accounts,
            (hash, block) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.params.coinInfo,
                    hash,
                    block,
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
