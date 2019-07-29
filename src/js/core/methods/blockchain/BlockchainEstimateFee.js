/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO, backendNotSupported } from '../../../constants/errors';

import { initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../../types';
import type { $BlockchainEstimateFee } from '../../../types/params';
import type { BlockchainEstimateFee$ } from '../../../types/response';

type Params = {
    coinInfo: CoinInfo,
    request: $ElementType<$BlockchainEstimateFee, 'request'>,
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
            { name: 'request', type: 'object' },
        ]);

        const request: $ElementType<$BlockchainEstimateFee, 'request'> = payload.request;

        if (request) {
            validateParams(request, [
                { name: 'blocks', type: 'array' },
                { name: 'specific', type: 'object' },
            ]);
            if (request.specific) {
                validateParams(request.specific, [
                    { name: 'conservative', type: 'boolean' },
                    { name: 'data', type: 'string' },
                    { name: 'from', type: 'string' },
                    { name: 'to', type: 'string' },
                    { name: 'txsize', type: 'number' },
                ]);
            }
        }
        const coinInfo: ?CoinInfo = getCoinInfo(payload.coin);

        if (!coinInfo) {
            throw NO_COIN_INFO;
        }
        if (!coinInfo.blockchainLink) {
            throw backendNotSupported(coinInfo.name);
        }

        this.params = {
            coinInfo,
            request,
        };
    }

    async run(): Promise<$ElementType<BlockchainEstimateFee$, 'payload'>> {
        const { coinInfo, request } = this.params;
        const backend = await initBlockchain(coinInfo, this.postMessage);
        return await backend.estimateFee(request || {});
    }
}
