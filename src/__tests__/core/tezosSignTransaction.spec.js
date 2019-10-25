/* @flow */
import type {
    TestFunction,
    SubtestTezosSignTransaction,
} from 'flowtype/tests';

import type {
    TestTezosSignTransactionPayload,
    ExpectedTezosSignTransactionResponse,
} from 'flowtype/tests/tezos-sign-transaction';

const transaction = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/10'",
            branch: 'BLGUkzwvguFu8ei8eLW3KgCbdtrMmv1UCqMvUpHHTGq1UPxypHS',
            operation: {
                transaction: {
                    source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    destination: 'tz1Kef7BSg6fo75jk37WkKRYSnJDs69KVqt9',
                    counter: 297,
                    amount: 200000,
                    fee: 10000,
                    gas_limit: 44825,
                    storage_limit: 0,
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigu2eT5jqaio9U4CZfcnig5AZSLQDWHJsxt58atyL91gEfVZVQLpWjcVydRTHW4WggePXZXufyCe7N81Knre7AMUTnKHo4d6',
                sig_op_contents: '491b6da2b640be1f13f696e0a187f91f30e8608bbcf28c44ae96d1929410ecff6c005f450441f41ee11eee78a31d1e1e55627c783bd6904ea90299de0200c09a0c0000001e65c88ae6317cd62a638c8abd1e71c83c847500dc6fe56edb83c648813cdc6a0b7e7924d75f9fcd0032ef50e53814be0492da185e97028f604e0b135c1f5220efcb054c8036a8c8f84b49b38cc5483428a6ee02',
                operation_hash: 'ooBrdKQf1u2Ut7vRPe7k2NSLppcsJx3jLj2boFJdPhvShfRdPQ9',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/transaction',
    };
};

const revealAndTransaction = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/1'",
            branch: 'BMagKRHKSx5nfDgVFtSd8UtaUDhVXHxjxspfkAzHW7esUv44tNU',
            operation: {
                reveal: {
                    source: 'tz1ekQapZCX4AXxTJhJZhroDKDYLHDHegvm1',
                    counter: 575424,
                    fee: 10000,
                    gas_limit: 20000,
                    storage_limit: 0,
                    public_key: 'edpkuTPqWjcApwyD3VdJhviKM5C13zGk8c4m87crgFarQboF3Mp56f',
                },
                transaction: {
                    source: 'tz1ekQapZCX4AXxTJhJZhroDKDYLHDHegvm1',
                    destination: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    counter: 575425,
                    amount: 100000,
                    fee: 10000,
                    gas_limit: 20000,
                    storage_limit: 0,
                }
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigu1CLfKgV7v3bGcUkWuATevw41EuR9ijJpZzirntww64biqtyXEZsb4yuZsi2K6QSV8235HUpJ8LUwgJ5DdbXYdBicHFmpx',
                sig_op_contents: 'f620803bd17e2343a21006c93538305eb52f789159232006cf449bc0ccee70426b00d19f28e14d94840e6c1cba6afd0b62fddfe9bf3d904ec08f23a09c0100006b1b598dee2b666881463910da4eff87f6f97f0743b13fa7ca03346f3b3186dc6c00d19f28e14d94840e6c1cba6afd0b62fddfe9bf3d904ec18f23a09c0100a08d0600005f450441f41ee11eee78a31d1e1e55627c783bd600d15a3b6d111bcdd6e10ee06afda2e3fea8d226ad583bb68228fa42e404fa1f211aa6621e87153ffde24b1235c4444e41ddab3f39f725dab935299d3dc2029304',
                operation_hash: 'ontPttpmB88RSAdVUR2iTwyM4XW73PzNbaY1Q29Eu55rJnBcDf5',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/revealAndTransaction',
    };
};

const origination = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/10'",
            branch: 'BLCDAUzkxjRdspTRSdpYmJia4AzEh3NHeRMPLce4MdzkNczXa1u',
            operation: {
                origination: {
                    source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    balance: 100000,
                    fee: 20000,
                    counter: 298,
                    gas_limit: 20000,
                    storage_limit: 10000,
                    script: "0000001c02000000170500036805010368050202000000080316053d036d03420000000a010000000568656c6c6f",
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtfSgPbV5EY1ejjxWvHsd8fNwBDqoBmnDQcuxPL21WLMAYtgKM1SmGTfWEPzPzn4eGM5LgXhawf4ittEDTEPbCeK2FdxZ4t',
                sig_op_contents: '3f6a04127fd5a7162959df5c4c2b5245117c2af2f405c924383ad5dcd0974ae26d005f450441f41ee11eee78a31d1e1e55627c783bd6a09c01aa02a09c01904ea08d06000000001c02000000170500036805010368050202000000080316053d036d03420000000a010000000568656c6c6f3a5ed13909506adbeffdb45adaa6ef551b2fbcfde65129c52173a046c146ae5518b422ff19f8462b0bd4b7543f2cc146bf30c5bcbcbcafb7fc802136abbfa40b',
                operation_hash: 'op481NA9zX8EogNKAZ57oi3CG9XB77Kb7SRPqaSUYB7DRWmCx4n',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/origination',
    };
};

