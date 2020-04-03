export default {
    method: 'cardanoGetAddress',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: "m/44'/1815'/0'/0/0",
            params: {
                path: "m/44'/1815'/0'/0/0",
            },
            result: {
                address: 'Ae2tdPwUPEZLCq3sFv4wVYxwqjMH2nUzBVt1HFr4v87snYrtYq3d3bq2PUQ',
            },
        },
        // {
        //     description: "m/44'/1815'",
        //     params: {
        //         path: "m/44'/1815'",
        //     },
        //     result: false,
        // },
        {
            description: "m/44'/1815'/0'/0/1",
            params: {
                path: "m/44'/1815'/0'/0/1",
            },
            result: {
                address: 'Ae2tdPwUPEZEY6pVJoyuNNdLp7VbMB7U7qfebeJ7XGunk5Z2eHarkcN1bHK',
            },
        },
        {
            description: "m/44'/1815'/0'/0/2",
            params: {
                path: "m/44'/1815'/0'/0/2",
            },
            result: {
                address: 'Ae2tdPwUPEZ3gZD1QeUHvAqadAV59Zid6NP9VCR9BG5LLAja9YtBUgr6ttK',
            },
        },
    ],
};
