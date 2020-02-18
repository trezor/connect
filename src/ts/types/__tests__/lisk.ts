import TrezorConnect from '../index';
export const liskGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.liskGetAddress({ path: 'm/44' });
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
    const bundleAddress = await TrezorConnect.liskGetAddress({ bundle: [{ path: 'm/44' }] });
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
    TrezorConnect.liskGetAddress({
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
    TrezorConnect.liskGetAddress();
    // @ts-ignore
    TrezorConnect.liskGetAddress({ coin: 'btc' });
    // @ts-ignore
    TrezorConnect.liskGetAddress({ path: 1 });
    // @ts-ignore
    TrezorConnect.liskGetAddress({ bundle: 1 });
};

export const liskGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.liskGetPublicKey({ path: 'm/44' });

    if (singlePK.success) {
        const { payload } = singlePK;
        payload.path;
        payload.serializedPath;
        payload.publicKey;
        // @ts-ignore
        payload.forEach(item => {
            item.path;
        });
    }

    // bundle
    const bundlePK = await TrezorConnect.liskGetPublicKey({ bundle: [{ path: 'm/44' }] });

    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            item.path;
            item.serializedPath;
            item.publicKey;
        });
        // @ts-ignore
        bundlePK.payload.path;
    } else {
        bundlePK.payload.error;
    }
};

export const liskSignTransaction = async () => {
    const common = {
        amount: '10000000',
        recipientId: '9971262264659915921L',
        timestamp: 57525937,
        type: 0,
        fee: '10000000',
    };
    const sign = await TrezorConnect.liskSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            asset: {
                multisignature: {
                    min: 2,
                    lifetime: 5,
                    keysgroup: [
                        '+5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
                        '+922fbfdd596fa78269bbcadc67ec2a1cc15fc929a19c462169568d7a3df1a1aa',
                    ],
                },
            },
        },
    });

    if (sign.success) {
        const { payload } = sign;
        payload.signature;
    }

    TrezorConnect.liskSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            asset: {
                delegate: {
                    username: 'trezor_t',
                },
            },
        },
    });

    TrezorConnect.liskSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            asset: {
                votes: [
                    '+b002f58531c074c7190714523eec08c48db8c7cfc0c943097db1a2e82ed87f84',
                    '-ec111c8ad482445cfe83d811a7edd1f1d2765079c99d7d958cca1354740b7614',
                ],
            },
        },
    });

    TrezorConnect.liskSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            asset: {
                signature: {
                    publicKey: 'publicKey',
                },
            },
        },
    });

    TrezorConnect.liskSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            asset: {
                data: '00',
            },
        },
    });
};

export const signMessage = async () => {
    const sign = await TrezorConnect.liskSignMessage({ path: 'm/44', message: 'foo' });
    if (sign.success) {
        const { payload } = sign;
        payload.publicKey;
        payload.signature;
    }
    const verify = await TrezorConnect.liskVerifyMessage({ publicKey: 'a', signature: 'a', message: 'foo' });
    if (verify.success) {
        const { payload } = verify;
        payload.message;
    }
};
