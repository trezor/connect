// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

// get address

export interface EthereumGetAddress {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
}

export interface EthereumAddress {
    address: string;
    path: number[];
    serializedPath: string;
}

// get public key

export interface EthereumGetPublicKey {
    path: string | number[];
    showOnTrezor?: boolean;
}

// sign transaction

export interface EthereumTransaction {
    to: string;
    value: string;
    gasPrice: string;
    gasLimit: string;
    nonce: string;
    data?: string;
    chainId?: number;
    txType?: number;
}

export interface EthereumSignTransaction {
    path: string | number[];
    transaction: EthereumTransaction;
}

// sign message

export interface EthereumSignMessage {
    path: string | number[];
    message: string;
    hex?: boolean;
}

// verify message

export interface EthereumVerifyMessage {
    address: string;
    message: string;
    hex?: boolean;
    signature: string;
}
