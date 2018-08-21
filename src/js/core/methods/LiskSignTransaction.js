/* @flow */

'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { prepareTx } from './helpers/liskSignTx';

import type { CoreMessage } from '../../types';
import type { LiskTransaction, LiskSignedTx } from '../../types/trezor';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { Transaction as RawTransaction } from '../../types/lisk';

type Params = {
    path: Array<number>,
    transaction: LiskTransaction,
}

export default class LiskSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['0', '2.0.8'];

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);

        this.info = 'Sign Lisk transaction';

        const tx: RawTransaction = payload.transaction;
        validateParams(tx, [
            { name: 'type', type: 'number', obligatory: true },
            { name: 'fee', type: 'string', obligatory: true },
            { name: 'amount', type: 'string', obligatory: true },
            { name: 'timestamp', type: 'number', obligatory: true },
            { name: 'recipientId', type: 'string' },
            { name: 'signature', type: 'string' },
            { name: 'asset', type: 'object' },
        ]);

        const transaction: LiskTransaction = prepareTx(tx);

        this.params = {
            path,
            transaction,
        };
    }

    async run(): Promise<LiskSignedTx> {
        const response: MessageResponse<LiskSignedTx> = await this.device.getCommands().typedCall('LiskSignTx', 'LiskSignedTx', {
            address_n: this.params.path,
            transaction: this.params.transaction,
        });
        return response.message;
    }
}
