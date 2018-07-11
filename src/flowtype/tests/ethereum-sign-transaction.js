/* @flow */

import type { Transaction as EthereumTransaction } from '../../js/types/ethereum.js';
declare module 'flowtype/tests/ethereum-sign-transaction' {
    declare export type TestEthereumSignTransactionPayload = {
        method: string,
        path: string | Array<number>,
        transaction: EthereumTransaction,
    };
    declare export type ExpectedEthereumSignTransactionResponse = {
        success?: boolean,
        payload?: {
            r: string,
            s: string,
            v?: number
        },
    };
}
