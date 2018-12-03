/* @flow */
'use strict';

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO } from '../../../constants/errors';

import { create as createBlockchainBackend } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../../types';

type Params = {
    address: string,
    coinInfo: CoinInfo,
}

export default class BlockchainGetAccountSequence extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'address', type: 'string', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        const coinInfo: ?CoinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            address: payload.address,
            coinInfo,
        };
    }

    async run(): Promise<number> {
        const backend = await createBlockchainBackend(this.params.coinInfo, this.postMessage);
        return await backend.getAccountSequence(this.params.address);
    }
}
