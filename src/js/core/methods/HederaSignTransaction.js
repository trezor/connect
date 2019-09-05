/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type { CoreMessage } from '../../types';
import type { HederaSignedTx } from '../../types/trezor';

type Params = {
    path: Array<number>,
    transaction: string,
}

export default class HederaSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Hedera'), this.firmwareRange);

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', type: 'string', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);

        this.info = 'Sign Hedera Transaction';

        this.params = {
            path,
            transaction: payload.transaction,
        };
    }

    async run(): Promise<HederaSignedTx> {
        return await this.device.getCommands().hederaSignTx(
            this.params.path,
            this.params.transaction,
        );
    }
}
