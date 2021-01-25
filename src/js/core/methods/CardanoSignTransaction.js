/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import { addressParametersToProto, validateAddressParameters } from './helpers/cardanoAddressParameters';
import { validateTokenBundle, tokenBundleToProto } from './helpers/cardanoTokens';

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
    ttl?: string;
    certificates: Array<CardanoTxCertificate>;
    withdrawals: Array<CardanoTxWithdrawal>;
    metadata: string;
    validityIntervalStart?: string;
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
            { name: 'fee', type: 'amount', obligatory: true },
            { name: 'ttl', type: 'string' },
            { name: 'certificates', type: 'array', allowEmpty: true },
            { name: 'withdrawals', type: 'array', allowEmpty: true },
            { name: 'metadata', type: 'string' },
            { name: 'validityIntervalStart', type: 'string' },
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
                { name: 'token_bundle', type: 'array', allowEmpty: true },
            ]);

            const result: CardanoTxOutput = {
                amount: output.amount,
                token_bundle: [],
            };

            if (output.addressParameters) {
                validateAddressParameters(output.addressParameters);
                result.address_parameters = addressParametersToProto(output.addressParameters);
            } else {
                result.address = output.address;
            }

            if (output.tokenBundle) {
                validateTokenBundle(output.tokenBundle);
                result.token_bundle = tokenBundleToProto(output.tokenBundle);
            }

            return result;
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
            validityIntervalStart: payload.validityIntervalStart,
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
            this.params.validityIntervalStart,
            this.params.protocolMagic,
            this.params.networkId,
        );

        return {
            hash: response.tx_hash,
            serializedTx: response.serialized_tx,
        };
    }
}
