/* @flow */
import TrezorConnect from '../../index';

export const nemGetAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.nemGetAddress({ path: 'm/44', network: 1 });
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
    const bundleAddress = await TrezorConnect.nemGetAddress({ bundle: [{ path: 'm/44', network: 1 }] });
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
    // $FlowIssue
    TrezorConnect.nemGetAddress();
    // $FlowIssue
    TrezorConnect.nemGetAddress({ coin: 'btc' });
    // $FlowIssue
    TrezorConnect.nemGetAddress({ path: 1 });
    // $FlowIssue
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
        (payload.data: string);
        (payload.signature: string);
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
