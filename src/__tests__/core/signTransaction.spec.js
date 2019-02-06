/* @flow */
import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';
import type {
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const oneOneFee = (): SubtestSignTransaction => {
    // See tx d5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
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
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '010000000182488650ef25a58fef6788bd71b8212038d7f2bbe4750bc7bcb44701e85ef6d5000000006b4830450221009a0b7be0d4ed3146ee262b42202841834698bb3ee39c24e7437df208b8b7077102202b79ab1e7736219387dffe8d615bbdba87e11477104b867ef47afed1a5ede7810121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0160cc0500000000001976a914de9b2a8da088824e8fe51debea566617d851537888ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oneOneFee',
    };
};

const oneTwoFee = (): SubtestSignTransaction => {
    // See tx c275c333fd1b36bef4af316226c66a8b3693fbfcc081a5e16a2ae5fcb09e92bf
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
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
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: ['304402200aad33a2fa9994b1aedb062486808b7e85406c2745359a02d57d617cd48298b80220394320f7409359a56061d050eeba0ba27b1ac9e3e0aa4501427f58766381f34d'],
                serializedTx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a47304402200aad33a2fa9994b1aedb062486808b7e85406c2745359a02d57d617cd48298b80220394320f7409359a56061d050eeba0ba27b1ac9e3e0aa4501427f58766381f34d0121035c85bf271936439f0a25b9ba175593a178fcf7c5476f6c8a4621f50b1de93b3effffffff0230750000000000001976a91489a0db486cbff44de5b4bdf30e04cf66f73224db88ac10270000000000001976a91405427736705cfbfaff76b1cff48283707fb1037088ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oneTwoFee',
    };
};

const oneThreeFee = (): SubtestSignTransaction => {
    // See tx d5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
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
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '010000000182488650ef25a58fef6788bd71b8212038d7f2bbe4750bc7bcb44701e85ef6d5000000006b483045022100e695e2c530c7c0fc32e6b79b7cff56a7f70a8c9da787534f46b4204070f914fc02207b0879a81408a11e23b11d4c7965c62b5fc6d5c2d92340f5ee2da7b40e99314a0121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0300650400000000001976a914de9b2a8da088824e8fe51debea566617d851537888ace02e0000000000001976a9141fe1d337fb81afca42818051e12fd18245d1b17288ac80380100000000001976a9140223b1a09138753c9cb0baf95a0a62c82711567a88ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oneThreeFee',
    };
};

const twoTwo = (): SubtestSignTransaction => {
    // See tx c6be22d34946593bcad1d2b013e12f74159e69574ffea21581dad115572e031c
    // See tx 58497a7757224d1ff1941488d23087071103e5bf855f4c1c44e5c8d9d82ca46e
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
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
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '01000000021c032e5715d1da8115a2fe4f57699e15742fe113b0d2d1ca3b594649d322bec6010000006b483045022100f773c403b2f85a5c1d6c9c4ad69c43de66930fff4b1bc818eb257af98305546a0220443bde4be439f276a6ce793664b463580e210ec6c9255d68354449ac0443c76501210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a6ffffffff6ea42cd8d9c8e5441c4c5f85bfe50311078730d2881494f11f4d2257777a4958010000006b48304502210090cff1c1911e771605358a8cddd5ae94c7b60cc96e50275908d9bf9d6367c79f02202bfa72e10260a146abd59d0526e1335bacfbb2b4401780e9e3a7441b0480c8da0121038caebd6f753bbbd2bb1f3346a43cd32140648583673a31d62f2dfb56ad0ab9e3ffffffff02a0860100000000001976a9142f4490d5263906e4887ca2996b9e207af3e7824088aca0860100000000001976a914812c13d97f9159e54e326b481b8f88a73df8507a88ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/twoTwo',
    };
};

const testnetOneTwoFee = (): SubtestSignTransaction => {
    // See tx e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 0, 0],
                    prev_hash: 'e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'msj42CCGruhRsFrGATiUuh25dtxYtnpbTx',
                    amount: '30090000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 1, 0],
                    amount: '900000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0100000001cd3b93f5b24ae190ce5141235091cd93fbb2908e24e5b9ff6776aec11b0e04e5000000006a47304402204a1915f47d170b3d17f2d13696279edf7ad7b250d9827b29fa5ca96211c3d58f02200476f03c7be26f874ef2ebfa049b11aaee1582b619a46f96482b731aec14e98c012103426f6986e620f883d2d44f671cf2f91e5e0ae4d9fab0c0cc54ac16a80e628631ffffffff021023cb01000000001976a91485eb47fe98f349065d6f044e27a4ac541af79ee288aca0bb0d00000000001976a9149a3677c632cab1860f1ee7bd52d7c095579b758888ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnetOneTwoFee',
    };
};

