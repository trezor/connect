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
    Base = 0,
    Pointer = 4,
    Enterprise = 6,
    Byron = 8,
    Reward = 14,
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

export interface CardanoInput {
    path: string | number[];
    prev_hash: string;
    prev_index: number;
}
export type CardanoOutput =
    | {
          path: string | number[];
          amount: string;
      }
    | {
          address: string;
          amount: string;
      };

export interface CardanoSignTransaction {
    inputs: CardanoInput[];
    outputs: CardanoOutput[];
    fee: string;
    ttl: string;
    protocolMagic: number;
}

export interface CardanoSignedTx {
    hash: string;
    serialized_tx: string;
}
