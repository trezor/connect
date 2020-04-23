/* @flow */
import TrezorConnect from '../../index';

export const rippleGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.rippleGetAddress({ path: 'm/44' });
    (singleAddress.success: boolean);
    if (singleAddress.success) {
        const { payload } = singleAddress;
        (payload.address: string);
        (payload.path: number[]);
        (payload.serializedPath: string);
    }

    // bundle
    const bundleAddress = await TrezorConnect.rippleGetAddress({ bundle: [{ path: 'm/44' }] });
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
    TrezorConnect.rippleGetAddress({
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
    const e1 = await TrezorConnect.rippleGetAddress({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $ExpectError: payload is Address[]
    const e2 = await TrezorConnect.rippleGetAddress({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $FlowIssue
    TrezorConnect.rippleGetAddress();
    // $FlowIssue
    TrezorConnect.rippleGetAddress({ coin: 'btc' });
    // $FlowIssue
    TrezorConnect.rippleGetAddress({ path: 1 });
    // $FlowIssue
    TrezorConnect.rippleGetAddress({ bundle: 1 });
};

export const rippleSignTransaction = async () => {
    const sign = await TrezorConnect.rippleSignTransaction({
        path: 'm/44',
        transaction: {
            payment: {
                amount: '100',
                destination: '1',
                destinationTag: 1,
            },
            fee: '1',
            flags: 1,
            sequence: 1,
            maxLedgerVersion: 1,
        },
    });

    if (sign.success) {
        const { payload } = sign;
        (payload.serializedTx: string);
        (payload.signature: string);
    }
};
