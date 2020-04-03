// const lotsOfOutputs = () => {
//     const outputs = [];
//     const total = 255;
//     for (let i = 0; i < total; i++) {
//         const output = {
//             address: '1NwN6UduuVkJi6sw3gSiKZaCY5rHgVXC2h',
//             amount: Math.floor((100000 + 2540000 - 39000) / total).toString(),
//             script_type: 'PAYTOADDRESS',
//         };

//         outputs.push(output);
//     }
//     return outputs;
// };

// let serializedTx = '0100000002fb792f470a58993e14964c9bd46cdf37cb4bbc3f61540cb651580c82ed243ec6010000006b483045022100969da46f94a81f34f3717b014e0c3e1826eda1b0022ec2f9ce39f3d750ab9235022026da269770993211a1503413566a339bbb4389a482fffcf8e1f76713fc3b94f5012103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a7902ffffffffe56582d2119100cb1d3da8232291e053f71e25fb669c87b32a667749959ea239010000006a473044022052e1419bb237b9db400ab5e3df16db6355619d545fde9030924a360763ae9ad40220704beab04d72ecaeb42eca7d98faca7a0941e65f2e1341f183be2b83e6b09e1c012103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a7902fffffffffdff00';
//     serializedTx = serializedTx + 'd8270000000000001976a914f0a2b64e56ee2ff57126232f84af6e3a41d4055088ac'.repeat(255);
//     serializedTx = serializedTx + '00000000';

