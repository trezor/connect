import TrezorConnect from '../index';

export const cardanoGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.cardanoGetAddress({
        addressParameters: {
            addressType: 0,
            path: 'm/44',
            stakingPath: 'm/44',
            stakingKeyHash: 'aaff00..',
            certificatePointer: {
                blockIndex: 0,
                txIndex: 1,
                certificateIndex: 2,
            },
        },
        protocolMagic: 0,
        networkId: 0,
    });
    if (singleAddress.success) {
        const { payload } = singleAddress;
        payload.address;
        payload.protocolMagic;
        payload.networkId;
        payload.serializedPath;
        payload.serializedStakingPath;
        const { addressParameters } = payload;
        addressParameters.addressType;
        addressParameters.path;
        addressParameters.stakingPath;
        addressParameters.stakingKeyHash;
        const { certificatePointer } = addressParameters;
        if (certificatePointer) {
            certificatePointer.blockIndex;
            certificatePointer.txIndex;
            certificatePointer.certificateIndex;
        }
        // @ts-ignore
        payload.forEach(item => {
            item.address;
        });
    }

    // bundle
    const bundleAddress = await TrezorConnect.cardanoGetAddress({
        bundle: [
            {
                addressParameters: {
                    addressType: 0,
                    path: 'm/44',
                    stakingPath: 'm/44',
                    stakingKeyHash: 'aaff00..',
                    certificatePointer: {
                        blockIndex: 0,
                        txIndex: 1,
                        certificateIndex: 2,
                    },
                },
                protocolMagic: 0,
                networkId: 0,
            },
        ],
    });
    if (bundleAddress.success) {
        bundleAddress.payload.forEach(item => {
            item.address;
            item.protocolMagic;
            item.networkId;
            item.serializedPath;
            item.serializedStakingPath;
            const { addressParameters } = item;
            addressParameters.addressType;
            addressParameters.path;
            addressParameters.stakingPath;
            addressParameters.stakingKeyHash;
            const { certificatePointer } = addressParameters;
            if (certificatePointer) {
                certificatePointer.blockIndex;
                certificatePointer.txIndex;
                certificatePointer.certificateIndex;
            }
        });
        // @ts-ignore
        bundleAddress.payload.address;
    } else {
        bundleAddress.payload.error;
    }

    // with all possible params
    TrezorConnect.cardanoGetAddress({
        device: {
            path: '1',
            instance: 1,
            state: 'state@device-id:1',
        },
        useEmptyPassphrase: true,
        allowSeedlessDevice: false,
        keepSession: false,
        skipFinalReload: false,
        addressParameters: {
            addressType: 0,
            path: 'm/44',
            stakingPath: 'm/44',
            stakingKeyHash: 'aaff00..',
            certificatePointer: {
                blockIndex: 0,
                txIndex: 1,
                certificateIndex: 2,
            },
        },
        address: 'a',
        protocolMagic: 0,
        networkId: 0,
        showOnTrezor: true,
    });

    // with invalid params
    // @ts-ignore
    TrezorConnect.cardanoGetAddress();
    // @ts-ignore
    TrezorConnect.cardanoGetAddress({ coin: 'btc' });
    // @ts-ignore
    TrezorConnect.cardanoGetAddress({ addressParameters: { path: 1 } });
    // @ts-ignore
    TrezorConnect.cardanoGetAddress({ bundle: 1 });
};

export const cardanoGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.cardanoGetPublicKey({ path: 'm/44' });
    if (singlePK.success) {
        const { payload } = singlePK;
        payload.path;
        payload.serializedPath;
        payload.publicKey;
        payload.node;
        // @ts-ignore
        payload.forEach(item => {
            item.path;
        });
    }

    // bundle
    const bundlePK = await TrezorConnect.cardanoGetPublicKey({ bundle: [{ path: 'm/44' }] });
    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            item.path;
            item.serializedPath;
            item.publicKey;
            item.node;
        });
        // @ts-ignore
        bundlePK.payload.path;
    } else {
        bundlePK.payload.error;
    }
};

export const cardanoSignTransaction = async () => {
    const sign = await TrezorConnect.cardanoSignTransaction({
        inputs: [
            {
                prev_hash: '1af..',
                path: 'm/44',
                prev_index: 0,
            },
        ],
        outputs: [
            {
                address: 'Ae2..',
                amount: '3003112',
                tokenBundle: [
                    {
                        policyId: 'aaff00..',
                        tokenAmounts: [{ assetNameBytes: 'aaff00..', amount: '3003112' }],
                    },
                ],
            },
            {
                addressParameters: {
                    addressType: 0,
                    path: 'm/44',
                    stakingPath: 'm/44',
                    stakingKeyHash: 'aaff00..',
                    certificatePointer: {
                        blockIndex: 0,
                        txIndex: 0,
                        certificateIndex: 0,
                    },
                },
                amount: '3003112',
                tokenBundle: [
                    {
                        policyId: 'aaff00..',
                        tokenAmounts: [{ assetNameBytes: 'aaff00..', amount: '3003112' }],
                    },
                ],
            },
        ],
        certificates: [
            {
                type: 0,
                path: 'm/44',
                pool: 'aaff00..',
                poolParameters: {
                    poolId: 'aaff00..',
                    vrfKeyHash: 'aaff00..',
                    pledge: '500000000',
                    cost: '340000000',
                    margin: {
                        numerator: '1',
                        denominator: '2',
                    },
                    rewardAccount: 'stake1uya87zwnmax0v6nnn8ptqkl6ydx4522kpsc3l3wmf3yswygwx45el',
                    owners: [
                        {
                            stakingKeyPath: "m/1852'",
                            stakingKeyHash: 'aaff00..',
                        },
                        {
                            stakingKeyHash: 'aaff00..',
                        },
                    ],
                    relays: [
                        {
                            type: 0,
                            ipv4Address: '192.168.0.1',
                            ipv6Address: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
                            port: 1234,
                            hostName: 'www.test2.test',
                        },
                    ],
                    metadata: {
                        url: 'https://www.test.test',
                        hash: 'aaff00..',
                    },
                },
            },
        ],
        withdrawals: [{ path: 'm/44', amount: '3003112' }],
        auxiliaryData: {
            blob: 'aaff00..',
            catalystRegistrationParameters: {
                votingPublicKey: 'aaff00..',
                stakingPath: 'm/44',
                rewardAddressParameters: {
                    addressType: 0,
                    path: 'm/44',
                    stakingPath: 'm/44',
                    stakingKeyHash: 'aaff00..',
                    certificatePointer: {
                        blockIndex: 0,
                        txIndex: 0,
                        certificateIndex: 0,
                    },
                },
                nonce: '0',
            },
        },
        fee: '42',
        ttl: '10',
        protocolMagic: 0,
        networkId: 0,
    });

    if (sign.success) {
        const { payload } = sign;
        payload.hash;
        payload.serializedTx;
    }
};
