/* @flow */

// Cardano method parameters types
import type { HDPubNode } from '../trezor/protobuf';

// GetPublicKey

export type CardanoGetPublicKey = {
    path: string | number[];
    showOnTrezor?: boolean;
}

export type CardanoPublicKey = {
    path: number[];
    serializedPath: string;
    publicKey: string;
    node: HDPubNode;
}

// GetAddress

export const CARDANO_ADDRESS_TYPE = Object.freeze({
    Base: 0,
    Pointer: 4,
    Enterprise: 6,
    Byron: 8,
    Reward: 14,
});
export type CardanoAddressType = $Values<typeof CARDANO_ADDRESS_TYPE>;

export type CardanoCertificatePointer = {
    blockIndex: number;
    txIndex: number;
    certificateIndex: number;
}

export type CardanoAddressParameters = {
    addressType: CardanoAddressType;
    path: string | number[];
    stakingPath?: string | number[];
    stakingKeyHash?: string;
    certificatePointer?: CardanoCertificatePointer;
};

export type CardanoGetAddress = {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    address?: string;
    showOnTrezor?: boolean;
}

export type CardanoAddress = {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    serializedPath: string;
    serializedStakingPath: string;
    address: string;
}

// Sign transaction

export const CARDANO_CERTIFICATE_TYPE = Object.freeze({
    StakeRegistration: 0,
    StakeDeregistration: 1,
    StakeDelegation: 2,
});
export type CardanoCertificateType = $Values<typeof CARDANO_CERTIFICATE_TYPE>;

export type CardanoInput = {
    path: string | number[];
    prev_hash: string;
    prev_index: number;
}
export type CardanoOutput = {
    addressParameters: CardanoAddressParameters;
    amount: string;
} | {
    address: string;
    amount: string;
}
export type CardanoCertificate = {
    type: CardanoCertificateType;
    path: string | number[];
    pool?: string;
}
export type CardanoWithdrawal = {
    path: string | number[];
    amount: string;
}

export type CardanoSignTransaction = {
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

export type CardanoSignedTx = {
    hash: string;
    serializedTx: string;
}
