// Lisk types
// https://lisk.io/documentation/lisk-elements/user-guide/transactions

export interface VoteAsset {
    votes: string[];
}

export interface SignatureAsset {
    signature: {
        publicKey: string;
    };
}

export interface DelegateAsset {
    delegate: {
        username: string;
    };
}

export interface MultisignatureAsset {
    multisignature: {
        min: number;
        lifetime: number;
        keysgroup: string[];
    };
}

export interface DataAsset {
    data: string;
}

export type LiskAsset = SignatureAsset | MultisignatureAsset | DelegateAsset | VoteAsset | DataAsset;

export interface LiskTransaction {
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

export interface LiskGetAddress {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
}

export interface LiskAddress {
    path: number[];
    serializedPath: string;
    address: string;
}

// get public key

export interface LiskGetPublicKey {
    path: string | number[];
    showOnTrezor?: boolean;
}

export interface LiskPublicKey {
    path: number[];
    serializedPath: string;
    publicKey: string;
}

// sign transaction

export interface LiskSignTransaction {
    path: string | number[];
    transaction: LiskTransaction;
}

// sign message

export interface LiskSignMessage {
    path: string | number[];
    message: string;
}

export interface LiskMessageSignature {
    publicKey: string;
    signature: string;
}

// verify message

export interface LiskVerifyMessage {
    publicKey: string;
    message: string;
    signature: string;
}
