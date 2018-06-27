/* @flow */

import type {
    TransactionInput,
    TransactionOutput,
} from 'flowtype/trezor';

declare module 'flowtype/tests/sign-tx' {
    declare export type TestSignTxPayload = {
        method: string,
        coin: string,
        inputs: Array<TransactionInput>,
        outputs: Array<TransactionOutput>,
    };

    declare export type ExpectedSignTxResponse = {
        success?: boolean,
        payload?: {
            code?: string,
            serialized?: {
                serialized_tx: string,
            },
        }
    };
}