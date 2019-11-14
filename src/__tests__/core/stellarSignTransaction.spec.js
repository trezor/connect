/* todo: flow */
/* eslint-disable */

// Test data from:
// https://github.com/trezor/trezor-firmware/blob/master/tests/device_tests/test_msg_stellar_sign_transaction.py

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { settings, CoreEventHandler } from './common.js';

const header = {
    method: 'stellarSignTransaction',
    path: `m/44'/148'/0'`,
    networkPassphrase: 'Test SDF Network ; September 2015',
}

const transactionCommon = {
    source: 'GAK5MSF74TJW6GLM7NLTL76YZJKM2S4CGP3UH4REJHPHZ4YBZW2GSBPW',
    fee: 100,
    sequence: 4294967296,
    memo: {
        type: 0,
    },
}

const PUBLIC_KEY = '15d648bfe4d36f196cfb5735ffd8ca54cd4b8233f743f22449de7cf301cdb469';

const createAccount = () => {
    const testPayloads = [
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'createAccount',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        startingBalance: '1000333000',
                    }
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'beb458aa43386f9e0dac3474e54ad6ed91d4ec235c89d5747e7f9b93d76a396d5b09b997dd87de45b9364dfd5a79af27afd483d2c7c186dac3a5dcb151e9e307',
            },
        },
    ];

    return {
        specName: '/createAccount',
        testPayloads,
        expectedResponses,
    }
}

const accountMerge = () => {
    const testPayloads = [
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'accountMerge',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                    }
                ]
            }
        }
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: '15d648bfe4d36f196cfb5735ffd8ca54cd4b8233f743f22449de7cf301cdb469',
                signature: 'd91dcf8fcf54f9d5abab2ee8b54acb2e3b40363020d2598140bf04fbcf4fa3463de28a9991ab8ff23dd613bfbfcfbbc5e97bc030ba0e76a458914cebda887b0e',
            },
        },
    ];

    return {
        specName: '/accountMerge',
        testPayloads,
        expectedResponses,
    }
}

const payment = () => {
    const testPayloads = [
        // asset type native
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'payment',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        asset: {
                            type: 0,
                            code: 'XLM',
                        },
                        amount: '500111000',
                    }
                ]
            }
        },
        // asset type alphanum4
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'payment',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        amount: '500111000',
                        asset: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        }
                    }
                ]
            }
        },
        // asset type alphanum12
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'payment',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        amount: '500111000',
                        asset: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        }
                    }
                ]
            }
        }
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'a4373a8212822cda186edde1e1e070fb9df7db7ee6d01074269fddfd3c49080f37985de8e45af8979bf0016051eb685d4d600ff4c85596e63471de62e785300e',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '02b67274eb57536c21a11b928c92c52163d222cab701bb2770967e4c7176e02452ae2556c39172fdd1eb0e550ebb87f3536f08ea8b0331e237f5a59ece0e6d0f',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '41920fe1728f7dee0ea59b6e262cab319057f58073bc6a4719c9e076015f1e7da471d38dade177f38fe9085f34c5f1271a6f20aca6a83a75042b1a9c30abf100',
            },
        },
    ];

    return {
        specName: '/payment',
        testPayloads,
        expectedResponses,
    }
}

const bumpSequence = () => {
    const testPayloads = [
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'bumpSequence',
                        bumpTo: '9223372036854775807',
                    }
                ]
            }
        }
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '64c21f1d6869c97760e343f3c0eb647176276d920ed76432d16be41aaa18a5bee3c966c6d874021bb7605a10a85392bcd69bd94c0da933088f8ccc025c0fff06',
            },
        },
    ];

    return {
        specName: '/bumpSequence',
        testPayloads,
        expectedResponses,
    }
}



