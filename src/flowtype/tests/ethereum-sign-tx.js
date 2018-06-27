/* @flow */

declare module 'flowtype/tests/ethereum-sign-tx' {
    import type { Transaction } from 'flowtype/Ethereum'

    declare export type TestEthereumSignTxPayload = {
        method: string,
        path: string | Array<number>,
        transaction: Transaction,
    };
    declare export type ExpectedEthereumSignTxResponse = {
        success?: boolean,
        payload?: {
            r: string,
            s: string,
            v?: number
        },
    };

    declare export type SubtestEthereumSignTx = {
        testPayloads: Array<TestEthereumSignTxPayload>,
        expectedResponses: Array<ExpectedEthereumSignTxResponse>,
        specName: string,
    };
}
