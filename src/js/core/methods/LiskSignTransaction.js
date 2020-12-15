/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import { prepareTx } from './helpers/liskSignTx';

import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class LiskSignTransaction extends AbstractMethod {
    params: $ElementType<MessageType, 'LiskSignTx'>;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Lisk'), this.firmwareRange);

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);

        this.info = 'Sign Lisk transaction';

        const tx = payload.transaction;
        validateParams(tx, [
            { name: 'type', type: 'number', obligatory: true },
            { name: 'fee', type: 'string', obligatory: true },
            { name: 'amount', type: 'amount', obligatory: true },
            { name: 'timestamp', type: 'number', obligatory: true },
            { name: 'recipientId', type: 'string' },
            { name: 'signature', type: 'string' },
            { name: 'asset', type: 'object' },
        ]);

        const transaction = prepareTx(tx);
        if (!transaction.asset) transaction.asset = {};
        this.params = {
            address_n: path,
            transaction,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('LiskSignTx', 'LiskSignedTx', this.params);
        return response.message;
    }
}