const setOptions = () => {
    const testPayloads = [
        // inflationDest
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        inflationDest: 'GAFXTC5OV5XQD66T7WGOB2HUVUC3ZVJDJMBDPTVQYV3G3K7TUHC6CLBR',
                    }
                ]
            }
        },
        // signer with ed25519PublicKey
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        signer: {
                            type: 0,
                            key: '72187adb879c414346d77c71af8cce7b6eaa57b528e999fd91feae6b6418628e',
                            weight: 2,
                        }
                    }
                ]
            }
        },
        // signer with sha256Hash
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        signer: {
                            type: 2,
                            key: '72187adb879c414346d77c71af8cce7b6eaa57b528e999fd91feae6b6418628e',
                            weight: 2,
                        }
                    }
                ]
            }
        },
        // signer with preAuthTx
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        signer: {
                            type: 1,
                            key: '72187adb879c414346d77c71af8cce7b6eaa57b528e999fd91feae6b6418628e',
                            weight: 2,
                        }
                    }
                ]
            }
        },
        // medThreshold
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        medThreshold: 0,
                    }
                ]
            }
        },
        // Threshold + clearFlags
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        clearFlags: 0,
                        lowThreshold: 0,
                        highThreshold: 3,
                    }
                ]
            }
        },
        // homedomain
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        setFlags: 3,
                        masterWeight: 4,
                        homeDomain: 'hello',
                    }
                ]
            }
        },
        // noop
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                    }
                ]
            }
        },
        // remove signer
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        signer: {
                            type: 0,
                            key: '72187adb879c414346d77c71af8cce7b6eaa57b528e999fd91feae6b6418628e',
                            weight: 0
                        }
                    }
                ]
            }
        },
        // unset homeDomain
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'setOptions',
                        homeDomain: '',
                    },
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '76f79684a63cc7b6f462a187587e85a354ac9316873f5d4d5ddda7ea81ca1a2bfe4ff2ea07e082cdb989034b69959fb41cd3c96c70fb2f706c83fcb8eb6a8b0c',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '1007a286e1418549e31fa4a077ffae00796f6a37eff78e1512935208bb0e50b371616768fd2d2525d519c3fda437a23eced28bed93d0e6060f25135478f4ce0a',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'd9c7d9ca38c1c5209706f1ed1a0e095728da6297935444cfeaf4a1165a3e33de84ac41036343dadc2a4a3b22964d749b7ff810e9fcb3168ac46dd66d4eee060e',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '4492b7d183cbea3e7e484b421d4ad3940aa9bf39df79b3b7ddf95a930ebe493ed8c16af713c9ba2a34ec1b323d5beaacc9eba4a3fe355f440cb4e993db0c3105',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '136a73d3a3c50790af213de9794718d30c68eeef5d6b687affefea8a6d5e4562c70bbdd9b45a83b4b30168a9ebeb765f8c1fe40f36660b31f18afe66fa6ebe01',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'c92404e1a4b44c8f8dd718d2c22fe90011e90be03a46b34f5833ae158189150e41e2f214d92faa97680218b13b6d089867974af74db57fe6b7d2666861e14b0f',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'db6adf70eaf10621396a4a4db27597f323e000ea5c95b6a356a5d469730d78bd34d29d4e845862d39d2dd7e18d469a123727d5b0918dbed948086a47e24b0301',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '837c9a09112a111a457a52f81194488c08ed2989059bb597490b1b918380d5ad2b8061f8892068f2ebfb8d51d81b722c274d9a4fec90d5aa071c91dc66e68f0e',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '82bade0d47be0ec690ba2ee301fcf354d7635dbad108900a82ed7b9fc7f340d76e6e85c00388fe56cc6a3b856b339d6f15abd4d965e4590b0286c7e5f4620907',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'ce69d6bced2cc8a4280a22cb9fa109b3b6fd8e9ac06f78e18f7675ba77651dc7435fbbc0d392ab4396a833de37be42100fa3a55f7d8cd56c8252983042045108',
            },
        },
    ];

    return {
        specName: '/setOptions',
        testPayloads,
        expectedResponses,
    }
}

const manageData = () => {
    const testPayloads = [
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageData',
                        name: 'data',
                        value: '616263', // Buffer.from('abc').toString('hex')
                    }
                ]
            }
        },
        // Buffer value
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageData',
                        name: 'data',
                        value: '001083', // Buffer.from("ABCD", "base64").toString('hex')
                    }
                ]
            }
        },
        // remove entry
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageData',
                        name: 'data',
                        value: null,
                    }
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '3136bc7e684cec1c58628f6463544a40516b83f3157f3b2088f4ae3fbf922598e14373f5b9c3792549df983e78f3850b44f8d54ddfb46188d2ea149c2eea5b09',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '0bbd890aceb16e3aeb27827e3663769f80830bd118ebaa899eb957f6b4b7676a4819c6993b2ec794c2cdacf6dfa3731fd9219cc4acf7e14cba0a82c9c21acd0d',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'c1ebb8d2b23a9145dfec9a465702484ed6130a824dc5d4eb2a1c98f011b463ad9de6eee3d241942aa0aa33a215390f465c375a4c6800e947a1c14b17b3206709',
            },
        },
    ];

    return {
        specName: '/manageData',
        testPayloads,
        expectedResponses,
    }
}

