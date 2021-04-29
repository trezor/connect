/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import {
    addressParametersToProto,
    validateAddressParameters,
} from './helpers/cardanoAddressParameters';
import { transformAuxiliaryData } from './helpers/cardanoAuxiliaryData';
import { transformCertificate } from './helpers/cardanoCertificate';
import { validateTokenBundle, tokenBundleToProto } from './helpers/cardanoTokens';
import { ERRORS } from '../../constants';
import { Enum_CardanoCertificateType as CardanoCertificateType } from '../../types/trezor/protobuf';
import type {
    MessageType,
    CardanoTxCertificateType,
    CardanoTxInputType,
    CardanoTxOutputType,
    CardanoTxWithdrawalType,
} from '../../types/trezor/protobuf';
import type { CoreMessage } from '../../types';

// todo: remove when listed firmwares become mandatory for cardanoSignTransaction
const CardanoSignTransactionFeatures = Object.freeze({
    SignStakePoolRegistrationAsOwner: ['0', '2.3.5'],
    ValidityIntervalStart: ['0', '2.3.5'],
    MultiassetOutputs: ['0', '2.3.5'],
    AuxiliaryData: ['0', '2.3.7'],
});

export default class CardanoSignTransaction extends AbstractMethod {
    params: $ElementType<MessageType, 'CardanoSignTx'>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(
            this.name,
            getMiscNetwork('Cardano'),
            this.firmwareRange,
        );
        this.info = 'Sign Cardano transaction';

        const { payload } = message;

        if (payload.metadata) {
            throw ERRORS.TypedError(
                'Method_InvalidParameter',
                'Metadata field has been replaced by auxiliaryData.',
            );
        }

        // validate incoming parameters
        validateParams(payload, [
            { name: 'inputs', type: 'array', obligatory: true },
            { name: 'outputs', type: 'array', obligatory: true, allowEmpty: true },
            { name: 'fee', type: 'amount', obligatory: true },
            { name: 'ttl', type: 'amount' },
            { name: 'certificates', type: 'array', allowEmpty: true },
            { name: 'withdrawals', type: 'array', allowEmpty: true },
            { name: 'validityIntervalStart', type: 'amount' },
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
                { name: 'tokenBundle', type: 'array', allowEmpty: true },
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

        let auxiliaryData;
        if (payload.auxiliaryData) {
            auxiliaryData = transformAuxiliaryData(payload.auxiliaryData);
        }

        this.params = {
            inputs,
            outputs,
            fee: payload.fee,
            ttl: payload.ttl,
            certificates,
            withdrawals,
            auxiliary_data: auxiliaryData,
            validity_interval_start: payload.validityIntervalStart,
            protocol_magic: payload.protocolMagic,
            network_id: payload.networkId,
        };
    }

    _ensureFeatureIsSupported(feature: $Keys<typeof CardanoSignTransactionFeatures>) {
        if (!this.device.atLeast(CardanoSignTransactionFeatures[feature])) {
            throw ERRORS.TypedError(
                'Method_InvalidParameter',
                `Feature ${feature} not supported by device firmware`,
            );
        }
    }

    _ensureFirmwareSupportsParams() {
        const { params } = this;

        params.certificates.forEach(certificate => {
            if (certificate.type === CardanoCertificateType.STAKE_POOL_REGISTRATION) {
                this._ensureFeatureIsSupported('SignStakePoolRegistrationAsOwner');
            }
        });

        if (params.validity_interval_start != null) {
            this._ensureFeatureIsSupported('ValidityIntervalStart');
        }

        params.outputs.forEach(output => {
            if (output.token_bundle && output.token_bundle.length > 0) {
                this._ensureFeatureIsSupported('MultiassetOutputs');
            }
        });

        if (params.auxiliary_data) {
            this._ensureFeatureIsSupported('AuxiliaryData');
        }
    }

    async run() {
        this._ensureFirmwareSupportsParams();

        const typedCall = this.device.getCommands().typedCall.bind(this.device.getCommands());

        let serializedTx = '';

        let { type, message } = await typedCall(
            'CardanoSignTx',
            'CardanoSignedTx|CardanoSignedTxChunk',
            this.params,
        );
        while (type === 'CardanoSignedTxChunk') {
            serializedTx += message.signed_tx_chunk;
            ({ type, message } = await typedCall(
                'CardanoSignedTxChunkAck',
                'CardanoSignedTx|CardanoSignedTxChunk',
            ));
        }

        // this is required for backwards compatibility for FW <= 2.3.6 when the tx was not sent in chunks yet
        if (message.serialized_tx) {
            serializedTx += message.serialized_tx;
        }

        const hash = message.tx_hash;
        return {
            hash,
            serializedTx,
        };
    }
}
