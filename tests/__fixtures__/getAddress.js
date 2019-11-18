export default [
    {
        description: 'Bitcoin first address',
        params: {
            path: "m/49'/0'/0'/0/0",
            coin: 'btc',
        },
        result: {
            address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
        },
    },
    {
        description: 'Bitcoin first address (path as array)',
        params: {
            path: [2147483697, 2147483648, 2147483648, 0, 0],
            coin: 'Bitcoin',
        },
        result: {
            address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
        },
    },
    {
        description: 'Litecoin first address',
        params: {
            path: "m/49'/2'/0'/0/0",
            coin: 'ltc',
        },
        result: {
            address: 'MFoQRU1KQq365Sy3cXhix3ygycEU4YWB1V',
        },
    },
    {
        description: 'Litecoin first address (path as array)',
        params: {
            path: [2147483697, 2147483650, 2147483648, 0, 0],
            coin: 'Litecoin',
        },
        result: {
            address: 'MFoQRU1KQq365Sy3cXhix3ygycEU4YWB1V',
        },
    },
    {
        description: 'Testnet first address',
        params: {
            path: "m/49'/1'/0'/0/0",
            coin: 'tbtc',
        },
        result: {
            address: '2N4dH9yn4eYnnjHTYpN9xDmuMRS2k1AHWd8',
        },
    },
    {
        description: 'Testnet first address (path as array)',
        params: {
            path: [2147483697, 2147483649, 2147483648, 0, 0],
            coin: 'Testnet',
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
    {
        description: 'Bitcoin Cash first address (path as array)',
        params: {
            path: [2147483692, 2147483793, 2147483648, 0, 0],
            coin: 'bch',
        },
        result: {
            address: 'bitcoincash:qzqxk2q6rhy3j9fnnc00m08g4n5dm827xv2dmtjzzp',
        },
    },
];
