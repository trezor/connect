import {
    PrevInput,
    TxInput as OrigTxInputType,
    TxInputType,
    TxOutputType,
    TxOutputBinType,
    Address as ProtobufAddress,
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
    path: number[];
    serializedPath: string;
};

// getPublicKey params
export interface GetPublicKey {
    path: string | number[];
    coin?: string;
    crossChain?: boolean;
}

// combined Bitcoin.PublicKey and Bitcoin.HDNode
export interface HDNodeResponse {
    path: number[];
    serializedPath: string;
    childNum: number;
    xpub: string;
    xpubSegwit?: string;
    chainCode: string;
    publicKey: string;
    fingerprint: number;
    depth: number;
}

// based on PROTO.TransactionType, with required fields
export type RefTransaction = {
    hash: string;
    version: number;
    inputs: PrevInput[];
    bin_outputs: TxOutputBinType[];
    outputs?: undefined;
    lock_time: number;
    extra_data?: string;
    expiry?: number;
    overwintered?: boolean;
    version_group_id?: number;
    timestamp?: number;
    branch_id?: number;
} | {
    hash: string;
    version: number;
    inputs: OrigTxInputType[];
    bin_outputs?: undefined;
    outputs: TxOutputType[];
    lock_time: number;
    extra_data?: string;
    expiry?: number;
    overwintered?: boolean;
    version_group_id?: number;
    timestamp?: number;
    branch_id?: number;
}

// based on PROTO.SignTx, only optional fields
export type TransactionOptions = {
    version?: number;
    lock_time?: number;
    expiry?: number;
    overwintered?: boolean;
    version_group_id?: number;
    timestamp?: number;
    branch_id?: number;
};

// signTransaction params
export interface SignTransaction {
    inputs: TxInputType[];
    outputs: TxOutputType[];
    refTxs?: RefTransaction[];
    account?: { // Partial account (addresses)
        addresses: {
            used: { path: string; address: string }[];
            unused: { path: string; address: string }[];
            change: { path: string; address: string }[];
        };
    };
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
export type SignedTransaction = {
    signatures: string[];
    serializedTx: string;
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
    hex?: boolean;
}

export interface VerifyMessage {
    address: string;
    signature: string;
    message: string;
    coin: string;
    hex?: boolean;
}

export { TxInputType, TxOutputType } from '../trezor/protobuf';
