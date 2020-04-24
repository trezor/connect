/* @flow */
import TrezorConnect from '../../index';

export const binanceGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.binanceGetAddress({ path: 'm/44' });
    (singleAddress.success: boolean);
    if (singleAddress.success) {
        const { payload } = singleAddress;
        (payload.address: string);
        (payload.path: number[]);
        (payload.serializedPath: string);
    }

    // bundle
    const bundleAddress = await TrezorConnect.binanceGetAddress({ bundle: [{ path: 'm/44' }] });
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
    TrezorConnect.binanceGetAddress({
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
    const e1 = await TrezorConnect.binanceGetAddress({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $ExpectError: payload is Address[]
    const e2 = await TrezorConnect.binanceGetAddress({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $FlowIssue
    TrezorConnect.binanceGetAddress();
    // $FlowIssue
    TrezorConnect.binanceGetAddress({ useEmptyPassphrase: true });
    // $FlowIssue
    TrezorConnect.binanceGetAddress({ path: 1 });
    // $FlowIssue
    TrezorConnect.binanceGetAddress({ bundle: 1 });
};

export const binanceGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.binanceGetPublicKey({ path: 'm/44' });
    (singlePK.success: boolean);
    if (singlePK.success) {
        const { payload } = singlePK;
        (payload.path: number[]);
        (payload.serializedPath: string);
        (payload.publicKey: string);
    }

    // bundle
    const bundlePK = await TrezorConnect.binanceGetPublicKey({ bundle: [{ path: 'm/44' }] });
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
    const e1 = await TrezorConnect.binanceGetPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $ExpectError: payload is PublicKey[]
    const e2 = await TrezorConnect.binanceGetPublicKey({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.path;
};

export const binanceSignTransaction = async () => {
    const sign = await TrezorConnect.binanceSignTransaction({
        path: 'm/44',
        transaction: {
            chain_id: 'Binance-Chain-Nile',
            account_number: 34,
            memo: 'test',
            sequence: 31,
            source: 1,
            transfer: {
                inputs: [
                    {
                        address: 'tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd',
                        coins: [
                            { amount: 1000000000, denom: 'BNB' },
                        ],
                    },
                ],
                outputs: [
                    {
                        address: 'tbnb1ss57e8sa7xnwq030k2ctr775uac9gjzglqhvpy',
                        coins: [
                            { amount: 1000000000, denom: 'BNB' },
                        ],
                    },
                ],
            },
            placeOrder: {
                id: 'BA36F0FAD74D8F41045463E4774F328F4AF779E5-33',
                ordertype: 2,
                price: 100000000,
                quantity: 100000000,
                sender: 'tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd',
                side: 1,
                symbol: 'ADA.B-B63_BNB',
                timeinforce: 1,
            },
            cancelOrder: {
                refid: 'BA36F0FAD74D8F41045463E4774F328F4AF779E5-29',
                sender: 'tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd',
                symbol: 'BCHSV.B-10F_BNB',
            },
        },
    });

    if (sign.success) {
        const { payload } = sign;
        (payload.public_key: string);
        (payload.signature: string);
    }
};
