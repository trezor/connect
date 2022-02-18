// https://github.com/trezor/trezor-firmware/blob/master/tests/device_tests/bitcoin/test_getownershipproof.py

const legacyResults = [
    {
        // getOwnershipProof not supported on T1 and TT below 2.4.4
        rules: ['1', '<2.4.4'],
        success: false,
    },
];

export default {
    method: 'getOwnershipProof',
    setup: {
        mnemonic: 'mnemonic_all',
    },
    tests: [
        {
            description: 'Bitcoin (Bech32/P2WPKH): ownership proof',
            params: {
                path: "m/84'/0'/0'/1/0",
                coin: 'btc',
            },
            result: {
                ownership_proof:
                    '534c00190001a122407efc198211c81af4450f40b235d54775efd934d16b9e31c6ce9bad57070002483045022100c0dc28bb563fc5fea76cacff75dba9cb4122412faae01937cdebccfb065f9a7002202e980bfbd8a434a7fc4cd2ca49da476ce98ca097437f8159b1a386b41fcdfac50121032ef68318c8f6aaa0adec0199c69901f0db7d3485eb38d9ad235221dc3d61154b',
            },
            legacyResults,
        },
        {
            description: 'Bitcoin (Bech32/P2WPKH): ownership proof with user confirmation',
            params: {
                path: "m/84'/0'/0'/1/0",
                coin: 'btc',
                userConfirmation: true,
            },
            result: {
                ownership_proof:
                    '534c00190101a122407efc198211c81af4450f40b235d54775efd934d16b9e31c6ce9bad5707000247304402201c8d141bcb99660d5de876e51d929abd2954a2eb79adde83d25cc5e94f085ace02207b14736cd0515a11571bcecfbd44f11ca8a2d661b5235fd27837b74ca5071a120121032ef68318c8f6aaa0adec0199c69901f0db7d3485eb38d9ad235221dc3d61154b',
            },
            legacyResults,
        },
        {
            description: 'Bitcoin (Bech32/P2WPKH): ownership proof with commitment data',
            params: {
                path: "m/84'/0'/0'/1/0",
                coin: 'btc',
                userConfirmation: true,
                commitmentData: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
            },
            result: {
                ownership_proof:
                    '534c00190101a122407efc198211c81af4450f40b235d54775efd934d16b9e31c6ce9bad57070002483045022100b41c51d130d1e4e179679734b7fcb39abe8859727de10a782fac3f9bae82c31802205b0697eb1c101a1f5a3b103b7b6c34568adface1dbbb3512b783c66bb52f0c920121032ef68318c8f6aaa0adec0199c69901f0db7d3485eb38d9ad235221dc3d61154b',
            },
            legacyResults,
        },
        {
            description: 'Bitcoin (Taproot/P2TR): ownership proof',
            params: {
                path: "m/86'/0'/0'/1/0",
                coin: 'btc',
            },
            result: {
                ownership_proof:
                    '534c00190001dc18066224b9e30e306303436dc18ab881c7266c13790350a3fe415e438135ec0001401b553e5b9cc787b531bbc78417aea901272b4ea905136a2babc4d6ca471549743b5e0e39ddc14e620b254e42faa7f6d5bd953e97aa231d764d21bc5a58e8b7d9',
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
                    ownership_proof:
                        '534c00190001a122407efc198211c81af4450f40b235d54775efd934d16b9e31c6ce9bad57070002483045022100c0dc28bb563fc5fea76cacff75dba9cb4122412faae01937cdebccfb065f9a7002202e980bfbd8a434a7fc4cd2ca49da476ce98ca097437f8159b1a386b41fcdfac50121032ef68318c8f6aaa0adec0199c69901f0db7d3485eb38d9ad235221dc3d61154b',
                },
                {
                    ownership_proof:
                        '534c00190001dc18066224b9e30e306303436dc18ab881c7266c13790350a3fe415e438135ec0001401b553e5b9cc787b531bbc78417aea901272b4ea905136a2babc4d6ca471549743b5e0e39ddc14e620b254e42faa7f6d5bd953e97aa231d764d21bc5a58e8b7d9',
                },
            ],
            legacyResults,
        },
    ],
};
