/* @flow */
import TrezorConnect from '../../index';

export const getAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.getAddress({ path: 'm/44' });
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
    const bundleAddress = await TrezorConnect.getAddress({ bundle: [{ path: 'm/44' }] });
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
    TrezorConnect.getAddress({
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
        coin: 'btc',
        crossChain: true,
    });

    // with invalid params
    // $FlowIssue
    TrezorConnect.getAddress();
    // $FlowIssue
    TrezorConnect.getAddress({ coin: 'btc' });
    // $FlowIssue
    TrezorConnect.getAddress({ path: 1 });
    // $FlowIssue
    TrezorConnect.getAddress({ bundle: 1 });
};

export const getPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.getPublicKey({ path: 'm/44' });
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
        // $FlowIssue: payload is Address
        payload.forEach(item => {
            (item.path: string);
        });
    }

    // bundle
    const bundlePK = await TrezorConnect.getPublicKey({ bundle: [{ path: 'm/44' }] });
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
        // $FlowIssue: payload is Address[]
        (bundlePK.payload.xpub: string);
    } else {
        (bundlePK.payload.error: string);
    }
};

export const signTransaction = async () => {
    // minimum required params
    TrezorConnect.signTransaction({
        inputs: [],
        outputs: [],
        coin: 'btc',
    });

    // with all possible params
    const sign = await TrezorConnect.signTransaction({
        inputs: [
            {
                address_n: [0],
                prev_index: 0,
                prev_hash: 'txhash',
                script_type: 'SPENDADDRESS',
            },
            {
                address_n: [0],
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
                script_type: 'SPENDWITNESS',
            },
            {
                address_n: [0],
                prev_index: 0,
                prev_hash: 'abcd',
                amount: '1',
                script_type: 'SPENDP2SHWITNESS',
            },
            {
                address_n: [0],
                prev_index: 0,
                prev_hash: 'txhash',
                script_type: 'SPENDMULTISIG',
                sequence: 1,
                multisig: {
                    pubkeys: [
                        { node: 'HDNodeAsString', address_n: [0] },
                        {
                            node: {
                                depth: 0,
                                fingerprint: 1,
                                child_num: 1,
                                chain_code: 'chain_code',
                                public_key: 'xpubABCD',
                            },
                            address_n: [0],
                        },
                    ],
                    signatures: ['signature'],
                    m: 0,
                },
            },
        ],
        outputs: [
            // external outputs
            {
                address: 'ExternalAddress',
                amount: '100',
                script_type: 'PAYTOADDRESS',
            },
            {
                address: 'ExternalAddress',
                amount: '100',
                script_type: 'PAYTOADDRESS',
                multisig: {
                    pubkeys: [
                        { node: 'HDNodeAsString', address_n: [0] },
                    ],
                    signatures: ['signature'],
                    m: 0,
                },
            },
            // change outputs
            {
                address_n: [0],
                amount: '100',
                script_type: 'PAYTOADDRESS',
            },
            {
                address_n: [0],
                amount: '100',
                script_type: 'PAYTOWITNESS',
            },
            {
                address_n: [0],
                amount: '100',
                script_type: 'PAYTOP2SHWITNESS',
            },
            {
                address_n: [0],
                amount: '100',
                script_type: 'PAYTOMULTISIG',
                multisig: {
                    pubkeys: [
                        { node: 'HDNodeAsString', address_n: [0] },
                    ],
                    signatures: ['signature'],
                    m: 0,
                },
            },
            {
                amount: '0',
                op_return_data: 'deadbeef',
                script_type: 'PAYTOOPRETURN',
            },
        ],
        refTxs: [
            {
                hash: 'txhash',
                version: 1,
                inputs: [
                    {
                        prev_hash: 'txhash',
                        prev_index: 0,
                        script_sig: 'tx-signature',
                        sequence: 1,
                    },
                ],
                bin_outputs: [
                    {
                        amount: '100',
                        script_pubkey: 'tx-script-pubkey',
                    },
                ],
                lock_time: 1,
                extra_data: '00',
                timestamp: 1,
                version_group_id: 4,
            },
        ],
        coin: 'btc',
        locktime: 0,
        timestamp: 1,
        version: 0,
        expiry: 0,
        overwintered: true,
        versionGroupId: 4,
        branchId: 1,
        push: true,
        // common:
        useEmptyPassphrase: true,
        allowSeedlessDevice: false,
        keepSession: false,
        skipFinalReload: false,
    });

    if (sign.success) {
        const { payload } = sign;
        (payload.signatures: string[]);
        (payload.serializedTx: string);
        (payload.txid: string | null | void);
    }

    // with invalid params
    // $FlowIssue
    TrezorConnect.signTransaction();
    // $FlowIssue
    TrezorConnect.signTransaction({ coin: 'btc' });
    // $FlowIssue: invalid script_type
    TrezorConnect.signTransaction({
        inputs: [{
            address_n: [0],
            prev_index: 0,
            prev_hash: 'txhash',
            script_type: 'SPENDADDRESS-2',
        }],
        outputs: [],
        coin: 'btc',
    });
};

