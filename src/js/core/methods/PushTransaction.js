/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { getCoinInfo } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';
import { create as createBackend } from '../../backend';

import type { CoreMessage, CoinInfo } from '../../types';

type Params = {
    tx: string,
    coinInfo: CoinInfo,
}

export default class PushTransaction extends AbstractMethod {
    params: Params;

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

        const coinInfo: ?CoinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        if (coinInfo.type === 'bitcoin' && !/^[0-9A-Fa-f]*$/.test(payload.tx)) {
            throw new Error('Invalid params: Transaction must be hexadecimal');
        }

        this.params = {
            tx: payload.tx,
            coinInfo,
        };
    }

    async run(): Promise<{ txid: string }> {
        const { coinInfo } = this.params;
        if (coinInfo.type === 'misc') throw new Error('Invalid CoinInfo object');
        // initialize backend
        const backend = await createBackend(coinInfo);
        const txid: string = await backend.sendTransactionHex(this.params.tx);
        return {
            txid,
        };
    }
}
