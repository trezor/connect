export default {
    method: 'getAddress',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'Bitcoin bech32 first address',
            params: {
                path: "m/84'/0'/0'/0/0",
                coin: 'btc',
            },
            result: {
                address: 'bc1qkkr2uvry034tsj4p52za2pg42ug4pxg5qfxyfa',
            },
        },
        {
            description: 'Bitcoin p2sh first address',
            params: {
                path: "m/49'/0'/0'/0/0",
                coin: 'btc',
            },
            result: {
                address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
            },
        },
        {
            description: 'Bitcoin p2sh first address (path as array)',
            params: {
                path: [2147483697, 2147483648, 2147483648, 0, 0],
                coin: 'Bitcoin',
            },
            result: {
                address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
            },
        },
        {
            description: 'Bitcoin p2sh first change address',
            params: {
                path: "m/49'/0'/0'/1/0",
                coin: 'btc',
            },
            result: {
                address: '3DDuECA7AomS7GSf5G2NAF6djKEqF2qma5',
            },
        },
        {
            description: 'Bitcoin p2pkh first address',
            params: {
                path: "m/44'/0'/0'/0/0",
                coin: 'btc',
            },
            result: {
                address: '1FH6ehAd5ZFXCM1cLGzHxK1s4dGdq1JusM',
            },
        },
        {
            description: 'Litecoin p2sh first address',
            params: {
                path: "m/49'/2'/0'/0/0",
                coin: 'ltc',
            },
            result: {
                address: 'MFoQRU1KQq365Sy3cXhix3ygycEU4YWB1V',
            },
        },
        {
            description: 'Testnet p2sh first address',
            params: {
                path: "m/49'/1'/0'/0/0",
                coin: 'tbtc',
            },
            result: {
                address: '2N4dH9yn4eYnnjHTYpN9xDmuMRS2k1AHWd8',
            },
        },
        {
            description: 'Bitcoin Cash first address',
            params: {
                path: "m/44'/145'/0'/0/0",
                coin: 'bcash',
            },
            result: {
                address: 'bitcoincash:qzqxk2q6rhy3j9fnnc00m08g4n5dm827xv2dmtjzzp',
            },
        },
    ],
};
