const PROTOCOL_MAGICS = {
    mainnet: 764824073,
    testnet: 42,
};

export default {
    method: 'cardanoGetAddress',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: "Mainnet - m/44'/1815'/0'/0/0",
            params: {
                path: "m/44'/1815'/0'/0/0",
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
            },
            result: {
                address: 'Ae2tdPwUPEZLCq3sFv4wVYxwqjMH2nUzBVt1HFr4v87snYrtYq3d3bq2PUQ',
            },
        },
        {
            description: "Mainnet - m/44'/1815'",
            params: {
                path: "m/44'/1815'",
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
            },
            result: false,
        },
        {
            description: "Mainnet - m/44'/1815'/0'/0/1",
            params: {
                path: "m/44'/1815'/0'/0/1",
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
            },
            result: {
                address: 'Ae2tdPwUPEZEY6pVJoyuNNdLp7VbMB7U7qfebeJ7XGunk5Z2eHarkcN1bHK',
            },
        },
        {
            description: "Mainnet - m/44'/1815'/0'/0/2",
            params: {
                path: "m/44'/1815'/0'/0/2",
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
            },
            result: {
                address: 'Ae2tdPwUPEZ3gZD1QeUHvAqadAV59Zid6NP9VCR9BG5LLAja9YtBUgr6ttK',
            },
        },
        {
            description: "Testnet - m/44'/1815'/0'/0/0",
            params: {
                path: "m/44'/1815'/0'/0/0",
                protocolMagic: PROTOCOL_MAGICS['testnet'],
            },
            result: {
                address: '2657WMsDfac5vydkak9a7BqGrsLqBzB7K3vT55rucZKYDmVnUCf6hXAFkZSTcUx7r',
            },
        },
        {
            description: "Testnet - m/44'/1815'/0'/0/1",
            params: {
                path: "m/44'/1815'/0'/0/1",
                protocolMagic: PROTOCOL_MAGICS['testnet'],
            },
            result: {
                address: '2657WMsDfac61ebUDw53WUX49Dcfya8S8G7iYbhN4nP8JSFuh38T1LuFax1bUnhxA',
            },
        },
        {
            description: "Testnet - m/44'/1815'/0'/0/2",
            params: {
                path: "m/44'/1815'/0'/0/2",
                protocolMagic: PROTOCOL_MAGICS['testnet'],
            },
            result: {
                address: '2657WMsDfac5PMpEsxc1md3pgZKUZRZ11MUK8tjkDHBQG9b3TMBsTQc4PmmumVrcn',
            },
        },
    ],
};
