/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import type {
    SubtestEthereumSignTx,
    EthereumSignTxAvailableSubtests,
} from 'flowtype/tests';
import type {
    TestEthereumSignTxPayload,
    ExpectedEthereumSignTxResponse,
} from 'flowtype/tests/ethereum-sign-tx';

const knownErc20Token = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload>  = [
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x0',
                gasPrice: '0x14',
                gasLimit: '0x14',
                to: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
                chainId: 1,
                value: '0x0',
                data: '0xa9059cbb000000000000000000000000574bbb36871ba6b78e27f4b4dcfb76ea0091880b000000000000000000000000000000000000000000000000000000000bebc200',
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        {
            payload: {
                r: '75cf48fa173d8ceb68af9e4fb6b78ef69e6ed5e7679ba6f8e3e91d74b2fb0f96',
                s: '65de4a8c35263b2cfff3954b12146e8e568aa67a1c2461d6865e74ef75c7e190',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/knownErc20Token',
    };
};

const unknownErc20Token = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x0',
                gasPrice: '0x14',
                gasLimit: '0x14',
                to: '0xfc6b5d6af8a13258f7cbd0d39e11b35e01a32f93',
                chainId: 1,
                value: '0x0',
                data: '0xa9059cbb000000000000000000000000574bbb36871ba6b78e27f4b4dcfb76ea0091880b0000000000000000000000000000000000000000000000000000000000000123',
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        {
            payload: {
                r: '1707471fbf632e42d18144157aaf4cde101cd9aa9782ad8e30583cfc95ddeef6',
                s: '3d2e52ba5904a4bf131abde3f79db826199f5d6f4d241d531d7e8a30a3b9cfd9',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/unknownErc20Token',
    };
};

const noData = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x0',
                gasPrice: '0x14',
                gasLimit: '0x14',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xa',
            },
        },
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        }
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        {
            payload: {
                r: '9b61192a161d056c66cfbbd331edb2d783a0193bd4f65f49ee965f791d898f72',
                s: '49c0bbe35131592c6ed5c871ac457feeb16a1493f64237387fab9b83c1a202f7',
                v: 27,
            },
        },
        {
            payload: {
                r: '6de597b8ec1b46501e5b159676e132c1aa78a95bd5892ef23560a9867528975a',
                s: '6e33c4230b1ecf96a8dbb514b4aec0a6d6ba53f8991c8143f77812aa6daa993f',
                v: 28,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noData',
    };
};

const data = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x0',
                gasPrice: '0x14',
                gasLimit: '0x14',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xa',
                data: `0x${'6162636465666768696a6b6c6d6e6f70'.repeat(16)}`,
            },

        },
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
                data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
            },
        }
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        {
            payload: {
                r: '6da89ed8627a491bedc9e0382f37707ac4e5102e25e7a1234cb697cedb7cd2c0',
                s: '691f73b145647623e2d115b208a7c3455a6a8a83e3b4db5b9c6d9bc75825038a',
                v: 28,
            },
        },
        {
            payload: {
                r: '4e90b13c45c6a9bf4aaad0e5427c3e62d76692b36eb727c78d332441b7400404',
                s: '3ff236e7d05f0f9b1ee3d70599bb4200638f28388a8faf6bb36db9e04dc544be',
                v: 28,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/data'
    };
};

const message = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x0',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0x0',
                data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
            },
        }
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        {
            payload: {
                r: '070e9dafda4d9e733fa7b6747a75f8a4916459560efb85e3e73cd39f31aa160d',
                s: '7842db33ef15c27049ed52741db41fe3238a6fa3a6a0888fcfb74d6917600e41',
                v: 28,
            },
        },
    ];


    return {
        testPayloads,
        expectedResponses,
        specName: '/message',
    };
};