const testnetFeeTooHigh = (): SubtestSignTransaction => {
    // See tx 6f90f3c7cbec2258b0971056ef3fe34128dbde30daa9c0639a898f9977299d54
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: '6f90f3c7cbec2258b0971056ef3fe34128dbde30daa9c0639a898f9977299d54',
                    prev_index: 1,
                },
            ],
            outputs: [
                {
                    address: 'mfiGQVPcRcaEvQPYDErR34DcCovtxYvUUV',
                    amount: '400000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [2],
                    amount: '500000000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0100000001549d2977998f899a63c0a9da30dedb2841e33fef561097b05822eccbc7f3906f010000006b483045022100eadd720201416e059d663fbb05bb9e87e56d11a6ce53f8da1ca8278d5beb07f102202b3d0318812ec2ec40d12bf36bafa5ee24b81208f08690c7ed89e47740e018cb0121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff02801a0600000000001976a9140223b1a09138753c9cb0baf95a0a62c82711567a88ac0065cd1d000000001976a9142db345c36563122e2fd0f5485fb7ea9bbf7cb5a288ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnetFeeTooHigh',
    };
};

const lotsOfOutputs = (): SubtestSignTransaction => {
    // Tests if device implements serialization of len(outputs) correctly

    // See tx c63e24ed820c5851b60c54613fbc4bcb37df6cd49b4c96143e99580a472f79fb
    // See tx 39a29e954977662ab3879c66fb251ef753e0912223a83d1dcb009111d28265e5
    const outputs = [];
    const total: number = 255;
    for (let i = 0; i < total; i++) {
        const output = {
            address: '1NwN6UduuVkJi6sw3gSiKZaCY5rHgVXC2h',
            amount: Math.floor((100000 + 2540000 - 39000) / total).toString(),
            script_type: 'PAYTOADDRESS',
        };

        outputs.push(output);
    }

    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [3],
                    prev_hash: 'c63e24ed820c5851b60c54613fbc4bcb37df6cd49b4c96143e99580a472f79fb',
                    prev_index: 1,
                },
                {
                    address_n: [3],
                    prev_hash: '39a29e954977662ab3879c66fb251ef753e0912223a83d1dcb009111d28265e5',
                    prev_index: 1,
                },
            ],
            outputs,
        },
    ];

    let serializedTx = '0100000002fb792f470a58993e14964c9bd46cdf37cb4bbc3f61540cb651580c82ed243ec6010000006b483045022100969da46f94a81f34f3717b014e0c3e1826eda1b0022ec2f9ce39f3d750ab9235022026da269770993211a1503413566a339bbb4389a482fffcf8e1f76713fc3b94f5012103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a7902ffffffffe56582d2119100cb1d3da8232291e053f71e25fb669c87b32a667749959ea239010000006a473044022052e1419bb237b9db400ab5e3df16db6355619d545fde9030924a360763ae9ad40220704beab04d72ecaeb42eca7d98faca7a0941e65f2e1341f183be2b83e6b09e1c012103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a7902fffffffffdff00';
    serializedTx = serializedTx + 'd8270000000000001976a914f0a2b64e56ee2ff57126232f84af6e3a41d4055088ac'.repeat(total);
    serializedTx = serializedTx + '00000000';
    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/lotsOfOutputs',
    };
};

const feeTooHigh = (): SubtestSignTransaction => {
    // See tx 1570416eb4302cf52979afd5e6909e37d8fdd874301f7cc87e547e509cb1caa6
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: '1570416eb4302cf52979afd5e6909e37d8fdd874301f7cc87e547e509cb1caa6',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                    amount: '99490000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0100000001a6cab19c507e547ec87c1f3074d8fdd8379e90e6d5af7929f52c30b46e417015000000006b483045022100dc3531da7feb261575f03b5b9bbb35edc7f73bb081c92538827105de4102737002200161e34395f6a8ee93979200cb974fa75ccef6d7c14021511cf468eece90d6450121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff01d018ee05000000001976a914de9b2a8da088824e8fe51debea566617d851537888ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/feeTooHigh',
    };
};

const notEnoughFunds = (): SubtestSignTransaction => {
    // See tx d5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
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
                    amount: '400000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                code: 'Failure_NotEnoughFunds',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/feeTooHigh',
    };
};

