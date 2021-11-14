import TrezorConnect from '../index';

export const getAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.getAddress({ path: 'm/44' });
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
    const bundleAddress = await TrezorConnect.getAddress({ bundle: [{ path: 'm/44' }] });
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
    // @ts-ignore
    TrezorConnect.getAddress();
    // @ts-ignore
    TrezorConnect.getAddress({ coin: 'btc' });
    // @ts-ignore
    TrezorConnect.getAddress({ path: 1 });
    // @ts-ignore
    TrezorConnect.getAddress({ bundle: 1 });
};

export const getPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.getPublicKey({ path: 'm/44' });
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
    const bundlePK = await TrezorConnect.getPublicKey({ bundle: [{ path: 'm/44' }] });
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
        bundlePK.payload.xpub;
    } else {
        bundlePK.payload.error;
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
        payload.signatures;
        payload.serializedTx;
        payload.txid;
    }

    // with invalid params
    // @ts-ignore
    TrezorConnect.signTransaction();
    // @ts-ignore
    TrezorConnect.signTransaction({ coin: 'btc' });

    TrezorConnect.signTransaction({
        inputs: [
            {
                address_n: [0],
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
                // @ts-ignore
                script_type: 'SPENDADDRESS-2',
            },
        ],
        outputs: [
            // @ts-ignore unexpected address_n
            {
                address_n: [0],
                amount: '0',
                op_return_data: 'deadbeef',
                script_type: 'PAYTOOPRETURN',
            },
            // @ts-ignore unexpected script_type
            {
                address: 'abcd',
                amount: '100',
                script_type: 'PAYTOP2SHWITNESS',
            },
            // @ts-ignore unexpected address
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
        push.payload.txid;
    }

    // with invalid params
    // @ts-ignore
    TrezorConnect.pushTransaction();
    // @ts-ignore
    TrezorConnect.pushTransaction({ coin: 'btc' });
};

export const composeTransaction = async () => {
    // Method with mixed params and mixed responses

    const compose = await TrezorConnect.composeTransaction({
        outputs: [],
        coin: 'btc',
    });
    if (compose.success) {
        compose.payload.serializedTx;
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
            tx.error;
        }
        if (tx.type === 'nonfinal') {
            tx.bytes;
            tx.feePerByte;
        }
        if (tx.type === 'final') {
            tx.transaction.inputs;
            tx.transaction.outputs;
        }
    } else {
        precompose.payload.error;
        // @ts-ignore
        precompose.payload.type;
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
        payload.empty;
        payload.path;
        payload.descriptor;
        payload.balance;
        payload.availableBalance;
        if (payload.tokens) {
            payload.tokens;
        }
        if (payload.addresses) {
            payload.addresses.used;
            payload.addresses.unused;
            payload.addresses.change;
        }
        if (payload.utxo) {
            payload.utxo;
        }

        payload.history.total;
        payload.history.tokens;
        payload.history.unconfirmed;
        payload.history.transactions;
        payload.history.txids;

        if (payload.page) {
            payload.page.index;
            payload.page.size;
            payload.page.total;
        }

        if (payload.marker) {
            payload.marker.ledger;
            payload.marker.seq;
        }

        if (payload.misc) {
            payload.misc.nonce;
            payload.misc.sequence;
            payload.misc.reserve;
        }

        payload.utxo;
        payload.history;
        payload.misc;
        payload.page;
        payload.marker;
    }
};

export const signMessage = async () => {
    const sign = await TrezorConnect.signMessage({ path: 'm/44', coin: 'btc', message: 'foo' });
    if (sign.success) {
        const { payload } = sign;
        payload.address;
        payload.signature;
    }
    const verify = await TrezorConnect.verifyMessage({ address: 'a', signature: 'a', message: 'foo', coin: 'btc' });
    if (verify.success) {
        const { payload } = verify;
        payload.message;
    }
};
