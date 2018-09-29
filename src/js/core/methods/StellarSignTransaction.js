/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/stellarSignTx';

import type { StellarSignedTx } from '../../types/trezor';
import type { Transaction as $StellarTransaction, StellarSignedTx as StellarSignedTxResponse } from '../../types/stellar';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>,
    networkPassphrase: string,
    transaction: any,
}

export default class StellarSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['1.7.0', '2.0.8'];
        this.info = 'Sign Stellar transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'networkPassphrase', type: 'string', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in stellar-sdk format
        const transaction: $StellarTransaction = payload.transaction;
        this.params = {
            path,
            networkPassphrase: payload.networkPassphrase,
            transaction,
        };
    }

    async run(): Promise<StellarSignedTxResponse> {
        const response: StellarSignedTx = await helper.stellarSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.networkPassphrase,
            this.params.transaction
        );

        return {
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
