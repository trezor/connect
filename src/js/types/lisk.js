/* @flow */
// Lisk types
// https://lisk.io/documentation/lisk-elements/user-guide/transactions

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type {
    Success,
    LiskSignedTx,
} from './trezor';

export type VoteAsset = {
    votes: Array<string>,
}

export type SignatureAsset = {
    signature: {
        publicKey: string,
    },
}

export type DelegateAsset = {
    delegate: {
        username: string,
    },
}

export type MultisignatureAsset = {
    multisignature: {
       min: number,
       lifetime: number,
       keysgroup: Array<string>,
    },
}

export type DataAsset = {
    data: string,
}

export type Asset = SignatureAsset | MultisignatureAsset | DelegateAsset | VoteAsset | DataAsset;

export type Transaction = {
    type: number,
    fee: string,
    amount: string,
    timestamp: number,
    recipientId?: string,
    senderPublicKey?: string,
    requesterPublicKey?: string,
    signature?: string,
    asset?: Asset,
}

// methods parameters

// get address

export type $LiskGetAddress = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type LiskAddress = {
    path: Array<number>,
    serializedPath: string,
    address: string,
}

export type LiskGetAddress$ = {
    success: true,
    payload: LiskAddress,
} | Unsuccessful$;

export type LiskGetAddress$$ = {
    success: true,
    payload: Array<LiskAddress>,
} | Unsuccessful$;

// get public key

export type $LiskGetPublicKey = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type LiskPublicKey = {
    path: Array<number>,
    serializedPath: string,
    publicKey: string,
}

export type LiskGetPublicKey$ = {
    success: true,
    payload: LiskPublicKey,
} | Unsuccessful$;

export type LiskGetPublicKey$$ = {
    success: true,
    payload: Array<LiskPublicKey>,
} | Unsuccessful$;

// sign message

export type LiskMessageSignature = {
    publicKey: string,
    signature: string,
}

export type $LiskSignMessage = $Common & {
    path: $Path,
    message: string,
}

export type LiskSignMessage$ = {
    success: true,
    payload: LiskMessageSignature,
} | Unsuccessful$;

// sign transaction

export type $LiskSignTransaction = $Common & {
    path: $Path,
    transaction: Transaction,
}

export type LiskSignTransaction$ = {
    success: true,
    payload: LiskSignedTx,
} | Unsuccessful$

// verify message

export type $LiskVerifyMessage = $Common & {
    publicKey: string,
    message: string,
    signature: string,
}

export type LiskVerifyMessage$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;