const pathPayment = () => {
    const testPayloads = [
        // asset native
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'pathPayment',
                        sendAsset: {
                            type: 0,
                            code: 'XLM',
                        },
                        sendMax: '500111000',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        destAsset: {
                            type: 0,
                            code: 'XLM',
                        },
                        destAmount: '500111000',
                    }
                ]
            }
        },
        // asset alphanum4
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'pathPayment',
                        sendAsset: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        sendMax: '500111000',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        destAsset: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        destAmount: '500111000',
                    }
                ]
            }
        },
        // asset alphanum12
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'pathPayment',
                        sendAsset: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        sendMax: '500111000',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        destAsset: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        destAmount: '500111000',
                    }
                ]
            }
        },
        // asset types combined
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'pathPayment',
                        sendAsset: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        sendMax: '500111000',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        destAsset: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        destAmount: '500111000',
                    }
                ]
            }
        },
        // with path
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'pathPayment',
                        sendAsset: {
                            type: 0,
                            code: 'XLM',
                        },
                        sendMax: '500111000',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        destAsset: {
                            type: 0,
                            code: 'XLM',
                        },
                        destAmount: '500111000',
                        path: [
                            {
                                type: 1,
                                code: 'X',
                                issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                            },
                            {
                                type: 2,
                                code: 'ABCDEFGHIJKL',
                                issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                            },
                        ],
                    }
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '104a9ccbca49622f02b9029c8f4e4be0ca58fb8d26b42c4a409a99580a0c25878ba5c4073f7936dfed76244355974694fc08c1983fb3f09930d164372ad01a0a',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '212c02000c7ca6bf7df1542a0353b3f79452f3b17e201c68fd6053303f4b4263d0e5d7de33fb2e78a5ff9fc5a8534ca386475aea84d2022083d080af9b559d00',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '95f44fbc1dfd91927ed461316899cd8aeebec81df11eb217cac2757e7c4ecd1d6249c209eff9223f5e8be816589697c92de933fa23c6178073af0d6aebefca0e',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'b4d3b04c55ff0d0565691e1197baa33d245013217f35fdb41b7509672c52549bc3a41d7e77990f17b0d4e435ece31a2610ede619bcf3a2723823d6f143af7402',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'c6999c263fa4ab9f22cdfaef42101b4b4706bf17fca3867e6a0a69a1fc7034932d0fb01db610e8e973eef379d4714f44f0b60acf45524bc7aa94fbbdae259e0f',
            },
        },
    ];

    return {
        specName: '/pathPayment',
        testPayloads,
        expectedResponses,
    }
}

const createPassiveOffer = () => {
    const testPayloads = [
        // asset native
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'createPassiveOffer',
                        selling: {
                            type: 0,
                            code: 'XLM',
                        },
                        buying: {
                            type: 0,
                            code: 'XLM',
                        },
                        amount: '500111000',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                    }
                ]
            }
        },
        // asset alphanum4
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'createPassiveOffer',
                        selling: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        buying: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        amount: '500111000',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                    }
                ]
            }
        },
        // asset alphanum12
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'createPassiveOffer',
                        selling: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        buying: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        amount: '500111000',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                    }
                ]
            }
        },
        // asset combined
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'createPassiveOffer',
                        selling: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        buying: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        amount: '9223372036854775807',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                    }
                ]
            }
        },
        // { n, d } price
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'createPassiveOffer',
                        selling: {
                            type: 0,
                            code: 'XLM',
                        },
                        buying: {
                            type: 0,
                            code: 'XLM',
                        },
                        amount: '500111000',
                        price: {
                            n: 1024,
                            d: 100,
                        },
                    }
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '90b39b6b8450ffc97df736562651b2d82c3fbdef15ea19f7c566fb23c8215aa7b71c4b87d2cc83701d1c1a645a8333896c8bccf6fcd34031e14a844cf8a8680e',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'b6a81b8bd705d5f013caa5c84eb2c11a2eaf1245c5adb6a4ff31c5493009bb223d76e987aef3f4dbbb992386518df231e9b773829d3dcc7560dead9ec966030c',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'ad33e9114d4f2957a5c4dfb552670cf500f67fd6b57d4fda4aad4160c3c645fd6a28f0afb6a517bc678200ee704cb6954093001556359912e46b099d8580570e',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'f62241ec7f84371150109d097e4c6fca1202eb95f94ac3400e3d8cc149e0c53cc2db84879279bb83d0b43343eb4e0f6d4181d4ff899cb647aa177ac466889907',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '32fdececbc1d1731dce6979d3e0c77cb433b8c12cb242decc9706b7ca6bebf8534bea71603556612cb44badfda230b0f6886ca3f51546e989a97cb91d4871304',
            },
        },
    ];

    return {
        specName: '/createPassiveOffer',
        testPayloads,
        expectedResponses,
    }
}

