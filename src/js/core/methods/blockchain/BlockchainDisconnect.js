/* @flow */
'use strict';

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import * as BLOCKCHAIN from '../../../constants/blockchain';
import { NO_COIN_INFO } from '../../../constants/errors';

import BlockBook, { find as findBackend } from '../../../backend';
import { getCoinInfo } from '../../../data/CoinInfo';
import { BlockchainMessage } from '../../../message/builder';
import type { CoreMessage, CoinInfo } from '../../../types';

type Params = {
    coinInfo: CoinInfo,
}

export default class BlockchainDisconnect extends AbstractMethod {
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
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        let coinInfo: ?CoinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            coinInfo = getCoinInfo(payload.coin);
        }

        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            coinInfo,
        };
    }

    async run(): Promise<{ disconnected: true }> {
        const backend = await findBackend(this.params.coinInfo.name);

        if (backend) {
            backend.blockchain.destroy();
            backend._setError(new Error('manual disconnect'));
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                coin: this.params.coinInfo,
                error: 'manual disconnect',
            }));
        }

        return {
            disconnected: true,
        };
    }
}
