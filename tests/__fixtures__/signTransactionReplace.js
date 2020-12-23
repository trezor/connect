const { ADDRESS_N } = global.TestUtils;
// const { ADDRESS_N, TX_CACHE } = global.TestUtils;

export default {
    method: 'signTransaction',
    setup: {
        mnemonic: 'mnemonic_all',
    },
    tests: [
        {
            description: 'Replace tx P2PKH: bump fee',
            params: {
                coin: 'Bitcoin',
                inputs: [
                    {
                        address_n: ADDRESS_N("m/44'/0'/0'/0/4"),
                        amount: '174998',
                        prev_index: 0,
                        prev_hash: 'beafc7cbd873d06dbee88a7002768ad5864228639db514c81cfb29f108bb1e7a',
                        orig_index: 0,
                        orig_hash: '50f6f1209ca92d7359564be803cb2c932cde7d370f7cee50fd1fad6790f6206d',
                    },
                ],
                outputs: [
                    {
                        address_n: ADDRESS_N("m/44'/0'/0'/1/2"),
                        script_type: 'PAYTOADDRESS',
                        amount: '109998', // 174998 - 50000 - 15000
                        orig_hash: '50f6f1209ca92d7359564be803cb2c932cde7d370f7cee50fd1fad6790f6206d',
                        orig_index: 0,
                    },
                    {
                        address: '1GA9u9TfCG7SWmKCveBumdA1TZpfom6ZdJ',
                        amount: '50000',
                        script_type: 'PAYTOADDRESS',
                        orig_hash: '50f6f1209ca92d7359564be803cb2c932cde7d370f7cee50fd1fad6790f6206d',
                        orig_index: 1,
                    },
                ],
                // refTxs: [TX_CACHE('beafc7'), TX_CACHE('50f6f1')],
            },
            result: {
                serializedTx: '01000000017a1ebb08f129fb1cc814b59d63284286d58a7602708ae8be6dd073d8cbc7afbe000000006b483045022100a8c1c118d61259f8df463deb538a10d9e9f42bbdfff28bb1337ee5426e5098f8022060e7464f7a63a83fd93dbd268f319133cb03452764afd601db063ff3eede9207012103f54094da6a0b2e0799286268bb59ca7c83538e81c78e64f6333f40f9e0e222c0ffffffff02aead0100000000001976a914902c642ba3a22f5c6cfa30a1790c133ddf15cc8888ac50c30000000000001976a914a6450f1945831a81912616691e721b787383f4ed88ac00000000',
            },
        },
        {
            description: 'Replace tx P2PKH in P2SH, remove change',
            params: {
                coin: 'Testnet',
                inputs: [
                    {
                        address_n: ADDRESS_N("m/49'/1'/0'/0/4"),
                        amount: '100000',
                        script_type: 'SPENDP2SHWITNESS',
                        prev_hash: '5e7667690076ae4737e2f872005de6f6b57592f32108ed9b301eeece6de24ad6',
                        prev_index: 1,
                        orig_hash: '334cd7ad982b3b15d07dd1c84e939e95efb0803071648048a7f289492e7b4c8a',
                        orig_index: 0,
                    },
                    {
                        address_n: ADDRESS_N("m/49'/1'/0'/0/3"),
                        amount: '998060',
                        script_type: 'SPENDP2SHWITNESS',
                        prev_hash: 'efaa41ff3e67edf508846c1a1ed56894cfd32725c590300108f40c9edc1aac35',
                        prev_index: 0,
                        orig_hash: '334cd7ad982b3b15d07dd1c84e939e95efb0803071648048a7f289492e7b4c8a',
                        orig_index: 1,
                    },
                ],
                outputs: [
                    {
                        address: '2MvUUSiQZDSqyeSdofKX9KrSCio1nANPDTe',
                        amount: '1000000',
                        script_type: 'PAYTOADDRESS',
                        orig_hash: '334cd7ad982b3b15d07dd1c84e939e95efb0803071648048a7f289492e7b4c8a',
                        orig_index: 0,
                    },
                ],
                // refTxs: [TX_CACHE('5e7667'), TX_CACHE('efaa41'), TX_CACHE('334cd7')],
            },
            result: {
                serializedTx: '01000000000102d64ae26dceee1e309bed0821f39275b5f6e65d0072f8e23747ae76006967765e0100000017160014039ba06270e6c6c1ad4e6940515aa5cdbad33f9effffffff35ac1adc9e0cf408013090c52527d3cf9468d51e1a6c8408f5ed673eff41aaef0000000017160014209297fb46272a0b7e05139440dbd39daea3e25affffffff0140420f000000000017a9142369da13fee80c9d7fd8043bf1275c04deb360e68702483045022100c28eceaade3d0bc82e4b634d2c6d06feed4afe37c77b04b379eaf8c058b7190702202b7a369dd6104c13c60821c1ad4e7c2d8d37cf1962a9b3f5d70717709c021d63012103bb0e339d7495b1f355c49d385b79343e52e68d99de2fe1f7f476c465c9ccd16702483045022100f6a447b7f95fb067c87453c408aa648262adaf2472a7ccc754518cd06353b87502202e00359dd663eda24d381e070b92a5e41f1d047d276f685ff549a03659842b1b012103c2c2e65556ca4b7371549324b99390725493c8a6792e093a0bdcbb3e2d7df4ab00000000',
            },
        },
        {
            description: 'Replace tx P2WPKH finalize',
            params: {
                coin: 'Testnet',
                inputs: [
                    {
                        address_n: ADDRESS_N("m/84'/1'/0'/0/2"),
                        amount: '20000000',
                        script_type: 'SPENDWITNESS',
                        prev_hash: '43d273d3caf41759ad843474f960fbf80ff2ec961135d018b61e9fab3ad1fc06',
                        prev_index: 1,
                        orig_hash: '70f9871eb03a38405cfd7a01e0e1448678132d815e2c9f552ad83ae23969509e',
                        orig_index: 0,
                        sequence: 4294967294,
                    },
                ],
                outputs: [
                    {
                        address: 'tb1qkvwu9g3k2pdxewfqr7syz89r3gj557l3uuf9r9',
                        amount: '100000',
                        script_type: 'PAYTOWITNESS',
                        orig_hash: '70f9871eb03a38405cfd7a01e0e1448678132d815e2c9f552ad83ae23969509e',
                        orig_index: 0,
                    },
                    {
                        address_n: ADDRESS_N("m/84'/1'/0'/1/1"),
                        amount: '19899800', // 20000000 - 100000 - 200
                        script_type: 'PAYTOWITNESS',
                        orig_hash: '70f9871eb03a38405cfd7a01e0e1448678132d815e2c9f552ad83ae23969509e',
                        orig_index: 1,
                    },
                ],
                locktime: 1348713,
                // refTxs: [TX_CACHE('43d273'), TX_CACHE('70f987')],
            },
            result: {
                serializedTx: '0100000000010106fcd13aab9f1eb618d0351196ecf20ff8fb60f9743484ad5917f4cad373d2430100000000feffffff02a086010000000000160014b31dc2a236505a6cb9201fa0411ca38a254a7bf198a52f0100000000160014167dae080bca35c9ea49c0c8335dcc4b252a1d700247304402201ee1828ab0ca7f8113989399edda8394c65e5c3c9fe597a78890c5d2c9bd2aeb022010e76ad6abe171e5cded6b374a344ee18a51d38477b76a4b6fb30289ed24beff01210357cb3a5918d15d224f14a89f0eb54478272108f6cbb9c473c1565e55260f6e9369941400',
            },
        },
        {
            skip: ['1'], // disable this for T1. Failure_DataError: messages.c:224:missing required field
            description: 'Replace tx: Meld transactions',
            params: {
                coin: 'Testnet',
                inputs: [
                    {
                        address_n: ADDRESS_N("m/49'/1'/0'/0/4"),
                        amount: '100000',
                        script_type: 'SPENDP2SHWITNESS',
                        prev_hash: '5e7667690076ae4737e2f872005de6f6b57592f32108ed9b301eeece6de24ad6',
                        prev_index: 1,
                        orig_hash: '334cd7ad982b3b15d07dd1c84e939e95efb0803071648048a7f289492e7b4c8a',
                        orig_index: 0,
                    },
                    {
                        address_n: ADDRESS_N("m/49'/1'/0'/0/8"),
                        amount: '4973340',
                        script_type: 'SPENDP2SHWITNESS',
                        prev_hash: '6673b7248e324882b2f9d02fdd1ff1d0f9ed216a234e836b8d3ac65661cbb457',
                        prev_index: 0,
                        orig_hash: 'ed89acb52cfa438e3653007478e7c7feae89fdde12867943eec91293139730d1',
                        orig_index: 0,
                    },
                    {
                        address_n: ADDRESS_N("m/49'/1'/0'/0/3"),
                        amount: '998060',
                        script_type: 'SPENDP2SHWITNESS',
                        prev_hash: 'efaa41ff3e67edf508846c1a1ed56894cfd32725c590300108f40c9edc1aac35',
                        prev_index: 0,
                        orig_hash: '334cd7ad982b3b15d07dd1c84e939e95efb0803071648048a7f289492e7b4c8a',
                        orig_index: 1,
                    },
                    {
                        address_n: ADDRESS_N("m/49'/1'/0'/0/9"),
                        amount: '839318869',
                        script_type: 'SPENDP2SHWITNESS',
                        prev_hash: '927784e07bbcefc4c738f5c31c7a739978fc86f35514edf7e7da25d53d83030b',
                        prev_index: 0,
                        orig_hash: 'ed89acb52cfa438e3653007478e7c7feae89fdde12867943eec91293139730d1',
                        orig_index: 1,
                    },
                ],
                outputs: [
                    {
                        address: 'moE1dVYvebvtaMuNdXQKvu4UxUftLmS1Gt',
                        amount: '100000000',
                        orig_hash: 'ed89acb52cfa438e3653007478e7c7feae89fdde12867943eec91293139730d1',
                        orig_index: 1,
                    },
                    {
                        address: '2MvUUSiQZDSqyeSdofKX9KrSCio1nANPDTe',
                        amount: '1000000',
                        orig_hash: '334cd7ad982b3b15d07dd1c84e939e95efb0803071648048a7f289492e7b4c8a',
                        orig_index: 0,
                    },
                    {
                        address_n: ADDRESS_N("m/49'/1'/0'/1/0"),
                        // 100000 + 4973340 + 998060 + 839318869 - 100000000 - 1000000 - 94500
                        amount: '744295769',
                        script_type: 'PAYTOP2SHWITNESS',
                    },
                ],
                // refTxs2: [TX_CACHE('5e7667'), TX_CACHE('efaa41'), TX_CACHE('334cd7'), TX_CACHE('6673b7'), TX_CACHE('ed89ac'), TX_CACHE('927784')],
            },
            result: {
                serializedTx: '01000000000104d64ae26dceee1e309bed0821f39275b5f6e65d0072f8e23747ae76006967765e0100000017160014039ba06270e6c6c1ad4e6940515aa5cdbad33f9effffffff57b4cb6156c63a8d6b834e236a21edf9d0f11fdd2fd0f9b28248328e24b773660000000017160014adbbadefe594e9e4bfccb9c699ae5d4f18716772ffffffff35ac1adc9e0cf408013090c52527d3cf9468d51e1a6c8408f5ed673eff41aaef0000000017160014209297fb46272a0b7e05139440dbd39daea3e25affffffff0b03833dd525dae7f7ed1455f386fc7899737a1cc3f538c7c4efbc7be08477920000000017160014681ea49259abb892460bf3373e8a0b43d877fa18ffffffff0300e1f505000000001976a914548cb80e45b1d36312fe0cb075e5e337e3c54cef88ac40420f000000000017a9142369da13fee80c9d7fd8043bf1275c04deb360e687590d5d2c0000000017a91458b53ea7f832e8f096e896b8713a8c6df0e892ca870247304402205b4b304cb5a23cd3b73aa586c983cbadefc3fcbcb8fb33684037b17a818726c002202a3f529183eebf2f06d041b18d379579c22d908be31060752179f01d125ff020012103bb0e339d7495b1f355c49d385b79343e52e68d99de2fe1f7f476c465c9ccd167024730440220666ebf2c146d4a369971ec1d5b69fce2f3b8e2c0ba689e6077ebed513f91dd760220200e203355156e23abf5b536ac174df4109985feddf86ab065c12f0da8339d6a012102a52d8cf5a89c284bacff90a3d7c30a0166e0074ca3fc385f3efce638c50493b30247304402207d6331026626fc133813ea672147c95feac29a3d7deefb49ef1d0194e061d53802207e4c3a3b8f3c2e11845684d74a5f1d8395da0a8e65e18c7f72155aac82be648e012103c2c2e65556ca4b7371549324b99390725493c8a6792e093a0bdcbb3e2d7df4ab02473044022047f95a95ea8cac78f057e15e37ac5cebd6abcf50d87e5509d30c730cb0f7e89f02201d861acb267c0bc100cac99cad42b067a39614602eef5f9f791c1875f24dd0de0121028cbc37e1816a23086fa738c8415def477e813e20f484dbbd6f5a33a37c32225100000000',
            },
        },
    ],
};
