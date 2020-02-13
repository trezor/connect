/* @flow */
// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

// get address

export type EthereumGetAddress = {
    path: string | number[];
    address?: string;
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

// sign transaction

export type EthereumTransaction = {
    to: string;
    value: string;
    gasPrice: string;
    gasLimit: string;
    nonce: string;
    data?: string;
    chainId?: number;
    txType?: number;
}

export type EthereumSignTransaction = {
    path: string | number[];
    transaction: EthereumTransaction;
}

// sign message

export type EthereumSignMessage = {
    path: string | number[];
    message: string;
    hex?: boolean;
};

// verify message

export type EthereumVerifyMessage = {
    address: string;
    message: string;
    hex?: boolean;
    signature: string;
}
