/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/stellarSignTx';

import type { NEMSignTxMessage, NEMSignedTx } from '../../types/trezor';
import type { Transaction as $NEMTransaction } from '../../types/nem';
import type { CoreMessage } from '../../types';


type Params = {
    path: Array<number>;
    transaction: any;
}

export default class StellarSignTransaction extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.info = 'Sign Stellar transaction';

        const payload: any = message.payload;
        // common fields validation
        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path, 3);
        }

        if (!payload.hasOwnProperty('transaction')) {
            throw new Error('Parameter "transaction" is missing');
        }

        this.params = {
            path: payload.path,
            transaction: payload.transaction,
        }

        // incoming data are in nem-sdk format
        // const transaction: $NEMTransaction = payload.transaction;
        // this.message = helper.createTx(transaction, payload.path);
    }

    async run(): Promise<NEMSignedTx> {
        const tx = this.params.transaction;
        return await helper.stellarSignTx(
            this.device.getCommands().typedCall.bind( this.device.getCommands() ),
            this.params.path,
            this.params.transaction
        );
    }
}
