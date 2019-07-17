/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

// get address

export type RippleAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $RippleGetAddress = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type RippleGetAddress$ = {
    success: true,
    payload: RippleAddress,
} | Unsuccessful$;

export type RippleGetAddress$$ = {
    success: true,
    payload: Array<RippleAddress>,
} | Unsuccessful$;

// sign transaction

type Payment = {
    amount: string,
    destination: string,
    destinationTag?: number,
}

export type Transaction = {
    fee?: string,
    flags?: number,
    sequence?: number,
    maxLedgerVersion?: number, // Proto: "last_ledger_sequence"
    payment: Payment,
}

export type $RippleSignTransaction = $Common & {
    path: $Path,
    transaction: Transaction,
}

export type RippleSignedTx = {
    serializedTx: string,
    signature: string,
}

export type RippleSignTransaction$ = {
    success: true,
    payload: RippleSignedTx,
} | Unsuccessful$;
