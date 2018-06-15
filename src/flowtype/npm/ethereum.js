/* @flow */
// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

declare module 'flowtype/Ethereum' {
    declare export type Transaction = {
        to: string,
        value: string,
        gasPrice: string,
        gasLimit: string,
        nonce: string,
        data?: string,
        chainId?: number,
        v: string,
        r: string,
        s: string,
    }
}
