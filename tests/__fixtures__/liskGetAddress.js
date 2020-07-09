export default {
    method: 'liskGetAddress',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: "m/44'/134'/0'",
            params: {
                path: "m/44'/134'/0'",
            },
            result: {
                address: '17563781916205589679L',
            },
        },
        {
            description: "m/44'/134'/0'/1'",
            params: {
                path: "m/44'/134'/0'/1'",
            },
            result: {
                address: '1874186517773691964L',
            }
        },
        {
            description: "m/44'/134'/0'/0'/1'",
            params: {
                path: "m/44'/134'/0'/0'/1'",
            },
            result: {
                address: '10017405670757635096L',
            },
        },
       
    ],
};
