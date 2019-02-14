/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestRippleSignTransactionPayload,
    ExpectedRippleSignTransactionResponse,
} from 'flowtype/tests/ripple-sign-transaction';

export const rippleSignTransaction = (): TestFunction => {
    const testPayloads: Array<TestRippleSignTransactionPayload> = [
        {
            method: 'rippleSignTransaction',
            path: "m/44'/144'/0'/0/0",
            transaction: {
                fee: '100000',
                flags: 0x80000000,
                sequence: 25,
                payment: {
                    amount: '100000000',
                    destination: 'rBKz5MC2iXdoS3XgnNSYmF69K1Yo4NS3Ws',
                },
            },
        },
        {
            method: 'rippleSignTransaction',
            path: "m/44'/144'/0'/0/2",
            transaction: {
                fee: '10',
                sequence: 1,
                payment: {
                    amount: '1',
                    destination: 'rNaqKtKrMSwpwZSzRckPf7S96DkimjkF4H',
                },
            },
        },
        {
            method: 'rippleSignTransaction',
            path: "m/44'/144'/0'/0/2",
            transaction: {
                fee: '1',
                flags: 1,
                sequence: 1,
                payment: {
                    amount: '1',
                    destination: 'rNaqKtKrMSwpwZSzRckPf7S96DkimjkF4H',
                },
            },
        },
    ];

    const expectedResponses: Array<ExpectedRippleSignTransactionResponse> = [
        {
            payload: {
                signature: '304402200ca685c17bfdc88bcf3b256d6a1b9ac10144459619c2b3ced0124e3549608909022036282a5bb8330d8e8d8b798d8c13582ff7284876e32974c87e9ecd9aa4a53d4d',
                serializedTx: '12000022800000002400000019614000000005f5e1006840000000000186a073210382acb77117eae7d1d3406f83c7f353d30129bad7f59d8518f68f22d1d69a376e7446304402200ca685c17bfdc88bcf3b256d6a1b9ac10144459619c2b3ced0124e3549608909022036282a5bb8330d8e8d8b798d8c13582ff7284876e32974c87e9ecd9aa4a53d4d811428c4348871a02d480ffdf2f192110185db13cfd983147148ebebf7304ccdf1676fefcf9734cf1e780826',
            },
        },
        {
            payload: {
                signature: '3045022100cdc10a493081e7000c416462e07cbfa728640597ebd1b8e7ccc12c82b0b55bc50220235d8b2413a8ae9087654f930c54b2d0a270c4a384ea63bbc97ee31afa67ded9',
                serializedTx: '1200002280000000240000000161400000000000000168400000000000000a732103503d63adead5038efde53ee6d00e091f68d80095eb65af7a2fdc98e4bc074ae474473045022100cdc10a493081e7000c416462e07cbfa728640597ebd1b8e7ccc12c82b0b55bc50220235d8b2413a8ae9087654f930c54b2d0a270c4a384ea63bbc97ee31afa67ded98114f2020b0923eb870997c3c6b914a36304ce91359183148fb40e1ffa5d557ce9851a535af94965e0dd0988',
            },
        },
        {
            payload: {
                signature: '304402205cc716cd6a3af8f525faff914e737f811a38112ad948676ee260cc0436b72cce02207fba07bf5c4b79680c0ab08b6b4e643a1097c2df8cbf50fd1768c772f73e3138',
                serializedTx: '12000022800000002400000064201b00051537614000000005f5e109684000000000000064732103503d63adead5038efde53ee6d00e091f68d80095eb65af7a2fdc98e4bc074ae47446304402205cc716cd6a3af8f525faff914e737f811a38112ad948676ee260cc0436b72cce02207fba07bf5c4b79680c0ab08b6b4e643a1097c2df8cbf50fd1768c772f73e31388114f2020b0923eb870997c3c6b914a36304ce91359183148fb40e1ffa5d557ce9851a535af94965e0dd0988',
            },
        },
        { success: false },
    ];

    const testName = 'RippleSignTransaction';
    return {
        testName,
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
