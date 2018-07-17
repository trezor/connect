/* @flow */

// This file has all various types that go into TREZOR or out of it.

export type CipheredKeyValue = {
    value: string;
}

export type Success = {};

export type CoinType = {
    coin_name: string,
    coin_shortcut: string,
    address_type: number,
    maxfee_kb: number,
    address_type_p2sh: number,
};

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
    coins: CoinType[],
    initialized: boolean,
    revision: string,
    bootloader_hash: string,
    imported: boolean,
    pin_cached: boolean,
    passphrase_cached: boolean,
    state?: string;
    needs_backup?: boolean,
    firmware_present?: boolean,
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

type MultisigRedeemScriptType = {
    pubkeys: Array<{ node: string, address_n: Array<number>}>;
    signatures: Array<string>;
    m?: number;
}

// type TransactionInputBase = {
//     address_n?: Array<number>,
//     prev_hash: string,
//     prev_index: number,
// }

// export type TransactionInput = TransactionInputBase & {
//     script_type: 'SPENDMULTISIG',
//     multisig: MultisigRedeemScriptType,
// } | TransactionInputBase & {
//     script_type: 'SPENDP2SHWITNESS',
//     amount: number,
// }

export type TransactionInput = {
    address_n?: Array<number>,
    prev_hash: string,
    prev_index: number,
    script_sig?: string,
    sequence?: number,
    script_type?: 'SPENDADDRESS' | 'SPENDMULTISIG' | 'EXTERNAL' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS',
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
    script_type: 'PAYTOADDRESS' | 'PAYTOP2SHWITNESS',
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
    serialized: {
        signatures: Array<string>,
        serialized_tx: string,
    },
};

export type EthereumTxRequest = {
    data_length?: number,
    signature_v?: number,
    signature_r?: string,
    signature_s?: string,
};

export type EthereumAddress = {
    address: string;
    path: Array<number>;
}

export type EthereumSignedTx = {
    v: number,
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
    address: string;
    path: Array<number>;
}

export type NEMSignedTx = {
    data: string;
    signature: string;
}

export type NEMSignTxMessage = {
    transaction?: NEMTransactionCommon;
    cosigning?: boolean;
    multisig?: NEMTransactionCommon;
    transfer?: NEMTransfer;
    provision_namespace?: NEMProvisionNamespace;
    mosaic_creation?: NEMMosaicCreation;
    supply_change?: NEMMosaicSupplyChange;
    aggregate_modification?: NEMAggregateModification;
    importance_transfer?: NEMImportanceTransfer;
}

export type NEMTransactionCommon = {
    address_n: ?Array<number>;
    network: ?number;
    timestamp: ?number;
    fee: ?number;
    deadline: ?number;
    signer: ?string;
}

export type NEMTransfer = {
    mosaics: ?Array<NEMMosaic>;
    public_key: ?string;
    recipient: ?string;
    amount: ?number;
    payload: ?string;
}

export type NEMMosaic = {
    namespace: ?string;
    mosaic: ?string;
    quantity: ?number;
}

export type NEMProvisionNamespace = {
    namespace: ?string;
    sink: ?string;
    fee: ?number;
    parent: ?string;
}

export type NEMMosaicCreation = {
    definition: ?NEMMosaicDefinition;
    sink: ?string;
    fee: ?number;
}

export type NEMMosaicDefinition = {
    name?: string;
    ticker?: string;
    namespace?: string;
    mosaic?: string;
    divisibility?: number;
    fee?: number;
    levy?: NEMMosaicLevyType;
    levy_address?: string;
    levy_namespace?: string;
    levy_mosaic?: string;
    supply?: number;
    mutable_supply?: boolean;
    transferable?: boolean;
    description?: string;
    networks?: number;
}

export type NEMMosaicSupplyChange = {
    namespace?: string;
    type?: NEMSupplyChangeType;
    mosaic?: string;
    delta?: number;
}

export type NEMAggregateModification = {
    modifications: ?Array<NEMCosignatoryModification>;
    relative_change: ?number; // TODO: "sint32"
}

export type NEMCosignatoryModification = {
    type?: NEMModificationType;
    public_key?: string;
}

export type NEMImportanceTransfer = {
    mode?: NEMImportanceTransferMode;
    public_key?: string;
}

export type NEMMosaicLevyType = {
    id: 1,
    name: 'MosaicLevy_Absolute'
} | {
    id: 2,
    name: 'MosaicLevy_Percentile'
}

export type NEMSupplyChangeType = {
    id: 1,
    name: 'SupplyChange_Increase'
} | {
    id: 2,
    name: 'SupplyChange_Decrease'
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
    name: 'ImportanceTransfer_Activate'
} | {
    id: 2,
    name: 'ImportanceTransfer_Deactivate'
}

// Stellar types
export type StellarAddress = {
    address: string;
    path: Array<number>;
}

export type StellarPublicKey = {
    public_key: string;
    path: Array<number>;
}

export type StellarSignedTx = {
    public_key: string;
    signature: string;
}

// GetAccountInfo response
export type AccountInfo = {
    id: number;
    path: Array<number>;
    serializedPath: string;
    xpub: string;
    address: string;
    addressId: number;
    addressPath: Array<number>;
    balance: number;
    confirmed: number;
}

// GetAddress response
export type Address = {
    address: string;
    path: Array<number>;
}
