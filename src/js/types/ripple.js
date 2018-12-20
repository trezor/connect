/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

// get account info

export type RippleAccount = {
    address: string,
    path?: Array<number>,
    serializedPath?: string,
    block: number,
    transactions: number,
    balance: string,
    availableBalance: string,
    sequence: number,
}

type RequestedAccount = {
    address: string,
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
