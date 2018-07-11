/* @flow */

import type {
    TransactionInput,
    TransactionOutput,
} from 'flowtype/trezor';

declare module 'flowtype/tests/sign-transaction' {
    declare export type TestSignTransactionPayload = {
        method: string,
        coin: string,
        inputs: Array<TransactionInput>,
        outputs: Array<TransactionOutput>,
    };

    declare export type ExpectedSignTransactionResponse = {
        success?: boolean,
        payload?: {
            code?: string,
            serialized?: {
                serialized_tx: string,
                signatures?: Array<string>,
            },
        }
    };
}