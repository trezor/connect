/* @flow */
// Lisk types
// https://lisk.io/documentation/lisk-elements/user-guide/transactions

export type VoteAsset = {
    votes: Array<string>;
}

export type SignatureAsset = {
    signature: {
        publicKey: string;
    };
}

export type DelegateAsset = {
    delegate: {
        username: string;
    };
}

export type MultisignatureAsset = {
    multisignature: {
       min: number;
       lifetime: number;
       keysgroup: Array<string>;
    };
}

export type DataAsset = {
    data: string;
}

export type Asset = SignatureAsset | MultisignatureAsset | DelegateAsset | VoteAsset | DataAsset;

export type LiskTransaction = {
    type: number;
    fee: string;
    amount: string;
    timestamp: number;
    recipientId?: string;
    senderPublicKey?: string;
    requesterPublicKey?: string;
    signature?: string;
    asset?: Asset;
}

// methods parameters

// get address

export type LiskGetAddress = {
    path: string | number[];
    showOnTrezor?: boolean;
}

export type LiskAddress = {
    path: number[];
    serializedPath: string;
    address: string;
}

// get public key

export type LiskGetPublicKey = {
    path: string | number[];
    showOnTrezor?: boolean;
}

export type LiskPublicKey = {
    path: number[];
    serializedPath: string;
    publicKey: string;
}

// sign message

export type LiskSignMessage = {
    path: string | number[];
    message: string;
}

export type LiskMessageSignature = {
    publicKey: string;
    signature: string;
}

// sign transaction

export type LiskSignTransaction = {
    path: string | number[];
    transaction: LiskTransaction;
}

export { LiskSignedTx } from '../trezor/protobuf';

// verify message

export type LiskVerifyMessage = {
    publicKey: string;
    message: string;
    signature: string;
}
