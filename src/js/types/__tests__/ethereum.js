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

    // $FlowExpectedError: payload is Address
    const e1 = await TrezorConnect.ethereumGetAddress({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $FlowExpectedError: payload is Address[]
    const e2 = await TrezorConnect.ethereumGetAddress({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $FlowExpectedError
    TrezorConnect.ethereumGetAddress();
    // $FlowExpectedError
    TrezorConnect.ethereumGetAddress({ coin: 'btc' });
    // $FlowExpectedError
    TrezorConnect.ethereumGetAddress({ path: 1 });
    // $FlowExpectedError
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
    // $FlowExpectedError: payload is PublicKey
    const e1 = await TrezorConnect.ethereumGetPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $FlowExpectedError: payload is PublicKey[]
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

    // eip1559 transaction
    TrezorConnect.ethereumSignTransaction({
        path: 'm/44',
        transaction: {
            nonce: '0x0',
            maxFeePerGas: '0x14',
            maxPriorityFeePerGas: '0x0',
            gasLimit: '0x14',
            to: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
            chainId: 1,
            value: '0x0',
            data: '0xa',
            accessList: [{ address: '0', storageKeys: [] }],
        },
    });

    TrezorConnect.ethereumSignTransaction({
        path: 'm/44',
        // $FlowExpectedError: combined gasPrice + maxFeePerGas
        transaction: {
            nonce: '0x0',
            maxFeePerGas: '0x14',
            maxPriorityFeePerGas: '0x0',
            gasPrice: '0x0',
            gasLimit: '0x14',
            to: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
            chainId: 1,
            value: '0x0',
            data: '0xa',
            accessList: [{ address: '0', storageKeys: [] }],
        },
    });
};

export const signMessage = async () => {
    const sign = await TrezorConnect.ethereumSignMessage({
        path: 'm/44',
        message: 'foo',
        hex: false,
    });
    if (sign.success) {
        const { payload } = sign;
        (payload.address: string);
        (payload.signature: string);
    }
    const verify = await TrezorConnect.ethereumVerifyMessage({
        address: 'a',
        signature: 'a',
        message: 'foo',
        hex: false,
    });
    if (verify.success) {
        const { payload } = verify;
        (payload.message: string);
    }
};

export const signTypedData = async () => {
    // $FlowIssue with `await` and Promises: https://github.com/facebook/flow/issues/5294 TODO: Update flow
    const sign = await TrezorConnect.ethereumSignTypedData({
        path: 'm/44',
        data: {
            types: {
                EIP712Domain: [
                    {
                        name: 'name',
                        type: 'string',
                    },
                    {
                        name: 'version',
                        type: 'string',
                    },
                    {
                        name: 'chainId',
                        type: 'uint256',
                    },
                    {
                        name: 'verifyingContract',
                        type: 'address',
                    },
                    {
                        name: 'salt',
                        type: 'bytes32',
                    },
                ],
            },
            primaryType: 'EIP712Domain',
            domain: {
                name: 'example.metamask.io',
                version: '1',
                chainId: 1,
                verifyingContract: '0x0000000000000000000000000000000000000000',
                salt: new Int32Array([1, 2, 3]).buffer,
            },
            message: {},
        },
        metamask_v4_compat: true,
    });

    if (sign.success) {
        const { payload } = sign;
        (payload.signature: string);
        (payload.network: string);
    }

    await TrezorConnect.ethereumSignTypedData({
        path: 'm/44',
        data: {
            types: {
                EIP712Domain: [],
                EmptyMessage: [],
            },
            primaryType: 'EmptyMessage',
            domain: {},
            message: {},
        },
        message_hash: '0x',
        domain_separator_hash: '0x',
        metamask_v4_compat: true,
    });

    // $FlowExpectedError `message_hash` is given, but it's an invalid type.
    await TrezorConnect.ethereumSignTypedData({
        path: 'm/44',
        data: {
            types: {
                EIP712Domain: [],
                EmptyMessage: [],
            },
            primaryType: 'EmptyMessage',
            domain: {},
            message: {},
        },
        message_hash: 123456,
        domain_separator_hash: '0x1234',
        metamask_v4_compat: true,
    });
};
