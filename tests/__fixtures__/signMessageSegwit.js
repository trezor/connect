// todo: needs attention in review

export default {
    method: 'signMessage',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'sign btc mainnet',
            params: {
                coin: 'Bitcoin',
                path: "m/49'/0'/0'",
                message: 'This is an example of a signed message.',
                hex: true,
            },
            result: {
                address: '3Pm1J6dXuugmkTgM5PdidR9UssSWwdy5Vh',
                signature: 'I9LMGylG9AO5rMcacNOrjT7XV1pNj+kTEP8qe7aCRqgbdzMeQkW5Fjo5iSXHhJfC2qO7tIL8Ggt8AlUGjnn0Cmc=',
            },
        },
        {
            description: 'sign long',
            params: {
                coin: 'Bitcoin',
                path: "m/49'/0'/0'",
                message: 'VeryLongMessage!'.repeat(64),
            },
            result: {
                address: '3Pm1J6dXuugmkTgM5PdidR9UssSWwdy5Vh',
                signature: "JD4v/Hc2xKSTiWls06AcRUN2Om/O96LxpanryPu6XG+aWZKPOmEVeeC5Vt1t86bcOBXIFAL58ufP4c5Tyscah4Y=",
            },
        },
    ],
};