const manageOffer = () => {
    const testPayloads = [
        // asset native
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageOffer',
                        selling: {
                            type: 0,
                            code: 'XLM',
                        },
                        buying: {
                            type: 0,
                            code: 'XLM',
                        },
                        amount: '500111000',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                        offerId: '101',
                    }
                ]
            }
        },
        // asset alphanum4
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageOffer',
                        selling: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        buying: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        amount: '500111000',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                        offerId: '101',
                    }
                ]
            }
        },
        // asset alphanum12
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageOffer',
                        selling: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        buying: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        amount: '500111000',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                        offerId: '101',
                    }
                ]
            }
        },
        // asset combined
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageOffer',
                        selling: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        buying: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        amount: '9223372036854775807',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                        offerId: '101',
                    }
                ]
            }
        },
        // { n, d } price
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageOffer',
                        selling: {
                            type: 0,
                            code: 'XLM',
                        },
                        buying: {
                            type: 0,
                            code: 'XLM',
                        },
                        amount: '500111000',
                        price: {
                            n: 1024,
                            d: 100,
                        },
                        offerId: '0',
                    }
                ]
            }
        },
        // new offer
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageOffer',
                        selling: {
                            type: 0,
                            code: 'XLM',
                        },
                        buying: {
                            type: 0,
                            code: 'XLM',
                        },
                        amount: '500111000',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                        offerId: '0',
                    }
                ]
            }
        },
        // remove offer
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'manageOffer',
                        selling: {
                            type: 0,
                            code: 'XLM',
                        },
                        buying: {
                            type: 0,
                            code: 'XLM',
                        },
                        amount: '0',
                        price: {
                            n: 500111,
                            d: 10000,
                        },
                        offerId: '101',
                    }
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '7ced75aa5e231cf079b74694307d6fcc84e2326694c13ae74748f10fdbb72653e648472fd6a7484f2d26d2f23fafe9a6495fd7766209d35756dc408fc3fb810b',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'f88fafa8e3b8ec59a7e6e642a8b5b4065230da685ea48ff79480bad441587442383242a2eb352eeb59a734ffc02e60c856b5f905b0f6862297cd010bc5c8ca03',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'e996eecc0112a89859d7b3a8d5ffd8fc1b4f9436ff8889997f20d61cfbc099d5891a28ee619408cc01342554df27a5480e29b13c4cbcc1fd464f583d019aa407',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '77538169e48b405b45c8a0de6bc317e0ef7326300335da39c9632b56d3b9638ec309b8248032097943d2e82b9083caf30f2fb5fb43e851da7886c60020cd1409',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '9e814c4f9c44a4b54451672fd7135b8cc3b2233e811167efb2e9e5f284c291d0ac41a1c9aa252f6893d8db0bb46aa6e78ecfe8edd8993fd8c6b1a243a1c8b40e',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'b81209bb37b9408f01762bb276e913697032137bdbc007ba9db883391bc8b6b0b7e3cc299efede60081a343ace6ac9e1036d7466516250784d4eb09b76099104',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'cb974b89e0286c9c616f12cb377ccfcf7a4d7c262a75721013248972a8f2b69b5462bb368c425a3df2f06846ce1de62fb458b0d862feb289af670361621cbc08',
            },
        },
    ];

    return {
        specName: '/manageOffer',
        testPayloads,
        expectedResponses,
    }
}

