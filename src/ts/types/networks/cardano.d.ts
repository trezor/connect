import { CARDANO_ADDRESS_TYPE, CARDANO_CERTIFICATE_TYPE } from '../../constants/cardano';

// Cardano method parameters types
import { HDPubNode } from '../trezor/protobuf';

// GetPublicKey

export interface CardanoGetPublicKey {
    path: string | number[];
    showOnTrezor?: boolean;
}

export interface CardanoPublicKey {
    path: number[];
    serializedPath: string;
    publicKey: string;
    node: HDPubNode;
}

// GetAddress

export enum CardanoAddressType {
    Base = CARDANO_ADDRESS_TYPE.Base,
    Pointer = CARDANO_ADDRESS_TYPE.Pointer,
    Enterprise = CARDANO_ADDRESS_TYPE.Enterprise,
    Byron = CARDANO_ADDRESS_TYPE.Byron,
    Reward = CARDANO_ADDRESS_TYPE.Reward,
}

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
};

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

export enum CardanoCertificateType {
    StakeRegistration = CARDANO_CERTIFICATE_TYPE.StakeRegistration,
    StakeDeregistration = CARDANO_CERTIFICATE_TYPE.StakeDeregistration,
    StakeDelegation = CARDANO_CERTIFICATE_TYPE.StakeDelegation,
}

export interface CardanoInput {
    path: string | number[];
    prev_hash: string;
    prev_index: number;
}
export type CardanoOutput =
    | {
          addressParameters: CardanoAddressParameters;
          amount: string;
      }
    | {
          address: string;
          amount: string;
      };
export type CardanoCertificate = {
    type: CardanoCertificateType;
    path: string | number[];
    pool?: string;
}
export type CardanoWithdrawal = {
    path: string | number[];
    amount: string;
}

export interface CardanoSignTransaction {
    inputs: CardanoInput[];
    outputs: CardanoOutput[];
    fee: string;
    ttl: string;
    certificates?: CardanoCertificate[];
    withdrawals?: CardanoWithdrawal[];
    metadata?: string;
    protocolMagic: number;
    networkId: number;
}

export interface CardanoSignedTx {
    hash: string;
    serialized_tx: string;
}
