/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import * as BLOCKCHAIN from '../../constants/blockchain';
import { NO_COIN_INFO } from '../../constants/errors';

import BlockBook, { find as findBackend } from '../../backend';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { BlockchainMessage } from '../../message/builder';
import type { CoinInfo, EthereumNetworkInfo } from 'flowtype';
import type { CoreMessage } from '../../types';

type Params = {
    coinInfo: CoinInfo | EthereumNetworkInfo,
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

        const network: ?EthereumNetworkInfo = getEthereumNetwork(payload.coin);
        if (!network) {
            throw NO_COIN_INFO;
        }

        this.params = {
            coinInfo: network,
        };
    }

    async run(): Promise<{ disconnected: true }> {
        // initialize backend
        const backend = await findBackend(this.params.coinInfo.name);

        if (backend) {
            backend.blockchain.destroy();
            backend._setError(new Error('manual'));
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
