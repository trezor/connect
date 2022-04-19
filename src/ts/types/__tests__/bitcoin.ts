import TrezorConnect from '../index';

export const getAddress = async () => {
    // regular
    const singleAddress = await TrezorConnect.getAddress({ path: 'm/44' });
    if (singleAddress.success) {
        const { payload } = singleAddress;
        payload.address;
        payload.path;
        payload.serializedPath;
        // @ts-expect-error
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
        // @ts-expect-error
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
    // @ts-expect-error
    TrezorConnect.getAddress();
    // @ts-expect-error
    TrezorConnect.getAddress({ coin: 'btc' });
    // @ts-expect-error
    TrezorConnect.getAddress({ path: 1 });
    // @ts-expect-error
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
        // @ts-expect-error
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
        // @ts-expect-error
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
            {
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
                script_type: 'EXTERNAL',
                script_pubkey: '1001',
                script_sig: '1110',
            },
            {
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
                script_type: 'EXTERNAL',
                script_pubkey: '1001',
                witness: '1110',
            },
            {
                prev_index: 0,
                prev_hash: 'abcd',
                amount: '1',
                script_type: 'EXTERNAL',
                script_pubkey: '1001',
                ownership_proof: '0011',
                commitment_data: '1100',
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
    // @ts-expect-error
    TrezorConnect.signTransaction();
    // @ts-expect-error
    TrezorConnect.signTransaction({ coin: 'btc' });

    TrezorConnect.signTransaction({
        inputs: [
            {
                address_n: [0],
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
                // @ts-expect-error
                script_type: 'SPENDADDRESS-2',
            },
            // @ts-expect-error missing address_n
            {
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
            },
            // @ts-expect-error missing script_pubkey
            {
                prev_index: 0,
                prev_hash: 'txhash',
                amount: '1',
                script_type: 'EXTERNAL',
            },
        ],
        outputs: [
            // @ts-expect-error unexpected address_n
            {
                address_n: [0],
                amount: '0',
                op_return_data: 'deadbeef',
                script_type: 'PAYTOOPRETURN',
            },
            // @ts-expect-error unexpected script_type
            {
                address: 'abcd',
                amount: '100',
                script_type: 'PAYTOP2SHWITNESS',
            },
            // @ts-expect-error unexpected address
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
    // @ts-expect-error
    TrezorConnect.pushTransaction();
    // @ts-expect-error
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
        // @ts-expect-error
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
    const verify = await TrezorConnect.verifyMessage({
        address: 'a',
        signature: 'a',
        message: 'foo',
        coin: 'btc',
    });
    if (verify.success) {
        const { payload } = verify;
        payload.message;
    }
};

export const getOwnershipId = async () => {
    const result = await TrezorConnect.getOwnershipId({ path: 'm/44' });
    if (result.success) {
        const { payload } = result;
        payload.ownership_id;
    }

    TrezorConnect.getOwnershipId({
        path: 'm/44',
        coin: 'btc',
        multisig: {
            pubkeys: [{ node: 'HDNodeAsString', address_n: [0] }],
            signatures: ['signature'],
            m: 0,
        },
        scriptType: 'SPENDTAPROOT',
    });

    // bundle
    const bundleId = await TrezorConnect.getOwnershipId({ bundle: [{ path: 'm/44' }] });
    if (bundleId.success) {
        bundleId.payload.forEach(item => {
            item.ownership_id;
        });
        // @ts-expect-error
        bundleId.payload.ownership_id;
    } else {
        bundleId.payload.error;
    }

    // @ts-expect-error missing path
    TrezorConnect.getOwnershipId({ coin: 'btc' });
};

export const getOwnershipProof = async () => {
    const result = await TrezorConnect.getOwnershipProof({ path: 'm/44' });
    if (result.success) {
        const { payload } = result;
        payload.ownership_proof;
        payload.signature;
    }

    TrezorConnect.getOwnershipProof({
        path: 'm/44',
        coin: 'btc',
        scriptType: 'SPENDTAPROOT',
        multisig: {
            pubkeys: [{ node: 'HDNodeAsString', address_n: [0] }],
            signatures: ['signature'],
            m: 0,
        },
        userConfirmation: true,
        ownershipIds: ['dead'],
        commitmentData: 'beef',
    });

    // bundle
    const bundleId = await TrezorConnect.getOwnershipProof({ bundle: [{ path: 'm/44' }] });
    if (bundleId.success) {
        bundleId.payload.forEach(item => {
            item.ownership_proof;
        });
        // @ts-expect-error
        bundleId.payload.ownership_proof;
    } else {
        bundleId.payload.error;
    }

    // @ts-expect-error missing path
    TrezorConnect.getOwnershipProof({ coin_name: 'btc' });
};

export const authorizeCoinJoin = async () => {
    const result = await TrezorConnect.authorizeCoinJoin({
        path: 'm/44',
        coordinator: 'TrezorCoinjoinCoordinator',
        maxRounds: 1,
        maxCoordinatorFeeRate: 100,
        maxFeePerKvbyte: 100,
    });
    if (result.success) {
        const { payload } = result;
        payload.message;
    }

    TrezorConnect.authorizeCoinJoin({
        path: 'm/44',
        coordinator: 'TrezorCoinjoinCoordinator',
        maxRounds: 1,
        maxCoordinatorFeeRate: 100,
        maxFeePerKvbyte: 100,
        coin: 'btc',
        scriptType: 'SPENDTAPROOT',
        amountUnit: 1, // MILLIBITCOIN
    });

    // @ts-expect-error missing maxTotalFee
    TrezorConnect.authorizeCoinJoin({ path: 'm/44', coordinator: '' });
    // @ts-expect-error missing coordinator
    TrezorConnect.authorizeCoinJoin({ path: 'm/44', maxTotalFee: 1 });
    // @ts-expect-error missing path
    TrezorConnect.authorizeCoinJoin({ coordinator: '', maxTotalFee: 1 });
};
