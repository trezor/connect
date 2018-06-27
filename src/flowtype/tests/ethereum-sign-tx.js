/* @flow */

declare module 'flowtype/tests/ethereum-sign-tx' {
     // TODO: Use type Trans from 'flowtype/Ethereum' instead
     // current problem is that I'm not sure whether rvs values are optional
     // because they shouldn't be needed when signing tx
     // they should be returned *after* signing the tx
     // import type { Transaction } from 'flowtype/Ethereum'
    declare type Transaction = {
        to: string,
        value: string,
        gasPrice: string,
        gasLimit: string,
        nonce: string,
        data?: string,
        chainId?: number,
        v?: string,
        r?: string,
        s?: string,
    }

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
}
