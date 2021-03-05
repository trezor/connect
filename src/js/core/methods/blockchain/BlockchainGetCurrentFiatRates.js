/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { ERRORS } from '../../../constants';

import { isBackendSupported, initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../../types';

type Params = {
    coinInfo: CoinInfo,
    currencies?: string[],
};

export default class BlockchainGetCurrentFiatRates extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = false;
        this.useUi = false;

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'currencies', type: 'array', obligatory: false },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }
        // validate backend
        isBackendSupported(coinInfo);

        this.params = {
            currencies: payload.currencies,
            coinInfo,
        };
    }

    async run() {
        const backend = await initBlockchain(this.params.coinInfo, this.postMessage);
        return backend.getCurrentFiatRates({ currencies: this.params.currencies });
    }
}
