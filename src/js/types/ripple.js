/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type { RippleAccount } from './account';

// get account info
type RequestedAccount = {
    descriptor: string,
    block?: number,
    mempool?: boolean,
    history?: boolean,
} | {
    path: string,
    block?: number,
    mempool?: boolean,
    history?: boolean,
};

export type $RippleGetAccountInfo = {
    account: RequestedAccount,
    level?: string,
    coin: string,
}

export type $$RippleGetAccountInfo = {
    bundle: Array<RequestedAccount>,
    level?: string,
    coin: string,
}

export type RippleGetAccountInfo$ = {
    success: true,
    payload: RippleAccount,
} | Unsuccessful$;

export type RippleGetAccountInfo$$ = {
    success: true,
    payload: Array<RippleAccount>,
} | Unsuccessful$;

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
