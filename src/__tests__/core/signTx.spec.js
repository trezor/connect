import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getHDPath } from '../../js/utils/pathUtils.js';

const oneOneFeeSubtest = (): void => {
    // See tx d5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: 'd5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882',
                    prev_index: 0,
                }
            ],
            outputs: [
                {
                    address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                    amount: 380000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '010000000182488650ef25a58fef6788bd71b8212038d7f2bbe4750bc7bcb44701e85ef6d5000000006b4830450221009a0b7be0d4ed3146ee262b42202841834698bb3ee39c24e7437df208b8b7077102202b79ab1e7736219387dffe8d615bbdba87e11477104b867ef47afed1a5ede7810121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0160cc0500000000001976a914de9b2a8da088824e8fe51debea566617d851537888ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oneOneFee',
    };
};

const oneTwoFeeSubtest = (): void => {
    // See tx c275c333fd1b36bef4af316226c66a8b3693fbfcc081a5e16a2ae5fcb09e92bf
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: getHDPath("m/44'/0'/0'/0/5"),
                    prev_hash: '50f6f1209ca92d7359564be803cb2c932cde7d370f7cee50fd1fad6790f6206d',
                    prev_index: 1,
                }
            ],
            outputs: [
                {
                    address_n: getHDPath("m/44'/0'/0'/1/3"),
                    amount: 30000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: '1Up15Msx4sbvUCGm8Xgo2Zp5FQim3wE59',
                    amount: 10000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000016d20f69067ad1ffd50ee7c0f377dde2c932ccb03e84b5659732da99c20f1f650010000006a47304402203429bd3ce7b38c5c1e8a15340edd79ced41a2939aae62e259d2e3d18e0c5ee7602201b83b10ebc4d6dcee3f9eb42ba8f1ef8a059a05397e0c1b9223d1565a3e6ec01012102a7a079c1ef9916b289c2ff21a992c808d0de3dfcf8a9f163205c5c9e21f55d5cffffffff0230750000000000001976a914954820f1de627a703596ac0396f986d958e3de4c88ac10270000000000001976a91405427736705cfbfaff76b1cff48283707fb1037088ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oneTwoFee',
    };
};

const oneThreeFeeSubtest = (): void => {
    // See tx d5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: 'd5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882',
                    prev_index: 0,
                }
            ],
            outputs: [
                {
                    address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                    amount: 390000 - 80000 - 12000 - 10000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: '13uaUYn6XAooo88QvAqAVsiVvr2mAXutqP',
                    amount: 12000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [1],
                    amount: 80000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '010000000182488650ef25a58fef6788bd71b8212038d7f2bbe4750bc7bcb44701e85ef6d5000000006b483045022100e695e2c530c7c0fc32e6b79b7cff56a7f70a8c9da787534f46b4204070f914fc02207b0879a81408a11e23b11d4c7965c62b5fc6d5c2d92340f5ee2da7b40e99314a0121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0300650400000000001976a914de9b2a8da088824e8fe51debea566617d851537888ace02e0000000000001976a9141fe1d337fb81afca42818051e12fd18245d1b17288ac80380100000000001976a9140223b1a09138753c9cb0baf95a0a62c82711567a88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oneThreeFee',
    };
};

const twoTwoSubtest = (): void => {
    // See tx c6be22d34946593bcad1d2b013e12f74159e69574ffea21581dad115572e031c
    // See tx 58497a7757224d1ff1941488d23087071103e5bf855f4c1c44e5c8d9d82ca46e
    const testPayloads = [
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
                    amount: 210000 - 100000 - 10000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [3],
                    amount: 100000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000021c032e5715d1da8115a2fe4f57699e15742fe113b0d2d1ca3b594649d322bec6010000006b483045022100f773c403b2f85a5c1d6c9c4ad69c43de66930fff4b1bc818eb257af98305546a0220443bde4be439f276a6ce793664b463580e210ec6c9255d68354449ac0443c76501210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a6ffffffff6ea42cd8d9c8e5441c4c5f85bfe50311078730d2881494f11f4d2257777a4958010000006b48304502210090cff1c1911e771605358a8cddd5ae94c7b60cc96e50275908d9bf9d6367c79f02202bfa72e10260a146abd59d0526e1335bacfbb2b4401780e9e3a7441b0480c8da0121038caebd6f753bbbd2bb1f3346a43cd32140648583673a31d62f2dfb56ad0ab9e3ffffffff02a0860100000000001976a9142f4490d5263906e4887ca2996b9e207af3e7824088aca0860100000000001976a914812c13d97f9159e54e326b481b8f88a73df8507a88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/twoTwo',
    };
};

