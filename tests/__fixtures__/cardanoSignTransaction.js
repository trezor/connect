// vectors from https://github.com/trezor/trezor-firmware/tree/master/python/trezorlib/tests/device_tests/test_msg_cardano_sign_transaction.py

const SAMPLE_INPUT = {
    path: "m/44'/1815'/0'/0/1",
    prev_hash: '1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc',
    prev_index: 0,
};

const SAMPLE_OUTPUTS = {
    simple_output: {
        address: 'Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2',
        amount: '3003112',
    },
    change_output: {path: "m/44'/1815'/0'/0/1", amount: '1000000'},
    testnet_output: {
        address: '2657WMsDfac7BteXkJq5Jzdog4h47fPbkwUM49isuWbYAr2cFRHa3rURP236h9PBe',
        amount: '3003112',
    },
};

const FEE = '42';
const TTL = '10';

const PROTOCOL_MAGICS = {
    mainnet: 0,
    testnet: 42,
};

export default {
    method: 'cardanoSignTransaction',
    setup: {
        mnemonic: 'mnemonic_all',
    },
    tests: [
        {
            description: 'signMainnetNoChange',
            params: {
                inputs: [SAMPLE_INPUT],
                outputs: [SAMPLE_OUTPUTS['simple_output']],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
            },
            result: {
                hash: '73e09bdebf98a9e0f17f86a2d11e0f14f4f8dae77cdf26ff1678e821f20c8db6',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030aa1008182582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840600b3c21cc08389de4f151aaf8cfea4127b04c50a70ad427d5f2724f72ca9dbce0e8812947a5040393276bcbe0cb047ba231c5edd55f69181a5caec7e5139c0ef6',
            },
        },

        {
            description: 'signMainnetChange',
            params: {
                inputs: [SAMPLE_INPUT],
                outputs: [
                    SAMPLE_OUTPUTS['simple_output'],
                    SAMPLE_OUTPUTS['change_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
            },
            result: {
                hash: '81b14b7e62972127eb33c0b1198de6430540ad3a98eec621a3194f2baac43a43',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e882582b82d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a000f424002182a030aa1008182582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840d97639e62463d312a3f98d8877e379dffbc9689e845ab7b1341b9c83eff40b1d26c85e42232027542d62edaeda8f84f9a0fc6232a8fa3e3c2536845fdbc6630ff6',
            },
        },

        {
            description: 'signTestnet',
            params: {
                inputs: [SAMPLE_INPUT],
                outputs: [
                    SAMPLE_OUTPUTS['testnet_output'],
                    SAMPLE_OUTPUTS['change_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['testnet'],
            },
            result: {
                hash: '1a624c5935fac3d0185e3900cc040f66442b40b29791cdbcb2803fb4c46ec8b4',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018282582f82d818582583581cc817d85b524e3d073795819a25cdbb84cff6aa2bbb3a081980d248cba10242182a001a0fb6fc611a002dd2e882582f82d818582583581c90bf7d20a6e5351b6e1a47f8f236005044e2a36fbe648a33a2639127a10242182a001ab97eca181a000f424002182a030aa1008182582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840d8f79cf71ffcdbfa22e7c1761702b36fa70d640bff851cc5b5087b3748fc14e92a56c274a37209e602208096b2e9366483d25cff990552cf9e91501146138d01f6',
            },
        },

    ],
};
