/* @flow */
// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

export type Transaction = {
    to: string,
    value: string,
    gasPrice: string,
    gasLimit: string,
    nonce: string,
    data?: string,
    chainId?: number,
    txType?: number,
    v: string,
    r: string,
    s: string,
}