const delegation = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/0'",
            branch: 'BKsApUkwpYVY54sJXjxQtF6RG42LXsWDBE7DU4JgH4fSdWz8RCT',
            operation: {
                delegation: {
                    source: 'tz1Kef7BSg6fo75jk37WkKRYSnJDs69KVqt9',
                    delegate: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    fee: 20000,
                    counter: 564565,
                    gas_limit: 20000,
                    storage_limit: 0,
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtvcVmjMrUbe6ZoCGNUP5qDazDpz5GSt8vSvPgmJSdUVJzWAMEPWdx6Q3XvJFwHcGX1hC34yxs2g6WvTVZjMhihg9tDBTUz',
                sig_op_contents: '142e354adf03cc7e81248c8accba513e9aa34edbc07e1220aae746430144e15d6e00001e65c88ae6317cd62a638c8abd1e71c83c8475a09c01d5ba22a09c0100ff005f450441f41ee11eee78a31d1e1e55627c783bd6ae516c284bbd7a00ebc79081d506ef545cc5999e14c812344100a3bbfcfd80ef2aba01600deb657653b9e0596836aaeac6a6e7b71c4d24b14cc14aa0187f3d01',
                operation_hash: 'ooQrBdtQNj5sZVnrnr89cVs9aPuaAGMHwtfMzmkJzWtNQthdwKY',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/delegation',
    };
};

const managerDelegation = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/10'",
            branch: 'BMdPMLXNyMTDp4vR6g7y8mWPk7KZbjoXH3gyWD1Tze43UE3BaPm',
            operation: {
                transaction: {
                    source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    destination: 'KT1SBj7e8ZhV2VvJtoc73dNRDLRJ9P6VjuVN',
                    counter: 292,
                    amount: 0,
                    fee: 10000,
                    gas_limit: 36283,
                    storage_limit: 0,
                    parameters_manager: {
                        set_delegate: "tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo"
                    }
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigu6uVsynCkPqbCPzzMr1goiiRA8QwxXZzrkNoi2FV4qP8hzokUc8LMUF7UdQ5LLwn3kHbktFBM42TBKAGsp1EFLuFPdwZHx',
                sig_op_contents: 'fc464b9936baf47710d2ab51eea4f13b7315f09f5b21e994fab897adf74e1dbd6c005f450441f41ee11eee78a31d1e1e55627c783bd6904ea402bb9b02000001c116a6c74bf00a5839b593838215fe1fcf2db59c00ff020000002f020000002a0320053d036d0743035d0a00000015005f450441f41ee11eee78a31d1e1e55627c783bd60346034e031bfcfe9fe160bb2735be9544a19dba7e738695a12aedcc231f547a5477b12dbcca39b94d62b7ba45efd966b64ce1b0a5a2e3486dc545ebfb817699701707b9af09',
                operation_hash: 'ooJr4VSmE39SarkGidLcrVpXckno7GwHqCcoVuNhRAbSe4B5PSF',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/managerDelegation',
    };
};

const managerCancelDelegation = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/10'",
            branch: 'BL6oaFJeEjtYxafJqEL8hXvSCZmM5d4quyAqjzkBhXvrX97JbQs',
            operation: {
                transaction: {
                    source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    destination: 'KT1SBj7e8ZhV2VvJtoc73dNRDLRJ9P6VjuVN',
                    counter: 293,
                    amount: 0,
                    fee: 10000,
                    gas_limit: 36283,
                    storage_limit: 0,
                    parameters_manager: {
                        cancel_delegate: true,
                    }
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtoPT2yADM2vttD7P17KRs7z23x5tuvZTnX8xmZG5yVb5PeeMQeN5mRxWy7Rzdu39CUZHnYcM75GDVg7gViYgab8YxooW5a',
                sig_op_contents: '3323323b395af6d3bb07c8042224d99c998ace60385fe2ecca8fecd43db01da56c005f450441f41ee11eee78a31d1e1e55627c783bd6904ea502bb9b02000001c116a6c74bf00a5839b593838215fe1fcf2db59c00ff0200000013020000000e0320053d036d053e035d034e031b7717ebf716361f2e44f7c54e03c7d4a5d4e681c8cabf10ec7e6e019334fe684b30ae649d8c5112e4bc51ca68c9eee4897d44d75e5cab44b9726d6f13586d3f0e',
                operation_hash: 'ooxjKGV6TNPdZsusxxetWt4K9XLbxSpRFUb39vD2uC7nMnwxmYt',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/managerCancelDelegation',
    };
};

