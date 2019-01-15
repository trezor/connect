/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

// get address

export type HyconAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $HyconGetAddress = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type HyconGetAddress$ = {
    success: true,
    payload: HyconAddress,
} | Unsuccessful$;

export type HyconGetAddress$$ = {
    success: true,
    payload: Array<HyconAddress>,
} | Unsuccessful$;

// sign transaction
export type Transaction = {
    fee: string,
    amount: string,
    nonce: number,
    to: string,
}

export type $HyconSignTransaction = $Common & {
    path: $Path,
    transaction: Transaction,
}

export type HyconSignedTx = {
    signature: string,
    recovery: number,
    txhash: string,
}

export type HyconSignTransaction$ = {
    success: true,
    payload: HyconSignedTx,
} | Unsuccessful$;
