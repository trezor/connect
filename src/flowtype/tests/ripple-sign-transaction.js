/* @flow */
import type { Transaction as RippleTransaction } from '../../js/types/ripple';

declare module 'flowtype/tests/ripple-sign-transaction' {
    declare export type TestRippleSignTransactionPayload = {
        method: string,
        path: string | Array<number>,
        transaction: RippleTransaction,
    };

    declare export type ExpectedRippleSignTransactionResponse = {
        success?: boolean,
        payload?: {
            signature: string,
            serializedTx: string,
        },
    };
}
