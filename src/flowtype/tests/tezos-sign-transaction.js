/* @flow */

declare module 'flowtype/tests/tezos-sign-transaction' {

    declare export type TestTezosSignTransactionPayload = {
        method: string,
        path: string | Array<number>,
    };

    declare export type ExpectedTezosSignTransactionResponse = {
        payload: {
            signature: string,
            sig_op_contents: string,
            operation_hash: string,
        },
    };
}
