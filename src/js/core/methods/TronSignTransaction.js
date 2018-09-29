/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import {validateParams} from './helpers/paramsValidator';
import {validatePath} from '../../utils/pathUtils';

import type { Transaction as TronTransaction } from '../../types/tron';

import type {CoreMessage} from '../../types';

type Params = {
    path: Array<number>,
    transaction: TronTransaction,
}

export default class TronSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['1.6.2', '2.0.7'];
        this.info = 'Sign Tron transaction';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);

        this.params = {
            path,
            transaction: payload.transaction,
        };
    }

    async run() {
        let tx = this.params.transaction;

        tx = {
            transaction: tx,
        };
        return await await this.device.getCommands().tronSignTx(
            this.params.path,
            tx,
            true,
        );
    }
}
