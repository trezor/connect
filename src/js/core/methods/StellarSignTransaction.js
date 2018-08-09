/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/stellarSignTx';

import type { StellarSignedTx } from '../../types/trezor';
import type { Transaction as $StellarTransaction } from '../../types/stellar';
import type { CoreMessage } from '../../types';
import type { StellarSignTransaction$ } from '../../types/response';

type Params = {
    path: Array<number>,
    ledgerVersion: number,
    networkPassphrase: string,
    transaction: any,
}

export default class StellarSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.info = 'Sign Stellar transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'ledgerVersion', type: 'number', obligatory: true },
            { name: 'networkPassphrase', type: 'string', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in stellar-sdk format
        const transaction: $StellarTransaction = payload.transaction;
        this.params = {
            path,
            ledgerVersion: payload.ledgerVersion,
            networkPassphrase: payload.networkPassphrase,
            transaction,
        };
    }

    async run(): Promise<$PropertyType<StellarSignTransaction$, 'payload'>> {
        const response: StellarSignedTx = await helper.stellarSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.ledgerVersion,
            this.params.networkPassphrase,
            this.params.transaction
        );

        return {
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
