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

export interface CardanoGetAddress {
    path: string | number[];
    address?: string;
    protocolMagic: number;
    showOnTrezor?: boolean;
}

export interface CardanoAddress {
    path: number[];
    serializedPath: string;
    protocolMagic: number;
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
