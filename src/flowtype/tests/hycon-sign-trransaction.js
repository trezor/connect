/* @flow */
import type { Transaction as HyconTransaction } from '../../js/types/hycon';

declare module 'flowtype/tests/hycon-sign-transaction' {
    declare export type TestHyconSignTransactionPayload = {
        method: string,
        path: string | Array<number>,
        transaction: HyconTransaction,
    };

    declare export type ExpectedHyconSignTransactionResponse = {
        success?: boolean,
        payload?: {
            signature: string,
            recovery: int,
            txhash: string,
        },
    };
}
