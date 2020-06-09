/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { ERRORS } from '../../../constants';

import { find as findBackend, remove as removeBackend, setCustomBackend, initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../../types';

type Params = {
    coinInfo: CoinInfo;
}

export default class BlockchainSetCustomBackend extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.info = '';
        this.useDevice = false;
        this.useUi = false;

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'blockchainLink', type: 'object' },
        ]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }

        setCustomBackend(coinInfo, payload.blockchainLink);

        this.params = {
            coinInfo,
        };
    }

    async run() {
        const current = await findBackend(this.params.coinInfo.name);
        if (current) {
            await current.disconnect();
            removeBackend(current);

            await initBlockchain(this.params.coinInfo, this.postMessage);
        }

        return true;
    }
}
