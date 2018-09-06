/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/tezosSignTx';

import type { TezosTransaction, TezosSignedTx } from '../../types/trezor';
import type { TezosCurve, TezosOperation, $TezosSignTransaction } from '../../types/tezos';
import type { CoreMessage } from '../../types';

export default class TezosSignTransaction extends AbstractMethod {
    message: $TezosSignTransaction // change type

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['0', '2.0.8'];
        this.info = 'Sign Tezos transaction';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'curve', obligatory: true },
            { name: 'branch', obligatory: true },
            { name: 'operation', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        const curve: TezosCurve = payload.curve;
        const branch: Array<number> = payload.branch;
        const operation: TezosOperation = payload.operation;

        this.message = helper.createTx(path, curve, branch, operation);

        //console.warn('[TezosSignTransaction][constructor]', message)
    }

    async run(): Promise<TezosSignedTx> {

        //console.warn('[y][TezosSignTransaction] run request ', this.message)

        const response: TezosSignedTx = await this.device.getCommands().tezosSignTransaction(
            this.message,
        );
        //console.warn('[y][TezosSignTransaction] run response ', response)

        return {
            signature: response.signature,
            sig_op_contents: response.sig_op_contents,
            operation_hash: response.operation_hash,
        }

    }
}