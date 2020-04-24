/* @flow */
import TrezorConnect from '../../index';

export const tezosGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.tezosGetAddress({ path: 'm/44' });
    (singleAddress.success: boolean);
    if (singleAddress.success) {
        const { payload } = singleAddress;
        (payload.address: string);
        (payload.path: number[]);
        (payload.serializedPath: string);
    }

    // bundle
    const bundleAddress = await TrezorConnect.tezosGetAddress({ bundle: [{ path: 'm/44' }] });
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
    TrezorConnect.tezosGetAddress({
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
    const e1 = await TrezorConnect.tezosGetAddress({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $ExpectError: payload is Address[]
    const e2 = await TrezorConnect.tezosGetAddress({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $ExpectError
    TrezorConnect.tezosGetAddress();
    // $ExpectError
    TrezorConnect.tezosGetAddress({ coin: 'btc' });
    // $ExpectError
    TrezorConnect.tezosGetAddress({ path: 1 });
    // $ExpectError
    TrezorConnect.tezosGetAddress({ bundle: 1 });
};

export const tezosGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.tezosGetPublicKey({ path: 'm/44' });
    (singlePK.success: boolean);
    if (singlePK.success) {
        const { payload } = singlePK;
        (payload.path: number[]);
        (payload.serializedPath: string);
        (payload.publicKey: string);
    }

    // bundle
    const bundlePK = await TrezorConnect.tezosGetPublicKey({ bundle: [{ path: 'm/44' }] });
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
    const e1 = await TrezorConnect.tezosGetPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $ExpectError: payload is PublicKey[]
    const e2 = await TrezorConnect.tezosGetPublicKey({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.path;
};

export const tezosSignTransaction = async () => {
    const sign = await TrezorConnect.tezosSignTransaction({
        path: "m/44'/1729'/10'",
        branch: 'BLGUkzwvguFu8ei8eLW3KgCbdtrMmv1UCqMvUpHHTGq1UPxypHS',
        operation: {
            transaction: {
                source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                destination: 'tz1Kef7BSg6fo75jk37WkKRYSnJDs69KVqt9',
                counter: 297,
                amount: 200000,
                fee: 10000,
                gas_limit: 44825,
                storage_limit: 0,
                parameters_manager: {
                    set_delegate: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    cancel_delegate: true,
                    transfer: {
                        amount: 200,
                        destination: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                    },
                },
            },
            reveal: {
                source: 'tz1ekQapZCX4AXxTJhJZhroDKDYLHDHegvm1',
                counter: 575424,
                fee: 10000,
                gas_limit: 20000,
                storage_limit: 0,
                public_key: 'edpkuTPqWjcApwyD3VdJhviKM5C13zGk8c4m87crgFarQboF3Mp56f',
            },
            origination: {
                source: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                balance: 100000,
                fee: 20000,
                counter: 298,
                gas_limit: 20000,
                storage_limit: 10000,
                script: '0000001c02000000170500036805010368050202000000080316053d036d03420000000a010000000568656c6c6f',
            },
            delegation: {
                source: 'tz1Kef7BSg6fo75jk37WkKRYSnJDs69KVqt9',
                delegate: 'tz1UKmZhi8dhUX5a5QTfCrsH9pK4dt1dVfJo',
                fee: 20000,
                counter: 564565,
                gas_limit: 20000,
                storage_limit: 0,
            },
        },
    });

    if (sign.success) {
        const { payload } = sign;
        (payload.sig_op_contents: string);
        (payload.signature: string);
        (payload.operation_hash: string);
    }
};
