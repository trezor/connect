/* @flow */
import type { RippleGetAddress } from '../../js/types';

export const rippleGetAddress = () => {
    const testPayloads: RippleGetAddress[] = [
        {
            method: 'rippleGetAddress',
            path: "m/44'/144'/0'/0/0",
        },
        {
            method: 'rippleGetAddress',
            path: "m/44'/144'/0'/0/1",
        },
        {
            method: 'rippleGetAddress',
            path: "m/44'/144'/1'/0/0",
        },
    ];
    const expectedResponses = [
        {
            payload: {
                address: 'rh5ZnEVySAy7oGd3nebT3wrohGDrsNS83E',
            },
        },
        {
            payload: {
                address: 'rwrZ3agNYYJw4yi6v1r7Ui9AwX9KsWzghr',
            },
        },
        {
            payload: {
                address: 'rEpwmtmvx8gkMhX5NLdU3vutQt7dor4MZm',
            },
        },
    ];

    const testName = 'RippleGetAddress';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
