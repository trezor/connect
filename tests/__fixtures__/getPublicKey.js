export default [
    {
        description: 'Bitcoin first account',
        params: {
            path: "m/49'/0'/0'",
            coin: 'btc',
        },
        result: {
            xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
        },
    },
    {
        description: 'Bitcoin first account (path as array)',
        params: {
            path: [2147483697, 2147483648, 2147483648],
            coin: 'Bitcoin',
        },
        result: {
            xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
        },
    },
    // {
    //     description: 'Invalid path',
    //     params: {
    //         path: [-1],
    //         coin: 'ltc',
    //     },
    //     result: false,
    // },
    // {
    //     description: 'Invalid path (too short)',
    //     params: {
    //         path: [0, 1],
    //         coin: 'Litecoin',
    //     },
    //     result: false,
    // },
];
