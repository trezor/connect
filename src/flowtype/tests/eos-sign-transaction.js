/* @flow */

import type { Transaction as EosTransaction } from '../../js/types/eos.js';
declare module 'flowtype/tests/eos-sign-transaction' {
    declare export type TestEosSignTransactionPayload = {
        method: string,
        path: string | Array<number>,
        transaction: EosTransaction,
    };
    declare export type ExpectedEosSignTransactionResponse = {
        success?: boolean,
        payload?: {
            signatureR: string,
            signatureS: string,
            signatureV?: number,
        },
    };
}
