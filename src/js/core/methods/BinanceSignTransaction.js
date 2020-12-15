/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/binanceSignTx';

import type { CoreMessage } from '../../types';
import type { BinancePreparedTransaction } from '../../types/networks/binance';

type Params = {
    path: number[];
    transaction: BinancePreparedTransaction;
}

export default class BinanceSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('BNB'), this.firmwareRange);
        this.info = 'Sign Binance transaction';

        const { payload } = message;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', type: 'string', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        const transaction = helper.validate(payload.transaction);

        this.params = {
            path,
            transaction,
        };
    }

    async run() {
        return helper.signTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.transaction,
        );
    }
}
