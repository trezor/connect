
// Cardano method parameters types
import { 
    HDNodeType,
    CardanoAddressType,
    CardanoTxAuxiliaryDataSupplementType,
    CardanoCertificateType,
    CardanoPoolRelayType,
    CardanoTxWitnessType,
    CardanoTxSigningMode
} from '../trezor/protobuf';

// GetPublicKey

export interface CardanoGetPublicKey {
    path: string | number[];
    showOnTrezor?: boolean;
}

export interface CardanoPublicKey {
    path: number[];
    serializedPath: string;
    publicKey: string;
    node: HDNodeType;
}

// GetAddress

export interface CardanoCertificatePointer {
    blockIndex: number;
    txIndex: number;
    certificateIndex: number;
}

export interface CardanoAddressParameters {
    addressType: CardanoAddressType;
    path: string | number[];
    stakingPath?: string | number[];
    stakingKeyHash?: string;
    certificatePointer?: CardanoCertificatePointer;
}

export interface CardanoGetAddress {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    address?: string;
    showOnTrezor?: boolean;
}

export interface CardanoAddress {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    serializedPath: string;
    serializedStakingPath: string;
    address: string;
}

// Sign transaction

export interface CardanoInput {
    path: string | number[];
    prev_hash: string;
    prev_index: number;
}

export type CardanoToken = {
    assetNameBytes: string;
    amount: string;
}

export type CardanoAssetGroup = {
    policyId: string;
    tokenAmounts: CardanoToken[];
}

export type CardanoOutput =
    | {
          addressParameters: CardanoAddressParameters;
          amount: string;
          tokenBundle?: CardanoAssetGroup[];
      }
    | {
          address: string;
          amount: string;
          tokenBundle?: CardanoAssetGroup[];
      }

export type CardanoPoolOwner = {
    stakingKeyPath?: string | number[];
    stakingKeyHash?: string;
}

export type CardanoPoolRelay = {
    type: CardanoPoolRelayType;
    ipv4Address?: string;
    ipv6Address?: string;
    port?: number;
    hostName?: string;
}

export type CardanoPoolMetadata = {
    url: string;
    hash: string;
}

export type CardanoPoolMargin = {
    numerator: string;
    denominator: string;
}

export type CardanoPoolParameters = {
    poolId: string;
    vrfKeyHash: string;
    pledge: string;
    cost: string;
    margin: CardanoPoolMargin;
    rewardAccount: string;
    owners: CardanoPoolOwner[];
    relays: CardanoPoolRelay[];
    metadata: CardanoPoolMetadata;
}

export type CardanoCertificate = {
    type: CardanoCertificateType;
    path: string | number[];
    pool?: string;
    poolParameters?: CardanoPoolParameters;
}

export type CardanoWithdrawal = {
    path: string | number[];
    amount: string;
}

export type CardanoCatalystRegistrationParameters = {
    votingPublicKey: string;
    stakingPath: string | number[];
    rewardAddressParameters: CardanoAddressParameters;
    nonce: string;
}

export type CardanoAuxiliaryData = {
    hash?: string;
    catalystRegistrationParameters?: CardanoCatalystRegistrationParameters;
}

export interface CardanoSignTransaction {
    inputs: CardanoInput[];
    outputs: CardanoOutput[];
    fee: string;
    ttl?: string;
    certificates?: CardanoCertificate[];
    withdrawals?: CardanoWithdrawal[];
    validityIntervalStart?: string;
    protocolMagic: number;
    networkId: number;
    auxiliaryData?: CardanoAuxiliaryData;
    signingMode: CardanoTxSigningMode;
}

export type CardanoSignedTxWitness = {
    type: CardanoTxWitnessType;
    pubKey: string;
    signature: string;
    chainCode?: string;
}

export type CardanoAuxiliaryDataSupplement = {
    type: CardanoTxAuxiliaryDataSupplementType;
    auxiliaryDataHash: string;
    catalystSignature?: string;
}

export interface CardanoSignedTxData {
    hash: string;
    witnesses: CardanoSignedTxWitness[];
    auxiliaryDataSupplement?: CardanoAuxiliaryDataSupplement;
}

export {
    CardanoAddressType,
    CardanoCertificateType,
    CardanoPoolRelayType,
    CardanoTxSigningMode,
    CardanoTxWitnessType,
} from '../trezor/protobuf';
