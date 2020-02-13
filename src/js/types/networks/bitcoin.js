/* @flow */
import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction,
    Address as ProtobufAddress,
    SignedTx,
    // MultisigRedeemScriptType,
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
    path: string;
    coin?: string;
    crossChain?: boolean;
};

// export type Input = {
//     address_n: number[];
//     prev_index: number;
//     prev_hash: string;
//     amount?: string; // Required for: segwit || bip143: true || zcash overwinter
//     script_type: InputScriptType;
//     multisig?: MultisigRedeemScriptType;
// }

export type RegularOutput = {
    address: string;
    amount: string;
    script_type?: 'PAYTOADDRESS';
}

export type InternalOutput = {
    address_n: number[];
    amount: string;
    script_type?: string;
}

export type SendMaxOutput = {
    type: 'send-max';
    address: string;
}

export type OpReturnOutput = {
    type: 'opreturn';
    dataHex: string;
}
export type NoAddressOutput = {
    type: 'noaddress';
    amount: string;
}

export type NoAddressSendMaxOutput = {
    type: 'send-max-noaddress';
}

export type ComposeOutput =
    | RegularOutput
    | InternalOutput
    | SendMaxOutput
    | OpReturnOutput
    | NoAddressOutput
    | NoAddressSendMaxOutput;

// export type BinOutput = {
//     amount: number;
//     script_pubkey: string;
// }

// extended type of protobuf.RefTransactionInput
// returned by `getReferencedTransactions` method
// transformed to protobuf by `transformReferencedTransactions` util
// export type RefTransaction = {
//     hash: string;
//     version?: number;
//     inputs: Input[];
//     bin_outputs: BinOutput[];
//     lock_time?: number;
//     extra_data?: string;
//     timestamp?: number;
//     version_group_id?: number;
// }

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
