/* @flow */
import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';
import type {
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const signPPC = (): SubtestSignTransaction => {
    // See tx f7e3624c143b6a170cc44f9337d0fa8ea8564a211de9c077c6889d8c78f80909
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Peercoin',
            timestamp: 1573209226,
            inputs: [
                {
                    address_n: [2147483692, 2147483654, 2147483648, 0, 0],
                    prev_hash: '41b29ad615d8eea40a4654a052d18bb10cd08f203c351f4d241f88b031357d3d',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'PXtfyTjzgXSgTwK5AbszdHQSSxyQN3BLM5',
                    amount: '90000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
            // since Peercoin doesn't have blockbook v2 implemented
            refTxs: [
                {
                    hash: '41b29ad615d8eea40a4654a052d18bb10cd08f203c351f4d241f88b031357d3d',
                    inputs: [
                        {
                            prev_hash: '67abe6288fdec766e106a46125727eb7c608266950746fc10d1d1c69645f68af',
                            prev_index: 0,
                            script_sig: '473044022052748f479c41b432352772ef7aa4b090e4f8df8d589aaea5cfc3dbef237a3935022012f53265e223c3cce6348306d7085b0538b68a52dbd99b0035a01b5bb2a8e50a0121038fa1b058febedda1a414ccb39f55ac09dd832e5c2e5af9b14ff49ea9d520b9fe',
                            sequence: 4294967295,
                        },
                    ],
                    bin_outputs: [
                        {
                            amount: '100000',
                            script_pubkey: '76a914d68a96304b1fb73aadfea0f44c17061f5e353e1b88ac',
                        },
                        {
                            amount: '695400',
                            script_pubkey: '76a91460223495a70ca30abcee5b93687d5fa88fa5d4ec88ac',
                        },
                    ],
                    version: 1,
                    timestamp: 1573209046,
                    lock_time: 0,
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '010000008a44c55d013d7d3531b0881f244d1f353c208fd00cb18bd152a054460aa4eed815d69ab241000000006a473044022025c0ea702390c702c7ae8b5ea469820bea8d942c8c16439f8f0ba2e91e699efc02200db9b0a48fa2861695fa91df4831a4c7306587e5d2dc85419647f462717bc8f001210274cb0ee652d9457fbb0f3872d43155a6bc16f77bd5749d8826b53db443b1b278ffffffff01905f0100000000001976a914ff9a05654150fdc92b1655f49d7f2a8aaf6a3a2a88ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/signPPC',
    };
};

const notEnoughFunds = (): SubtestSignTransaction => {
    // See tx 915340ecc7466d287596f1f5b1fa0c1fa78c5b76ede0dff978fd6a1ca31eee24
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Peercoin',
            timestamp: 1573218223,
            inputs: [
                {
                    address_n: [2147483692, 2147483654, 2147483648, 0, 0],
                    prev_hash: '41b29ad615d8eea40a4654a052d18bb10cd08f203c351f4d241f88b031357d3d',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address_n: [2147483692, 2147483654, 2147483648, 0, 1],
                    amount: '900000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
            // since Peercoin doesn't have blockbook v2 implemented
            // https://blockbook.peercoin.net/tx/41b29ad615d8eea40a4654a052d18bb10cd08f203c351f4d241f88b031357d3d
            refTxs: [
                {
                    hash: '41b29ad615d8eea40a4654a052d18bb10cd08f203c351f4d241f88b031357d3d',
                    inputs: [
                        {
                            prev_hash: '67abe6288fdec766e106a46125727eb7c608266950746fc10d1d1c69645f68af',
                            prev_index: 0,
                            script_sig: '473044022052748f479c41b432352772ef7aa4b090e4f8df8d589aaea5cfc3dbef237a3935022012f53265e223c3cce6348306d7085b0538b68a52dbd99b0035a01b5bb2a8e50a0121038fa1b058febedda1a414ccb39f55ac09dd832e5c2e5af9b14ff49ea9d520b9fe',
                            sequence: 4294967295,
                        },
                    ],
                    bin_outputs: [
                        {
                            amount: '100000',
                            script_pubkey: '76a914d68a96304b1fb73aadfea0f44c17061f5e353e1b88ac',
                        },
                        {
                            amount: '695400',
                            script_pubkey: '76a91460223495a70ca30abcee5b93687d5fa88fa5d4ec88ac',
                        },
                    ],
                    version: 1,
                    timestamp: 1573209046,
                    lock_time: 0,
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                code: 'Failure_NotEnoughFunds',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/notEnoughFunds',
    };
};

export const signTransactionPeercoin = (): TestFunction => {
    return {
        testName: 'SignTransactionPeercoin',
        mnemonic: 'mnemonic_all',
        subtests: {
            signPPC,
            notEnoughFunds,
        },
    };
};