const changeTrust = () => {
    const testPayloads = [
        // asset native
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'changeTrust',
                        line: {
                            type: 0,
                            code: 'XLM',
                        },
                        limit: '9223372036854775807',
                    }
                ]
            }
        },
        // asset alphanum4
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'changeTrust',
                        line: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        limit: '9223372036854775807',
                    }
                ]
            }
        },
        // asset alphanum12
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'changeTrust',
                        line: {
                            type: 2,
                            code: 'ABCDEFGHIJKL',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        limit: '9223372036854775807',
                    }
                ]
            }
        },
        // with arbitrary limit
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'changeTrust',
                        line: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        limit: '10000000000',
                    }
                ]
            }
        },
        // remove trust
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'changeTrust',
                        line: {
                            type: 1,
                            code: 'X',
                            issuer: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        },
                        limit: '0',
                    }
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'b39c7bfad1afd8d930b0650d5440f16d0d36249a8dd167a52e925b3d82f441aa785c7443d023a3294978539eb24fcab4b8f3736d031aba2e89cb692fee335e04',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '2ea2db58ff5417878703ab4ce07db09fdd5d97433a39c0c0eb2c7b07477a510592324d89e9ebbb6c812886c89e1c5238b36f09d37ff21cea3f11e7eba9851008',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '42913cbacba413ee6bcaec9ee99c982e0c557d941a500902981f05015252313b26a1c1ae9886a795e4ef41f40b5aabd92f464c07428a3c79bfa79a67aa139e06',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '544ae7d8f5740b9794e4f42117c30aeb6ca4b82ff4334dea8ff4a06b443e151e8cb5de7aaadc98d0dc4459ca51c02dbe72716d802c8def483b9409550886a700',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'fd26fef29dc5ce8b011206a277de10c35fdef484e665213c0a034003193d75183e0667a2dd876b17323c56900974080ed28fe51bd6b1ed89095632e38e048400',
            },
        },
    ];

    return {
        specName: '/changeTrust',
        testPayloads,
        expectedResponses,
    }
}

const allowTrust = () => {
    const testPayloads = [
        // asset native
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'allowTrust',
                        trustor: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        assetType: 1,
                        assetCode: 'XLM',
                        authorize: true,
                    }
                ]
            }
        },
        {
            ...header,
            transaction: {
                ...transactionCommon,
                operations: [
                    {
                        type: 'allowTrust',
                        trustor: 'GAUYJFQCYIHFQNS7CI6BFWD2DSSFKDIQZUQ3BLQODDKE4PSW7VVBKENC',
                        assetType: 1,
                        assetCode: 'XLM',
                        authorize: false,
                    }
                ]
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'a1166e3f66adad2e4f82457e9e15613be589235690504c83a1a332c4ccfada5a44eb9ccd4714a9dd6ef7bf4e120700efd2b901e762eb7baafc94116025f4ed08',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'bb40e85b8e4c771cb18408ef610cffc1aad5411294500da09178157994a17a7c317bb45e795b2d965779f7385d5361508c7e591ae9c9c9f6fdb7e3b1c2d3e105',
            },
        },
    ];

    return {
        specName: '/allowTrust',
        testPayloads,
        expectedResponses,
    }
}

