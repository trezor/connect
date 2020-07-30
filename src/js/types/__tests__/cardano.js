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
        (addressParameters.stakingPath: ?string | ?number[]);
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

    // $ExpectError: payload is Address
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

    // $ExpectError: payload is Address[]
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
    // $ExpectError
    TrezorConnect.cardanoGetAddress();
    // $ExpectError
    TrezorConnect.cardanoGetAddress({ coin: 'btc' });
    // $ExpectError
    TrezorConnect.cardanoGetAddress({ addressParameters: { path: 1 } });
    // $ExpectError
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
    // $ExpectError: payload is PublicKey
    const e1 = await TrezorConnect.cardanoGetPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $ExpectError: payload is PublicKey[]
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
