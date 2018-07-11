/* @flow */

import type { Transaction as NEMTransaction } from '../../js/types/nem';
declare module 'flowtype/tests/nem-sign-transaction' {
    declare export type TestNemSignTransactionPayload = {
        method: string,
        path: string | Array<number>,
        transaction: NEMTransaction,
    };
    declare export type ExpectedNemSignTransactionResponse = {
        payload: {
            data: string,
            signature: string,
        },
    };
}
