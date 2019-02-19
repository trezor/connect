/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestEthereumGetAddressPayload,
    ExpectedEthereumGetAddressResponse,
} from 'flowtype/tests/ethereum-get-address';

export const ethereumGetPublicKey = (): TestFunction => {
    const testPayloads: Array<TestEthereumGetAddressPayload> = [
        {
            method: 'ethereumGetPublicKey',
            path: "m/44'/60'/0'",
        },
        {
            method: 'ethereumGetPublicKey',
            path: "m/44'/60'/0'/0",
        },
        {
            method: 'ethereumGetPublicKey',
            path: "m/44'/60'/0'/0/0",
        },
    ];
    const expectedResponses: Array<ExpectedEthereumGetAddressResponse> = [
        {
            payload: {
                xpub: 'xpub6D54vV8eUYHMVBZCnz4SLjuiQngXURVCGKKGoJrWUDRegdMByLTJKfRs64q3UKiQCsSHJPtCQehTvERczdghS7gb8oedWSyNDtBU1zYDJtb',
            },
        },
        {
            payload: {
                xpub: 'xpub6Ef8Pj4PmrkTkobADTAMrh9pejCJ3uQUBbBmCemKACT84p8SvsnkcwXb6pgeuYEseAwGkk7xuPmZt6oYnSFLrxvaBpCxjY4Jsg3zU1nuS41',
            },
        },
        {
            payload: {
                xpub: 'xpub6GBpXvAiKQnvjHgC5qSoM3mJs4BGaRHeq8AYUf3bTyEyNx1fwhrDaX17wSwTzyjrbz2N85RLeJZqVsEJtGhsXZNJT7yMZ4mEs5T41jhg8U7',
            },
        },
    ];

    return {
        testName: 'EthereumGetAddress',
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
