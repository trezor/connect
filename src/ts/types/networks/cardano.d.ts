// Cardano method parameters types
import { HDPubNode } from '../trezor/protobuf';

// GetAddress

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

export interface CardanoGetAddress {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
}

export interface CardanoAddress {
    path: number[];
    serializedPath: string;
    address: string;
}

// Sign transaction

export interface CardanoInput {
    path: string | number[];
    prev_hash: string;
    prev_index: number;
    type: number;
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
    transactions: string[];
    protocol_magic: number;
}

export interface CardanoSignedTx {
    hash: string;
    body: string;
}
