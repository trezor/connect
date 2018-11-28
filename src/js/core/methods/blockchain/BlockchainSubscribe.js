/* @flow */
'use strict';

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import * as BLOCKCHAIN from '../../../constants/blockchain';
import { NO_COIN_INFO } from '../../../constants/errors';

import { create as createBlockbookBackend } from '../../../backend';
import { create as createBlockchainBackend } from '../../../backend/BlockchainLink';
import { getCoinInfoByCurrency, getEthereumNetwork, getMiscNetwork } from '../../../data/CoinInfo';
import { BlockchainMessage } from '../../../message/builder';
import type { CoinInfo, EthereumNetworkInfo, MiscNetworkInfo } from 'flowtype';
import type { CoreMessage } from '../../../types';

type Params = {
    accounts: Array<string>,
    useBlockchainLink: boolean,
    coinInfo: CoinInfo | EthereumNetworkInfo | MiscNetworkInfo,
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

        let useBlockchainLink = false;
        let coinInfo: ?(CoinInfo | EthereumNetworkInfo | MiscNetworkInfo) = getCoinInfoByCurrency(payload.coin);
        if (!coinInfo) {
            coinInfo = getEthereumNetwork(payload.coin);
        }
        if (!coinInfo) {
            coinInfo = getMiscNetwork(payload.coin);
            useBlockchainLink = true;
        }

        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            accounts: payload.accounts,
            coinInfo,
            useBlockchainLink,
        };
    }

    async run(): Promise<{ subscribed: true }> {
        if (this.params.useBlockchainLink) {
            return await this.subscribeBlockchainLink();
        } else {
            return await this.subscribeHDWallet();
        }
    }

    async subscribeBlockchainLink(): Promise<{ subscribed: true }> {
        const backend = await createBlockchainBackend(this.params.coinInfo);

        backend.subscribe(
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

    async subscribeHDWallet(): Promise<{ subscribed: true }> {
        // initialize backend
        const backend = await createBlockbookBackend(this.params.coinInfo);

        backend.subscribe(
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