const managerTransferToImplicit = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/10'",
            branch: 'BMCKRpEsFYQTdZy8BSLuFqkHmxwXrnRpKncdoVMbeGoggLG3bND',
            operation: {
                transaction: {
                    source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    destination: 'KT1SBj7e8ZhV2VvJtoc73dNRDLRJ9P6VjuVN',
                    counter: 294,
                    amount: 0,
                    fee: 10000,
                    gas_limit: 36283,
                    storage_limit: 0,
                    parameters_manager: {
                        transfer: {
                            amount: 200,
                            destination: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo'
                        }
                    }
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtbNN5Upt3yLdKn1P1hTWmfzSDVbybfdPn36j9vGQuxDa925D8pXwN3fBCSiYiacfby71E2y1CQVs9A95twKzLC4ssQsjhB',
                sig_op_contents: 'c35aff75e0600ed1cd73e488dbd547ad2466ae1bc5e6aebb688186505b0002af6c005f450441f41ee11eee78a31d1e1e55627c783bd6904ea602bb9b02000001c116a6c74bf00a5839b593838215fe1fcf2db59c00ff020000003802000000330320053d036d0743035d0a00000015005f450441f41ee11eee78a31d1e1e55627c783bd6031e0743036a008803034f034d031b1b3a2c89d3f11fddee752e088b05c32c7e5b4b2b9da90f957a3dda7e5cc35e981cd649918922bb5e217bd66b8cdcd6215292ad0e099c0aa12a5a3dcd93de6702',
                operation_hash: 'oo2CHrPX7qrEpmt7bCg83Fvq3EPZejuxDc8TfB8yXfH9kvVBba8',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/managerTransferToImplicit',
    };
};

const managerTransferToContract = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/10'",
            branch: 'BLvWRWsvoG26oPe8U4QTdkXfoWCMh5cmahFFtf1WrijPwRYn5hK',
            operation: {
                transaction: {
                    source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    destination: 'KT1SBj7e8ZhV2VvJtoc73dNRDLRJ9P6VjuVN',
                    counter: 296,
                    amount: 0,
                    fee: 10000,
                    gas_limit: 44825,
                    storage_limit: 0,
                    parameters_manager: {
                        transfer: {
                            amount: 200,
                            destination: 'KT1MJSg8YrnjSewrWGYL3e8XfqtLAG5WU4Hg'
                        }
                    }
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtchYBQ76wvbvyfdk4DPaiccaHAxrzQFQU8riMcnfu7bjJNKDVayc12N1TpcZ4hHL9SzuqHyurg8mQy7FYffQ6UvA2TcSs5',
                sig_op_contents: '9f74b83fc9b912cbbda61b62cf33f21c9956636c8f6469b75f7ef2ceef6a2c366c005f450441f41ee11eee78a31d1e1e55627c783bd6904ea80299de02000001c116a6c74bf00a5839b593838215fe1fcf2db59c00ff020000005502000000500320053d036d0743036e0a00000016018b83360512c6045c1185f8000de41302e23a220c000555036c0200000015072f02000000090200000004034f032702000000000743036a008803034f034d031b2565d189183f49d328b1cf20b7edc493c4406e4a209139d8af153c9e3cc0fc11e025270f137691f182f98058ee2fec0e3795633a0e98e0a7d196ea599b6e7207',
                operation_hash: 'op7eo4zVfPV5fQL7g8MUWAAp9QPxgZHcTDVgofCFhWeqqZEihyK',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/managerTransferToContract',
    };
};

export const tezosSignTransaction = (): TestFunction => {
    const availableSubtests = {
        transaction,
        revealAndTransaction,
        origination,
        delegation,
        managerCancelDelegation,
        managerDelegation,
        managerTransferToContract,
        managerTransferToImplicit,
    };

    const testName = 'TezosSignTransaction';

    return {
        testName,
        mnemonic: 'mnemonic_all',
        subtests: {
            ...availableSubtests,
        },
    };
};
