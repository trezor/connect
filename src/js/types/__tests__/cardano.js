/* @flow */
import TrezorConnect from '../../index';

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
    (singleAddress.success: boolean);
    if (singleAddress.success) {
        const { payload } = singleAddress;
        (payload.address: string);
        (payload.protocolMagic: number);
        (payload.networkId: number);
        (payload.serializedPath: string);
        (payload.serializedStakingPath: string);
        const { addressParameters } = payload;
        (addressParameters.addressType: number);
        (addressParameters.path: string | number[]);
        (addressParameters.stakingPath: ?string | ?(number[]));
        (addressParameters.stakingKeyHash: ?string);
        const { certificatePointer } = addressParameters;
        if (certificatePointer) {
            (certificatePointer.blockIndex: ?number);
            (certificatePointer.txIndex: ?number);
            (certificatePointer.certificateIndex: ?number);
        }
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
    (bundleAddress.success: boolean);
    if (bundleAddress.success) {
        bundleAddress.payload.forEach(item => {
            (item.address: string);
            (item.protocolMagic: number);
            (item.networkId: number);
            (item.serializedPath: string);
            (item.serializedStakingPath: string);
            const { addressParameters } = item;
            (addressParameters.addressType: number);
            (addressParameters.path: string | number[]);
            (addressParameters.stakingPath: ?string | number[]);
            const { certificatePointer } = addressParameters;
            if (certificatePointer) {
                (certificatePointer.blockIndex: ?number);
                (certificatePointer.txIndex: ?number);
                (certificatePointer.certificateIndex: ?number);
            }
        });
    } else {
        (bundleAddress.payload.error: string);
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

    // $FlowExpectedError: payload is Address
    const e1 = await TrezorConnect.cardanoGetAddress({
        addressParameters: {
            addressType: 0,
            path: 'm/44',
            stakingPath: 'm/44',
        },
    });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $FlowExpectedError: payload is Address[]
    const e2 = await TrezorConnect.cardanoGetAddress({
        bundle: [
            {
                addressParameters: {
                    addressType: 0,
                    path: 'm/44',
                    stakingPath: 'm/44',
                },
                protocolMagic: 0,
                networkId: 0,
            },
        ],
    });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $FlowExpectedError
    TrezorConnect.cardanoGetAddress();
    // $FlowExpectedError
    TrezorConnect.cardanoGetAddress({ coin: 'btc' });
    // $FlowExpectedError
    TrezorConnect.cardanoGetAddress({ addressParameters: { path: 1 } });
    // $FlowExpectedError
    TrezorConnect.cardanoGetAddress({ bundle: 1 });
};

export const cardanoGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.cardanoGetPublicKey({ path: 'm/44' });
    (singlePK.success: boolean);
    if (singlePK.success) {
        const { payload } = singlePK;
        (payload.path: number[]);
        (payload.serializedPath: string);
        (payload.publicKey: string);
        (payload.node: Object);
    }

    // bundle
    const bundlePK = await TrezorConnect.cardanoGetPublicKey({ bundle: [{ path: 'm/44' }] });
    (bundlePK.success: boolean);
    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            (item.path: number[]);
            (item.serializedPath: string);
            (item.publicKey: string);
            (item.node: Object);
        });
    } else {
        (bundlePK.payload.error: string);
    }

    // errors
    // $FlowExpectedError: payload is PublicKey
    const e1 = await TrezorConnect.cardanoGetPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $FlowExpectedError: payload is PublicKey[]
    const e2 = await TrezorConnect.cardanoGetPublicKey({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.path;
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
        (payload.hash: string);
        (payload.serializedTx: string);
    }
};
