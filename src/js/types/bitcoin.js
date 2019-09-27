/* @flow */

// copy/paste from hd-wallet/buildTx

export type PrecomposedTransaction = {
    type: 'error',
    error: string,
} | {
    type: 'nonfinal',
    max: string,
    totalSpent: string, // all the outputs, no fee, no change
    fee: string,
    feePerByte: string,
    bytes: number,
} | {
    type: 'final',
    max: string,
    totalSpent: string, // all the outputs, no fee, no change
    fee: string,
    feePerByte: string,
    bytes: number,
    transaction: {
        inputs: any,
        outputs: any,
    },
}
