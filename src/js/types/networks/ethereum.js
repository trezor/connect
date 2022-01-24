/* @flow */
// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

// get address

export type EthereumGetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
    useEventListener?: boolean, // set automatically if UI.ADDRESS_VALIDATION listener is used
    crossChain?: boolean,
};

export type EthereumAddress = {
    address: string,
    path: number[],
    serializedPath: string,
};

// get public key

export type EthereumGetPublicKey = {
    path: string | number[],
    showOnTrezor?: boolean,
    crossChain?: boolean,
};

// sign transaction

export type EthereumTransaction = {
    to: string,
    value: string,
    gasPrice: string,
    gasLimit: string,
    maxFeePerGas?: typeof undefined,
    maxPriorityFeePerGas?: typeof undefined,
    nonce: string,
    data?: string,
    chainId: number,
    txType?: number,
};

export type EthereumAccessList = {
    address: string,
    storageKeys: string[],
};

export type EthereumTransactionEIP1559 = {
    to: string,
    value: string,
    gasPrice?: typeof undefined,
    gasLimit: string,
    maxFeePerGas: string,
    maxPriorityFeePerGas: string,
    nonce: string,
    data?: string,
    chainId: number,
    accessList?: EthereumAccessList[],
};

export type EthereumSignTransaction = {
    path: string | number[],
    transaction: EthereumTransaction | EthereumTransactionEIP1559,
    crossChain?: boolean,
};

export type EthereumSignedTx = {
    v: string,
    r: string,
    s: string,
};

// sign message

export type EthereumSignMessage = {
    path: string | number[],
    message: string,
    hex?: boolean,
};

// sign typed message (eip-712)

type EthereumSignTypedDataTypeProperty = {
    name: string,
    type: string,
};

export type EthereumSignTypedDataTypes = {
    EIP712Domain: EthereumSignTypedDataTypeProperty[],
    [additionalProperties: string]: EthereumSignTypedDataTypeProperty[],
};

type EthereumSignTypedDataMessage<T: EthereumSignTypedDataTypes> = {
    types: T,
    primaryType: $Keys<T>,
    domain: {
        name?: string,
        version?: string,
        chainId?: number,
        verifyingContract?: string,
        salt?: ArrayBuffer,
    },
    message: { [fieldName: string]: any },
};

export type EthereumSignTypedData = {
    path: string | number[],
    metamask_v4_compat: boolean,
    data: EthereumSignTypedDataMessage<any>,
    domain_separator_hash?: typeof undefined,
    message_hash?: typeof undefined,
};

export type EthereumSignTypedHash = {
    path: string | number[],
    metamask_v4_compat?: typeof undefined,
    data?: typeof undefined,
    domain_separator_hash: string,
    message_hash: string,
};

// verify message

export type EthereumVerifyMessage = {
    address: string,
    message: string,
    hex?: boolean,
    signature: string,
};
