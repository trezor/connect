/* @flow */
import type { CardanoSignTransaction } from '../../js/types';

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

const signMainnetNoChange = () => {
    const inputs = [
        SAMPLE_INPUT,
    ];
    const outputs = [
        SAMPLE_OUTPUTS['simple_output'],
    ];

    const testPayloads: CardanoSignTransaction[] = [
        {
            method: 'cardanoSignTransaction',
            inputs,
            outputs,
            fee: FEE,
            ttl: TTL,
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                hash: '73e09bdebf98a9e0f17f86a2d11e0f14f4f8dae77cdf26ff1678e821f20c8db6',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030aa1028184582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840da07ac5246e3f20ebd1276476a4ae34a019dd4b264ffc22eea3c28cb0f1a6bb1c7764adeecf56bcb0bc6196fd1dbe080f3a7ef5b49f56980fe5b2881a4fdfa00582026308151516f3b0e02bb1638142747863c520273ce9bd3e5cd91e1d46fe2a63541a0f6',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/signMainnetTx',
    };
};

const signMainnetChange = () => {
    const inputs = [
        SAMPLE_INPUT,
    ];
    const outputs = [
        SAMPLE_OUTPUTS['simple_output'],
        SAMPLE_OUTPUTS['change_output'],
    ];

    const testPayloads: CardanoSignTransaction[] = [
        {
            method: 'cardanoSignTransaction',
            inputs,
            outputs,
            fee: FEE,
            ttl: TTL,
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                hash: '81b14b7e62972127eb33c0b1198de6430540ad3a98eec621a3194f2baac43a43',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e882582b82d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a000f424002182a030aa1028184582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840d909b16038c4fd772a177038242e6793be39c735430b03ee924ed18026bd28d06920b5846247945f1204276e4b759aa5ac05a4a73b49ce705ab0e5e54a3a170e582026308151516f3b0e02bb1638142747863c520273ce9bd3e5cd91e1d46fe2a63541a0f6',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/signMainnetTx',
    };
};

const signTestnet = () => {
    const inputs = [
        SAMPLE_INPUT,
    ];
    const outputs = [
        SAMPLE_OUTPUTS['testnet_output'],
        SAMPLE_OUTPUTS['change_output'],
    ];

    const testPayloads: CardanoSignTransaction[] = [
        {
            method: 'cardanoSignTransaction',
            inputs,
            outputs,
            fee: FEE,
            ttl: TTL,
            protocolMagic: PROTOCOL_MAGICS['testnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                hash: '5dd03fb44cb88061b2a1c246981bb31adfe4f57be69b58badb5ae8f448450932',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018282582f82d818582583581c586b90cf80c021db288ce1c18ecfd3610acf64f8748768b0eb7335b1a10242182a001aae3129311a002dd2e882582f82d818582583581c98c3a558f39d1d993cc8770e8825c70a6d0f5a9eb243501c4526c29da10242182a001aa8566c011a000f424002182a030aa1028184582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840fc30afdd0d4a6d8581e0f6abe895994d208fd382f2b23ff1553d711477a4fedbd1f68a76e7465c4816d5477f4287f7360acf71fca3b3d5902e4448e48c447106582026308151516f3b0e02bb1638142747863c520273ce9bd3e5cd91e1d46fe2a63545a10242182af6',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/signMainnetTx',
    };
};

export const cardanoSignTransaction = () => {
    const availableSubtests = {
        signMainnetNoChange,
        signMainnetChange,
        signTestnet,
    };
    return {
        testName: 'CardanoSignTransaction',
        mnemonic: 'mnemonic_all',
        subtests: {
            ...availableSubtests,
        },
    };
};
