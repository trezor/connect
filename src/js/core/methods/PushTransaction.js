/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { getCoinInfo } from '../../data/CoinInfo';
import { ERRORS } from '../../constants';
import { isBackendSupported, initBlockchain } from '../../backend/BlockchainLink';

import type { CoinInfo } from '../../types';

type Params = {
    tx: string,
    coinInfo: CoinInfo,
};

export default class PushTransaction extends AbstractMethod<'pushTransaction'> {
    params: Params;

    init() {
        this.requiredPermissions = [];
        this.useUi = false;
        this.useDevice = false;

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'tx', type: 'string', required: true },
            { name: 'coin', type: 'string', required: true },
        ]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }
        // validate backend
        isBackendSupported(coinInfo);

        if (coinInfo.type === 'bitcoin' && !/^[0-9A-Fa-f]*$/.test(payload.tx)) {
            throw ERRORS.TypedError('Method_InvalidParameter', 'Transaction must be hexadecimal');
        }

        this.params = {
            tx: payload.tx,
            coinInfo,
        };
    }

    async run() {
        const backend = await initBlockchain(this.params.coinInfo, this.postMessage);
        const txid = await backend.pushTransaction(this.params.tx);
        return {
            txid,
        };
    }
}
