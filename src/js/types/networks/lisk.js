/* @flow */
// Lisk types
// https://lisk.io/documentation/lisk-elements/user-guide/transactions

type VoteAsset = {
    votes: Array<string>;
}

type SignatureAsset = {
    signature: {
        publicKey: string;
    };
}

type DelegateAsset = {
    delegate: {
        username: string;
    };
}

type MultisignatureAsset = {
    multisignature: {
       min: number;
       lifetime: number;
       keysgroup: Array<string>;
    };
}

type DataAsset = {
    data: string;
}

export type LiskAsset = SignatureAsset | MultisignatureAsset | DelegateAsset | VoteAsset | DataAsset;

export type LiskTransaction = {
    type: number;
    fee: string;
    amount: string;
    timestamp: number;
    recipientId?: string;
    senderPublicKey?: string;
    requesterPublicKey?: string;
    signature?: string;
    asset?: LiskAsset;
}

// methods parameters

// get address

export type LiskGetAddress = {
    path: string | number[];
    address?: string;
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

// sign transaction

export type LiskSignTransaction = {
    path: string | number[];
    transaction: LiskTransaction;
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

// verify message

export type LiskVerifyMessage = {
    publicKey: string;
    message: string;
    signature: string;
}
