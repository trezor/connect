/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/cardanoSignTx';

import type { CardanoTxInput, CardanoTxOutput, CardanoSignedTx } from '../../types/trezor';
import type { CardanoSignedTx as CardanoSignedTxResponse } from '../../types/cardano';
import type { CoreMessage } from '../../types';

type Params = {
    inputs: Array<CardanoTxInput>,
    outputs: Array<CardanoTxOutput>,
    transactions: Array<string>,
    protocol_magic: number,
}

export default class CardanoSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Cardano'), this.firmwareRange);
        this.info = 'Sign Cardano transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'inputs', type: 'array', obligatory: true },
            { name: 'outputs', type: 'array', obligatory: true },
            { name: 'transactions', type: 'array', obligatory: true },
            { name: 'protocol_magic', type: 'number', obligatory: true },
        ]);

        const inputs: Array<CardanoTxInput> = payload.inputs.map(input => {
            validateParams(input, [
                { name: 'path', obligatory: true },
                { name: 'prev_hash', type: 'string', obligatory: true },
                { name: 'prev_index', type: 'number', obligatory: true },
                { name: 'type', type: 'number', obligatory: true },
            ]);
            return {
                address_n: validatePath(input.path, 5),
                prev_hash: input.prev_hash,
                prev_index: input.prev_index,
                type: input.type,
            };
        });

        const outputs: Array<CardanoTxOutput> = payload.outputs.map(output => {
            validateParams(output, [
                { name: 'address', type: 'string' },
                { name: 'amount', type: 'amount', obligatory: true },
            ]);

            if (output.path) {
                return {
                    address_n: validatePath(output.path, 5),
                    amount: output.amount,
                };
            } else {
                return {
                    address: output.address,
                    amount: output.amount,
                };
            }
        });

        this.params = {
            inputs,
            outputs,
            transactions: payload.transactions,
            protocol_magic: payload.protocol_magic,
        };
    }

    async run(): Promise<CardanoSignedTxResponse> {
        const response: CardanoSignedTx = await helper.cardanoSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.inputs,
            this.params.outputs,
            this.params.transactions,
            this.params.protocol_magic,
        );

        return {
            hash: response.tx_hash,
            body: response.tx_body,
        };
    }
}
