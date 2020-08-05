/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import { addressParametersToProto, validateAddressParameters } from './helpers/cardanoAddressParameters';

import type {
    CardanoTxCertificate,
    CardanoTxInput,
    CardanoTxOutput,
    CardanoTxWithdrawal,
} from '../../types/trezor/protobuf';
import type { CardanoSignedTx as CardanoSignedTxResponse } from '../../types/networks/cardano';
import type { CoreMessage } from '../../types';

type Params = {
    inputs: Array<CardanoTxInput>;
    outputs: Array<CardanoTxOutput>;
    fee: string;
    ttl: string;
    certificates: Array<CardanoTxCertificate>;
    withdrawals: Array<CardanoTxWithdrawal>;
    metadata: string;
    protocolMagic: number;
    networkId: number;
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
            { name: 'fee', type: 'string', obligatory: true },
            { name: 'ttl', type: 'string', obligatory: true },
            { name: 'certificates', type: 'array', allowEmpty: true },
            { name: 'withdrawals', type: 'array', allowEmpty: true },
            { name: 'metadata', type: 'string' },
            { name: 'protocolMagic', type: 'number', obligatory: true },
            { name: 'networkId', type: 'number', obligatory: true },
        ]);

        const inputs: Array<CardanoTxInput> = payload.inputs.map(input => {
            validateParams(input, [
                { name: 'path', obligatory: true },
                { name: 'prev_hash', type: 'string', obligatory: true },
                { name: 'prev_index', type: 'number', obligatory: true },
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

            if (output.addressParameters) {
                validateAddressParameters(output.addressParameters);
                return {
                    address_parameters: addressParametersToProto(output.addressParameters),
                    amount: output.amount,
                };
            } else {
                return {
                    address: output.address,
                    amount: output.amount,
                };
            }
        });

        let certificates: Array<CardanoTxCertificate> = [];
        if (payload.certificates) {
            certificates = payload.certificates.map(certificate => {
                validateParams(certificate, [
                    { name: 'type', type: 'number', obligatory: true },
                    { name: 'path', obligatory: true },
                    { name: 'pool', type: 'string' },
                ]);
                return {
                    type: certificate.type,
                    path: validatePath(certificate.path, 5),
                    pool: certificate.pool,
                };
            });
        }

        let withdrawals: Array<CardanoTxWithdrawal> = [];
        if (payload.withdrawals) {
            withdrawals = payload.withdrawals.map(withdrawal => {
                validateParams(withdrawal, [
                    { name: 'path', obligatory: true },
                    { name: 'amount', type: 'amount', obligatory: true },
                ]);
                return {
                    path: validatePath(withdrawal.path, 5),
                    amount: withdrawal.amount,
                };
            });
        }

        this.params = {
            inputs,
            outputs,
            fee: payload.fee,
            ttl: payload.ttl,
            certificates,
            withdrawals,
            metadata: payload.metadata,
            protocolMagic: payload.protocolMagic,
            networkId: payload.networkId,
        };
    }

    async run(): Promise<CardanoSignedTxResponse> {
        const response = await this.device.getCommands().cardanoSignTx(
            this.params.inputs,
            this.params.outputs,
            this.params.fee,
            this.params.ttl,
            this.params.certificates,
            this.params.withdrawals,
            this.params.metadata,
            this.params.protocolMagic,
            this.params.networkId,
        );

        return {
            hash: response.tx_hash,
            serializedTx: response.serialized_tx,
        };
    }
}
