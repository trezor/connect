export default {
    method: 'rippleGetAddress',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'first account',
            params: {
                path: "m/44'/144'/0'/0/0",
            },
            result: {
                address: 'rh5ZnEVySAy7oGd3nebT3wrohGDrsNS83E',
            },
        },
        {
            description: 'second account',
            params: {
                path: "m/44'/144'/1'/0/0",
            },
            result: {
                address: 'rEpwmtmvx8gkMhX5NLdU3vutQt7dor4MZm',
            },
        },
        {
            description: 'Forbidden key path',
            params: {
                path: "m/44'/0'/1'",
            },
            result: false,
        },
    ],
};
