export default {
    method: 'ethereumGetAddress',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: "m/44'/60'/1",
            params: {
                path: "m/44'/60'/1",
            },
            result: {
                address: '0xeD46C856D0c79661cF7d40FFE0C0C5077c00E898',
            },
        },
        {
            description: "m/44'/60'/0/1'",
            params: {
                path: "m/44'/60'/0/1'",
            },
            result: {
                address: '0x6682Fa7F3eC58581b1e576268b5463B4b5c93839',
            }
        },
        {
            description: "m/44'/60'/0'/9'/0",
            params: {
                path: "m/44'/60'/0'/9'/0",
            },
            result: {
                address: '0x2cffCE5B7DA9584caD519EFc4715425b630CEF3a',
            },
        },
        {
            description: "m/44'/160'/0'/0/0",
            params: {
                path: "m/44'/160'/0'/0/0",
            },
            result: false,
        },
        {
            description: "m/44'/199'/0'/0/9999",
            params: {
                path: "m/44'/199'/0'/0/9999",
            },
            result: false,
        },
    ],
};
