// https://github.com/trezor/trezor-firmware/blob/master/tests/device_tests/bitcoin/test_getownershipproof.py

const legacyResults = [
    {
        // getOwnershipId not supported on T1 and TT below 2.4.4
        rules: ['1', '<2.4.4'],
        success: false,
    },
];

export default {
    method: 'getOwnershipId',
    setup: {
        mnemonic: 'mnemonic_all',
    },
    tests: [
        {
            description: 'Bitcoin (Bech32/P2WPKH): ownership id',
            params: {
                path: "m/84'/0'/0'/1/0",
                coin: 'btc',
            },
            result: {
                ownership_id: 'a122407efc198211c81af4450f40b235d54775efd934d16b9e31c6ce9bad5707',
            },
            legacyResults,
        },
        {
            description: 'Bitcoin (Taproot/P2TR): ownership id',
            params: {
                path: "m/86'/0'/0'/1/0",
                coin: 'btc',
            },
            result: {
                ownership_id: 'dc18066224b9e30e306303436dc18ab881c7266c13790350a3fe415e438135ec',
            },
            legacyResults,
        },
        {
            description: 'Bundle',
            params: {
                bundle: [
                    { path: "m/84'/0'/0'/1/0", coin: 'btc' },
                    { path: "m/86'/0'/0'/1/0", coin: 'btc' },
                ],
            },
            result: [
                {
                    ownership_id:
                        'a122407efc198211c81af4450f40b235d54775efd934d16b9e31c6ce9bad5707',
                },
                {
                    ownership_id:
                        'dc18066224b9e30e306303436dc18ab881c7266c13790350a3fe415e438135ec',
                },
            ],
            legacyResults,
        },
    ],
};
