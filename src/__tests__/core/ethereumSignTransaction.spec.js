/* @flow */
import type {
    TestFunction,
    SubtestEthereumSignTransaction,
} from 'flowtype/tests';
import type {
    TestEthereumSignTransactionPayload,
    ExpectedEthereumSignTransactionResponse,
} from 'flowtype/tests/ethereum-sign-transaction';

const knownErc20Token = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
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
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            payload: {
                r: '0xaa0c28d61c7c9382a256ead609d5b713cfe17c3aa3a6facb6b60342883db448e',
                s: '0x039d88ed4ce5416680117dbee92f86976b381241786f1ffaf058c8e80cb25c63',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/knownErc20Token',
    };
};

const unknownErc20Token = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
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
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            payload: {
                r: '0xafd33dc30cf829e3fde2575f189b9f80a6e7cfe3bbad8554f1015b29c33fb13d',
                s: '0x5a4efd7242bae4e460ae2e608470ee19237246f72601bf879d0444100d6ae9ab',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/unknownErc20Token',
    };
};

const noData = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                nonce: '0x0',
                gasPrice: '0x14',
                gasLimit: '0x14',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xa',
            },
        },
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            payload: {
                r: '0xff2676c3d23f4ed59b41a284348b6e4cc56fa4b4c06ab2cd2cfa0fc85d3d5b72',
                s: '0x180682139cb3ec01d8371bd42996c689e2f11a14c89b2c57494a6020bae09417',
                v: '0x1b',
            },
        },
        {
            payload: {
                r: '0x324f82ca8a681ea882f7abfcc396addd13b4a947d65d3cf972c2a44cfbc35c89',
                s: '0x6fddb0aa918ab0ff5bd09368b4edec21e9a626c1acf8d839b821784db2b44fac',
                v: '0x1c',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noData',
    };
};

const data = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
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
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
                data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            payload: {
                r: '0xc07ca9b87ebf87620396a16cd575ac68dbef0eb0b22481f8f62facfe40fc4c7a',
                s: '0x3e2f26e2fb739cfeafee82f3f74ecd0b88dfba4d3cf850eb10f53569f424f3a0',
                v: '0x1c',
            },
        },
        {
            payload: {
                r: '0x2a27c485c02cdd4796eab5624cca2e5024b3567ff04ac144a0cb2a46c8bef98c',
                s: '0x56e5ca6a6adb6ee90e4749f3b28f372ccc8b3ba9a51ec1e739ba1cba0cc7eba5',
                v: '0x1c',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/data',
    };
};

const message = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                nonce: '0x0',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0x0',
                data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            payload: {
                r: '0xce5c299678f8ba333c219a3f70f01f7281bf4716cf4c2d47518f689cf3344dc4',
                s: '0x194495dedbcbfdc6bbccfd83f1b8b5a2802e5da1c86e61731ffbc59e5b1719b2',
                v: '0x1c',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/message',
    };
};

const newContract = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x4e20',
                gasLimit: '0x4e20',
                to: '',
                value: '0xab54a98ceb1f0ad2',
            },
        },
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
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
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            success: false,
            payload: {
                code: 'Failure_DataError',
            },
        },
        {
            payload: {
                r: '0x05249f09ef32544c07aba09767f4dbe5248472b5c5250e77911a034e0978041a',
                s: '0x0239c60830534b34db1c4c3d715253f2ed2786a322c6218c424188ccf0f0f464',
                v: '0x1b',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/newContract',
    };
};

const sanityChecks = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            // Gas overflow
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
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
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                nonce: '0x1e240',
                gasLimit: '0x2710',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
        {
            // No gas limit
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                nonce: '0x1e240',
                gasPrice: '0x2710',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
        {
            // No nonce
            method: 'ethereumSignTransaction',
            path: "m/44'/60'/0'",
            transaction: {
                gasLimit: '0x2710',
                to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                value: '0xab54a98ceb1f0ad2',
            },
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            success: false,
            payload: {
                code: 'Failure_DataError',
            },
        },
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

const noDataEip155 = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/1'/0'/0/0",
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
            method: 'ethereumSignTransaction',
            path: "m/44'/1'/0'/0/0",
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
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            payload: {
                r: '0x39aa7798b8debf2db32945d929d25bd9c514e7f7e6a1f1c72bcbf0600f9f2db3',
                s: '0x66e3a42fde7e7eb1096bc1f90342914612019688d97fe6b0571f420b5ddcb64c',
                v: '0x29',
            },
        },
        {
            payload: {
                r: '0x0283d00760697f456534ad547cb1aa0542527929bbe13d82877be23505a5b012',
                s: '0x2db7e0ea93dedf0226675b1b0498c1568c76e0c2d69dbfabb65bfa1412fb773b',
                v: '0x29',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noDataEip155',
    };
};

const dataEip155 = (): SubtestEthereumSignTransaction => {
    const testPayloads: Array<TestEthereumSignTransactionPayload> = [
        {
            method: 'ethereumSignTransaction',
            path: "m/44'/1'/0'/0/0",
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
            method: 'ethereumSignTransaction',
            path: "m/44'/1'/0'/0/0",
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
            method: 'ethereumSignTransaction',
            path: "m/44'/1'/0'/0/0",
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
            method: 'ethereumSignTransaction',
            path: "m/44'/1'/0'/0/0",
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
    const expectedResponses: Array<ExpectedEthereumSignTransactionResponse> = [
        {
            payload: {
                r: '0xdbae2f01331e274f24831afadaa86f1da08c9cf9e28b120acc17ec4a748c533a',
                s: '0x2e2a390c4afd7617d654b9affdee21b9b593964f19ac618039007b2c6677563f',
                v: '0x29',
            },
        },
        {
            payload: {
                r: '0x8ceec1dc6f52a6ff4d17584ebbae00e9d6210a960fba29095f077d57e0dbc28d',
                s: '0x3dd7d1b01c399d70a81fae0c0e5a306d1456b6f9a8d38514763d747af1e74c38',
                v: '0x29',
            },
        },
        {
            payload: {
                r: '0x0672d6eb1b238b225be64dcbe39f52a9fb376c3cc47ec3d3dd28c94fcaac98fe',
                s: '0x677959c411ef54889448de94661dfddef91292da7dd9a5855b9ee71bcd2bba6f',
                v: '0x29',
            },
        },
        {
            payload: {
                r: '0x23e1a4e27fd9926621bd75ecd7519e324a18a6ca156cafd522a9445096217360',
                s: '0x4cdc7f2d028449acd0c2b72aeaab20d571e0cf6439a2e4b3cb5f45ff7a92d2d9',
                v: '0x2a',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/dataEip155',
    };
};

export const ethereumSignTransaction = (): TestFunction => {
    const testName = 'EthereumSignTransaction';
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

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
