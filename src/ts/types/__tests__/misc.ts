import TrezorConnect from '../index';

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
        kv.payload.value;
    }

    // bundle
    const bundleKV = await TrezorConnect.cipherKeyValue({ bundle: [{ path: 'm/44', key: 'key' }] });

    if (bundleKV.success) {
        bundleKV.payload.forEach(item => {
            item.value;
        });
        // @ts-ignore
        bundleKV.payload.xpub;
    } else {
        bundleKV.payload.error;
    }
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
    //     payload.address;
    // }
    // (payload: { error: string });

    if (a.success) {
        a.payload.address;
        a.payload.publicKey;
        a.payload.signature;
        // @ts-ignore
        a.payload.error;
    } else {
        a.payload.error;
        // @ts-ignore
        a.payload.address;
    }
    // sync call
    TrezorConnect.requestLogin({
        challengeHidden: 'a',
        challengeVisual: 'b',
    });

    // @ts-ignore
    TrezorConnect.requestLogin();
    // @ts-ignore
    TrezorConnect.requestLogin({ callback: 'string' });
    // @ts-ignore
    TrezorConnect.requestLogin({ challengeHidden: 'a' });
    // @ts-ignore
    TrezorConnect.requestLogin({ challengeVisual: 1 });
};

export const debugLink = async () => {
    TrezorConnect.debugLinkDecision({ device: { path: '1' } });
    TrezorConnect.debugLinkGetState({ device: { path: '1' } });
};
