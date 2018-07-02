/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getHDPath } from '../../js/utils/pathUtils.js';

import type {
    SubtestSignTx,
    SignTxBcashAvailableSubtests,
} from 'flowtype/tests';
import type {
    TestSignTxPayload,
    ExpectedSignTxResponse,
} from 'flowtype/tests/sign-tx';

const change = (): SubtestSignTx => {
    const testPayloads: Array<TestSignTxPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bcash',
            inputs: [
                {
                    address_n: getHDPath("44'/145'/0'/0/0"),
                    amount: 1995344,
                    prev_hash: 'bc37c28dfb467d2ecb50261387bf752a3977d7e5337915071bb4151e6b711a78',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
            ],

            outputs: [
                {
                    address_n: getHDPath("44'/145'/0'/1/0"),
                    amount: 1896050,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: 'bitcoincash:qr23ajjfd9wd73l87j642puf8cad20lfmqdgwvpat4',
                    amount: 73452,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTxResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000001781a716b1e15b41b07157933e5d777392a75bf87132650cb2e7d46fb8dc237bc000000006a473044022061aee4f17abe044d5df8c52c9ffd3b84e5a29743517e488b20ecf1ae0b3e4d3a02206bb84c55e407f3b684ff8d9bea0a3409cfd865795a19d10b3d3c31f12795c34a412103a020b36130021a0f037c1d1a02042e325c0cb666d6478c1afdcd9d913b9ef080ffffffff0272ee1c00000000001976a914b1401fce7e8bf123c88a0467e0ed11e3b9fbef5488acec1e0100000000001976a914d51eca49695cdf47e7f4b55507893e3ad53fe9d888ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/change',
    };
};

const noChange = (): SubtestSignTx => {
    const testPayloads: Array<TestSignTxPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bcash',
            inputs: [
                {
                    address_n: getHDPath("44'/145'/0'/1/0"),
                    amount: 1896050,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
                {
                    address_n: getHDPath("44'/145'/0'/0/1"),
                    amount: 73452,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 1,
                    script_type: 'SPENDADDRESS',
                },
            ],

            outputs: [
                {
                    address: 'bitcoincash:qq6wnnkrz7ykaqvxrx4hmjvayvzjzml54uyk76arx4',
                    amount: 1934960,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTxResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000022c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50000000006a47304402207a2a955f1cb3dc5f03f2c82934f55654882af4e852e5159639f6349e9386ec4002205fb8419dce4e648eae8f67bc4e369adfb130a87d2ea2d668f8144213b12bb457412103174c61e9c5362507e8061e28d2c0ce3d4df4e73f3535ae0b12f37809e0f92d2dffffffff2c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50010000006a473044022062151cf960b71823bbe68c7ed2c2a93ad1b9706a30255fddb02fcbe056d8c26102207bad1f0872bc5f0cfaf22e45c925c35d6c1466e303163b75cb7688038f1a5541412102595caf9aeb6ffdd0e82b150739a83297358b9a77564de382671056ad9e5b8c58ffffffff0170861d00000000001976a91434e9cec317896e818619ab7dc99d2305216ff4af88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noChange',
    };
};

const oldAddr = (): SubtestSignTx => {
    const testPayloads: Array<TestSignTxPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bcash',
            inputs: [
                {
                    address_n: getHDPath("44'/145'/0'/1/0"),
                    amount: 1896050,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
                {
                    address_n: getHDPath("44'/145'/0'/0/1"),
                    amount: 73452,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 1,
                    script_type: 'SPENDADDRESS',
                },
            ],

            outputs: [
                {
                    address: '15pnEDZJo3ycPUamqP3tEDnEju1oW5fBCz',
                    amount: 1934960,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTxResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000022c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50000000006a47304402207a2a955f1cb3dc5f03f2c82934f55654882af4e852e5159639f6349e9386ec4002205fb8419dce4e648eae8f67bc4e369adfb130a87d2ea2d668f8144213b12bb457412103174c61e9c5362507e8061e28d2c0ce3d4df4e73f3535ae0b12f37809e0f92d2dffffffff2c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50010000006a473044022062151cf960b71823bbe68c7ed2c2a93ad1b9706a30255fddb02fcbe056d8c26102207bad1f0872bc5f0cfaf22e45c925c35d6c1466e303163b75cb7688038f1a5541412102595caf9aeb6ffdd0e82b150739a83297358b9a77564de382671056ad9e5b8c58ffffffff0170861d00000000001976a91434e9cec317896e818619ab7dc99d2305216ff4af88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oldAddr',
    };
};

// TODO: test_send_bch_multisig_wrongchange, test_send_bch_multisig_change, must specify multisig in output
/* const sendMultisigWrongChange = (): SubtestSignTx => {
    const testPayloads: Array<TestSignTxPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bcash',
            inputs: [
                {
                    address_n: getHDPath("44'/145'/1'/1/0"),
                    prev_hash: 'f68caf10df12d5b07a34601d88fa6856c6edcbf4d05ebef3486510ae1c293d5f',
                    prev_index: 1,
                    script_type: 'SPENDMULTISIG',
                    amount: 24000,
                    multisig: {
                        pubkeys: [
                            {
                                node: 'xpub6DFYZ2FZwJHL6vwJdzyXwgVK4wNLBcN56wTdLLt3CCVhpZTcUMfuTg5TpUzsAKcEdXsyks9JfkgPH7Wg5gLrpeQXiJtSeMyyX68hkYoW1tj',
                                address_n: [1, 0],
                            },
                            {
                                node: 'xpub6DFYZ2FZwJHL81KQ3GTCFgzpyKijch3dfQ1hH6pSGWV6knjBaCQE2KCVHKnP95V8d9o6JhZw9LTBd6BKogxeFuHuzaTSLC7krAzsKhL8VmF',
                                address_n: [1, 0],
                            },
                            {
                                node: 'xpub6DFYZ2FZwJHLCH9ZDt7JTpuvm2o44BqNwa3zN7Rdk79FT91mm5Q8oyo5y6JLUptuBtQFMqSMeFVpLbe15X8sJwHCfQmkKQPpFdR4VN49Rzx',
                                address_n: [1, 0],
                            },
                        ],
                        signatures: [
                            '',
                            '304402207274b5a4d15e75f3df7319a375557b0efba9b27bc63f9f183a17da95a6125c94022000efac57629f1522e2d3958430e2ef073b0706cfac06cce492651b79858f09ae',
                            '',
                        ],
                        m: 2,
                    },
                },
            ],
            outputs: [
                {
                    address_n: getHDPath("44'/145'/1'/1/1"),
                    amount: 23000,
                    script_type: 'PAYTOMULTISIG',
                },
            ],
        }
    ];
    const expectedResponses: Array<ExpectedSignTxResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000011553ef34c683f4d6a8d346844409e6e7fc4ff01eaa25b7e8ce215abbfee3896101000000fd43060048304502210098e23085ad7282de988bf98afa1e9add9c9830009132f8902a9fa4624d5dc98b0220733216e70ab67791aa64be5c83d2050cb4ed9ff7eda2a1acc35da024d2ab2a670147304402201f8c11fb6e90fd616e484986e9451929797eba039882a9abcc203210948060b9022044da031530de7d9747d3c5a8e7cec04b04b7af495c9120b854ce7362af7fa05a01483045022100ea67c70186acef019bdf1551881bf38e6f88186501b64d3a756a2ce18e4ba18002201c35110325653e21e448b60053a4b5dda46b61096faf701a1faca61fcde91f00014730440220315598992f156d2f9d7b4275395fa067aa61ea95829fa17730885c86df4de70d02203eda9ade1656e2198c668603b17e197acb0969ed183ab0841303ea261205618901473044022060fdd6621edde9b8cf6776bc4eef26ace9b57514d725b7214ba11d333520a30e022044c30744f94484aec0f896233c5613a3256878ec0379f566226906b6d1b6061401483045022100b1d907e3574f60f7834c7e9f2e367998ce0461dad7d742d84ef8917d713f41f902203b3ac54f7bb2f7fb8685f582d2a94f7213a37cb508acffe29090cc06ae01588b01483045022100e3bf90ff3ad6395e42f46002f253f94ca0e8ffaa0620f2ceb4fa21493abdca4d02201d4c28b10b740bb2dc4b3695b4205c18f8c0dad2bb69540eb8a36576463cd5280147304402202cfaf9fab7dc1c9f0c3c23bd46bd6d5cea0664d914139fc9add80766ce998808022012db2802c07853e4cbe147afdf0b47e60bdcbcd31f9df19e04c177ed9aa66c6d0147304402207cbc2d83f351eee5ee91df26bb0c7e1cb07fe328cbbcdb0bb9656d37922c497302201b3435d4c71ffd1b34d45892f2a487bd79c8c7f57cc04373287642bb9610cb840147304402202dc3eab30ccb06553703e794212f43ee9a659f5e787a8374e9ea0bf6de0def7402201a70e970c21a807783313ed102bf4f0a3406ac7c84f94bc8194c5e209464d7230147304402206b04530c190c46a879d7771a6ad53acd33547e0d7fd320d5ad0b5b1fdeb5d4c202207b812be81c3419daadc942cca0c55aa32c7759fa7566c6dc35f030ca87a1c5be01483045022100ce523dddd6eef73d5ae7c44c870466e1ac5a7a77d43475e8def024af68977a1e022028be0276435bfa2ea887d6cf89fa829f96c1c7a55edc57bb3fd667d523fd3bf601473044022019410b20ebcd8eb3ee7ec1eff6bf0f9cbfaea82116811c61f3cf24af7e4434b1022009e5823f3349f695be09ae40754185300d8442a22715ddb5ffa17c4213140e7201483045022100964ef26a9074c3cdafffcfbe4bd445933f8c842ba11fd887922adcf7fabe0c82022023055d94c75ab223c767fbaa825c917e9beecbc7d5758cccf20d886c63d4b72a0147304402207aa3a98197697d258a8baae681f0b4c0ee682982f4205534e6c95a37dabaddd60220517a7ed5c03da2f242e17ccfdae0d81d6f454d7f9ea931fc62df6c0eab922186014d01025f21023230848585885f63803a0a8aecdd6538792d5c539215c91698e315bf0253b43d210338d78612e990f2eea0c426b5e48a8db70b9d7ed66282b3b26511e0b1c75515a621038caebd6f753bbbd2bb1f3346a43cd32140648583673a31d62f2dfb56ad0ab9e32103477b9f0f34ae85434ce795f0c5e1e90c9420e5b5fad084d7cce9a487b94a79022103fe91eca10602d7dad4c9dab2b2a0858f71e25a219a6940749ce7a48118480dae210234716c01c2dd03fa7ee302705e2b8fbd1311895d94b1dca15e62eedea9b0968f210341fb2ead334952cf60f4481ba435c4693d0be649be01d2cfe9b02018e483e7bd2102dad8b2bce360a705c16e74a50a36459b4f8f4b78f9cd67def29d54ef6f7c7cf9210222dbe3f5f197a34a1d50e2cbe2a1085cac2d605c9e176f9a240e0fd0c669330d2103fb41afab56c9cdb013fda63d777d4938ddc3cb2ad939712da688e3ed333f95982102435f177646bdc717cb3211bf46656ca7e8d642726144778c9ce816b8b8c36ccf2102158d8e20095364031d923c7e9f7f08a14b1be1ddee21fe1a5431168e31345e5521026259794892428ca0818c8fb61d2d459ddfe20e57f50803c7295e6f4e2f5586652102815f910a8689151db627e6e262e0a2075ad5ec2993a6bc1b876a9d420923d681210318f54647f645ff01bd49fedc0219343a6a22d3ea3180a3c3d3097e4b888a8db45faeffffffff0110270000000000001976a9144a087d89f8ad16ca029c675b037c02fd1c5f9aec88ac00000000',
                },
                signatues: [
                    '3044022052ccf022b3684ecce9f961ce8828387b97267c86bedf0ce16a24bf014e62e42c022035d315ddbeeef7ab3456bd09aed8b625ea58852216b60e4b84ba9f85827d305c',
                ],
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sendMultisigWrongChange',
    };
}; */

export const signTxBcash = (): void => {
    const subtest: SignTxBcashAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        change,
        noChange,
        oldAddr,
        /* sendMultisigWrongChange, */
    };

    describe('SignTxBCash', () => {
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
