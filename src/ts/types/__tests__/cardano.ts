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
            },
        ],
        certificates: [{ type: 0, path: 'm/44', pool: 'aaff00..' }],
        withdrawals: [{ path: 'm/44', amount: '3003112' }],
        metadata: 'aaff00..',
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
