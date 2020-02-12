/* @flow */
// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

import type {
    MessageSignature,
    HDNodeResponse,
} from '../trezor/protobuf';

export type EthereumTransaction = {
    to: string;
    value: string;
    gasPrice: string;
    gasLimit: string;
    nonce: string;
    data?: string;
    chainId?: number;
    txType?: number;
    v: string;
    r: string;
    s: string;
}

// get address

export type EthereumGetAddress = {
    path: string | number[];
    showOnTrezor?: boolean;
}

export type EthereumAddress = {
    address: string;
    path: Array<number>;
    serializedPath: string;
}

// get public key

export type EthereumGetPublicKey = {
    path: string | number[];
    showOnTrezor?: boolean;
}

export type EthereumPublicKey = HDNodeResponse;

// sign transaction

export type EthereumSignTransaction = {
    path: string | number[];
    transaction: EthereumTransaction;
}

export { EthereumSignedTx } from '../trezor/protobuf';

// sign message

export type EthereumSignMessage = {
    path: string | number[];
    message: string;
    hex?: boolean;
};

export type EthereumMessageSignature = MessageSignature;

// verify message

export type EthereumVerifyMessage = {
    address: string;
    message: string;
    hex?: boolean;
    signature: string;
}
