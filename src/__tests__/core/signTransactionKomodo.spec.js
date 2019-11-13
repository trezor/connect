/* @flow */
import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';
import type {
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const feeSapling = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'kmd',
            version: 4,
            overwintered: true,
            versionGroupId: 2301567109,
            branchId: 1991772603,
            locktime: 1563046072,
            inputs: [
                {
                    address_n: [2147483692, 2147483789, 2147483648, 0, 0],
                    prev_hash: '2807c5b126ec8e2b078cab0f12e4c8b4ce1d7724905f8ebef8dca26b0c8e0f1d',
                    prev_index: 0,
                    amount: '1099980000',
                },
            ],
            outputs: [
                {
                    address: 'R9HgJZo6JBKmPvhm7whLSR8wiHyZrEDVRi',
                    amount: '1099970000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
            refTxs: [
                {
                    hash: '2807c5b126ec8e2b078cab0f12e4c8b4ce1d7724905f8ebef8dca26b0c8e0f1d',
                    inputs: [
                        {
                            prev_hash: '340d478f0c5750057d5f5028db8c10993578849e63f5cf8500e33ddefcd5334f',
                            prev_index: 0,
                            script_sig: '483045022100d29433faed373d23883ace59acda117a67d6e8e3e99bc767b96a183a840b4aec0220258baef0d63360324f2a455299b2695ae2fa727a5969a25a604c22086e36c6e9012102a87aef7b1a8f676e452d6240767699719cd58b0261c822472c25df146938bca5',
                            sequence: 4294967295,
                        },
                    ],
                    bin_outputs: [
                        {
                            amount: '1099980000',
                            script_pubkey: '76a91400178fa0b6fc253a3a402ee2cadd8a7bfec08f6388ac',
                        },
                    ],
                    version: 4,
                    version_group_id: 2301567109,
                    lock_time: 0,
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0400008085202f89011d0f8e0c6ba2dcf8be8e5f9024771dceb4c8e4120fab8c072b8eec26b1c50728000000006a4730440220158c970ca2fc6bcc33026eb5366f0342f63b35d178f7efb334b1df78fe90b67202207bc4ff69f67cf843b08564a5adc77bf5593e28ab4d5104911824ac13fe885d8f012102a87aef7b1a8f676e452d6240767699719cd58b0261c822472c25df146938bca5ffffffff01d0359041000000001976a91400178fa0b6fc253a3a402ee2cadd8a7bfec08f6388acb8302a5d000000000000000000000000000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/feeSapling',
    };
};

const rewardsClaim = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'kmd',
            version: 4,
            overwintered: true,
            versionGroupId: 0x892F2085,
            branchId: 0x76B809BB,
            locktime: 0x5D2AF1F2,
            inputs: [
                {
                    address_n: [2147483692, 2147483789, 2147483648, 0, 0],
                    prev_hash: '7b28bd91119e9776f0d4ebd80e570165818a829bbf4477cd1afe5149dbcd34b1',
                    prev_index: 0,
                    amount: '1099970000',
                },
            ],
            outputs: [
                {
                    address: 'R9HgJZo6JBKmPvhm7whLSR8wiHyZrEDVRi',
                    amount: '1099960000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: 'R9HgJZo6JBKmPvhm7whLSR8wiHyZrEDVRi',
                    amount: '79605',
                    script_type: 'PAYTOADDRESS',
                },
            ],
            refTxs: [
                {
                    hash: '7b28bd91119e9776f0d4ebd80e570165818a829bbf4477cd1afe5149dbcd34b1',
                    inputs: [
                        {
                            prev_hash: '2807c5b126ec8e2b078cab0f12e4c8b4ce1d7724905f8ebef8dca26b0c8e0f1d',
                            prev_index: 0,
                            script_sig: '4730440220158c970ca2fc6bcc33026eb5366f0342f63b35d178f7efb334b1df78fe90b67202207bc4ff69f67cf843b08564a5adc77bf5593e28ab4d5104911824ac13fe885d8f012102a87aef7b1a8f676e452d6240767699719cd58b0261c822472c25df146938bca5',
                            sequence: 4294967295,
                        },
                    ],
                    bin_outputs: [
                        {
                            amount: '1099980000',
                            script_pubkey: '76a91400178fa0b6fc253a3a402ee2cadd8a7bfec08f6388ac',
                        },
                    ],
                    version: 4,
                    version_group_id: 2301567109,
                    lock_time: 0,
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0400008085202f8901b134cddb4951fe1acd7744bf9b828a816501570ed8ebd4f076979e1191bd287b000000006a4730440220483a58f5be3a147c773c663008c992a7fcea4d03bdf4c1d4bc0535c0d98ddf0602207b19d69140dd00c7a94f048c712aeaed55dfd27f581c7212d9cc5e476fe1dc9f012102a87aef7b1a8f676e452d6240767699719cd58b0261c822472c25df146938bca5ffffffff02c00e9041000000001976a91400178fa0b6fc253a3a402ee2cadd8a7bfec08f6388acf5360100000000001976a91400178fa0b6fc253a3a402ee2cadd8a7bfec08f6388acf2f12a5d000000000000000000000000000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/rewardsClaim',
    };
};

export const signTransactionKomodo = (): TestFunction => {
    return {
        testName: 'SignTransactionKomodo',
        mnemonic: 'mnemonic_all',
        subtests: {
            feeSapling,
            rewardsClaim,
        },
    };
};
