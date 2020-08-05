import { CARDANO } from '../constants';

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

export interface CardanoCertificatePointer {
    blockIndex: number;
    txIndex: number;
    certificateIndex: number;
}

export interface CardanoAddressParameters {
    addressType: CARDANO.ADDRESS_TYPE;
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
    type: CARDANO.CERTIFICATE_TYPE;
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
    serializedTx: string;
}
