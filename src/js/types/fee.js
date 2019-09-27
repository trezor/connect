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
    label: string,
    feePerUnit: string,
    feePerTx?: string,
    feeLimit?: string,
    blocks: number,
};

export type FeeInfo = {
    blockTime: number,
    minFee: number,
    maxFee: number,
    levels: FeeLevel[],
}
