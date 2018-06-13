/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';

import type { NEMSignTxMessage, NEMSignedTx } from 'flowtype/trezor';
import type { Transaction as $NEMTransaction } from 'flowtype/NEM';
import type { CoreMessage } from 'flowtype';

export default class NEMSignTransaction extends AbstractMethod {

    message: NEMSignTxMessage;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = '1.6.0';
        this.useDevice = true;
        this.useUi = true;
        this.info = 'Sign Stellar transaction';

        const payload: any = message.payload;
        // common fields validation
        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path);
        }

        if (!payload.hasOwnProperty('transaction')) {
            throw new Error('Parameter "transaction" is missing');
        }

        // incoming data are in nem-sdk format
        // const transaction: $NEMTransaction = payload.transaction;
        // this.message = helper.createTx(transaction, payload.path);
    }

    async run(): Promise<NEMSignedTx> {
        const response = await this.device.getCommands().nemSignTx(this.message);
        return response.message;
    }
}