const testnetOneTwoFeeSubtest = (): void => {
    // See tx e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: getHDPath("44'/1'/0'/0/0"),
                    prev_hash: 'e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd',
                    prev_index: 0,
                }
            ],
            outputs: [
                {
                    address: 'msj42CCGruhRsFrGATiUuh25dtxYtnpbTx',
                    amount: 30090000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: getHDPath("44'/1'/0'/1/0"),
                    amount: 900000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        }
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000001cd3b93f5b24ae190ce5141235091cd93fbb2908e24e5b9ff6776aec11b0e04e5000000006b483045022100eba3bbcbb82ab1ebac88a394e8fb53b0263dadbb3e8072f0a21ee62818c911060220686a9b7f306d028b54a228b5c47cc6c27b1d01a3b0770440bcc64d55d8bace2c0121030e669acac1f280d1ddf441cd2ba5e97417bf2689e4bbec86df4f831bf9f7ffd0ffffffff021023cb01000000001976a91485eb47fe98f349065d6f044e27a4ac541af79ee288aca0bb0d00000000001976a9143d3cca567e00a04819742b21a696a67da796498b88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnetOneTwoFee',
    };
};

const testnetFeeTooHighSubtest = (): void => {
    // See tx 6f90f3c7cbec2258b0971056ef3fe34128dbde30daa9c0639a898f9977299d54
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: '6f90f3c7cbec2258b0971056ef3fe34128dbde30daa9c0639a898f9977299d54',
                    prev_index: 1,
                }
            ],
            outputs: [
                {
                    address: 'mfiGQVPcRcaEvQPYDErR34DcCovtxYvUUV',
                    amount: 1000000000 - 500000000 - 100000000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [2],
                    amount: 500000000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        }
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000001549d2977998f899a63c0a9da30dedb2841e33fef561097b05822eccbc7f3906f010000006a47304402205ea68e9d52d4be14420ccecf7f2e11489d49b86bedb79ee99b5e9b7188884150022056219cb3384a5df8048cca286a9533403dbda1571afd84b51379cdaee6a6dea80121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff020084d717000000001976a9140223b1a09138753c9cb0baf95a0a62c82711567a88ac0065cd1d000000001976a9142db345c36563122e2fd0f5485fb7ea9bbf7cb5a288ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnetFeeTooHigh',
    };
};

const lotsOfOutputsSubtest = (): void => {
    // Tests if device implements serialization of len(outputs) correctly

    // See tx c63e24ed820c5851b60c54613fbc4bcb37df6cd49b4c96143e99580a472f79fb
    // See tx 39a29e954977662ab3879c66fb251ef753e0912223a83d1dcb009111d28265e5
    let outputs = [];
    const total: number = 255;
    for (let i = 0; i < total; i++) {
        const output = {
            address: '1NwN6UduuVkJi6sw3gSiKZaCY5rHgVXC2h',
            amount: Math.floor((100000 + 2540000 - 39000) / total),
            script_type: 'PAYTOADDRESS'
        };

        outputs.push(output);
    }

    const testPayloads = [
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
        }
    ];

    let serializedTx = '0100000002fb792f470a58993e14964c9bd46cdf37cb4bbc3f61540cb651580c82ed243ec6010000006b483045022100969da46f94a81f34f3717b014e0c3e1826eda1b0022ec2f9ce39f3d750ab9235022026da269770993211a1503413566a339bbb4389a482fffcf8e1f76713fc3b94f5012103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a7902ffffffffe56582d2119100cb1d3da8232291e053f71e25fb669c87b32a667749959ea239010000006a473044022052e1419bb237b9db400ab5e3df16db6355619d545fde9030924a360763ae9ad40220704beab04d72ecaeb42eca7d98faca7a0941e65f2e1341f183be2b83e6b09e1c012103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a7902fffffffffdff00';
    serializedTx = serializedTx + 'd8270000000000001976a914f0a2b64e56ee2ff57126232f84af6e3a41d4055088ac'.repeat(total);
    serializedTx = serializedTx + '00000000';
    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: serializedTx,
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/lotsOfOutputs',
    };
};

const feeTooHighSubtest = (): void => {
    // See tx 1570416eb4302cf52979afd5e6909e37d8fdd874301f7cc87e547e509cb1caa6
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: '1570416eb4302cf52979afd5e6909e37d8fdd874301f7cc87e547e509cb1caa6',
                    prev_index: 0,
                }
            ],
            outputs: [
                {
                    address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                    amount: 100000000 - 510000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000001a6cab19c507e547ec87c1f3074d8fdd8379e90e6d5af7929f52c30b46e417015000000006b483045022100dc3531da7feb261575f03b5b9bbb35edc7f73bb081c92538827105de4102737002200161e34395f6a8ee93979200cb974fa75ccef6d7c14021511cf468eece90d6450121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff01d018ee05000000001976a914de9b2a8da088824e8fe51debea566617d851537888ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/feeTooHigh',
    };
};