const spendCoinbase = (): SubtestSignTransaction => {
    // 25 TEST generated to m/1 (mfiGQVPcRcaEvQPYDErR34DcCovtxYvUUV)
    // See tx d6da21677d7cca5f42fbc7631d062c9ae918a0254f7c6c22de8e8cb7fd5b8236
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: [1],
                    prev_hash: 'd6da21677d7cca5f42fbc7631d062c9ae918a0254f7c6c22de8e8cb7fd5b8236',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'mm6FM31rM5Vc3sw5D7kztiBg3jHUzyqF1g',
                    amount: '2500268230',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '010000000136825bfdb78c8ede226c7c4f25a018e99a2c061d63c7fb425fca7c7d6721dad6000000006a473044022047845c366eb24f40be315c7815a154513c444c7989eb80f7ce7ff6aeb703d26a022007c1f5efadf67c5889634fd7ac39a7ce78bffac291673e8772ecd8389c901d9f01210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a6ffffffff01c6100795000000001976a9143d2496e67f5f57a924353da42d4725b318e7a8ea88ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/spendCoinbase',
    };
};

const twoChanges = (): SubtestSignTransaction => {
    // tx e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 0, 0],
                    prev_hash: 'e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'msj42CCGruhRsFrGATiUuh25dtxYtnpbTx',
                    amount: '30090000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    // change
                    address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 1, 0],
                    amount: '900000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    // change
                    address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 1, 1],
                    amount: '10000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: [ '30440220246a5d5d21730d5de70ce9b9f46067b7bee2a448361a8a42274a8a9408b3211d022035c5fe94b8ee3c825d1c3ae86e31ec64671db27c6488cbc616b4c21b79902727' ],
                serializedTx: '0100000001cd3b93f5b24ae190ce5141235091cd93fbb2908e24e5b9ff6776aec11b0e04e5000000006a4730440220246a5d5d21730d5de70ce9b9f46067b7bee2a448361a8a42274a8a9408b3211d022035c5fe94b8ee3c825d1c3ae86e31ec64671db27c6488cbc616b4c21b79902727012103426f6986e620f883d2d44f671cf2f91e5e0ae4d9fab0c0cc54ac16a80e628631ffffffff031023cb01000000001976a91485eb47fe98f349065d6f044e27a4ac541af79ee288aca0bb0d00000000001976a9149a3677c632cab1860f1ee7bd52d7c095579b758888ac10270000000000001976a9141b7c3b31576a99995457844e1b2d0e231b8f064388ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/twoChanges',
    };
};

const p2sh = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: '54aa5680dea781f45ebb536e53dffc526d68c0eb5c00547e323b2c32382dfba3',
                    prev_index: 1,
                },
            ],
            outputs: [
                {
                    address: '3DKGE1pvPpBAgZj94MbCinwmksewUNNYVR',
                    amount: '390000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0100000001a3fb2d38322c3b327e54005cebc0686d52fcdf536e53bb5ef481a7de8056aa54010000006b4830450221009e020b0390ccad533b73b552f8a99a9d827212c558e4f755503674d07c92ad4502202d606f7316990e0461c51d4add25054f19c697aa3e3c2ced4d568f0b2c57e62f0121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0170f305000000000017a9147f844bdb0b8fd54b64e3d16c85dc1170f1ff97c18700000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/p2sh',
    };
};

const changeOnMainChainAllowed = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 0, 0],
                    prev_hash: 'e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'msj42CCGruhRsFrGATiUuh25dtxYtnpbTx',
                    amount: '30090000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    // change on main chain is allowed => treated as a change
                    address_n: [44 | 0x80000000, 1 | 0x80000000, 0 | 0x80000000, 0, 0],
                    amount: '900000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: ['304402202cf32c9a07a8bd86061df3554d9b0cfad516006a9b368e1c016dff3492ac2ac1022069927e583bdcdc48e254f2f1da6e8cd4b1338ca102e6200ac47a160b14b10b9b'],
                serializedTx: '0100000001cd3b93f5b24ae190ce5141235091cd93fbb2908e24e5b9ff6776aec11b0e04e5000000006a47304402202cf32c9a07a8bd86061df3554d9b0cfad516006a9b368e1c016dff3492ac2ac1022069927e583bdcdc48e254f2f1da6e8cd4b1338ca102e6200ac47a160b14b10b9b012103426f6986e620f883d2d44f671cf2f91e5e0ae4d9fab0c0cc54ac16a80e628631ffffffff021023cb01000000001976a91485eb47fe98f349065d6f044e27a4ac541af79ee288aca0bb0d00000000001976a9143a56a008ea50c69036f345a8b274b35bb156329288ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/changeOnMainChainAllowed',
    };
};

export const signTransaction = (): TestFunction => {
    const availableSubtests = {
        oneOneFee,
        oneTwoFee,
        oneThreeFee,
        twoTwo,
        testnetOneTwoFee,
        testnetFeeTooHigh,
        lotsOfOutputs,
        feeTooHigh,
        notEnoughFunds,
        spendCoinbase,
        twoChanges,
        p2sh,
        changeOnMainChainAllowed,
    };
    const testName = 'SignTransaction';
    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
