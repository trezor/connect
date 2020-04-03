export default {
    method: 'eosGetPublicKey',
    setup: {
        mnemonic: 'mnemonic_abandon',
    },
    tests: [
        {
            description: "m/44'/194'/0'/0/0",
            params: {
                path: "m/44'/194'/0'/0/0",
            },
            result: {
                wifPublicKey: 'EOS6zpSNY1YoLxNt2VsvJjoDfBueU6xC1M1ERJw1UoekL1NHn8KNA',
                rawPublicKey: '0315c358024ce46767102578947584c4342a6982b922d454f63588effa34597197',
            },
        },
        {
            description: "[2147483692, 2147483842, 2147483648, 0, 1]",
            params: {
                path: [2147483692, 2147483842, 2147483648, 0, 1],
            },
            result: {
                wifPublicKey: 'EOS62cPUiWnLqbUjiBMxbEU4pm4Hp5X3RGk4KMTadvZNygjX72yHW',
                rawPublicKey: '029622eff7248c4d298fe28f2df19ee0d5f7674f678844e05c31d1a5632412869e',
            },
        },
        {
            description: "m/44'/194'",
            params: {
                path: "m/44'/194'",
            },
        },
        {
            description: "[-1]",
            params: {
                path: [-1],
            }
        },
        {
            description: "m/44'/194'/0'/0/0'",
            params: {
                bundle: [
                    { path: "m/44'/194'/0'/0/0" },
                    { path: "m/44'/194'/0'/0/1" },
                    { path: "m/44'/194'/0'/0/0'" },
                ],
            },
            result: [
                {
                    wifPublicKey: 'EOS6zpSNY1YoLxNt2VsvJjoDfBueU6xC1M1ERJw1UoekL1NHn8KNA',
                    rawPublicKey: '0315c358024ce46767102578947584c4342a6982b922d454f63588effa34597197',
                },
                {
                    wifPublicKey: 'EOS62cPUiWnLqbUjiBMxbEU4pm4Hp5X3RGk4KMTadvZNygjX72yHW',
                    rawPublicKey: '029622eff7248c4d298fe28f2df19ee0d5f7674f678844e05c31d1a5632412869e',
                },
                {
                    wifPublicKey: 'EOS7n7TXwR4Y3DtPt2ji6akhQi5uw4SruuPArvoNJso84vhwPQt1G',
                    rawPublicKey: '037c9b7d24d42589941cca3f4debc75b37c0e7b881e6eb00d2e674958debe3bbc3',
                },
            ],
        },
    ],
};
