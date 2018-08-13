/* @flow */

declare module 'flowtype/tests/cardano-sign-transaction' {
    type CardanoInput = {
        address_n: string | Array<number>,
        tx_hash: string,
        output_index: number,
        type?: number,
    }
    type CardanoOutput = {
        address_n: string | Array<number>,
        amount: string,
    } | {
        address: string,
        amount: string,
    }

    declare export type TestCardanoSignTransactionPayload = {
        inputs: Array<CardanoInput>,
        outputs: Array<CardanoOutput>,
        transactions: Array<string>,
    };

    declare export type ExpectedCardanoSignTransactionResponse = {
        payload: {
            hash: string,
            body: string,
        },
    };
}
