/* @flow */

// This file has all various types that go into Trezor or out of it.

export type CipheredKeyValue = {
    value: string,
}

export type Success = {};

export type Features = {
    vendor: string,
    major_version: number,
    minor_version: number,
    patch_version: number,
    bootloader_mode: boolean,
    device_id: string,
    pin_protection: boolean,
    passphrase_protection: boolean,
    language: string,
    label: string,
    initialized: boolean,
    revision: string,
    bootloader_hash: string,
    imported: boolean,
    pin_cached: boolean,
    passphrase_cached: boolean,
    firmware_present: boolean,
    needs_backup: boolean,
    flags: number,
    model: string,
    fw_major: number,
    fw_minor: number,
    fw_patch: number,
    fw_vendor: string,
    fw_vendor_keys: string,
    unfinished_backup: boolean,
    no_backup: boolean,
};

export type ResetDeviceSettings = {
    display_random?: boolean,
    strength?: number,
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    language?: string,
    label?: string,
    u2f_counter?: number,
    skip_backup?: boolean,
};

export type HDPrivNode = {
    depth: number,
    fingerprint: number,
    child_num: number,
    chain_code: string,
    private_key: string,
};

export type HDPubNode = {
    depth: number,
    fingerprint: number,
    child_num: number,
    chain_code: string,
    public_key: string,
};

export type HDNode = HDPubNode | HDPrivNode;

export type LoadDeviceSettings = {
    pin?: string,
    passphrase_protection?: boolean,
    language?: string,
    label?: string,
    skip_checksum?: boolean,

    mnemonic?: string,
    node?: HDNode,
    payload?: string, // will be converted

    u2f_counter?: number,
};

export type RecoverDeviceSettings = {
    word_count?: number,
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    language?: string,
    label?: string,
    enforce_wordlist?: boolean,
    type?: number,
    u2f_counter?: number,
};

export type ApplySettings = {
    language?: string,
    label?: string,
    use_passphrase?: boolean,
    homescreen?: string,
};

export type MessageSignature = {
    address: string,
    signature: string,
}

export type MultisigRedeemScriptType = {
    pubkeys: Array<{ node: string, address_n: Array<number> }>,
    signatures: Array<string>,
    m?: number,
}

export type TransactionInput = {
    address_n?: Array<number>,
    prev_hash: string,
    prev_index: number,
    script_sig?: string,
    sequence?: number,
    script_type?: 'SPENDADDRESS' | 'SPENDMULTISIG' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS',
    multisig?: MultisigRedeemScriptType,
    amount?: number, // only with segwit
    decred_tree?: number,
    decred_script_version?: number,
};

export type TransactionOutput = {
    address: string,
    amount: number, // in satoshis
    script_type: 'PAYTOADDRESS',
} | {
    address_n: Array<number>,
    amount: number, // in satoshis
    script_type: 'PAYTOADDRESS' | 'PAYTOMULTISIG' | 'PAYTOWITNESS' | 'PAYTOP2SHWITNESS',
} | {
    op_return_data: string,
    amount: 0, // fixed
    script_type: 'PAYTOOPRETURN',
}
// TODO:
// "multisig": MultisigRedeemScriptType field, where?
// "decred_script_version": number field, where?

export type TransactionBinOutput = {
    amount: number,
    script_pubkey: string,
};

export type RefTransaction = {
    hash: string,
    version: number,
    inputs: Array<TransactionInput>,
    bin_outputs: Array<TransactionBinOutput>,
    lock_time: number,
    extra_data: ?string,
};

export type TxRequestDetails = {
    request_index: number,
    tx_hash?: string,
    extra_data_len?: number,
    extra_data_offset?: number,
};

export type TxRequestSerialized = {
    signature_index?: number,
    signature?: string,
    serialized_tx?: string,
};

export type TxRequest = {
    request_type: 'TXINPUT' | 'TXOUTPUT' | 'TXMETA' | 'TXFINISHED' | 'TXEXTRADATA',
    details: TxRequestDetails,
    serialized: TxRequestSerialized,
};

export type SignedTx = {
    signatures: Array<string>,
    serializedTx: string,
    txid?: string,
};

export type EthereumTxRequest = {
    data_length?: number,
    signature_v?: number,
    signature_r?: string,
    signature_s?: string,
};

export type EthereumAddress = {
    address: string,
}

export type EthereumSignedTx = {
    // v: number,
    v: string,
    r: string,
    s: string,
};

export type Identity = {
    proto?: string,
    user?: string,
    host?: string,
    port?: string,
    path?: string,
    index?: number,
};

export type SignedIdentity = {
    address: string,
    public_key: string,
    signature: string,
};

export type PublicKey = {
    node: HDPubNode,
    xpub: string,
};

