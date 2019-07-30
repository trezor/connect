/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO, backendNotSupported } from '../../../constants/errors';

import { initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../../types';
import type { SubscriptionAccountInfo } from '../../../types/params';

type Params = {
    accounts: SubscriptionAccountInfo[],
    coinInfo: CoinInfo,
}

export default class BlockchainSubscribe extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'accounts', type: 'array', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        payload.accounts.forEach(account => {
            validateParams(account, [
                { name: 'descriptor', type: 'string', obligatory: true },
            ]);
        });

        const coinInfo: ?CoinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }
        if (!coinInfo.blockchainLink) {
            throw backendNotSupported(coinInfo.name);
        }

        this.params = {
            accounts: payload.accounts,
            coinInfo,
        };
    }

    async run(): Promise<{ subscribed: boolean }> {
        const backend = await initBlockchain(this.params.coinInfo, this.postMessage);
        return backend.subscribe(this.params.accounts);
    }
}
