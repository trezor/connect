import TrezorConnect from '../index';

export const blockchainEstimateFee = async () => {
    const levels = [
        {
            label: 'high',
            blocks: 1,
            feeLimit: '100',
            feePerTx: '100',
            feePerUnit: '100',
        },
        {
            label: 'normal',
            feePerUnit: '100',
            blocks: 0,
        },
        {
            label: 'economy',
            feePerUnit: '100',
            blocks: 0,
        },
        {
            label: 'low',
            feePerUnit: '100',
            blocks: 0,
        },
        {
            label: 'custom',
            feePerUnit: '100',
            blocks: 0,
        },
    ];

    const simple = await TrezorConnect.blockchainEstimateFee({ coin: 'btc' });
    if (simple.success) {
        const { payload } = simple;
        payload.blockTime;
        payload.minFee;
        payload.maxFee;
        payload.levels;
    }

    TrezorConnect.blockchainEstimateFee({
        coin: 'btc',
        request: {
            blocks: [0],
            specific: {
                conservative: true,
                data: '0x',
                from: '0x',
                to: '0x',
                txsize: 100,
            },
            feeLevels: 'smart',
        },
    });

    TrezorConnect.blockchainEstimateFee({
        coin: 'btc',
        request: {
            feeLevels: 'preloaded',
        },
    });
};

export const blockchainGetTransactions = async () => {
    const txs = await TrezorConnect.blockchainGetTransactions({ coin: 'btc', txs: ['txid'] });
    if (txs.success) {
        const { payload } = txs;
        payload.forEach(tx => {
            if (tx.type === 'blockbook') {
                // (tx.vin: any[]);
            }
        });
    }
};

export const others = async () => {
    const accounts = [
        {
            descriptor: 'xpub',
            addresses: {
                used: [],
                unused: [],
                change: [],
            },
        },
        {
            descriptor: '0x00',
        },
    ];

    TrezorConnect.blockchainSubscribe({
        accounts,
        coin: 'btc',
    });

    TrezorConnect.blockchainUnsubscribe({
        accounts,
        coin: 'btc',
    });

    TrezorConnect.blockchainDisconnect({ coin: 'btc' });

    TrezorConnect.blockchainSetCustomBackend({
        coin: 'btc',
        blockchainLink: undefined,
    });

    TrezorConnect.blockchainSetCustomBackend({
        coin: 'btc',
        blockchainLink: {
            type: 'blockbook',
            url: ['https://btc1.trezor.io/'],
        },
    });
};