// combined PublicKey and bitcoin.HDNode
export type HDNodeResponse = {
    path: Array<number>,
    serializedPath: string,
    childNum: number,
    xpub: string,
    xpubSegwit?: string,
    chainCode: string,
    publicKey: string,
    fingerprint: number,
    depth: number,
};

// this is what Trezor asks for
export type SignTxInfoToTrezor = {
    inputs: Array<TransactionInput>,
} | {
    bin_outputs: Array<TransactionBinOutput>,
} | {
    outputs: Array<TransactionOutput>,
} | {
    extra_data: string,
} | {
    version: number,
    lock_time: number,
    inputs_cnt: number,
    outputs_cnt: number,
    extra_data_len?: number,
};

// NEM types
export type NEMAddress = {
    address: string,
}

export type NEMSignedTx = {
    data: string,
    signature: string,
}

export type NEMTransactionCommon = {
    address_n: ?Array<number>,
    network: ?number,
    timestamp: ?number,
    fee: ?number,
    deadline: ?number,
    signer: ?string,
}

export type NEMMosaic = {
    namespace: ?string,
    mosaic: ?string,
    quantity: ?number,
}

export type NEMTransfer = {
    mosaics: ?Array<NEMMosaic>,
    public_key: ?string,
    recipient: ?string,
    amount: ?number,
    payload: ?string,
}

export type NEMProvisionNamespace = {
    namespace: ?string,
    sink: ?string,
    fee: ?number,
    parent: ?string,
}

export type NEMMosaicLevyType = {
    id: 1,
    name: 'MosaicLevy_Absolute',
} | {
    id: 2,
    name: 'MosaicLevy_Percentile',
}

export type NEMSupplyChangeType = {
    id: 1,
    name: 'SupplyChange_Increase',
} | {
    id: 2,
    name: 'SupplyChange_Decrease',
}

export type NEMModificationType = {
    id: 1,
    name: 'CosignatoryModification_Add',
} | {
    id: 2,
    name: 'CosignatoryModification_Delete',
}

export type NEMImportanceTransferMode = {
    id: 1,
    name: 'ImportanceTransfer_Activate',
} | {
    id: 2,
    name: 'ImportanceTransfer_Deactivate',
}

export type NEMMosaicDefinition = {
    name?: string,
    ticker?: string,
    namespace?: string,
    mosaic?: string,
    divisibility?: number,
    fee?: number,
    levy?: NEMMosaicLevyType,
    levy_address?: string,
    levy_namespace?: string,
    levy_mosaic?: string,
    supply?: number,
    mutable_supply?: boolean,
    transferable?: boolean,
    description?: string,
    networks?: number,
}

export type NEMMosaicCreation = {
    definition: ?NEMMosaicDefinition,
    sink: ?string,
    fee: ?number,
}

export type NEMMosaicSupplyChange = {
    namespace?: string,
    type?: NEMSupplyChangeType,
    mosaic?: string,
    delta?: number,
}

export type NEMCosignatoryModification = {
    type?: NEMModificationType,
    public_key?: string,
}

export type NEMAggregateModification = {
    modifications: ?Array<NEMCosignatoryModification>,
    relative_change: ?number, // TODO: "sint32"
}

export type NEMImportanceTransfer = {
    mode?: NEMImportanceTransferMode,
    public_key?: string,
}

export type NEMSignTxMessage = {
    transaction?: NEMTransactionCommon,
    cosigning?: boolean,
    multisig?: NEMTransactionCommon,
    transfer?: NEMTransfer,
    provision_namespace?: NEMProvisionNamespace,
    mosaic_creation?: NEMMosaicCreation,
    supply_change?: NEMMosaicSupplyChange,
    aggregate_modification?: NEMAggregateModification,
    importance_transfer?: NEMImportanceTransfer,
}

// Stellar types

export type StellarAddress = {
    address: string,
}

export type StellarSignedTx = {
    public_key: string,
    signature: string,
}

export type StellarPaymentOp = {
    type: "StellarTxOpRequest",
    message: {},
}

export type StellarSignTxMessage = {
    address_n: Array<number>,
    source_account: string,
    fee: ?number,
    sequence_number: ?number,
    network_passphrase: string,
    timebounds_start?: number,
    timebounds_end?: number,
    memo_type?: number,
    memo_text?: ?string,
    memo_id?: ?number,
    memo_hash?: ?string,
    num_operations: number,
}

type StellarAsset = {
    type: string,
    code?: string,
    issuer?: string,
}

