/* @flow */
import TrezorConnect from '../../index';

export const liskGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.liskGetAddress({ path: 'm/44' });
    (singleAddress.success: boolean);
    if (singleAddress.success) {
        const { payload } = singleAddress;
        (payload.address: string);
        (payload.path: number[]);
        (payload.serializedPath: string);
    }

    // bundle
    const bundleAddress = await TrezorConnect.liskGetAddress({ bundle: [{ path: 'm/44' }] });
    (bundleAddress.success: boolean);
    if (bundleAddress.success) {
        bundleAddress.payload.forEach(item => {
            (item.address: string);
            (item.path: number[]);
            (item.serializedPath: string);
        });
    } else {
        (bundleAddress.payload.error: string);
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

    // $ExpectError: payload is Address
    const e1 = await TrezorConnect.liskGetAddress({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $ExpectError: payload is Address[]
    const e2 = await TrezorConnect.liskGetAddress({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $ExpectError
    TrezorConnect.liskGetAddress();
    // $ExpectError
    TrezorConnect.liskGetAddress({ coin: 'btc' });
    // $ExpectError
    TrezorConnect.liskGetAddress({ path: 1 });
    // $ExpectError
    TrezorConnect.liskGetAddress({ bundle: 1 });
};

export const liskGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.liskGetPublicKey({ path: 'm/44' });
    (singlePK.success: boolean);
    if (singlePK.success) {
        const { payload } = singlePK;
        (payload.path: number[]);
        (payload.serializedPath: string);
        (payload.publicKey: string);
    }

    // bundle
    const bundlePK = await TrezorConnect.liskGetPublicKey({ bundle: [{ path: 'm/44' }] });
    (bundlePK.success: boolean);
    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            (item.path: number[]);
            (item.serializedPath: string);
            (item.publicKey: string);
        });
    } else {
        (bundlePK.payload.error: string);
    }

    // errors
    // $ExpectError: payload is PublicKey
    const e1 = await TrezorConnect.liskGetPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $ExpectError: payload is PublicKey[]
    const e2 = await TrezorConnect.liskGetPublicKey({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.path;
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
        (payload.signature: string);
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
        (payload.publicKey: string);
        (payload.signature: string);
    }
    const verify = await TrezorConnect.liskVerifyMessage({ publicKey: 'a', signature: 'a', message: 'foo' });
    if (verify.success) {
        const { payload } = verify;
        (payload.message: string);
    }
};
