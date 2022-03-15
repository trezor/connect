/* @flow */

import { getCoinInfo } from '@trezor/connect-common';
import type { CoinInfo } from '@trezor/connect-common';
import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { ERRORS } from '../../../constants';

import { isBackendSupported, initBlockchain } from '../../../backend/BlockchainLink';

type Params = {
    currency?: string,
    coinInfo: CoinInfo,
};

export default class BlockchainSubscribeFiatRates extends AbstractMethod<'blockchainSubscribeFiatRates'> {
    params: Params;

    init() {
        this.useDevice = false;
        this.useUi = false;

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'currency', type: 'string', required: false },
            { name: 'coin', type: 'string', required: true },
        ]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }
        // validate backend
        isBackendSupported(coinInfo);

        this.params = {
            currency: payload.currency,
            coinInfo,
        };
    }

    async run() {
        const backend = await initBlockchain(this.params.coinInfo, this.postMessage);
        return backend.subscribeFiatRates(this.params.currency);
    }
}
