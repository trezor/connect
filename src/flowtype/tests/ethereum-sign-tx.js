/* @flow */

import type { Transaction as EthereumTransaction } from 'flowtype/Ethereum';
declare module 'flowtype/tests/ethereum-sign-tx' {
    declare export type TestEthereumSignTxPayload = {
        method: string,
        path: string | Array<number>,
        transaction: EthereumTransaction,
    };
    declare export type ExpectedEthereumSignTxResponse = {
        success?: boolean,
        payload?: {
            r: string,
            s: string,
            v?: number
        },
    };
}
