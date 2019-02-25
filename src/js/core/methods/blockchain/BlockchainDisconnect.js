/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import * as BLOCKCHAIN from '../../../constants/blockchain';
import { NO_COIN_INFO } from '../../../constants/errors';

import { find as findBlockbookBackend } from '../../../backend';
import { find as findBlockchainBackend } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import { BlockchainMessage } from '../../../message/builder';
import type { CoreMessage, CoinInfo } from '../../../types';

type Params = {
    coinInfo: CoinInfo,
}

export default class BlockchainDisconnect extends AbstractMethod {
    params: Params;

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
        if (this.params.coinInfo.type === 'misc') {
            return await this.disconnectBlockchain();
        } else {
            return await this.disconnectBlockbook();
        }
    }

    async disconnectBlockchain() {
        const backend = await findBlockchainBackend(this.params.coinInfo.name);
        if (backend) {
            backend.disconnect();
        }

        return {
            disconnected: true,
        };
    }

    async disconnectBlockbook() {
        const backend = await findBlockbookBackend(this.params.coinInfo.name);

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
