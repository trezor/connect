/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/eosSignTx';

import type { EosSignedTx } from '../../types/trezor';
import type { Transaction as $EosTransaction, EosSignedTx as EosSignedTxResponse } from '../../types/eos';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>,
    transaction: any,
}

export default class EosSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['1.7.0', '2.0.8'];
        this.info = 'Sign EOS transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in stellar-sdk format
        const transaction: $EosTransaction = payload.transaction;
        this.params = {
            path,
            transaction,
        };
    }

    async run(): Promise<EosSignedTxResponse> {
        const response: EosSignedTx = await helper.eosSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.transaction
        );

        return {
            signatureV: response.signature_v,
            signatureR: response.signature_r,
            signatureS: response.signature_s,
        };
    }
}