export type StellarOperationMessage = {
    type: 'StellarCreateAccountOp',
    new_account: ?string,
    source_account: string,
    starting_balance: ?number,
} | {
    type: 'StellarPaymentOp',
    source_account: ?string,
    destination_account: ?string,
    asset: ?StellarAsset,
    amount: ?number,
} | {
    type: 'StellarPathPaymentOp',
    source_account: string,
    send_asset: ?StellarAsset,
    send_max: ?number,
    destination_account: ?string,
    destination_asset: ?StellarAsset,
    destination_amount: ?number,
    paths: ?Array<StellarAsset>,
} | {
    type: 'StellarManageOfferOp',
    source_account: string,
    offer_id: number,
    amount: number,
    buying_asset: StellarAsset,
    selling_asset: StellarAsset,
    price_n: number,
    price_d: number,
} | {
    type: 'StellarCreatePassiveOfferOp',
    source_account: string,
    offer_id: number,
    amount: number,
    buying_asset: StellarAsset,
    selling_asset: StellarAsset,
    price_n: number,
    price_d: number,
} | {
    type: 'StellarSetOptionsOp',
    source_account: string,
    signer_type: ?number,
    signer_key: ?string,
    signer_weight: ?number,
    clear_flags: ?number,
    set_flags: ?number,
    master_weight: ?number,
    low_threshold: ?number,
    medium_threshold: ?number,
    high_threshold: ?number,
    home_domain: ?string,
    inflation_destination_account: ?string,
} | {
    type: 'StellarChangeTrustOp',
    source_account: string,
    asset: ?StellarAsset,
    limit: ?number,
} | {
    type: 'StellarAllowTrustOp',
    source_account: string,
    trusted_account: string,
    asset_type: ?number,
    asset_code: ?string,
    is_authorized: ?number,
} | {
    type: 'StellarAccountMergeOp',
    source_account: string,
    destination_account: string,
} | {
    type: 'StellarManageDataOp',
    source_account: string,
    key: string,
    value: string,
} | {
    type: 'StellarBumpSequenceOp',
    source_account: string,
    bump_to: number,
}

// Tezos types
export type TezosAddress = {
    address: string,
};

export type TezosPublicKey = {
    public_key: string,
};

type TezosContractID = {
    tag: number,
    hash: Uint8Array,
};

export type TezosRevealOp = {
    source: TezosContractID,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
    public_key: Uint8Array,
};

export type TezosTransactionOp = {
    source: TezosContractID,
    destination: TezosContractID,
    amount: number,
    counter: number,
    fee: number,
    gas_limit: number,
    storage_limit: number,
    parameters?: Array<number>,
};

export type TezosOriginationOp = {
    source: TezosContractID,
    manager_pubkey: Uint8Array,
    balance: number,
    spendable: boolean,
    delegatable: boolean,
    delegate: Uint8Array,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
    script?: Array<number>,
};

export type TezosDelegationOp = {
    source: TezosContractID,
    delegate: Uint8Array,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
};

export type TezosTransaction = {
    address_n: Array<number>,
    branch: Uint8Array,
    reveal?: TezosRevealOp,
    transaction?: TezosTransactionOp,
    origination?: TezosOriginationOp,
    delegation?: TezosDelegationOp,
};

export type TezosSignedTx = {
    signature: string,
    sig_op_contents: string,
    operation_hash: string,
};

// Cardano types
export type CardanoAddress = {
    address: string,
    address_n?: Array<number>,
};

export type CardanoPublicKey = {
    xpub: string,
    node: HDPubNode,
};

export type CardanoSignedTx = {
    tx_hash: string,
    tx_body: string,
};
export type CardanoTxInput = {
    tx_hash: string,
    address_n: Array<number>,
    output_index: number,
    type?: number,
};
export type CardanoTxOutput = {
    address?: string,
    address_n?: Array<number>,
    amount: number,
};

export type CardanoTxRequest = {
    tx_index: number,
    tx_hash: string,
    tx_body: string,
};

// Lisk types
export type LiskAddress = {
    address: string,
}

export type LiskPublicKey = {
    public_key: string,
}

export type LiskMessageSignature = {
    public_key: string,
    signature: string,
};

export type LiskAsset =
    { data: string } |
    { votes: Array<string> } |
    { delegate: { username: string } } |
    { signature: { public_key: string } } |
    {
        multisignature: {
            min: number,
            life_time: number,
            keys_group: Array<string>,
        },
    };

export type LiskTransaction = {
    type: number,
    fee: number,
    amount: number,
    timestamp: number,
    recipient_id?: string,
    sender_public_key?: string,
    requester_public_key?: string,
    signature?: string,
    asset?: LiskAsset,
}

export type LiskSignedTx = {
    signature: string,
}

// Ripple types
export type RippleAddress = {
    address: string,
}

export type RippleTransaction = {
    address_n: Array<number>,
    fee?: number,
    flags?: number,
    sequence?: number,
    last_ledger_sequence?: number,
    payment: {
        amount: number,
        destination: string,
    },
}

export type RippleSignedTx = {
    signature: string,
    serialized_tx: string,
}

// GetAddress response
export type Address = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

// Reset device flags
export type ResetDeviceFlags = {
    display_random?: boolean,
    strength?: number,
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    language?: string,
    label?: string,
    u2f_counter?: number,
    skip_backup?: boolean,
    no_backup?: boolean,
}
