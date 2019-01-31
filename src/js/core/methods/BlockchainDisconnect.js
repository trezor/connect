/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import * as BLOCKCHAIN from '../../constants/blockchain';
import { NO_COIN_INFO } from '../../constants/errors';

import BlockBook, { find as findBackend } from '../../backend';
import { getCoinInfo } from '../../data/CoinInfo';
import { BlockchainMessage } from '../../message/builder';
import type { CoreMessage, CoinInfo } from '../../types';

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

        const coinInfo: ?CoinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            coinInfo,
        };
    }

    async run(): Promise<{ disconnected: true }> {
        const { coinInfo } = this.params;
        if (coinInfo.type === 'misc') throw new Error('Invalid CoinInfo object');

        const backend = await findBackend(coinInfo.name);
        if (backend) {
            backend.blockchain.destroy();
            backend._setError(new Error('manual disconnect'));
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                coin: coinInfo,
                error: 'manual disconnect',
            }));
        }

        return {
            disconnected: true,
        };
    }
}
