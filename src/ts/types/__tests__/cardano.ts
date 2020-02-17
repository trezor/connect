import TrezorConnect from '../index';

export const cardanoGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.cardanoGetAddress({ path: 'm/44' });
    if (singleAddress.success) {
        const { payload } = singleAddress;
        payload.address;
        payload.path;
        payload.serializedPath;
        // @ts-ignore
        payload.forEach(item => {
            item.address;
        });
    }

    // bundle
    const bundleAddress = await TrezorConnect.cardanoGetAddress({ bundle: [{ path: 'm/44' }] });
    if (bundleAddress.success) {
        bundleAddress.payload.forEach(item => {
            item.address;
            item.path;
            item.serializedPath;
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
        path: 'm/44',
        address: 'a',
        showOnTrezor: true,
    });

    // with invalid params
    // @ts-ignore
    TrezorConnect.cardanoGetAddress();
    // @ts-ignore
    TrezorConnect.cardanoGetAddress({ coin: 'btc' });
    // @ts-ignore
    TrezorConnect.cardanoGetAddress({ path: 1 });
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
                type: 0,
            },
        ],
        outputs: [
            {
                address: 'Ae2..',
                amount: '3003112',
            },
        ],
        transactions: ['txid'],
        protocol_magic: 764824073,
    });

    if (sign.success) {
        const { payload } = sign;
        payload.hash;
        payload.body;
    }
};
