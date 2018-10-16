/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { getCoinInfoByCurrency, getEthereumNetwork } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';
import BlockBook, { create as createBackend } from '../../backend';

import type { CoreMessage } from '../../types';
import type { CoinInfo, EthereumNetworkInfo } from 'flowtype';

type Params = {
    tx: string,
    coinInfo: CoinInfo | EthereumNetworkInfo,
}

export default class PushTransaction extends AbstractMethod {
    params: Params;
    backend: BlockBook;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.useUi = false;
        this.useDevice = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'tx', type: 'string', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        let coinInfo: ?(CoinInfo | EthereumNetworkInfo) = getCoinInfoByCurrency(payload.coin);
        if (!coinInfo) {
            coinInfo = getEthereumNetwork(payload.coin);
        } else {
            // btc-like tx
            if (!(/^[0-9A-Fa-f]*$/.test(payload.tx))) {
                throw new Error('Transaction must be hexadecimal');
            }
        }
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            tx: payload.tx,
            coinInfo,
        };
    }

    async run(): Promise<{ txid: string }> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);
        const txid: string = await this.backend.sendTransactionHex(this.params.tx);
        return {
            txid,
        };
    }
}
