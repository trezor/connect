/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { ERRORS } from '../../../constants';

import { isBackendSupported, initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoinInfo } from '../../../types';

type Params = {
    coinInfo: CoinInfo,
};

export default class BlockchainUnsubscribeFiatRates extends AbstractMethod<'blockchainUnsubscribeFiatRates'> {
    params: Params;

    init() {
        this.useDevice = false;
        this.useUi = false;

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [{ name: 'coin', type: 'string', required: true }]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }
        // validate backend
        isBackendSupported(coinInfo);

        this.params = {
            coinInfo,
        };
    }

    async run() {
        const backend = await initBlockchain(this.params.coinInfo, this.postMessage);
        return backend.unsubscribeFiatRates();
    }
}
