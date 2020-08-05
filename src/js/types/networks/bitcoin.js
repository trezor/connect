/* @flow */
import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction,
    Address as ProtobufAddress,
    SignedTx,
} from '../trezor/protobuf';

// getAddress params
export type GetAddress = {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
    coin?: string;
    crossChain?: boolean;
};

// getAddress response
export type Address = ProtobufAddress & {
    serializedPath: string;
};

// getPublicKey params
export type GetPublicKey = {
    path: string | number[];
    coin?: string;
    crossChain?: boolean;
};

// signTransaction params
export type SignTransaction = {
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
};
export type SignedTransaction = SignedTx & {
    txid?: string;
}

// push transaction params
export type PushTransaction = {
    tx: string;
    coin: string;
};

// push transaction response
export type PushedTransaction = {
    txid: string;
};

export type SignMessage = {
    path: string | number[];
    coin: string;
    message: string;
};

export type VerifyMessage = {
    address: string;
    signature: string;
    message: string;
    coin: string;
};

export type { TransactionInput, TransactionOutput } from '../trezor/protobuf';
