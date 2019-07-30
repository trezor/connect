/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO, backendNotSupported } from '../../../constants/errors';

import { find as findBlockchainBackend } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
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
        if (!coinInfo.blockchainLink) {
            throw backendNotSupported(coinInfo.name);
        }

        this.params = {
            coinInfo,
        };
    }

    async run(): Promise<{ disconnected: true }> {
        const backend = await findBlockchainBackend(this.params.coinInfo.name);
        if (backend) {
            backend.disconnect();
        }

        return {
            disconnected: true,
        };
    }
}
