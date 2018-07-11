import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import type {
    SubtestSignTx,
    SignTxMultisigAvailableSubtests,
} from 'flowtype/tests';
import type {
    TestSignTxPayload,
    ExpectedSignTxResponse,
} from 'flowtype/tests/sign-tx';
const twoOfThree = (): SubtestSignTx => {
    const testPayloads: Array<TestSignTxPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [1],
                    prev_hash: 'c6091adf4c0c23982a35899a6e58ae11e703eacd7954f588ed4b9cdefc4dba52',
                    prev_index: 1,
                    script_type: 'SPENDMULTISIG',
                    multisig: {
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
                    },
                },
            ],
            outputs: [
                {
                    address: '12iyMbUb4R2K3gre4dHSrbu5azG5KaqVss',
                    amount: 100000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [3],
                    prev_hash: 'c6091adf4c0c23982a35899a6e58ae11e703eacd7954f588ed4b9cdefc4dba52',
                    prev_index: 1,
                    script_type: 'SPENDMULTISIG',
                    multisig: {
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
                        signatures: ['3045022100985cc1ba316d140eb4b2d4028d8cd1c451f87bff8ff679858732e516ad04cd3402207af6edda99972af0baa7702a3b7448517c8242e7bca669f6861771cdd16ee058', '', ''],
                        m: 2,
                    },
                },
            ],
            outputs: [
                {
                    address: '12iyMbUb4R2K3gre4dHSrbu5azG5KaqVss',
                    amount: 100000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTxResponse> = [
        {
            payload: {
                serialized: {
                    signatures: [
                        '3045022100985cc1ba316d140eb4b2d4028d8cd1c451f87bff8ff679858732e516ad04cd3402207af6edda99972af0baa7702a3b7448517c8242e7bca669f6861771cdd16ee058',
                    ],
                },
            },
        },
        {
            payload: {
                serialized: {
                    signatures: [
                        '3045022100f5428fe0531b3095675b40d87cab607ee036fac823b22e8dcec35b65aff6e52b022032129b4577ff923d321a1c70db5a6cec5bcc142cb2c51901af8b989cced23e0d',
                    ],
                    serialized_tx: '010000000152ba4dfcde9c4bed88f55479cdea03e711ae586e9a89352a98230c4cdf1a09c601000000fdfe0000483045022100985cc1ba316d140eb4b2d4028d8cd1c451f87bff8ff679858732e516ad04cd3402207af6edda99972af0baa7702a3b7448517c8242e7bca669f6861771cdd16ee05801483045022100f5428fe0531b3095675b40d87cab607ee036fac823b22e8dcec35b65aff6e52b022032129b4577ff923d321a1c70db5a6cec5bcc142cb2c51901af8b989cced23e0d014c6952210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a621038caebd6f753bbbd2bb1f3346a43cd32140648583673a31d62f2dfb56ad0ab9e32103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a790253aeffffffff01a0860100000000001976a91412e8391ad256dcdc023365978418d658dfecba1c88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/twoOfThree',
    };
};

const fifteenOfFifteen = (): SubtestSignTx => {
    let pubkeys: Array<{ node: string, address_n: Array<number>}> = [];
    let signatures: Array<string> = [
        '304502210098e23085ad7282de988bf98afa1e9add9c9830009132f8902a9fa4624d5dc98b0220733216e70ab67791aa64be5c83d2050cb4ed9ff7eda2a1acc35da024d2ab2a67',
        '304402201f8c11fb6e90fd616e484986e9451929797eba039882a9abcc203210948060b9022044da031530de7d9747d3c5a8e7cec04b04b7af495c9120b854ce7362af7fa05a',
        '3045022100ea67c70186acef019bdf1551881bf38e6f88186501b64d3a756a2ce18e4ba18002201c35110325653e21e448b60053a4b5dda46b61096faf701a1faca61fcde91f00',
        '30440220315598992f156d2f9d7b4275395fa067aa61ea95829fa17730885c86df4de70d02203eda9ade1656e2198c668603b17e197acb0969ed183ab0841303ea2612056189',
        '3044022060fdd6621edde9b8cf6776bc4eef26ace9b57514d725b7214ba11d333520a30e022044c30744f94484aec0f896233c5613a3256878ec0379f566226906b6d1b60614',
        '3045022100b1d907e3574f60f7834c7e9f2e367998ce0461dad7d742d84ef8917d713f41f902203b3ac54f7bb2f7fb8685f582d2a94f7213a37cb508acffe29090cc06ae01588b',
        '3045022100e3bf90ff3ad6395e42f46002f253f94ca0e8ffaa0620f2ceb4fa21493abdca4d02201d4c28b10b740bb2dc4b3695b4205c18f8c0dad2bb69540eb8a36576463cd528',
        '304402202cfaf9fab7dc1c9f0c3c23bd46bd6d5cea0664d914139fc9add80766ce998808022012db2802c07853e4cbe147afdf0b47e60bdcbcd31f9df19e04c177ed9aa66c6d',
        '304402207cbc2d83f351eee5ee91df26bb0c7e1cb07fe328cbbcdb0bb9656d37922c497302201b3435d4c71ffd1b34d45892f2a487bd79c8c7f57cc04373287642bb9610cb84',
        '304402202dc3eab30ccb06553703e794212f43ee9a659f5e787a8374e9ea0bf6de0def7402201a70e970c21a807783313ed102bf4f0a3406ac7c84f94bc8194c5e209464d723',
        '304402206b04530c190c46a879d7771a6ad53acd33547e0d7fd320d5ad0b5b1fdeb5d4c202207b812be81c3419daadc942cca0c55aa32c7759fa7566c6dc35f030ca87a1c5be',
        '3045022100ce523dddd6eef73d5ae7c44c870466e1ac5a7a77d43475e8def024af68977a1e022028be0276435bfa2ea887d6cf89fa829f96c1c7a55edc57bb3fd667d523fd3bf6',
        '3044022019410b20ebcd8eb3ee7ec1eff6bf0f9cbfaea82116811c61f3cf24af7e4434b1022009e5823f3349f695be09ae40754185300d8442a22715ddb5ffa17c4213140e72',
        '3045022100964ef26a9074c3cdafffcfbe4bd445933f8c842ba11fd887922adcf7fabe0c82022023055d94c75ab223c767fbaa825c917e9beecbc7d5758cccf20d886c63d4b72a',
        '',
    ];
    for (let i = 0; i < 15; i++) {
        pubkeys.push(
            {
                node: 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
                address_n: [i],
            },
        );
    }

    const testPayloads: Array<TestSignTxPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [14],
                    prev_hash: '6189e3febb5a21cee8b725aa1ef04ffce7e609448446d3a8d6f483c634ef5315',
                    prev_index: 1,
                    script_type: 'SPENDMULTISIG',
                    multisig: {
                        pubkeys,
                        signatures,
                        m: 15,
                    },
                },
            ],
            outputs: [
                {
                    address: '17kTB7qSk3MupQxWdiv5ZU3zcrZc2Azes1',
                    amount: 10000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];
    const expectedResponses: Array<ExpectedSignTxResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000011553ef34c683f4d6a8d346844409e6e7fc4ff01eaa25b7e8ce215abbfee3896101000000fd43060048304502210098e23085ad7282de988bf98afa1e9add9c9830009132f8902a9fa4624d5dc98b0220733216e70ab67791aa64be5c83d2050cb4ed9ff7eda2a1acc35da024d2ab2a670147304402201f8c11fb6e90fd616e484986e9451929797eba039882a9abcc203210948060b9022044da031530de7d9747d3c5a8e7cec04b04b7af495c9120b854ce7362af7fa05a01483045022100ea67c70186acef019bdf1551881bf38e6f88186501b64d3a756a2ce18e4ba18002201c35110325653e21e448b60053a4b5dda46b61096faf701a1faca61fcde91f00014730440220315598992f156d2f9d7b4275395fa067aa61ea95829fa17730885c86df4de70d02203eda9ade1656e2198c668603b17e197acb0969ed183ab0841303ea261205618901473044022060fdd6621edde9b8cf6776bc4eef26ace9b57514d725b7214ba11d333520a30e022044c30744f94484aec0f896233c5613a3256878ec0379f566226906b6d1b6061401483045022100b1d907e3574f60f7834c7e9f2e367998ce0461dad7d742d84ef8917d713f41f902203b3ac54f7bb2f7fb8685f582d2a94f7213a37cb508acffe29090cc06ae01588b01483045022100e3bf90ff3ad6395e42f46002f253f94ca0e8ffaa0620f2ceb4fa21493abdca4d02201d4c28b10b740bb2dc4b3695b4205c18f8c0dad2bb69540eb8a36576463cd5280147304402202cfaf9fab7dc1c9f0c3c23bd46bd6d5cea0664d914139fc9add80766ce998808022012db2802c07853e4cbe147afdf0b47e60bdcbcd31f9df19e04c177ed9aa66c6d0147304402207cbc2d83f351eee5ee91df26bb0c7e1cb07fe328cbbcdb0bb9656d37922c497302201b3435d4c71ffd1b34d45892f2a487bd79c8c7f57cc04373287642bb9610cb840147304402202dc3eab30ccb06553703e794212f43ee9a659f5e787a8374e9ea0bf6de0def7402201a70e970c21a807783313ed102bf4f0a3406ac7c84f94bc8194c5e209464d7230147304402206b04530c190c46a879d7771a6ad53acd33547e0d7fd320d5ad0b5b1fdeb5d4c202207b812be81c3419daadc942cca0c55aa32c7759fa7566c6dc35f030ca87a1c5be01483045022100ce523dddd6eef73d5ae7c44c870466e1ac5a7a77d43475e8def024af68977a1e022028be0276435bfa2ea887d6cf89fa829f96c1c7a55edc57bb3fd667d523fd3bf601473044022019410b20ebcd8eb3ee7ec1eff6bf0f9cbfaea82116811c61f3cf24af7e4434b1022009e5823f3349f695be09ae40754185300d8442a22715ddb5ffa17c4213140e7201483045022100964ef26a9074c3cdafffcfbe4bd445933f8c842ba11fd887922adcf7fabe0c82022023055d94c75ab223c767fbaa825c917e9beecbc7d5758cccf20d886c63d4b72a0147304402207aa3a98197697d258a8baae681f0b4c0ee682982f4205534e6c95a37dabaddd60220517a7ed5c03da2f242e17ccfdae0d81d6f454d7f9ea931fc62df6c0eab922186014d01025f21023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43d210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a621038caebd6f753bbbd2bb1f3346a43cd32140648583673a31d62f2dfb56ad0ab9e32103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a79022103fe91eca10602d7dad4c9dab2b2a0858f71e25a219a6940749ce7a48118480dae210234716c01c2dd03fa7ee302705e2b8fbd1311895d94b1dca15e62eedea9b0968f210341fb2ead334952cf60f4481ba435c4693d0be649be01d2cfe9b02018e483e7bd2102dad8b2bce360a705c16e74a50a36459b4f8f4b78f9cd67def29d54ef6f7c7cf9210222dbe3f5f197a34a1d50e2cbe2a1085cac2d605c9e176f9a240e0fd0c669330d2103fb41afab56c9cdb013fda63d777d4938ddc3cb2ad939712da688e3ed333f95982102435f177646bdc717cb3211bf46656ca7e8d642726144778c9ce816b8b8c36ccf2102158d8e20095364031d923c7e9f7f08a14b1be1ddee21fe1a5431168e31345e5521026259794892428ca0818c8fb61d2d459ddfe20e57f50803c7295e6f4e2f5586652102815f910a8689151db627e6e262e0a2075ad5ec2993a6bc1b876a9d420923d681210318f54647f645ff01bd49fedc0219343a6a22d3ea3180a3c3d3097e4b888a8db45faeffffffff0110270000000000001976a9144a087d89f8ad16ca029c675b037c02fd1c5f9aec88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/fifteenOfFifteen'
    }
};

const missingPubkey = (): SubtestSignTx => {
    const testPayloads: Array<TestSignTxPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bitcoin',
            inputs: [
                {
                    address_n: [10],
                    prev_hash: 'c6091adf4c0c23982a35899a6e58ae11e703eacd7954f588ed4b9cdefc4dba52',
                    prev_index: 1,
                    script_type: 'SPENDMULTISIG',
                    multisig: {
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
                    }
                },
            ],
            outputs: [
                {
                    address: '12iyMbUb4R2K3gre4dHSrbu5azG5KaqVss',
                    amount: 100000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        }
    ];

    const expectedResponses: Array<ExpectedSignTxResponse> = [
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/missingPubkey',
    }
};

export const signTxMultisig = (): void => {
    const subtest: SignTxMultisigAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        twoOfThree,
        fifteenOfFifteen,
        missingPubkey,
    };

    describe('SignTxMultisig', () => {
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