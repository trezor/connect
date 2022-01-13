const multisig = {
    pubkeys: [
        {
            node: 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
            address_n: [1],
        },
        {
            node: 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
            address_n: [2],
        },
        {
            node: 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
            address_n: [3],
        },
    ],
    signatures: ['', '', ''],
    m: 2,
};

const legacyResults = [
    {
        // "error": "fsm_msg_coin.h:162:Forbidden key path",
        rules: ['<1.10.6'],
        success: false,
    },
];

export default {
    method: 'getAddress',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'show multisig address (1)',
            params: {
                path: [1],
                multisig,
                scriptType: 'SPENDMULTISIG',
                showOnTrezor: true,
            },
            result: {
                address: '3E7GDtuHqnqPmDgwH59pVC7AvySiSkbibz',
            },
            legacyResults,
        },
        {
            description: 'show multisig address (2)',
            params: {
                path: [2],
                multisig,
                scriptType: 'SPENDMULTISIG',
                showOnTrezor: true,
            },
            result: {
                address: '3E7GDtuHqnqPmDgwH59pVC7AvySiSkbibz',
            },
            legacyResults,
        },
        {
            description: 'show multisig address (3)',
            params: {
                path: [3],
                multisig,
                scriptType: 'SPENDMULTISIG',
                showOnTrezor: true,
            },
            result: {
                address: '3E7GDtuHqnqPmDgwH59pVC7AvySiSkbibz',
            },
            legacyResults,
        },
    ],
};
