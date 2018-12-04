/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type {
    TezosRevealOp,
    TezosTransactionOp,
    TezosOriginationOp,
    TezosDelegationOp,
} from './trezor';

// get address

export type TezosAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetAddress = $Common & {
    path: $Path,
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

export type TezosPublicKey = $Common & {
    publicKey: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetPublicKey = {
    path: $Path,
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

export type TezosOperation = {
    reveal?: TezosRevealOp,
    transaction?: TezosTransactionOp,
    origination?: TezosOriginationOp,
    delegation?: TezosDelegationOp,
}

export type $TezosSignTransaction = $Common & {
    address_n: Array<number>,
    branch: string,
    operation: TezosOperation,
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
