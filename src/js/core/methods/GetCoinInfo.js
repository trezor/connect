/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { ERRORS } from '../../constants';

import { getCoinInfo } from '../../data/CoinInfo';
import type { CoinInfo } from '../../types';

type Params = {
    coinInfo: CoinInfo,
};

export default class GetCoinInfo extends AbstractMethod<'getCoinInfo'> {
    params: Params;

    init() {
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;

        const { payload } = this;

        validateParams(payload, [{ name: 'coin', type: 'string', required: true }]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }

        this.params = {
            coinInfo,
        };
    }

    run() {
        return Promise.resolve(this.params.coinInfo);
    }
}
