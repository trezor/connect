/* @flow */
import TrezorConnect from '../../index';

export const ethereumGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.ethereumGetAddress({ path: 'm/44' });
    (singleAddress.success: boolean);
    if (singleAddress.success) {
        const { payload } = singleAddress;
        (payload.address: string);
        (payload.path: number[]);
        (payload.serializedPath: string);
    }

    // bundle
    const bundleAddress = await TrezorConnect.ethereumGetAddress({ bundle: [{ path: 'm/44' }] });
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
    TrezorConnect.ethereumGetAddress({
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
        address: '0x',
        showOnTrezor: true,
    });

    // $ExpectError: payload is Address
    const e1 = await TrezorConnect.ethereumGetAddress({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $ExpectError: payload is Address[]
    const e2 = await TrezorConnect.ethereumGetAddress({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $ExpectError
    TrezorConnect.ethereumGetAddress();
    // $ExpectError
    TrezorConnect.ethereumGetAddress({ coin: 'btc' });
    // $ExpectError
    TrezorConnect.ethereumGetAddress({ path: 1 });
    // $ExpectError
    TrezorConnect.ethereumGetAddress({ bundle: 1 });
};

export const ethereumGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.ethereumGetPublicKey({ path: 'm/44' });
    (singlePK.success: boolean);
    if (singlePK.success) {
        const { payload } = singlePK;
        (payload.path: number[]);
        (payload.serializedPath: string);
        (payload.xpub: string);
        (payload.xpubSegwit: string | void);
        (payload.chainCode: string);
        (payload.childNum: number);
        (payload.publicKey: string);
        (payload.fingerprint: number);
        (payload.depth: number);
    }

    // bundle
    const bundlePK = await TrezorConnect.ethereumGetPublicKey({ bundle: [{ path: 'm/44' }] });
    (bundlePK.success: boolean);
    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            (item.path: number[]);
            (item.serializedPath: string);
            (item.xpub: string);
            (item.xpubSegwit: string | void);
            (item.chainCode: string);
            (item.childNum: number);
            (item.publicKey: string);
            (item.fingerprint: number);
            (item.depth: number);
        });
    } else {
        (bundlePK.payload.error: string);
    }

    // errors
    // $ExpectError: payload is PublicKey
    const e1 = await TrezorConnect.ethereumGetPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $ExpectError: payload is PublicKey[]
    const e2 = await TrezorConnect.ethereumGetPublicKey({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.path;
};

export const ethereumSignTransaction = async () => {
    const sign = await TrezorConnect.ethereumSignTransaction({
        path: 'm/44',
        transaction: {
            nonce: '0x0',
            gasPrice: '0x14',
            gasLimit: '0x14',
            to: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
            chainId: 1,
            value: '0x0',
            data: '0xa',
        },
    });

    if (sign.success) {
        const { payload } = sign;
        (payload.r: string);
        (payload.s: string);
        (payload.v: string);
    }
};

export const signMessage = async () => {
    const sign = await TrezorConnect.ethereumSignMessage({ path: 'm/44', message: 'foo', hex: false });
    if (sign.success) {
        const { payload } = sign;
        (payload.address: string);
        (payload.signature: string);
    }
    const verify = await TrezorConnect.ethereumVerifyMessage({ address: 'a', signature: 'a', message: 'foo', hex: false });
    if (verify.success) {
        const { payload } = verify;
        (payload.message: string);
    }
};