export default {
    method: 'signTransaction',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: '1 input, 1 output, no change (legacy address_n: [0])',
            params: {
                inputs: [
                    {
                        address_n: [0],
                        prev_hash: 'd5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882',
                        prev_index: 0,
                    },
                ],
                outputs: [
                    {
                        address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                        amount: '380000',
                        script_type: 'PAYTOADDRESS',
                    },
                ],
                coin: 'btc',
            },
            result: {
                serializedTx: '010000000182488650ef25a58fef6788bd71b8212038d7f2bbe4750bc7bcb44701e85ef6d5000000006b4830450221009a0b7be0d4ed3146ee262b42202841834698bb3ee39c24e7437df208b8b7077102202b79ab1e7736219387dffe8d615bbdba87e11477104b867ef47afed1a5ede7810121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0160cc0500000000001976a914de9b2a8da088824e8fe51debea566617d851537888ac00000000',
            },
        },
        {
            description: '1 input, 1 output, 1 change',
            params: {
                inputs: [
                    {
                        address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 0, 5],
                        prev_hash: '50f6f1209ca92d7359564be803cb2c932cde7d370f7cee50fd1fad6790f6206d',
                        prev_index: 1,
                    },
                ],
                outputs: [
                    {
                        address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 1, 3],
                        amount: '30000',
                        script_type: 'PAYTOADDRESS',
                    },
                    {
                        address: '1Up15Msx4sbvUCGm8Xgo2Zp5FQim3wE59',
                        amount: '10000',
                        script_type: 'PAYTOADDRESS',
                    },
                ],
                coin: 'btc',
            },
            result: {
                signatures: ['304402200aad33a2fa9994b1aedb062486808b7e85406c2745359a02d57d617cd48298b80220394320f7409359a56061d050eeba0ba27b1ac9e3e0aa4501427f58766381f34d'],
                serializedTx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a47304402200aad33a2fa9994b1aedb062486808b7e85406c2745359a02d57d617cd48298b80220394320f7409359a56061d050eeba0ba27b1ac9e3e0aa4501427f58766381f34d0121035c85bf271936439f0a25b9ba175593a178fcf7c5476f6c8a4621f50b1de93b3effffffff0230750000000000001976a91489a0db486cbff44de5b4bdf30e04cf66f73224db88ac10270000000000001976a91405427736705cfbfaff76b1cff48283707fb1037088ac00000000',
            },
        },
        {
            // tx d5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882
            description: '1 input, 2 outputs, 1 change',
            params: {
                inputs: [
                    {
                        address_n: [0],
                        prev_hash: 'd5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882',
                        prev_index: 0,
                    },
                ],
                outputs: [
                    {
                        address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                        amount: '288000',
                        script_type: 'PAYTOADDRESS',
                    },
                    {
                        address: '13uaUYn6XAooo88QvAqAVsiVvr2mAXutqP',
                        amount: '12000',
                        script_type: 'PAYTOADDRESS',
                    },
                    {
                        address_n: [1],
                        amount: '80000',
                        script_type: 'PAYTOADDRESS',
                    },
                ],
                coin: 'btc',
            },
            result: {
                serializedTx: '010000000182488650ef25a58fef6788bd71b8212038d7f2bbe4750bc7bcb44701e85ef6d5000000006b483045022100e695e2c530c7c0fc32e6b79b7cff56a7f70a8c9da787534f46b4204070f914fc02207b0879a81408a11e23b11d4c7965c62b5fc6d5c2d92340f5ee2da7b40e99314a0121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0300650400000000001976a914de9b2a8da088824e8fe51debea566617d851537888ace02e0000000000001976a9141fe1d337fb81afca42818051e12fd18245d1b17288ac80380100000000001976a9140223b1a09138753c9cb0baf95a0a62c82711567a88ac00000000',
            },
        },
        {
            description: '2 inputs, 1 output, 1 change',
            params: {
                inputs: [
                    {
                        address_n: [1],
                        prev_hash: 'c6be22d34946593bcad1d2b013e12f74159e69574ffea21581dad115572e031c',
                        prev_index: 1,
                    },
                    {
                        address_n: [2],
                        prev_hash: '58497a7757224d1ff1941488d23087071103e5bf855f4c1c44e5c8d9d82ca46e',
                        prev_index: 1,
                    },
                ],
                outputs: [
                    {
                        address: '15Jvu3nZNP7u2ipw2533Q9VVgEu2Lu9F2B',
                        amount: '100000',
                        script_type: 'PAYTOADDRESS',
                    },
                    {
                        address_n: [3],
                        amount: '100000',
                        script_type: 'PAYTOADDRESS',
                    },
                ],
                coin: 'btc',
            },
            result: {
                serializedTx: '01000000021c032e5715d1da8115a2fe4f57699e15742fe113b0d2d1ca3b594649d322bec6010000006b483045022100f773c403b2f85a5c1d6c9c4ad69c43de66930fff4b1bc818eb257af98305546a0220443bde4be439f276a6ce793664b463580e210ec6c9255d68354449ac0443c76501210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a6ffffffff6ea42cd8d9c8e5441c4c5f85bfe50311078730d2881494f11f4d2257777a4958010000006b48304502210090cff1c1911e771605358a8cddd5ae94c7b60cc96e50275908d9bf9d6367c79f02202bfa72e10260a146abd59d0526e1335bacfbb2b4401780e9e3a7441b0480c8da0121038caebd6f753bbbd2bb1f3346a43cd32140648583673a31d62f2dfb56ad0ab9e3ffffffff02a0860100000000001976a9142f4490d5263906e4887ca2996b9e207af3e7824088aca0860100000000001976a914812c13d97f9159e54e326b481b8f88a73df8507a88ac00000000',
            },
        },
        // {
        //     description: '2 inputs, 255 outputs',
        //     customTimeout: 500000,
        //     params: {
        //         inputs: [
        //             {
        //                 address_n: [3],
        //                 prev_hash: 'c63e24ed820c5851b60c54613fbc4bcb37df6cd49b4c96143e99580a472f79fb',
        //                 prev_index: 1,
        //             },
        //             {
        //                 address_n: [3],
        //                 prev_hash: '39a29e954977662ab3879c66fb251ef753e0912223a83d1dcb009111d28265e5',
        //                 prev_index: 1,
        //             },
        //         ],
        //         outputs: lotsOfOutputs(),
        //         coin: 'btc',
        //     },
        //     result: {
        //         serializedTx: serializedTx,
        //     },
        // },
    ],
};
