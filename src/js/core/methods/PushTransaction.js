/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { getCoinInfo } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';
import { create as createBlockbookBackend } from '../../backend';
import { create as createBlockchainBackend } from '../../backend/BlockchainLink';

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
        if (this.params.coinInfo.type === 'misc') {
            return await this.pushBlockchain();
        } else {
            return await this.pushBlockbook();
        }
    }

    async pushBlockchain(): Promise<{ txid: string }> {
        const backend = await createBlockchainBackend(this.params.coinInfo, this.postMessage);
        const txid: string = await backend.pushTransaction(this.params.tx);
        return {
            txid,
        };
    }

    async pushBlockbook(): Promise<{ txid: string }> {
        const { coinInfo } = this.params;
        if (coinInfo.type === 'misc') throw new Error('Invalid CoinInfo object');

        const backend = await createBlockbookBackend(coinInfo);
        const txid: string = await backend.sendTransactionHex(this.params.tx);
        return {
            txid,
        };
    }
}
