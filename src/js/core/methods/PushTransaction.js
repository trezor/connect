/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { getCoinInfoByCurrency } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';
import BlockBook, { create as createBackend } from '../../backend';

import type { CoreMessage, PushTransaction$ } from '../../types';
import type { CoinInfo } from 'flowtype';

type Params = {
    tx: string,
    coinInfo: CoinInfo,
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

        if (!(/^[0-9A-Fa-f]*$/.test(payload.tx))) {
            throw new Error('Transaction must be hexadecimal');
        }

        const coinInfo: ?CoinInfo = getCoinInfoByCurrency(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            tx: payload.tx,
            coinInfo,
        };
    }

    async run(): Promise<PushTransaction$> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);
        const txid: string = await this.backend.sendTransactionHex(this.params.tx);
        return {
            txid,
        };
    }
}
