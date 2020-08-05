import {
    TransactionInput,
    TransactionOutput,
    RefTransaction,
    Address as ProtobufAddress,
    SignedTx,
} from '../trezor/protobuf';

// getAddress params
export interface GetAddress {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
    coin?: string;
    crossChain?: boolean;
}

// getAddress response
export type Address = ProtobufAddress & {
    serializedPath: string;
};

// getPublicKey params
export interface GetPublicKey {
    path: string | number[];
    coin?: string;
    crossChain?: boolean;
}

// signTransaction params
export interface SignTransaction {
    inputs: TransactionInput[];
    outputs: TransactionOutput[];
    refTxs?: RefTransaction[];
    coin: string;
    locktime?: number;
    timestamp?: number;
    version?: number;
    expiry?: number;
    overwintered?: boolean;
    versionGroupId?: number;
    branchId?: number;
    push?: boolean;
}
export type SignedTransaction = SignedTx & {
    txid?: string;
};

// push transaction params
export interface PushTransaction {
    tx: string;
    coin: string;
}

// push transaction response
export interface PushedTransaction {
    txid: string;
}

export interface SignMessage {
    path: string | number[];
    coin: string;
    message: string;
}

export interface VerifyMessage {
    address: string;
    signature: string;
    message: string;
    coin: string;
}

export { TransactionInput, TransactionOutput } from '../trezor/protobuf';