const notEnoughFundsSubtest = (): void => {
    // See tx d5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: 'd5f65ee80147b4bcc70b75e4bbf2d7382021b871bd8867ef8fa525ef50864882',
                    prev_index: 0,
                }
            ],
            outputs: [
                {
                    address: '1MJ2tj2ThBE62zXbBYA5ZaN3fdve5CPAz1',
                    amount: 400000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
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

const attackChangeOutputsSubtest = (): void => {
    // This unit test attempts to modify data sent during ping-pong of streaming signing.
    // Because device is asking for human confirmation only during first pass(first input),
    // device must detect that data has been modified during other passes and fail to sign
    // such modified data(which has not been confirmed by the user).

    // Test firstly prepare normal transaction and send it to device.Then it send the same
    // transaction again, but change amount of output 1 during signing the second input.

    console.log('TODO');
    return {
        testPayloads: { },
        expectedResponses: { },
        specName: '/attackChangeOutputs',
    }
};

const attackChangeInputAddressSubtest = (): void => {
    // This unit test attempts to modify input address after the Trezor checked
    // that it matches the change output

    console.log('TODO');
    return {
        testPayloads: { },
        expectedResponses: { },
        specName: '/attackChangeInputAddress',
    };
};

const spendCoinbaseSubtest = (): void => {
    // 25 TEST generated to m/1 (mfiGQVPcRcaEvQPYDErR34DcCovtxYvUUV)
    // See tx d6da21677d7cca5f42fbc7631d062c9ae918a0254f7c6c22de8e8cb7fd5b8236
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: [1],
                    prev_hash: 'd6da21677d7cca5f42fbc7631d062c9ae918a0254f7c6c22de8e8cb7fd5b8236',
                    prev_index: 0,
                }
            ],
            outputs: [
                {
                    address: 'mm6FM31rM5Vc3sw5D7kztiBg3jHUzyqF1g',
                    amount: 2500278230 - 10000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '010000000136825bfdb78c8ede226c7c4f25a018e99a2c061d63c7fb425fca7c7d6721dad6000000006a473044022047845c366eb24f40be315c7815a154513c444c7989eb80f7ce7ff6aeb703d26a022007c1f5efadf67c5889634fd7ac39a7ce78bffac291673e8772ecd8389c901d9f01210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a6ffffffff01c6100795000000001976a9143d2496e67f5f57a924353da42d4725b318e7a8ea88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/spendCoinbase',
    };
};

const twoChangesSubtest = (): void => {
    // tx e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: getHDPath("44'/1'/0'/0/0"),
                    prev_hash: 'e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd',
                    prev_index: 0,
                }
            ],
            outputs: [
                {
                    address: 'msj42CCGruhRsFrGATiUuh25dtxYtnpbTx',
                    amount: 30090000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    // change
                    address_n: getHDPath("44'/1'/0'/1/0"),
                    amount: 900000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    // change
                    address_n: getHDPath("44'/1'/0'/1/1"),
                    amount: 10000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        { success: true, },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/twoChanges',
    };
};

const p2shSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [0],
                    prev_hash: '54aa5680dea781f45ebb536e53dffc526d68c0eb5c00547e323b2c32382dfba3',
                    prev_index: 1,
                }
            ],
            outputs: [
                {
                    address: '3DKGE1pvPpBAgZj94MbCinwmksewUNNYVR',
                    amount: 400000 - 10000,
                    script_type: 'PAYTOSCRIPTHASH',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000001a3fb2d38322c3b327e54005cebc0686d52fcdf536e53bb5ef481a7de8056aa54010000006b4830450221009e020b0390ccad533b73b552f8a99a9d827212c558e4f755503674d07c92ad4502202d606f7316990e0461c51d4add25054f19c697aa3e3c2ced4d568f0b2c57e62f0121023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43dffffffff0170f305000000000017a9147f844bdb0b8fd54b64e3d16c85dc1170f1ff97c18700000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/p2sh',
    };
};

const changeOnMainChainAllowedSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: getHDPath("44'/1'/0'/0/0"),
                    prev_hash: 'e5040e1bc1ae7667ffb9e5248e90b2fb93cd9150234151ce90e14ab2f5933bcd',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'msj42CCGruhRsFrGATiUuh25dtxYtnpbTx',
                    amount: 30090000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    // change on main chain is allowed => treated as a change
                    address_n: getHDPath("44'/1'/0'/0/0"),
                    amount: 900000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        { success: true, },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/changeOnMainChainAllowed',
    };
};

export const signTxTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        oneOneFee: oneOneFeeSubtest,
        oneTwoFee: oneTwoFeeSubtest,
        oneThreeFee: oneThreeFeeSubtest,
        twoTwo: twoTwoSubtest,
        testnetOneTwoFee: testnetOneTwoFeeSubtest,
        testnetFeeTooHigh: testnetFeeTooHighSubtest,
        lotsOfOutputs: lotsOfOutputsSubtest,
        feeTooHigh: feeTooHighSubtest,
        notEnoughFunds: notEnoughFundsSubtest,
        attackChangeOutputs: attackChangeOutputsSubtest,
        attackChangeInputAddress: attackChangeInputAddressSubtest,
        spendCoinbase: spendCoinbaseSubtest,
        twoChanges: twoChangesSubtest,
        p2sh: p2shSubtest,
        changeOnMainChainAllowed: changeOnMainChainAllowedSubtest,
    };

    describe('SignTx', () => {
        let core: Core;

        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        const { testPayloads, expectedResponses, specName } = availableSubtests[subtest]();
        if (testPayloads.length !== expectedResponses.length) {
            throw new Error('Different number of payloads and expected responses');
        }

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];

            it(specName, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};