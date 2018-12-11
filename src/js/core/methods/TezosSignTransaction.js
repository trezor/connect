/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/tezosSignTx';

import type { TezosOperation } from '../../types/tezos';
import type { TezosTransaction, TezosSignedTx } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    transaction: TezosTransaction,
}

export default class TezosSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['0', '2.0.8'];
        this.info = 'Sign Tezos transaction';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'branch', type: 'string', obligatory: true },
            { name: 'operation', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        const branch: string = payload.branch;
        const operation: TezosOperation = payload.operation;
        const transaction = helper.createTx(path, branch, operation);

        this.params = {
            transaction,
        };
    }

    async run(): Promise<TezosSignedTx> {
        return await this.device.getCommands().tezosSignTransaction(
            this.params.transaction,
        );
    }
}
