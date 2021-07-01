/* @flow */
import cbor from 'borc';
import type {
    CardanoCatalystRegistrationParametersType,
    CardanoTxWithdrawalType,
    CardanoTxInputType,
    CardanoTxOutputType,
    CardanoCertificateType,
    CardanoPoolOwner,
    CardanoPoolRelayParameters,
    CardanoPoolMetadataType,
} from '../../../types/trezor/protobuf';
import {
    Enum_CardanoTxAuxiliaryDataSupplementType as CardanoTxAuxiliaryDataSupplementType,
    Enum_CardanoTxWitnessType as CardanoTxWitnessType,
} from '../../../types/trezor/protobuf';
import type {
    CardanoSignedTxWitness,
    CardanoSignedTxData,
    CardanoAuxiliaryDataSupplement,
} from '../../../types/networks/cardano';
import type { CardanoSignTransactionParams } from '../CardanoSignTransaction';

const METADATA_HASH_KEY = 7;

const SHELLEY_WITNESSES_KEY = 0;
const BYRON_WITNESSES_KEY = 2;

const CATALYST_REGISTRATION_SIGNATURE_ENTRY_KEY = 61285;
const CATALYST_REGISTRATION_SIGNATURE_KEY = 1;

type CardanoPoolParametersTypeLegacy = {
    pool_id: string,
    vrf_key_hash: string,
    pledge: string | number,
    cost: string | number,
    margin_numerator: string | number,
    margin_denominator: string | number,
    reward_account: string,
    owners: CardanoPoolOwner[],
    relays: CardanoPoolRelayParameters[],
    metadata?: CardanoPoolMetadataType,
};

type CardanoTxCertificateTypeLegacy = {
    type: CardanoCertificateType,
    path?: number[],
    pool?: string,
    pool_parameters?: CardanoPoolParametersTypeLegacy,
};

type CardanoTxAuxiliaryDataTypeLegacy = {
    blob?: string,
    catalyst_registration_parameters?: CardanoCatalystRegistrationParametersType,
};

type CardanoSignTransactionLegacyParams = {
    auxiliary_data: void | CardanoTxAuxiliaryDataTypeLegacy,
    certificates: CardanoTxCertificateTypeLegacy[],
    fee: number,
    inputs: CardanoTxInputType[],
    network_id: number,
    outputs: CardanoTxOutputType[],
    protocol_magic: number,
    ttl: number,
    validity_interval_start: number,
    withdrawals: CardanoTxWithdrawalType[],
};

export const toLegacyParams = (
    params: CardanoSignTransactionParams,
): CardanoSignTransactionLegacyParams => ({
    inputs: params.inputsWithPath.map(({ input, path }) => ({ ...input, address_n: path })),
    outputs: params.outputsWithTokens.map(({ output, tokenBundle }) => ({
        ...output,
        token_bundle: tokenBundle
            ? tokenBundle.map(assetGroup => ({
                  policy_id: assetGroup.policyId,
                  tokens: assetGroup.tokens,
              }))
            : [],
        asset_groups_count: undefined,
    })),
    fee: params.fee,
    ttl: params.ttl,
    certificates: params.certificatesWithPoolOwnersAndRelays.map(
        ({ certificate, poolOwners, poolRelays }) => ({
            ...certificate,
            pool_parameters: certificate.pool_parameters
                ? { ...certificate.pool_parameters, owners: poolOwners, relays: poolRelays }
                : undefined,
        }),
    ),
    withdrawals: params.withdrawals,
    auxiliary_data: params.auxiliaryData
        ? {
              catalyst_registration_parameters: params.auxiliaryData
                  .catalyst_registration_parameters
                  ? params.auxiliaryData.catalyst_registration_parameters
                  : undefined,
          }
        : undefined,
    validity_interval_start: params.validityIntervalStart,
    protocol_magic: params.protocolMagic,
    network_id: params.networkId,
});

const _transformShelleyWitnesses = (deserializedWitnesses): CardanoSignedTxWitness[] => {
    if (!deserializedWitnesses.has(SHELLEY_WITNESSES_KEY)) {
        return [];
    }

    return deserializedWitnesses.get(SHELLEY_WITNESSES_KEY).map(witness => {
        const [pubKeyBytes, signatureBytes] = witness;
        return {
            type: CardanoTxWitnessType.SHELLEY_WITNESS,
            pubKey: Buffer.from(pubKeyBytes).toString('hex'),
            signature: Buffer.from(signatureBytes).toString('hex'),
            chainCode: null,
        };
    });
};

const _transformByronWitnesses = (deserializedWitnesses): CardanoSignedTxWitness[] => {
    if (!deserializedWitnesses.has(BYRON_WITNESSES_KEY)) {
        return [];
    }

    return deserializedWitnesses.get(BYRON_WITNESSES_KEY).map(witness => {
        const [pubKeyBytes, signatureBytes, chainCodeBytes] = witness;
        return {
            type: CardanoTxWitnessType.BYRON_WITNESS,
            pubKey: Buffer.from(pubKeyBytes).toString('hex'),
            signature: Buffer.from(signatureBytes).toString('hex'),
            chainCode: Buffer.from(chainCodeBytes).toString('hex'),
        };
    });
};

const _transformAuxiliaryData = (txBody, auxiliaryData): CardanoAuxiliaryDataSupplement | void => {
    // Legacy firmware only supported catalyst registration auxiliary data so try to parse it.
    // If it fails, then no supplement is needed.
    try {
        const [maybeCatalystRegistration] = auxiliaryData;
        return {
            type: CardanoTxAuxiliaryDataSupplementType.CATALYST_REGISTRATION_SIGNATURE,
            auxiliaryDataHash: Buffer.from(txBody.get(METADATA_HASH_KEY)).toString('hex'),
            catalystSignature: Buffer.from(
                maybeCatalystRegistration
                    .get(CATALYST_REGISTRATION_SIGNATURE_ENTRY_KEY)
                    .get(CATALYST_REGISTRATION_SIGNATURE_KEY),
            ).toString('hex'),
        };
    } catch (e) {
        return undefined;
    }
};

export const legacySerializedTxToResult = (
    txHash: string,
    serializedTx: string,
): CardanoSignedTxData => {
    const [txBody, deserializedWitnesses, auxiliaryData] = cbor.decode(serializedTx);

    const shelleyWitnesses = _transformShelleyWitnesses(deserializedWitnesses);
    const byronWitnesses = _transformByronWitnesses(deserializedWitnesses);
    const witnesses = shelleyWitnesses.concat(byronWitnesses);

    const auxiliaryDataSupplement = _transformAuxiliaryData(txBody, auxiliaryData);

    return { hash: txHash, witnesses, auxiliaryDataSupplement };
};
