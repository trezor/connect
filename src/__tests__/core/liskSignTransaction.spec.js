/* @flow */
import type {
    TestFunction,
    SubtestLiskSignTransaction,
} from 'flowtype/tests';
import type {
    TestLiskSignTransactionPayload,
    ExpectedLiskSignTransactionResponse,
} from 'flowtype/tests/lisk-sign-transaction';

const liskSignTxTransfer = (): SubtestLiskSignTransaction => {
    const testPayloads: Array<TestLiskSignTransactionPayload> = [
        {
            method: 'liskSignTransaction',
            path: "m/44'/134'/0'/0'",
            transaction: {
                amount: '10000000',
                recipientId: '9971262264659915921L',
                timestamp: 57525937,
                type: 0,
                fee: '10000000',
                asset: {},
            },
        },
    ];
    const expectedResponses: Array<ExpectedLiskSignTransactionResponse> = [
        {
            payload: {
                signature: 'b62717d581e5713bca60b758b661e6cfa091addc6caedd57534e06cda805943ee80797b9fb9a1e1b2bd584e292d2a7f832a4d1b3f15f00e1ee1b72de7e195a08',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/liskSignTxTransfer',
    };
};

const liskSignTxTransferWithData = (): SubtestLiskSignTransaction => {
    const testPayloads: Array<TestLiskSignTransactionPayload> = [
        {
            method: 'liskSignTransaction',
            path: "m/44'/134'/0'/0'",
            transaction: {
                amount: '10000000',
                recipientId: '9971262264659915921L',
                timestamp: 57525937,
                type: 0,
                fee: '20000000',
                asset: {
                    data: 'Test data',
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedLiskSignTransactionResponse> = [
        {
            payload: {
                signature: '5dd0dbb87ee46f3e985b1ef2df85cb0bec481e8601d150388f73e198cdd57a698eab076c7cd5b281fbb6a83dd3dc64d91a6eccd1614dffd46f101194ffa3a004',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/liskSignTxTransferWithData',
    };
};

const liskSignTxSecondSignature = (): SubtestLiskSignTransaction => {
    const testPayloads: Array<TestLiskSignTransactionPayload> = [
        {
            method: 'liskSignTransaction',
            path: "m/44'/134'/0'/0'",
            transaction: {
                amount: '0',
                timestamp: 57525937,
                type: 1,
                fee: '500000000',
                asset: {
                    signature: {
                        publicKey: '5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
                    },
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedLiskSignTransactionResponse> = [
        {
            payload: {
                signature: 'f02bdc40a7599c21d29db4080ff1ff8934f76eedf5b0c4fa695c8a64af2f0b40a5c4f92db203863eebbbfad8f0611a23f451ed8bb711490234cdfb034728fd01',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/liskSignTxSecondSignature',
    };
};

const liskSignTxDelegateRegistration = (): SubtestLiskSignTransaction => {
    const testPayloads: Array<TestLiskSignTransactionPayload> = [
        {
            method: 'liskSignTransaction',
            path: "m/44'/134'/0'/0'",
            transaction: {
                amount: '0',
                timestamp: 57525937,
                type: 2,
                fee: '2500000000',
                asset: {
                    delegate: {
                        username: 'trezor_t',
                    },
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedLiskSignTransactionResponse> = [
        {
            payload: {
                signature: '5ac02b2882b9d7d0f944e48baadc27de1296cc08c3533f7c8e380fbbb9fb4a6ac81b5dc57060d7d8c68912eea24eb6e39024801bccc0d55020e2052b0c2bb701',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/liskSignTxDelegateRegistration',
    };
};

const liskSignTxCastVotes = (): SubtestLiskSignTransaction => {
    const testPayloads: Array<TestLiskSignTransactionPayload> = [
        {
            method: 'liskSignTransaction',
            path: "m/44'/134'/0'/0'",
            transaction: {
                amount: '0',
                timestamp: 57525937,
                type: 3,
                fee: '100000000',
                asset: {
                    votes: [
                        '+b002f58531c074c7190714523eec08c48db8c7cfc0c943097db1a2e82ed87f84',
                        '-ec111c8ad482445cfe83d811a7edd1f1d2765079c99d7d958cca1354740b7614',
                    ],
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedLiskSignTransactionResponse> = [
        {
            payload: {
                signature: '1d0599a8387edaa4a6d309b8a78accd1ceaff20ff9d87136b01cba0efbcb9781c13dc2b0bab5a1ea4f196d8dcc9dbdbd2d56dbffcc088fc77686b2e2c2fe560f',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/liskSignTxCastVotes',
    };
};

const liskSignTxMultisignature = (): SubtestLiskSignTransaction => {
    const testPayloads: Array<TestLiskSignTransactionPayload> = [
        {
            method: 'liskSignTransaction',
            path: "m/44'/134'/0'/0'",
            transaction: {
                amount: '0',
                timestamp: 57525937,
                type: 4,
                fee: '1500000000',
                asset: {
                    multisignature: {
                        min: 2,
                        lifetime: 5,
                        keysgroup: [
                            '+5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
                            '+922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
                        ],
                    },
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedLiskSignTransactionResponse> = [
        {
            payload: {
                signature: '88923866c2d500a6927715699ab41a0f58ea4b52e552d90e923bc24ac9da240f2328c93f9ce043a1da4937d4b61c7f57c02fc931f9824d06b24731e7be23c506',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/liskSignTxMultisignature',
    };
};

export const liskSignTransaction = (): TestFunction => {
    const testName = 'LiskSignTransaction';
    const availableSubtests = {
        liskSignTxTransfer,
        liskSignTxTransferWithData,
        liskSignTxSecondSignature,
        liskSignTxDelegateRegistration,
        liskSignTxCastVotes,
        liskSignTxMultisignature,
    };

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