const withMemo = () => {

    const operations = [
        {
            type: 'payment',
            destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
            amount: '500111000',
            asset: {
                type: 0,
                code: 'XLM',
            },
        }
    ];

    const testPayloads = [
        // memo type text
        {
            ...header,
            transaction: {
                ...transactionCommon,
                memo: {
                    type: 1,
                    text: 'foobar',
                },
                operations,
            }
        },
        // memo type id
        {
            ...header,
            transaction: {
                ...transactionCommon,
                memo: {
                    type: 2,
                    id: '1234567890',
                },
                operations,
            }
        },
        // memo type hash
        {
            ...header,
            transaction: {
                ...transactionCommon,
                memo: {
                    type: 3,
                    hash: '72187adb879c414346d77c71af8cce7b6eaa57b528e999fd91feae6b6418628e',
                },
                operations,
            }
        },
        // memo type return
        {
            ...header,
            transaction: {
                ...transactionCommon,
                memo: {
                    type: 4,
                    hash: '72187adb879c414346d77c71af8cce7b6eaa57b528e999fd91feae6b6418628e',
                },
                operations,
            }
        },
        // payment with timeBounds and memo text
        {
            ...header,
            transaction: {
                ...transactionCommon,
                timebounds: {
                    minTime: 0,
                    maxTime: 1580800029,
                },
                memo: {
                    type: 1,
                    text: 'foobar',
                },
                operations,
            }
        },
        // multiple operations with timeBounds and memo text
        {
            ...header,
            transaction: {
                ...transactionCommon,
                timebounds: {
                    minTime: 0,
                    maxTime: 1580800029,
                },
                memo: {
                    type: 1,
                    text: 'foobar',
                },
                fee: 300,
                operations: [
                    {
                        type: 'payment',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        asset: {
                           type: 0,
                           code: 'XLM',
                        },
                        amount: '500111000'
                    },
                    {
                        type: 'createAccount',
                        destination: 'GBOVKZBEM2YYLOCDCUXJ4IMRKHN4LCJAE7WEAEA2KF562XFAGDBOB64V',
                        startingBalance: '1000333000'
                    },
                    {
                        type: 'bumpSequence',
                        bumpTo: '9223372036854775807'
                    }
                ],
            }
        },
        // timebounds - minTime only
        {
            ...header,
            transaction: {
                ...transactionCommon,
                timebounds: {
                    minTime: 1000000000,
                    maxTime: 0,
                },
                operations: [
                    { type: 'setOptions' },
                ],
            }
        },
        // timebounds - minTime only
        {
            ...header,
            transaction: {
                ...transactionCommon,
                timebounds: {
                    minTime: 1000000000,
                    maxTime: 1580800029,
                },
                operations: [
                    { type: 'setOptions' },
                ],
            }
        },
    ];

    const expectedResponses = [
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '6290ab96e48967416c0245e9f06d8ddde7660d092a88b06c2d4a83e75d241a00b57fe9c4b53b9624754eeeeb0519368cba92194d96054cd7c31f4a6d391d9706',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: 'b26eb3e67c0aa59a7f8275726249fb2d862d723d54cbdd24c6d1a7597a0830650fef55b6b4366a59b0978cd3d288e724658c4b0068eb5fc918e1fb6d44b6ea08',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '584454be04b5f0ff4d298808f75cb9ae4cc255f6ff2b81060085f307eb42056552e7f08a11127ff7053b2dd96cce0e19a3fa2b02e60269b57679108f6cd75b03',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '5fb11358e4aee1120c7e2e43d3b285d0a6a24859ceaef390aa9a2cc90097bba005790c02d0e1995466c9dfa89cb2b1347bd26a7b92c76b861abc7e734ac12d00',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '2c56ada05098568381bb5d50bcc5775e251a285e45a2e19ce72ddb2467adbbc6dd600e625e5c6c132178f797110cb85e2ee00587418ead1911c97d41eabbd503',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '7683b67f489789ace2f8eccabcc543943da3a64fcd4bd2356ec3c7538eac5c83349e78479a4a886c2bde0ae63307bfd321159e30b4f69a0961b049a8e972a109',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '38099504f25a2578e447cd6257f43343b7b957689d8e8698e94ee66660b6fe32b9ec9848840279026e95953d8fb175b86a0813be7e5e015cd58d51553ec97909',
            },
        },
        {
            payload: {
                publicKey: PUBLIC_KEY,
                signature: '57c79a904825c748e30dda9ea7a868d6d939d76a573fe7fc8e174dcacd6581c5a34e5252bcc619b5b141feef21bc9d69da471f7090a17406136e11dbc1b06e04',
            },
        },
    ];

    return {
        specName: '/withMemo',
        testPayloads,
        expectedResponses,
    }
}

export const stellarSignTransaction = (): void => {
    const subtests = {
        createAccount,
        accountMerge,
        payment,
        setOptions,
        manageData, // illegal string
        pathPayment,
        createPassiveOffer,
        manageOffer,
        changeTrust,
        allowTrust,
        bumpSequence,
        withMemo,
    };

    return {
        testName: 'StellarSignTransaction',
        mnemonic: 'mnemonic_12',
        subtests,
    };
};