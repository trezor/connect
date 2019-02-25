/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO } from '../../../constants/errors';

import { create as createBlockchainBackend } from '../../../backend/BlockchainLink';
import { getMiscNetwork } from '../../../data/CoinInfo';
import type { CoreMessage, MiscNetworkInfo } from '../../../types';

type Params = {
    coinInfo: MiscNetworkInfo,
};

export default class BlockchainEstimateFee extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        const coinInfo: ?MiscNetworkInfo = getMiscNetwork(payload.coin);

        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        this.params = {
            coinInfo,
        };
    }

    async run(): Promise<Array<{ name: string, value: string }>> {
        const backend = await createBlockchainBackend(this.params.coinInfo, this.postMessage);
        return await backend.estimateFee();
    }
}
