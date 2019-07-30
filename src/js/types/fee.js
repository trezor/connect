/* @flow */

export type SelectFeeLevel = {
    name: string,
    fee: '0',
    disabled: true,
} | {
    name: string,
    fee: string,
    feePerByte: string,
    minutes: number,
    total: string,
}

export type FeeLevel = {
    type: 'bitcoin',
    name: string,
    info: {
        fee: string,
        blocks: number,
    },
} | {
    type: 'ethereum',
    name: string,
    info: {
        fee: string,
        gasLimit: string,
        gasPrice: string,
        blocks: number,
    },
} | {
    type: 'ripple',
    name: string,
    info: {
        fee: string,
        blocks: number,
    },
}
