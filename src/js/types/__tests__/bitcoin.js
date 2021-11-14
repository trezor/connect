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

    // $FlowExpectedError: payload is Address
    const e1 = await TrezorConnect.getAddress({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.address: string);
        });
    }

    // $FlowExpectedError: payload is Address[]
    const e2 = await TrezorConnect.getAddress({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.address;

    // with invalid params
    // $FlowExpectedError
    TrezorConnect.getAddress();
    // $FlowExpectedError
    TrezorConnect.getAddress({ coin: 'btc' });
    // $FlowExpectedError
    TrezorConnect.getAddress({ path: 1 });
    // $FlowExpectedError
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
    } else {
        (bundlePK.payload.error: string);
    }

    // errors
    // $FlowExpectedError: payload is PublicKey
    const e1 = await TrezorConnect.getPublicKey({ path: 'm/44' });
    if (e1.success) {
        e1.payload.forEach(item => {
            (item.path: string);
        });
    }

    // $FlowExpectedError: payload is PublicKey[]
    const e2 = await TrezorConnect.getPublicKey({ bundle: [{ path: 'm/44' }] });
    if (e2.success) e2.payload.path;
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
                amount: '1',
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
                amount: '1',
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
                orig_hash: 'origtxhash',
                orig_index: 1,
            },
            {
                address: 'ExternalAddress',
                amount: '100',
                script_type: 'PAYTOADDRESS',
                multisig: {
                    pubkeys: [{ node: 'HDNodeAsString', address_n: [0] }],
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
                    pubkeys: [{ node: 'HDNodeAsString', address_n: [0] }],
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
                expiry: 1,
                timestamp: 1,
                overwintered: false,
                version_group_id: 4,
                branch_id: 1,
            },
            {
                hash: 'origTxHash',
                version: 1,
                inputs: [
                    {
                        address_n: [],
                        prev_hash: 'txhash',
                        prev_index: 0,
                        script_sig: 'tx-signature',
                        sequence: 1,
                        script_type: 'SPENDP2SHWITNESS',
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
                        amount: '1',
                        decred_tree: 1,
                        witness: 'w',
                        ownership_proof: 'ownership_proof',
                        commitment_data: 'commitment_data',
                        orig_hash: 'origtxhash',
                        orig_index: 1,
                    },
                ],
                outputs: [
                    {
                        address: 'a',
                        amount: '100',
                        script_type: 'PAYTOADDRESS',
                    },
                    {
                        address_n: [0],
                        amount: '100',
                        script_type: 'PAYTOADDRESS',
                    },
                    {
                        address_n: [0],
                        amount: '100',
                        script_type: 'PAYTOSCRIPTHASH',
                    },
                    {
                        address_n: [0],
                        amount: '100',
                        script_type: 'PAYTOMULTISIG',
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
                        amount: '0',
                        op_return_data: 'deadbeef',
                        script_type: 'PAYTOOPRETURN',
                    },
                ],
                lock_time: 1,
                extra_data: '00',
                expiry: 1,
                timestamp: 1,
                overwintered: false,
                version_group_id: 4,
                branch_id: 1,
            },
        ],
        account: {
            addresses: {
                used: [],
                unused: [],
                change: [{ path: 'm/44', address: 'a' }],
            },
        },
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
    // $FlowExpectedError
    TrezorConnect.signTransaction();
    // $FlowExpectedError
    TrezorConnect.signTransaction({ coin: 'btc' });
    TrezorConnect.signTransaction({
        inputs: [
            {
                address_n: [0],
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
                // $FlowExpectedError: invalid script_type
                script_type: 'SPENDADDRESS-2',
            },
        ],
        outputs: [
            {
                // $FlowExpectedError: unexpected address_n
                address_n: [0],
                amount: '0',
                op_return_data: 'deadbeef',
                script_type: 'PAYTOOPRETURN',
            },
            // $FlowExpectedError: unexpected script_type
            {
                address: 'abcd',
                amount: '100',
                script_type: 'PAYTOP2SHWITNESS',
            },
            // $FlowExpectedError: unexpected address
            {
                address: 'abcd',
                amount: '0',
                op_return_data: 'deadbeef',
                script_type: 'PAYTOOPRETURN',
            },
        ],
        coin: 'btc',
    });
};

export const pushTransaction = async () => {
    const push = await TrezorConnect.pushTransaction({ tx: 'serializedTX', coin: 'btc' });
    if (push.success) {
        (push.payload.txid: string);
    }

    // with invalid params
    // $FlowExpectedError
    TrezorConnect.pushTransaction();
    // $FlowExpectedError
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
    } else {
        (precompose.payload.error: string);
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
        defaultAccountType: 'p2sh',
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
    const bundlePK = await TrezorConnect.getAccountInfo({
        bundle: [{ path: 'm/44', coin: 'btc' }],
    });
    (bundlePK.success: boolean);
    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            (item.empty: boolean);
        });
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
    const verify = await TrezorConnect.verifyMessage({
        address: 'a',
        signature: 'a',
        message: 'foo',
        coin: 'btc',
    });
    if (verify.success) {
        const { payload } = verify;
        (payload.message: string);
    }
};
