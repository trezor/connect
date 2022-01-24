import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/getpublickey.json';

export default {
    method: 'ethereumGetPublicKey',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests
        .flatMap(({ parameters, result }) => ({
            description: parameters.path,
            params: {
                path: parameters.path,
            },
            result: {
                fingerprint: result.fingerprint,
                childNum: result.child_num,
                chainCode: result.chain_code,
                publicKey: result.public_key,
                xpub: result.xpub,
            },
        }))
        // Cross-chain transaction
        .concat([
            {
                description: 'Cross-chain public key not allowed (missing param)',
                params: {
                    path: 'm/0',
                },
                result: false,
            },
            {
                description: 'Cross-chain public key allowed',
                params: {
                    path: 'm/0',
                    crossChain: true,
                },
                result: {
                    xpub: 'xpub68zNxjsTrV8y8uoJ6ruP8b4YWfWxVjBXqi8XVoVszyQZRPR2xonw7X6tiVbXzQkGEoCMTxDqJWyXoPkcxF2QWehP8isk5Tgdt7jDRjc8emc',
                },
            },
        ]),
};
