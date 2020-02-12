/* @flow */
// import { CommonParams } from './params';

// getAddress params
// export type GetAddress = {
//     path: string | number[];
//     address?: string;
//     showOnTrezor?: boolean;
//     coin?: string;
//     crossChain?: boolean;
//     bundle?: typeof undefined;
// };

// // getAddress response
// export type Address = {
//     address: string;
//     path: number[];
//     serializedPath: string;
// };

// getAddress params
export type GetAddress = {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
    coin?: string;
    crossChain?: boolean;
};

// getAddress response
export type Address = {
    address: string;
    path: number[];
    serializedPath: string;
};

// getPublicKey params
export type GetPublicKey = {
    path: string;
    coin?: string;
    crossChain?: boolean;
};

// getPublicKey response
export type PublicKey = {
    path: number[]; // hardended path
    serializedPath: string; // serialized path
    xpub: string; // xpub in legacy format
    xpubSegwit?: string; // optional for segwit accounts: xpub in segwit format
    chainCode: string; // BIP32 serialization format
    childNum: number; // BIP32 serialization format
    publicKey: string; // BIP32 serialization format
    fingerprint: number; // BIP32 serialization format
    depth: number; // BIP32 serialization format
};

// push transaction params
export type PushTransaction = {
    tx: string;
    coin: string;
};

// push transaction response
export type PushTransactionResponse = {
    txid: string;
};

export interface Input {
    address_n: number[];
    prev_index: number;
    prev_hash: string;
    amount: string;
    script_type: string;
}

export interface RegularOutput {
    address: string;
    amount: string;
    script_type?: string;
}

export interface InternalOutput {
    address_n: number[];
    amount: string;
    script_type?: string;
}

export interface SendMaxOutput {
    type: 'send-max';
    address: string;
}

export interface OpReturnOutput {
    type: 'opreturn';
    dataHex: string;
}
export interface NoAddressOutput {
    type: 'noaddress';
    amount: string;
}

export interface NoAddressSendMaxOutput {
    type: 'send-max-noaddress';
}

export type Output =
    | RegularOutput
    | InternalOutput
    | SendMaxOutput
    | OpReturnOutput
    | NoAddressOutput
    | NoAddressSendMaxOutput;

export interface BinOutput {
    amount: number;
    script_pubkey: string;
}

export interface RefTransaction {
    hash: string;
    version?: number;
    inputs: Input[];
    bin_outputs: BinOutput[];
    lock_time?: number;
    extra_data?: string;
    timestamp?: number;
    version_group_id?: number;
}

// signTransaction params
export type SignTransaction = {
    inputs: Input[];
    outputs: Output[];
    refTxs?: RefTransaction[];
    coin: string;
    locktime?: number;
    version?: number;
    expiry?: number;
    branchId?: number;
    push?: boolean;
};

export interface SignedTransaction {
    signatures: string[]; // signer signatures
    serializedTx: string; // serialized transaction
    txid?: string; // blockchain transaction id
}

export interface SignedMessage {
    address: string; // signer address
    signature: string; // signature in base64 format
}