const newContract = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '',
                value: '0xab54a98ceb1f0ad2',
            },
        },
        {
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x0',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '',
                value: '0xab54a98ceb1f0ad2',
                data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        { success: false },
        {
            payload: {
                r: 'b401884c10ae435a2e792303b5fc257a09f94403b2883ad8c0ac7a7282f5f1f9',
                s: '4742fc9e6a5fa8db3db15c2d856914a7f3daab21603a6c1ce9e9927482f8352e',
                v: 28,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/newContract',
    };
};

const sanityChecks = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            // Gas overflow
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0xffffffffffffffffffffffffffffffff',
                gasLimit: '0xffffffffffffffffffffffffffffffff',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
        {
            // No gas price
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x1e240',
                gasLimit: '0x2710',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
        {
            // No gas limit
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x2710',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
        {
            // No nonce
            method: 'ethereumSignTx',
            path: [0, 0],
            transaction: {
                gasLimit: '0x2710',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        { success: false },
        { success: false },
        { success: false },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sanityChecks',
    };
};

const noDataEip155 = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            method: 'ethereumSignTx',
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            transaction: {
                nonce: '0x0',
                gasPrice: '0x4a817c800',
                gasLimit: '0x5208',
                to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                value: '0x16345785d8a0000',
                chainId: 3,
            },
        },
        {
            method: 'ethereumSignTx',
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            transaction: {
                nonce: '0x1',
                gasPrice: '0x4a817c800',
                gasLimit: '0x5208',
                to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                value: '0x16345785d8a0000',
                chainId: 3,
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        {
            payload: {
                r: 'a90d0bc4f8d63be69453dd62f2bb5fff53c610000abf956672564d8a654d401a',
                s: '544a2e57bc8b4da18660a1e6036967ea581cc635f5137e3ba97a750867c27cf2',
                v: 41,
            },
        },
        {
            payload: {
                r: '699428a6950e23c6843f1bf3754f847e64e047e829978df80d55187d19a401ce',
                s: '087343d0a3a2f10842218ffccb146b59a8431b6245ab389fde22dc833f171e6e',
                v: 42,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noDataEip155',
    }
};

const dataEip155 = (): SubtestEthereumSignTx => {
    const testPayloads: Array<TestEthereumSignTxPayload> = [
        {
            method: 'ethereumSignTx',
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            transaction: {
                nonce: '0x2',
                gasPrice: '0x4a817c800',
                gasLimit: '0x520c',
                to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                value: '0x16345785d8a0000',
                data: '0x0',
                chainId: 3,
            },
        },
        {
            method: 'ethereumSignTx',
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            transaction: {
                nonce: '0x3',
                gasPrice: '0x4a817c800',
                gasLimit: '0x492d4',
                to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                value: '0x16345785d8a0000',
                data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
                chainId: 3,
            },
        },
        {
            method: 'ethereumSignTx',
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            transaction: {
                nonce: '0x4',
                gasPrice: '0x4a817c800',
                gasLimit: '0x520c',
                to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                value: '0x0',
                data: '0x0',
                chainId: 3,
            },
        },
        {
            method: 'ethereumSignTx',
            path: [2147483692, 2147483649, 2147483648, 0, 0],
            transaction: {
                nonce: '0x5',
                gasPrice: '0x0',
                gasLimit: '0x520c',
                to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                value: '0x0',
                data: '0x0',
                chainId: 3,
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTxResponse> = [
        {
            payload: {
                r: 'ba85b622a8bb82606ba96c132e81fa8058172192d15bc41d7e57c031bca17df4',
                s: '6473b75997634b6f692f8d672193591d299d5bf1c2d6e51f1a14ed0530b91c7d',
                v: 42,
            },
        },
        {
            payload: {
                r: 'd021c98f92859c8db5e4de2f0e410a8deb0c977eb1a631e323ebf7484bd0d79a',
                s: '2c0e9defc9b1e895dc9520ff25ba3c635b14ad70aa86a5ad6c0a3acb82b569b6',
                v: 42,
            },
        },
        {
            payload: {
                r: 'dd52f026972a83c56b7dea356836fcfc70a68e3b879cdc8ef2bb5fea23e0a7aa',
                s: '079285fe579c9a2da25c811b1c5c0a74cd19b6301ee42cf20ef7b3b1353f7242',
                v: 42,
            },
        },
        {
            payload: {
                r: 'f7505f709d5999343aea3c384034c62d0514336ff6c6af65582006f708f81503',
                s: '44e09e29a4b6247000b46ddc94fe391e94deb2b39ad6ac6398e6db5bec095ba9',
                v: 42,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/dataEip155',
    };
};

export const ethereumSignTx = () => {
    const subtest: EthereumSignTxAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        knownErc20Token,
        unknownErc20Token,
        noData,
        data,
        message,
        newContract,
        sanityChecks,
        noDataEip155,
        dataEip155,
    };

    describe('EthereumSignTx', () => {
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

            console.warn(payload);

            it(specName, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};