export const pushTransaction = async () => {
    const push = await TrezorConnect.pushTransaction({ tx: 'serializedTX', coin: 'btc' });
    if (push.success) {
        (push.payload.txid: string);
    }

    // with invalid params
    // $FlowIssue
    TrezorConnect.pushTransaction();
    // $FlowIssue
    TrezorConnect.pushTransaction({ coin: 'btc' });
};

export const composeTransaction = async () => {
    // Method with mixed params and mixed responses

    const compose = await TrezorConnect.composeTransaction({
        outputs: [],
        coin: 'btc',
    });
    if (compose.success) {
        (compose.payload.serializedTx: string);
    }

    const precompose = await TrezorConnect.composeTransaction({
        outputs: [],
        account: {
            path: 'm/49',
            addresses: {
                used: [],
                unused: [],
                change: [],
            },
            utxo: [],
        },
        feeLevels: [{ feePerUnit: '1' }],
        coin: 'btc',
    });
    // (precompose.success: boolean);
    if (precompose.success) {
        const tx = precompose.payload[0];
        if (tx.type === 'error') {
            (tx.error: string);
        }
        if (tx.type === 'nonfinal') {
            (tx.bytes: number);
            (tx.feePerByte: string);
        }
        if (tx.type === 'final') {
            (tx.transaction.inputs: any[]);
            (tx.transaction.outputs: any[]);
        }
        (precompose.payload.error: string);
    } else {
        (precompose.payload.error: string);
        // $FlowIssue: tx does not exists
        (precompose.payload.type: 'final');
    }
};

export const getAccountInfo = async () => {
    // minimum required params
    TrezorConnect.getAccountInfo({ coin: 'btc' });

    const account = await TrezorConnect.getAccountInfo({
        coin: 'btc',
        path: 'm/44',
        descriptor: 'xpub',
        details: 'txs',
        tokens: 'used',
        page: 1,
        pageSize: 2,
        from: 1,
        to: 100,
        contractFilter: 'address',
        gap: 25,
        marker: {
            ledger: 1,
            seq: 1,
        },
    });
    if (account.success) {
        const { payload } = account;
        (payload.empty: boolean);
        (payload.path: string);
        (payload.descriptor: string);
        (payload.balance: string);
        (payload.availableBalance: string);
        if (payload.tokens) {
            (payload.tokens: any[]);
        }
        if (payload.addresses) {
            (payload.addresses.used: any[]);
            (payload.addresses.unused: any[]);
            (payload.addresses.change: any[]);
        }
        if (payload.utxo) {
            (payload.utxo: any[]);
        }

        (payload.history.total: number);
        (payload.history.tokens: number | null | void);
        (payload.history.unconfirmed: number | null | void);
        (payload.history.transactions: any[] | null | void);
        (payload.history.txids: any[] | null | void);

        if (payload.page) {
            (payload.page.index: number);
            (payload.page.size: number);
            (payload.page.total: number);
        }

        if (payload.marker) {
            (payload.marker.ledger: number);
            (payload.marker.seq: number);
        }

        if (payload.misc) {
            (payload.misc.nonce: string | null | void);
            (payload.misc.sequence: number | null | void);
            (payload.misc.reserve: string | null | void);
        }

        // (payload.utxo: string);
        // (payload.history: string);
        // (payload.misc: string);
        // (payload.page: string);
        // (payload.marker: string);
    }

    // bundle
    const bundlePK = await TrezorConnect.getAccountInfo({ bundle: [{ path: 'm/44', coin: 'btc' }] });
    (bundlePK.success: boolean);
    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            (item.empty: boolean);
        });
        // $FlowIssue: payload is Address[]
        (bundlePK.payload.xpub: string);
    } else {
        (bundlePK.payload.error: string);
    }
};

export const signMessage = async () => {
    const sign = await TrezorConnect.signMessage({ path: 'm/44', coin: 'btc', message: 'foo' });
    if (sign.success) {
        const { payload } = sign;
        (payload.address: string);
        (payload.signature: string);
    }
    const verify = await TrezorConnect.verifyMessage({ address: 'a', signature: 'a', message: 'foo', coin: 'btc' });
    if (verify.success) {
        const { payload } = verify;
        (payload.message: string);
    }
};
