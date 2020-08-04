/* @flow */

import { ADDRESS_TYPE, CERTIFICATE_TYPE } from '../../constants/cardano';

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

export type CardanoAddressType = $Values<typeof ADDRESS_TYPE>;

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

export type CardanoCertificateType = $Values<typeof CERTIFICATE_TYPE>;

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
