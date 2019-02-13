/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
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
        this.firmwareRange['1'].min = '1.6.2';
        this.firmwareRange['2'].min = '2.0.7';
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Sign NEM transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in nem-sdk format
        const transaction: $NEMTransaction = payload.transaction;
        this.message = helper.createTx(transaction, path);
    }

    async run(): Promise<NEMSignedTx> {
        return await this.device.getCommands().nemSignTx(this.message);
    }
}
