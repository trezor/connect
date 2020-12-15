/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type { RippleTransaction } from '../../types/networks/ripple';
import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class RippleSignTransaction extends AbstractMethod {
    params: $ElementType<MessageType, 'RippleSignTx'>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Ripple'), this.firmwareRange);
        this.info = 'Sign Ripple transaction';

        const { payload } = message;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 5);
        // incoming data should be in ripple-sdk format
        const transaction: RippleTransaction = payload.transaction;

        validateParams(transaction, [
            { name: 'fee', type: 'string' },
            { name: 'flags', type: 'number' },
            { name: 'sequence', type: 'number' },
            { name: 'maxLedgerVersion', type: 'number' },
            { name: 'payment', type: 'object' },
        ]);

        validateParams(transaction.payment, [
            { name: 'amount', type: 'string', obligatory: true },
            { name: 'destination', type: 'string', obligatory: true },
            { name: 'destinationTag', type: 'number' },
        ]);

        this.params = {
            address_n: path,
            fee: transaction.fee,
            flags: transaction.flags,
            sequence: transaction.sequence,
            last_ledger_sequence: transaction.maxLedgerVersion,
            payment: {
                amount: transaction.payment.amount,
                destination: transaction.payment.destination,
                destination_tag: transaction.payment.destinationTag,
            },
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const { message } = await cmd.typedCall('RippleSignTx', 'RippleSignedTx', this.params);
        return {
            serializedTx: message.serialized_tx,
            signature: message.signature,
        };
    }
}
