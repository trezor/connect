import TrezorConnect from '../index';

export const nemGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.nemGetAddress({ path: 'm/44', network: 1 });

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
    const bundleAddress = await TrezorConnect.nemGetAddress({ bundle: [{ path: 'm/44', network: 1 }] });

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
    TrezorConnect.nemGetAddress({
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
        network: 1,
        address: 'a',
        showOnTrezor: true,
    });

    // with invalid params
    // @ts-ignore
    TrezorConnect.nemGetAddress();
    // @ts-ignore
    TrezorConnect.nemGetAddress({ coin: 'btc' });
    // @ts-ignore
    TrezorConnect.nemGetAddress({ path: 1 });
    // @ts-ignore
    TrezorConnect.nemGetAddress({ bundle: 1 });
};

export const nemSignTransaction = async () => {
    const common = {
        version: -1744830464,
        timeStamp: 74649215,
        fee: 2000000,
        deadline: 74735615,
        signer: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
    };
    const sign = await TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x0101,
            recipient: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
            amount: 2000000,
            message: {
                payload: '746573745f6e656d5f7472616e73616374696f6e5f7472616e73666572',
                type: 1,
            },
        },
    });

    if (sign.success) {
        const { payload } = sign;
        payload.data;
        payload.signature;
    }

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x1001,
            modifications: [
                {
                    modificationType: 1,
                    cosignatoryAccount: 'c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
                },
            ],
            minCosignatories: {
                relativeChange: 3,
            },
        },
    });

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x4002,
            mosaicId: {
                namespaceId: 'hellom',
                name: 'Hello mosaic',
            },
            supplyType: 1,
            delta: 1,
        },
    });

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x4002,
            mosaicId: {
                namespaceId: 'hellom',
                name: 'Hello mosaic',
            },
            supplyType: 1,
            delta: 1,
        },
    });

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x1004,
            otherTrans: {
                timeStamp: 2,
                amount: 2000000,
                deadline: 67890,
                fee: 15000,
                recipient: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                type: 0x0101,
                message: {
                    payload: '746573745f6e656d5f7472616e73616374696f6e5f7472616e73666572',
                    type: 1,
                },
                version: -1744830464,
                signer: 'c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
            },
        },
    });

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x1002,
            otherTrans: {
                timeStamp: 2,
                amount: 2000000,
                deadline: 67890,
                fee: 15000,
                recipient: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                type: 0x0101,
                message: {
                    payload: '746573745f6e656d5f7472616e73616374696f6e5f7472616e73666572',
                    type: 1,
                },
                version: -1744830464,
                signer: 'c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
            },
        },
    });

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x0801,
            importanceTransfer: {
                mode: 1,
                publicKey: 'c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
            },
        },
    });

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x2001,
            newPart: 'ABCDE',
            rentalFeeSink: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
            parent: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
            rentalFee: 1500,
        },
    });

    TrezorConnect.nemSignTransaction({
        path: 'm/44',
        transaction: {
            ...common,
            type: 0x4001,
            mosaicDefinition: {
                id: {
                    namespaceId: 'hellom',
                    name: 'Hello mosaic',
                },
                levy: {
                    type: 1,
                    fee: 1,
                    recipient: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                    mosaicId: {
                        namespaceId: 'hellom',
                        name: 'Hello mosaic',
                    },
                },
                description: 'lorem',
                properties: [
                    {
                        name: 'divisibility',
                        value: 'string',
                    },
                    {
                        name: 'initialSupply',
                        value: 'string',
                    },
                    {
                        name: 'supplyMutable',
                        value: 'string',
                    },
                    {
                        name: 'transferable',
                        value: 'string',
                    },
                ],
            },
            creationFeeSink: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
            creationFee: 1500,
        },
    });
};
