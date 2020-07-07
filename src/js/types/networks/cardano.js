/* @flow */

// Cardano method parameters types
import type { HDPubNode } from '../trezor/protobuf';

// GetAddress

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

export type CardanoGetAddress = {
    path: string | number[];
    address?: string;
    protocolMagic: number;
    showOnTrezor?: boolean;
}

export type CardanoAddress = {
    path: number[];
    serializedPath: string;
    protocolMagic: number;
    address: string;
}

// Sign transaction

export type CardanoInput = {
    path: string | number[];
    prev_hash: string;
    prev_index: number;
}
export type CardanoOutput = {
    path: string | number[];
    amount: string;
} | {
    address: string;
    amount: string;
}

export type CardanoSignTransaction = {
    inputs: CardanoInput[];
    outputs: CardanoOutput[];
    fee: string;
    ttl: string;
    protocolMagic: number;
}

export type CardanoSignedTx = {
    hash: string;
    serializedTx: string;
}
