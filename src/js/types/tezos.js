/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

// get address

export type TezosAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetAddress = {
    path: $Path,
    curve: 0 | 1 | 2,
    showOnTrezor?: boolean,
}

export type TezosGetAddress$ = {
    success: true,
    payload: TezosAddress,
} | Unsuccessful$;

export type TezosGetAddress$$ = {
    success: true,
    payload: Array<TezosAddress>,
} | Unsuccessful$;

// get public key

export type TezosPublicKey = {
    publicKey: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetPublicKey = {
    path: $Path,
    curve: 0 | 1 | 2,
    showOnTrezor?: boolean,
}

export type TezosGetPublicKey$ = {
    success: true,
    payload: TezosPublicKey,
} | Unsuccessful$;

export type TezosGetPublicKey$$ = {
    success: true,
    payload: Array<TezosPublicKey>,
} | Unsuccessful$;

// sign transaction

export type Transaction = {
    // TODO: add expected fields
}

export type $TezosSignTransaction = $Common & {
    path: $Path,
    transaction: Transaction,
}

export type TezosSignedTx = {
    signatureContents: string,
    signature: string,
    hash: string,
}

export type TezosSignTransaction$ = {
    success: true,
    payload: TezosSignedTx,
} | Unsuccessful$;
