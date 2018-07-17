/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/nemSignTx';

import type { NEMSignTxMessage, NEMSignedTx } from '../../types/trezor';
import type { Transaction as $NEMTransaction } from '../../types/nem';
import type { CoreMessage } from '../../types';

export default class NEMSignTransaction extends AbstractMethod {

    message: NEMSignTxMessage;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.info = 'Sign NEM transaction';

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

        // incoming data are in nem-sdk format
        const transaction: $NEMTransaction = payload.transaction;
        this.message = helper.createTx(transaction, payload.path);
    }

    async run(): Promise<NEMSignedTx> {
        const response = await this.device.getCommands().nemSignTx(this.message);
        return response.message;
    }
}
