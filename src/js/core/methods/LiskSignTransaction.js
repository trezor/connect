/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import { prepareTx } from './helpers/liskSignTx';

import type { CoreMessage } from '../../types';
import type { LiskTransaction, LiskSignedTx } from '../../types/trezor/protobuf';
import type { LiskTransaction as LiskParsedTransaction } from '../../types/networks/lisk';

type Params = {
    path: Array<number>;
    transaction: LiskTransaction;
}

export default class LiskSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Lisk'), this.firmwareRange);

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);

        this.info = 'Sign Lisk transaction';

        const tx: LiskParsedTransaction = payload.transaction;
        validateParams(tx, [
            { name: 'type', type: 'number', obligatory: true },
            { name: 'fee', type: 'string', obligatory: true },
            { name: 'amount', type: 'amount', obligatory: true },
            { name: 'timestamp', type: 'number', obligatory: true },
            { name: 'recipientId', type: 'string' },
            { name: 'signature', type: 'string' },
            { name: 'asset', type: 'object' },
        ]);

        const transaction: LiskTransaction = prepareTx(tx);
        if (!transaction.asset) transaction.asset = {};
        this.params = {
            path,
            transaction,
        };
    }

    async run(): Promise<LiskSignedTx> {
        return await this.device.getCommands().liskSignTx(
            this.params.path,
            this.params.transaction,
        );
    }
}
