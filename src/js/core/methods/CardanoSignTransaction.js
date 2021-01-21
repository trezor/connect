/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import { addressParametersToProto, validateAddressParameters } from './helpers/cardanoAddressParameters';
import { transformCertificate } from './helpers/cardanoCertificate';
import { validateTokenBundle, tokenBundleToProto } from './helpers/cardanoTokens';

import type {
    MessageType,
    CardanoTxCertificateType,
    CardanoTxInputType,
    CardanoTxOutputType,
    CardanoTxWithdrawalType,
} from '../../types/trezor/protobuf';
import type { CoreMessage } from '../../types';

export default class CardanoSignTransaction extends AbstractMethod {
    params: $ElementType<MessageType, 'CardanoSignTx'>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Cardano'), this.firmwareRange);
        this.info = 'Sign Cardano transaction';

        const { payload } = message;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'inputs', type: 'array', obligatory: true },
            { name: 'outputs', type: 'array', obligatory: true, allowEmpty: true },
            { name: 'fee', type: 'amount', obligatory: true },
            { name: 'ttl', type: 'string' },
            { name: 'certificates', type: 'array', allowEmpty: true },
            { name: 'withdrawals', type: 'array', allowEmpty: true },
            { name: 'metadata', type: 'string' },
            { name: 'validityIntervalStart', type: 'string' },
            { name: 'protocolMagic', type: 'number', obligatory: true },
            { name: 'networkId', type: 'number', obligatory: true },
        ]);

        const inputs: CardanoTxInputType[] = payload.inputs.map(input => {
            validateParams(input, [
                { name: 'prev_hash', type: 'string', obligatory: true },
                { name: 'prev_index', type: 'number', obligatory: true },
            ]);
            return {
                address_n: input.path ? validatePath(input.path, 5) : undefined,
                prev_hash: input.prev_hash,
                prev_index: input.prev_index,
                type: input.type,
            };
        });

        const outputs: CardanoTxOutputType[] = payload.outputs.map(output => {
            validateParams(output, [
                { name: 'address', type: 'string' },
                { name: 'amount', type: 'amount', obligatory: true },
                { name: 'token_bundle', type: 'array', allowEmpty: true },
            ]);

            const result: CardanoTxOutputType = {
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

        let certificates: CardanoTxCertificateType[] = [];
        if (payload.certificates) {
            certificates = payload.certificates.map(transformCertificate);
        }

        let withdrawals: CardanoTxWithdrawalType[] = [];
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
            validity_interval_start: payload.validityIntervalStart,
            protocol_magic: payload.protocolMagic,
            network_id: payload.networkId,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const { message } = await cmd.typedCall('CardanoSignTx', 'CardanoSignedTx', this.params);
        return {
            hash: message.tx_hash,
            serializedTx: message.serialized_tx,
        };
    }
}
