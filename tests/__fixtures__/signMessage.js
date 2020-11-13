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
                path: [0],
                message: 'This is an example of a signed message.',
                hex: true,
            },
            result: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: 'IJ4j7fDk5H/x3sJ/Ms14xQ507wGO6Kat81rhfHqbDdlvSLST/X26sD77b0OcY4PJUjs7vF8afRWKavkKsVTpvoA=',
            },
        },
        {
            description: 'sign btc testnet',
            params: {
                coin: 'Testnet',
                path: "m/49'/1'/0'",
                message: 'This is an example of a signed message.',
                hex: true,
            },
            result: {
                address: '2MtXohfW9QA4VhD1zxViEt7ETNc2NuTDPVA',
                signature: 'I/vI4myVcUm8uITt1THKuRgr95tSI1wvejtp/+dR7pK+IiGf9XbKAEBuNxfcl/OReirWM7/Y8IjfyLmr0KMxFVY=',
            },
        },
        {
            description: 'sign bch mainnet',
            params: {
                coin: 'Bcash',
                path: "m/44'/145'/0'",
                message: 'This is an example of a signed message.',
            },
            result: {
                address: 'bitcoincash:qzhsxlrst79yl6cn9fxahfl6amjn95fufcvsuqscme',
                signature: 'IGxjebM6k9IgwjK8jV0PnauOieOW69aHoMQGVwYLnVU+I5dhLqHfboqo7ATsXlSWxAjigv/QW0KyHaN9gZ43INo=',
            },
        },
        {
            description: 'sign long',
            params: {
                coin: 'Bitcoin',
                path: [0],
                message: 'VeryLongMessage!'.repeat(64),
            },
            result: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: 'IF/3lcKa73U4+LO9suit0NByKtYwoUC2rv1QSlqJXL2GfLsAmBr8UO3QOYIR6NfDBLuO+kYRgbwK+mfqSnIKie0=',
            },
        },
    ],
};
