/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/tezosSignTx';

import type { TezosSignedTx } from '../../types/trezor';
import type { Transaction as $TezosTransaction, TezosSignedTx as TezosSignedTxResponse } from '../../types/tezos';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>,
    networkPassphrase: string,
    transaction: any,
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
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in stellar-sdk format
        const transaction: $TezosTransaction = payload.transaction;
        this.params = {
            path,
            networkPassphrase: payload.networkPassphrase,
            transaction,
        };
    }

    async run(): Promise<TezosSignedTxResponse> {
        const response: TezosSignedTx = await helper.tezosSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.transaction
        );

        return {
            signatureContents: response.sig_op_contents,
            signature: response.signature,
            hash: response.operation_hash,
        };
    }
}
