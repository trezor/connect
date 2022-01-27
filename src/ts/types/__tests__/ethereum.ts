import TrezorConnect from '../index';

export const ethereumGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.ethereumGetAddress({ path: 'm/44' });

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
    const bundleAddress = await TrezorConnect.ethereumGetAddress({ bundle: [{ path: 'm/44' }] });

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
    // @ts-ignore
    TrezorConnect.ethereumGetAddress();
    // @ts-ignore
    TrezorConnect.ethereumGetAddress({ coin: 'btc' });
    // @ts-ignore
    TrezorConnect.ethereumGetAddress({ path: 1 });
    // @ts-ignore
    TrezorConnect.ethereumGetAddress({ bundle: 1 });
};

export const ethereumGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.ethereumGetPublicKey({ path: 'm/44' });

    if (singlePK.success) {
        const { payload } = singlePK;
        payload.path;
        payload.serializedPath;
        payload.xpub;
        payload.xpubSegwit;
        payload.chainCode;
        payload.childNum;
        payload.publicKey;
        payload.fingerprint;
        payload.depth;
        // @ts-ignore
        payload.forEach(item => {
            item.path;
        });
    }

    // bundle
    const bundlePK = await TrezorConnect.ethereumGetPublicKey({ bundle: [{ path: 'm/44' }] });

    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            item.path;
            item.serializedPath;
            item.xpub;
            item.xpubSegwit;
            item.chainCode;
            item.childNum;
            item.publicKey;
            item.fingerprint;
            item.depth;
        });
        // @ts-ignore
        bundlePK.payload.path;
    } else {
        bundlePK.payload.error;
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
        payload.r;
        payload.s;
        payload.v;
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

    // @ts-expect-error: combined gasPrice + maxFeePerGas
    TrezorConnect.ethereumSignTransaction({
        path: 'm/44',
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
        payload.address;
        payload.signature;
    }
    const verify = await TrezorConnect.ethereumVerifyMessage({
        address: 'a',
        signature: 'a',
        message: 'foo',
        hex: false,
    });
    if (verify.success) {
        const { payload } = verify;
        payload.message;
    }
};

export const signTypedData = async () => {
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
                Message: [
                    {
                        name: 'Test Field',
                        type: 'string',
                    },
                ],
            },
            primaryType: 'Message',
            domain: {
                name: 'example.metamask.io',
                version: '1',
                chainId: 1,
                verifyingContract: '0x0000000000000000000000000000000000000000',
                salt: new Int32Array([1, 2, 3]).buffer,
            },
            message: {
                'Test Field': 'Hello World',
            },
        },
        metamask_v4_compat: true,
    });

    if (sign.success) {
        const { payload } = sign;
        payload.address;
        payload.signature;
    }

    await TrezorConnect.ethereumSignTypedData({
        path: 'm/44',
        metamask_v4_compat: true,
        data: {
            types: { EIP712Domain: [] },
            primaryType: 'EIP712Domain',
            domain: {},
            message: {},
        },
        message_hash: '0x',
        domain_separator_hash: '0x',
    });

    await TrezorConnect.ethereumSignTypedData({
        path: 'm/44',
        metamask_v4_compat: true,
        data: {
            types: { EIP712Domain: [] },
            // @ts-expect-error: primaryType not in `types`
            primaryType: 'UnknownType',
            domain: {},
            message: {},
        },
        // @ts-expect-error: incorrect type for message_hash
        message_hash: 12345,
        domain_separator_hash: '0x',
    });
};
