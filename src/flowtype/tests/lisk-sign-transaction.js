/* @flow */

import type { PreparedTransaction as LiskTransaction } from '../../js/types/lisk.js';
declare module 'flowtype/tests/lisk-sign-transaction' {
    declare export type TestLiskSignTransactionPayload = {
        method: string,
        path: string,
        transaction: LiskTransaction,
    };
    declare export type ExpectedLiskSignTransactionResponse = {
        payload: {
            signature: string,
        },
    };
}
