/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO, backendNotSupported } from '../../../constants/errors';

import { initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../../types';

type Params = {
    coinInfo: CoinInfo;
    currencies?: string[];
};

export default class BlockchainGetCurrentFiatRates extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'currencies', type: 'array', obligatory: false },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }
        if (!coinInfo.blockchainLink) {
            throw backendNotSupported(coinInfo.name);
        }

        this.params = {
            currencies: payload.currencies,
            coinInfo: coinInfo,
        };
    }

    async run() {
        const backend = await initBlockchain(
            this.params.coinInfo,
            this.postMessage
        );
        return backend.getCurrentFiatRates({ currencies: this.params.currencies });
    }
}
