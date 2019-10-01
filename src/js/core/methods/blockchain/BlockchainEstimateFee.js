/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { NO_COIN_INFO, backendNotSupported } from '../../../constants/errors';
import Fees from '../tx/Fees';
import { initBlockchain } from '../../../backend/BlockchainLink';
import { getCoinInfo } from '../../../data/CoinInfo';
import type { CoreMessage, CoinInfo } from '../../../types';
import type { $BlockchainEstimateFee } from '../../../types/params';
import type { BlockchainEstimateFee$ } from '../../../types/response';

type Request = $ElementType<$BlockchainEstimateFee, 'request'>;
type Response = $ElementType<BlockchainEstimateFee$, 'payload'>

type Params = {
    coinInfo: CoinInfo,
    request: Request,
};

export default class BlockchainEstimateFee extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = false;
        this.useUi = false;

        const payload: $BlockchainEstimateFee = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'request', type: 'object' },
        ]);

        const request: Request = payload.request;

        if (request) {
            validateParams(request, [
                { name: 'blocks', type: 'array' },
                { name: 'specific', type: 'object' },
                { name: 'feeLevels', type: 'string' },
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

    async run(): Promise<Response> {
        const { coinInfo, request } = this.params;
        const feeInfo = {
            blockTime: coinInfo.blocktime,
            minFee: coinInfo.minFee,
            maxFee: coinInfo.maxFee,
            levels: [],
        };
        if (request && request.feeLevels) {
            const fees = new Fees(coinInfo);
            if (request.feeLevels === 'smart') {
                const backend = await initBlockchain(coinInfo, this.postMessage);
                await fees.load(backend);
            }
            feeInfo.levels = fees.levels;
        } else {
            const backend = await initBlockchain(coinInfo, this.postMessage);
            feeInfo.levels = await backend.estimateFee(request || {});
        }

        return feeInfo;
    }
}
