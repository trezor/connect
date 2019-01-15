/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import type { HyconSignedTx } from '../../types/trezor';
import type { Transaction as $HyconTransaction, HyconSignedTx as HyconSignedTxResponse } from '../../types/hycon';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>,
    transaction: $HyconTransaction,
}

export default class HyconSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['0', '2.0.8'];
        this.info = 'Sign Hycon transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 5);
        const transaction: $HyconTransaction = payload.transaction;

        validateParams(transaction, [
            { name: 'fee', type: 'string' },
            { name: 'amount', type: 'string' },
            { name: 'to', type: 'string' },
            { name: 'nonce', type: 'number' }
        ]);

        this.params = {
            path,
            transaction,
        };
    }

    async run(): Promise<HyconSignedTxResponse> {
        const tx: $HyconTransaction = this.params.transaction;
        const response: HyconSignedTx = await this.device.getCommands().hyconSignTx({
            address_n: this.params.path,
            fee: tx.fee,
            amount: tx.amount,
            nonce: tx.nonce,
            to: tx.to,
            
        });

        return {
            signature: response.signature,
            recovery: response.recovery,
            txhash: response.txhash,
        };
    }
}
