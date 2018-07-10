/* @flow */

import type { Transaction } from '../../js/types/nem';
declare module 'flowtype/tests/nem-sign-transaction' {
    declare export type TestNemSignTransactionPayload = {
        method: string,
        path: string | Array<number>,
        transaction: Transaction,
    };
    declare export type ExpectedNemSignTransactionResponse = {
        payload: {
            data: string,
            signature: string,
        },
    };
}
