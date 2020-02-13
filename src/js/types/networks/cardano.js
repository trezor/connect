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
    showOnTrezor?: boolean;
}

export type CardanoAddress = {
    path: number[];
    serializedPath: string;
    address: string;
}

// Sign transaction

export type CardanoInput = {
    path: string | number[];
    prev_hash: string;
    prev_index: number;
    type: number;
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
    transactions: string[];
    protocol_magic: number;
}

export type CardanoSignedTx = {
    hash: string;
    body: string;
}
