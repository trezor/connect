/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO, backendNotSupported } from '../../../constants/errors';

import { initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo, BlockchainSubscribeAccount } from '../../../types';

type Params = {
    accounts?: BlockchainSubscribeAccount[];
    coinInfo: CoinInfo;
}

export default class BlockchainUnsubscribe extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'accounts', type: 'array' },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        if (payload.accounts) {
            payload.accounts.forEach(account => {
                validateParams(account, [
                    { name: 'descriptor', type: 'string', obligatory: true },
                ]);
            });
        }

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

    async run(): Promise<any> {
        const backend = await initBlockchain(this.params.coinInfo, this.postMessage);
        return backend.unsubscribe(this.params.accounts);
    }
}
