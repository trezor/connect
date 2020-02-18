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
        // $FlowIssue: payload is Address
        payload.forEach(item => {
            (item.address: string);
        });
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
        // $FlowIssue: payload is Address[]
        (bundleAddress.payload.address: string);
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

    // with invalid params
    // $FlowIssue
    TrezorConnect.ethereumGetAddress();
    // $FlowIssue
    TrezorConnect.ethereumGetAddress({ coin: 'btc' });
    // $FlowIssue
    TrezorConnect.ethereumGetAddress({ path: 1 });
    // $FlowIssue
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
        // $FlowIssue: payload is Address
        payload.forEach(item => {
            (item.path: string);
        });
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
        // $FlowIssue: payload is Address[]
        (bundlePK.payload.path: string);
    } else {
        (bundlePK.payload.error: string);
    }
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
