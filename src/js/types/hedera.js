/* @flow */
// Hedera types

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type { HederaSignedTx } from './trezor';

export type SignatureAsset = {
    signature: {
        publicKey: string,
    },
}

export type $HederaGetPublicKey = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type HederaPublicKey = {
    path: Array<number>,
    serializedPath: string,
    publicKey: string,
}

// get public key

export type HederaGetPublicKey$ = {
    success: true,
    payload: HederaPublicKey,
} | Unsuccessful$;

export type HederaGetPublicKey$$ = {
    success: true,
    payload: Array<HederaPublicKey>,
} | Unsuccessful$;

// sign transaction

export type $HederaSignTransaction = $Common & {
    path: $Path,
    transaction: string,
}

export type HederaSignTransaction$ = {
    success: true,
    payload: HederaSignedTx,
} | Unsuccessful$
