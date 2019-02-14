/* @flow */

import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestLiskVerifyMessagePayload,
    ExpectedLiskVerifyMessageResponse,
} from 'flowtype/tests/lisk-verify-message';

export const liskVerifyMessage = (): TestFunction => {
    const testPayloads: Array<TestLiskVerifyMessagePayload> = [
        {
            method: 'liskVerifyMessage',
            publicKey: 'a129381c1c077f9d8cb70ac48dcbbf3535bd4d5767dc363438e95fb9f1211704',
            signature: 'c613109d013d9583ba7ef66af2a136f7ece710307a0293674976cc2bf36bdcd0c06f4eb92369bb8ed52c02efdb80474273de51055632c488eb8affb5a71e1e00',
            message: 'Test message to sign',
        },
        {
            method: 'liskVerifyMessage',
            publicKey: 'fd697bbc54db919215ac9c527a4996256f29952cc209fb4e550c530d891aabf1',
            signature: '8964d245b50b975fc665eab5fbecb2fc2ddf8ce0e3dcfffe9de73906c1ce575f47e6b9686b1b32628e88de22785ba688309d8aefb15ceb2e820cd10fa667bd0f',
            message: 'Another Test message to sign',
        },
    ];

    const expectedResponses: Array<ExpectedLiskVerifyMessageResponse> = [
        { success: true },
        { success: true },
    ];

    const testName = 'LiskVerifyMessage';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
