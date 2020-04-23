/* @flow */
import TrezorConnect from '../../index';

export const cipherKeyValue = async () => {
    const kv = await TrezorConnect.cipherKeyValue({
        path: 'm/44',
        key: 'key',
        value: 'hash',
        askOnEncrypt: true,
        askOnDecrypt: false,
        iv: 'advanced',
    });
    if (kv.success) {
        (kv.payload.value: string);
    }

    // bundle
    const bundleKV = await TrezorConnect.cipherKeyValue({ bundle: [{ path: 'm/44', key: 'key' }] });
    (bundleKV.success: boolean);
    if (bundleKV.success) {
        bundleKV.payload.forEach(item => {
            (item.value: string);
        });
    } else {
        (bundleKV.payload.error: string);
    }

    // $ExpectError: payload is Address
    const e1 = await TrezorConnect.cipherKeyValue({ bundle: [{ path: 'm/44', key: 'key' }] });
    if (e1.success) e1.payload.xpub;
};

export const customMessage = async () => {
    TrezorConnect.customMessage({
        messages: {},
        message: 'MyCustomSignTx',
        params: {
            inputs: { index: 1, hash: '0' },
        },
        callback: async (request: any) => {
            if (request.type === 'MyCustomTxReq') {
                return {
                    message: 'MyCustomTxAck',
                    params: {
                        index: 1,
                    },
                };
            }
            return { message: 'MyCustomSigned' };
        },
    });
};

// Method with mixed params
export const requestLogin = async () => {
    // async call
    const a = await TrezorConnect.requestLogin({
        callback: () => ({
            challengeHidden: 'a',
            challengeVisual: 'b',
        }),
    });
    // const { success, payload } = a;
    // if (success && payload.address) {
    //     (payload.address: string);
    // }
    // (payload: { error: string });
    (a.success: boolean);
    if (a.success) {
        (a.payload.address: string);
        (a.payload.publicKey: string);
        (a.payload.signature: string);
    } else {
        (a.payload.error: string);
    }
    // sync call
    TrezorConnect.requestLogin({
        challengeHidden: 'a',
        challengeVisual: 'b',
    });

    // $ExpectError
    const e1 = await TrezorConnect.requestLogin({
        challengeHidden: 'a',
        challengeVisual: 'b',
    });
    if (e1.success) {
        // error does not exists
        (e1.payload.error: string);
    } else {
        // address does not exists
        (e1.payload.address: string);
    }

    // $ExpectError
    TrezorConnect.requestLogin();
    // $ExpectError
    TrezorConnect.requestLogin({ callback: 'string' });
    // $ExpectError
    TrezorConnect.requestLogin({ challengeHidden: 'a' });
    // $ExpectError
    TrezorConnect.requestLogin({ challengeVisual: 1 });
};

export const debugLink = async () => {
    TrezorConnect.debugLinkDecision({ device: { path: '1' } });
    TrezorConnect.debugLinkGetState({ device: { path: '1' } });
};
