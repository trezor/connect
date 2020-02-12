/* @flow */

// get address

export type RippleGetAddress = {
    path: string | number[];
    showOnTrezor?: boolean;
}

export type RippleAddress = {
    address: string;
    path: Array<number>;
    serializedPath: string;
}

// sign transaction

type Payment = {
    amount: string;
    destination: string;
    destinationTag?: number;
}

export type RippleTransaction = {
    fee?: string;
    flags?: number;
    sequence?: number;
    maxLedgerVersion?: number; // Proto: "last_ledger_sequence"
    payment: Payment;
}

export type RippleSignTransaction = {
    path: string | number[];
    transaction: RippleTransaction;
}

export type RippleSignedTx = {
    serializedTx: string;
    signature: string;
}
