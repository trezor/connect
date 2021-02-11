// @flow
// This file is auto generated from data/messages/message.json
const Enum_InputScriptType = Object.freeze({
    SPENDADDRESS: 0,
    SPENDMULTISIG: 1,
    EXTERNAL: 2,
    SPENDWITNESS: 3,
    SPENDP2SHWITNESS: 4,
});
export type InputScriptType = $Keys<typeof Enum_InputScriptType>;

const Enum_OutputScriptType = Object.freeze({
    PAYTOADDRESS: 0,
    PAYTOSCRIPTHASH: 1,
    PAYTOMULTISIG: 2,
    PAYTOOPRETURN: 3,
    PAYTOWITNESS: 4,
    PAYTOP2SHWITNESS: 5,
});
export type OutputScriptType = $Keys<typeof Enum_OutputScriptType>;

const Enum_AmountUnit = Object.freeze({
    BITCOIN: 0,
    MILLIBITCOIN: 1,
    MICROBITCOIN: 2,
    SATOSHI: 3,
});
export type AmountUnit = $Values<typeof Enum_AmountUnit>;

const Enum_CardanoAddressType = Object.freeze({
    BASE: 0,
    BASE_SCRIPT_KEY: 1,
    BASE_KEY_SCRIPT: 2,
    BASE_SCRIPT_SCRIPT: 3,
    POINTER: 4,
    POINTER_SCRIPT: 5,
    ENTERPRISE: 6,
    ENTERPRISE_SCRIPT: 7,
    BYRON: 8,
    REWARD: 14,
    REWARD_SCRIPT: 15,
});
export type CardanoAddressType = $Values<typeof Enum_CardanoAddressType>;

const Enum_CardanoCertificateType = Object.freeze({
    STAKE_REGISTRATION: 0,
    STAKE_DEREGISTRATION: 1,
    STAKE_DELEGATION: 2,
    STAKE_POOL_REGISTRATION: 3,
});
export type CardanoCertificateType = $Values<typeof Enum_CardanoCertificateType>;

const Enum_CardanoPoolRelayType = Object.freeze({
    SINGLE_HOST_IP: 0,
    SINGLE_HOST_NAME: 1,
    MULTIPLE_HOST_NAME: 2,
});
export type CardanoPoolRelayType = $Values<typeof Enum_CardanoPoolRelayType>;

const Enum_BackupType = Object.freeze({
    Bip39: 0,
    Slip39_Basic: 1,
    Slip39_Advanced: 2,
});
export type BackupType = $Keys<typeof Enum_BackupType>;

const Enum_SafetyCheckLevel = Object.freeze({
    Strict: 0,
    PromptAlways: 1,
    PromptTemporarily: 2,
});
export type SafetyCheckLevel = $Values<typeof Enum_SafetyCheckLevel>;

// BinanceGetAddress
export type BinanceGetAddress = {
    address_n: number[];
    show_display?: boolean;
};

// BinanceAddress
export type BinanceAddress = {
    address: string;
};

// BinanceGetPublicKey
export type BinanceGetPublicKey = {
    address_n: number[];
    show_display?: boolean;
};

// BinancePublicKey
export type BinancePublicKey = {
    public_key: string;
};

// BinanceSignTx
export type BinanceSignTx = {
    address_n: number[];
    msg_count?: number;
    account_number?: number;
    chain_id?: string;
    memo?: string;
    sequence?: number;
    source?: number;
};

// BinanceTxRequest
export type BinanceTxRequest = {};

export type BinanceCoin = {
    amount?: number;
    denom?: string;
};

export type BinanceInputOutput = {
    address?: string;
    coins: BinanceCoin[];
};

// BinanceTransferMsg
export type BinanceTransferMsg = {
    inputs: BinanceInputOutput[];
    outputs: BinanceInputOutput[];
};

const Enum_BinanceOrderType = Object.freeze({
    OT_UNKNOWN: 0,
    MARKET: 1,
    LIMIT: 2,
    OT_RESERVED: 3,
});
export type BinanceOrderType = $Values<typeof Enum_BinanceOrderType>;

const Enum_BinanceOrderSide = Object.freeze({
    SIDE_UNKNOWN: 0,
    BUY: 1,
    SELL: 2,
});
export type BinanceOrderSide = $Values<typeof Enum_BinanceOrderSide>;

const Enum_BinanceTimeInForce = Object.freeze({
    TIF_UNKNOWN: 0,
    GTE: 1,
    TIF_RESERVED: 2,
    IOC: 3,
});
export type BinanceTimeInForce = $Values<typeof Enum_BinanceTimeInForce>;

// BinanceOrderMsg
export type BinanceOrderMsg = {
    id?: string;
    ordertype?: BinanceOrderType;
    price?: number;
    quantity?: number;
    sender?: string;
    side?: BinanceOrderSide;
    symbol?: string;
    timeinforce?: BinanceTimeInForce;
};

// BinanceCancelMsg
export type BinanceCancelMsg = {
    refid?: string;
    sender?: string;
    symbol?: string;
};

// BinanceSignedTx
export type BinanceSignedTx = {
    signature: string;
    public_key: string;
};

// HDNodeType
export type HDNodeType = {
    depth: number;
    fingerprint: number;
    child_num: number;
    chain_code: string;
    private_key?: string;
    public_key: string;
};

export type HDNodePathType = {
    node: HDNodeType | string;
    address_n: number[];
};

// MultisigRedeemScriptType
export type MultisigRedeemScriptType = {
    pubkeys: HDNodePathType[];
    signatures: string[];
    m: number;
    nodes?: HDNodeType[];
    address_n?: number[];
};

// GetPublicKey
export type GetPublicKey = {
    address_n: number[];
    ecdsa_curve_name?: string;
    show_display?: boolean;
    coin_name?: string;
    script_type?: InputScriptType;
    ignore_xpub_magic?: boolean;
};

// PublicKey
export type PublicKey = {
    node: HDNodeType;
    xpub: string;
    root_fingerprint?: number;
};

// GetAddress
export type GetAddress = {
    address_n: number[];
    coin_name?: string;
    show_display?: boolean;
    multisig?: MultisigRedeemScriptType;
    script_type?: InputScriptType;
    ignore_xpub_magic?: boolean;
};

// Address
export type Address = {
    address: string;
};

// GetOwnershipId
export type GetOwnershipId = {
    address_n: number[];
    coin_name?: string;
    multisig?: MultisigRedeemScriptType;
    script_type?: InputScriptType;
};

// OwnershipId
export type OwnershipId = {
    ownership_id: string;
};

// SignMessage
export type SignMessage = {
    address_n: number[];
    message: string;
    coin_name?: string;
    script_type?: InputScriptType;
};

// MessageSignature
export type MessageSignature = {
    address: string;
    signature: string;
};

// VerifyMessage
export type VerifyMessage = {
    address: string;
    signature: string;
    message: string;
    coin_name?: string;
};

// SignTx
export type SignTx = {
    outputs_count: number;
    inputs_count: number;
    coin_name?: string;
    version?: number;
    lock_time?: number;
    expiry?: number;
    overwintered?: boolean;
    version_group_id?: number;
    timestamp?: number;
    branch_id?: number;
    amount_unit?: AmountUnit;
};

const Enum_RequestType = Object.freeze({
    TXINPUT: 0,
    TXOUTPUT: 1,
    TXMETA: 2,
    TXFINISHED: 3,
    TXEXTRADATA: 4,
    TXORIGINPUT: 5,
    TXORIGOUTPUT: 6,
});
export type RequestType = $Keys<typeof Enum_RequestType>;

export type TxRequestDetailsType = {
    request_index: number;
    tx_hash?: string;
    extra_data_len?: number;
    extra_data_offset?: number;
};

export type TxRequestSerializedType = {
    signature_index?: number;
    signature?: string;
    serialized_tx?: string;
};

// TxRequest
export type TxRequest = {
    request_type: RequestType;
    details: TxRequestDetailsType;
    serialized?: TxRequestSerializedType;
};

export type TxInputType = {
    address_n: number[];
    prev_hash: string;
    prev_index: number;
    script_sig?: string;
    sequence?: number;
    script_type?: InputScriptType;
    multisig?: MultisigRedeemScriptType;
    amount: number | string;
    decred_tree?: number;
    witness?: string;
    ownership_proof?: string;
    commitment_data?: string;
    orig_hash?: string;
    orig_index?: number;
};

export type TxOutputBinType = {
    amount: number | string;
    script_pubkey: string;
    decred_script_version?: number;
};

// - TxOutputType replacement
// TxOutputType needs more exact types
// differences: external output (no address_n), opreturn output (no address_n, no address)
// eslint-disable-next-line no-unused-vars
type Exclude<A, B> = $Keys<$Diff<typeof Enum_OutputScriptType, { PAYTOOPRETURN: 3 }>>; // flowtype equivalent of typescript Exclude
export type ChangeOutputScriptType = Exclude<OutputScriptType, 'PAYTOOPRETURN'>;

export type TxOutputType = {|
    address: string;
    address_n?: typeof undefined;
    script_type: 'PAYTOADDRESS';
    amount: string;
    multisig?: MultisigRedeemScriptType;
    orig_hash?: string;
    orig_index?: number;
|} | {|
    address?: typeof undefined;
    address_n: number[];
    script_type: ChangeOutputScriptType;
    amount: string;
    multisig?: MultisigRedeemScriptType;
    orig_hash?: string;
    orig_index?: number;
|} | {|
    address?: typeof undefined;
    address_n?: typeof undefined;
    amount: '0';
    op_return_data: string;
    script_type: 'PAYTOOPRETURN';
    orig_hash?: string;
    orig_index?: number;
|};
// - TxOutputType replacement end

// TxAck
// - TxAck replacement
// TxAck needs more exact types
// differences: RefTxInputType (no address_n) and TxInputType, partial exact responses in TxAckResponse
export type RefTxInputType = {|
    prev_hash: string;
    prev_index: number;
    script_sig: string;
    sequence: number;
    decred_tree?: number;
|};

export type TxAckResponse = {|
    inputs: Array<TxInputType | RefTxInputType>;
|} | {|
    bin_outputs: TxOutputBinType[];
|} | {|
    outputs: TxOutputType[];
|} | {|
    extra_data: string;
|} | {|
    version?: number;
    lock_time?: number;
    inputs_cnt: number;
    outputs_cnt: number;
    extra_data?: string;
    extra_data_len?: number;
    timestamp?: number;
    version_group_id?: number;
    expiry?: number;
    branch_id?: number;
|};

export type TxAck = {
    tx: TxAckResponse;
};
// - TxAck replacement end

// TxInput
export type TxInput = {
    address_n: number[];
    prev_hash: string;
    prev_index: number;
    script_sig?: string;
    sequence?: number;
    script_type?: InputScriptType;
    multisig?: MultisigRedeemScriptType;
    amount: string | number;
    decred_tree?: number;
    witness?: string;
    ownership_proof?: string;
    commitment_data?: string;
    orig_hash?: string;
    orig_index?: number;
};

// TxOutput

// - TxOutput replacement
export type TxOutput = TxOutputType;
// - TxOutput replacement end

// PrevTx
export type PrevTx = {
    version: number;
    lock_time: number;
    inputs_count: number;
    outputs_count: number;
    extra_data_len?: number;
    expiry?: number;
    version_group_id?: number;
    timestamp?: number;
    branch_id?: number;
};

// PrevInput
export type PrevInput = {
    prev_hash: string;
    prev_index: number;
    script_sig: string;
    sequence: number;
    decred_tree?: number;
};

// PrevOutput
export type PrevOutput = {
    amount: string | number;
    script_pubkey: string;
    decred_script_version?: number;
};

export type TxAckInputWrapper = {
    input: TxInput;
};

// TxAckInput
export type TxAckInput = {
    tx: TxAckInputWrapper;
};

export type TxAckOutputWrapper = {
    output: TxOutput;
};

// TxAckOutput
export type TxAckOutput = {
    tx: TxAckOutputWrapper;
};

// TxAckPrevMeta
export type TxAckPrevMeta = {
    tx: PrevTx;
};

export type TxAckPrevInputWrapper = {
    input: PrevInput;
};

// TxAckPrevInput
export type TxAckPrevInput = {
    tx: TxAckPrevInputWrapper;
};

export type TxAckPrevOutputWrapper = {
    output: PrevOutput;
};

// TxAckPrevOutput
export type TxAckPrevOutput = {
    tx: TxAckPrevOutputWrapper;
};

export type TxAckPrevExtraDataWrapper = {
    extra_data_chunk: string;
};

// TxAckPrevExtraData
export type TxAckPrevExtraData = {
    tx: TxAckPrevExtraDataWrapper;
};

// GetOwnershipProof
export type GetOwnershipProof = {
    address_n: number[];
    coin_name?: string;
    script_type?: InputScriptType;
    multisig?: MultisigRedeemScriptType;
    user_confirmation?: boolean;
    ownership_ids: string[];
    commitment_data?: string;
};

// OwnershipProof
export type OwnershipProof = {
    ownership_proof: string;
    signature: string;
};

// AuthorizeCoinJoin
export type AuthorizeCoinJoin = {
    coordinator: string;
    max_total_fee: number;
    fee_per_anonymity?: number;
    address_n: number[];
    coin_name?: string;
    script_type?: InputScriptType;
    amount_unit?: AmountUnit;
};

// FirmwareErase
export type FirmwareErase = {
    length?: number;
};

// FirmwareRequest
export type FirmwareRequest = {
    offset?: number;
    length?: number;
};

// FirmwareUpload
export type FirmwareUpload = {
    payload: Buffer;
    hash?: string;
};

// SelfTest
export type SelfTest = {
    payload?: string;
};

// CardanoBlockchainPointerType
export type CardanoBlockchainPointerType = {
    block_index: number;
    tx_index: number;
    certificate_index: number;
};

// CardanoAddressParametersType
export type CardanoAddressParametersType = {
    address_type: CardanoAddressType;
    address_n: number[];
    address_n_staking: number[];
    staking_key_hash?: string;
    certificate_pointer?: CardanoBlockchainPointerType;
};

// CardanoGetAddress
export type CardanoGetAddress = {
    show_display?: boolean;
    protocol_magic: number;
    network_id: number;
    address_parameters: CardanoAddressParametersType;
};

// CardanoAddress
export type CardanoAddress = {
    address: string;
};

// CardanoGetPublicKey
export type CardanoGetPublicKey = {
    address_n: number[];
    show_display?: boolean;
};

// CardanoPublicKey
export type CardanoPublicKey = {
    xpub: string;
    node: HDNodeType;
};

export type CardanoTxInputType = {
    address_n?: number[];
    prev_hash: string;
    prev_index: number;
};

export type CardanoTokenType = {
    asset_name_bytes: string;
    amount: string | number;
};

export type CardanoAssetGroupType = {
    policy_id: string;
    tokens: CardanoTokenType[];
};

export type CardanoTxOutputType = {
    address?: string;
    amount: number;
    address_parameters?: CardanoAddressParametersType;
    token_bundle: CardanoAssetGroupType[];
};

export type CardanoPoolOwnerType = {
    staking_key_path?: number[];
    staking_key_hash?: string;
};

export type CardanoPoolRelayParametersType = {
    type: CardanoPoolRelayType;
    ipv4_address?: string;
    ipv6_address?: string;
    host_name?: string;
    port?: number;
};

export type CardanoPoolMetadataType = {
    url: string;
    hash: string;
};

export type CardanoPoolParametersType = {
    pool_id: string;
    vrf_key_hash: string;
    pledge: string | number;
    cost: string | number;
    margin_numerator: string | number;
    margin_denominator: string | number;
    reward_account: string;
    owners: CardanoPoolOwnerType[];
    relays: CardanoPoolRelayParametersType[];
    metadata?: CardanoPoolMetadataType;
};

export type CardanoTxCertificateType = {
    type: CardanoCertificateType;
    path?: number[];
    pool?: string;
    pool_parameters?: CardanoPoolParametersType;
};

export type CardanoTxWithdrawalType = {
    path: number[];
    amount: number;
};

// CardanoSignTx
export type CardanoSignTx = {
    inputs: CardanoTxInputType[];
    outputs: CardanoTxOutputType[];
    protocol_magic: number;
    fee: string | number;
    ttl?: string | number;
    network_id: number;
    certificates: CardanoTxCertificateType[];
    withdrawals: CardanoTxWithdrawalType[];
    metadata?: string;
    validity_interval_start?: number;
};

// CardanoSignedTx
export type CardanoSignedTx = {
    tx_hash: string;
    serialized_tx: string;
};

// Success
export type Success = {
    message: string;
};

const Enum_FailureType = Object.freeze({
    Failure_UnexpectedMessage: 1,
    Failure_ButtonExpected: 2,
    Failure_DataError: 3,
    Failure_ActionCancelled: 4,
    Failure_PinExpected: 5,
    Failure_PinCancelled: 6,
    Failure_PinInvalid: 7,
    Failure_InvalidSignature: 8,
    Failure_ProcessError: 9,
    Failure_NotEnoughFunds: 10,
    Failure_NotInitialized: 11,
    Failure_PinMismatch: 12,
    Failure_WipeCodeMismatch: 13,
    Failure_InvalidSession: 14,
    Failure_FirmwareError: 99,
});
export type FailureType = $Values<typeof Enum_FailureType>;

// Failure
export type Failure = {
    code?: FailureType;
    message?: string;
};

const Enum_ButtonRequestType = Object.freeze({
    ButtonRequest_Other: 1,
    ButtonRequest_FeeOverThreshold: 2,
    ButtonRequest_ConfirmOutput: 3,
    ButtonRequest_ResetDevice: 4,
    ButtonRequest_ConfirmWord: 5,
    ButtonRequest_WipeDevice: 6,
    ButtonRequest_ProtectCall: 7,
    ButtonRequest_SignTx: 8,
    ButtonRequest_FirmwareCheck: 9,
    ButtonRequest_Address: 10,
    ButtonRequest_PublicKey: 11,
    ButtonRequest_MnemonicWordCount: 12,
    ButtonRequest_MnemonicInput: 13,
    _Deprecated_ButtonRequest_PassphraseType: 14,
    ButtonRequest_UnknownDerivationPath: 15,
    ButtonRequest_RecoveryHomepage: 16,
    ButtonRequest_Success: 17,
    ButtonRequest_Warning: 18,
    ButtonRequest_PassphraseEntry: 19,
    ButtonRequest_PinEntry: 20,
});
export type ButtonRequestType = $Values<typeof Enum_ButtonRequestType>;

// ButtonRequest
export type ButtonRequest = {
    code?: ButtonRequestType;
};

// ButtonAck
export type ButtonAck = {};

const Enum_PinMatrixRequestType = Object.freeze({
    PinMatrixRequestType_Current: 1,
    PinMatrixRequestType_NewFirst: 2,
    PinMatrixRequestType_NewSecond: 3,
    PinMatrixRequestType_WipeCodeFirst: 4,
    PinMatrixRequestType_WipeCodeSecond: 5,
});
export type PinMatrixRequestType = $Values<typeof Enum_PinMatrixRequestType>;

// PinMatrixRequest
export type PinMatrixRequest = {
    type?: PinMatrixRequestType;
};

// PinMatrixAck
export type PinMatrixAck = {
    pin: string;
};

// PassphraseRequest
export type PassphraseRequest = {
    _on_device?: boolean;
};

// PassphraseAck
export type PassphraseAck = {
    passphrase?: string;
    _state?: string;
    on_device?: boolean;
};

// Deprecated_PassphraseStateRequest
export type Deprecated_PassphraseStateRequest = {
    state?: string;
};

// Deprecated_PassphraseStateAck
export type Deprecated_PassphraseStateAck = {};

// CipherKeyValue
export type CipherKeyValue = {
    address_n: number[];
    key: string;
    value: string;
    encrypt?: boolean;
    ask_on_encrypt?: boolean;
    ask_on_decrypt?: boolean;
    iv?: string;
};

// CipheredKeyValue
export type CipheredKeyValue = {
    value: string;
};

// IdentityType
export type IdentityType = {
    proto?: string;
    user?: string;
    host?: string;
    port?: string;
    path?: string;
    index?: number;
};

// SignIdentity
export type SignIdentity = {
    identity: IdentityType;
    challenge_hidden?: string;
    challenge_visual?: string;
    ecdsa_curve_name?: string;
};

// SignedIdentity
export type SignedIdentity = {
    address: string;
    public_key: string;
    signature: string;
};

// GetECDHSessionKey
export type GetECDHSessionKey = {
    identity: IdentityType;
    peer_public_key: string;
    ecdsa_curve_name?: string;
};

// ECDHSessionKey
export type ECDHSessionKey = {
    session_key: string;
};

const Enum_DebugSwipeDirection = Object.freeze({
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
});
export type DebugSwipeDirection = $Values<typeof Enum_DebugSwipeDirection>;

// DebugLinkDecision
export type DebugLinkDecision = {
    yes_no?: boolean;
    swipe?: DebugSwipeDirection;
    input?: string;
    x?: number;
    y?: number;
    wait?: boolean;
};

// DebugLinkLayout
export type DebugLinkLayout = {
    lines: string[];
};

// DebugLinkReseedRandom
export type DebugLinkReseedRandom = {
    value?: number;
};

// DebugLinkRecordScreen
export type DebugLinkRecordScreen = {
    target_directory?: string;
};

const Enum_DebugLinkShowTextStyle = Object.freeze({
    NORMAL: 0,
    BOLD: 1,
    MONO: 2,
    BR: 4,
    BR_HALF: 5,
    SET_COLOR: 6,
});
export type DebugLinkShowTextStyle = $Values<typeof Enum_DebugLinkShowTextStyle>;

export type DebugLinkShowTextItem = {
    style?: DebugLinkShowTextStyle;
    content?: string;
};

// DebugLinkShowText
export type DebugLinkShowText = {
    header_text?: string;
    body_text: DebugLinkShowTextItem[];
    header_icon?: string;
    icon_color?: string;
};

// DebugLinkGetState
export type DebugLinkGetState = {
    wait_word_list?: boolean;
    wait_word_pos?: boolean;
    wait_layout?: boolean;
};

// DebugLinkState
export type DebugLinkState = {
    layout?: string;
    pin?: string;
    matrix?: string;
    mnemonic_secret?: string;
    node?: HDNodeType;
    passphrase_protection?: boolean;
    reset_word?: string;
    reset_entropy?: string;
    recovery_fake_word?: string;
    recovery_word_pos?: number;
    reset_word_pos?: number;
    mnemonic_type?: number;
    layout_lines: string[];
};

// DebugLinkStop
export type DebugLinkStop = {};

// DebugLinkLog
export type DebugLinkLog = {
    level?: number;
    bucket?: string;
    text?: string;
};

// DebugLinkMemoryRead
export type DebugLinkMemoryRead = {
    address?: number;
    length?: number;
};

// DebugLinkMemory
export type DebugLinkMemory = {
    memory?: string;
};

// DebugLinkMemoryWrite
export type DebugLinkMemoryWrite = {
    address?: number;
    memory?: string;
    flash?: boolean;
};

// DebugLinkFlashErase
export type DebugLinkFlashErase = {
    sector?: number;
};

// DebugLinkEraseSdCard
export type DebugLinkEraseSdCard = {
    format?: boolean;
};

// DebugLinkWatchLayout
export type DebugLinkWatchLayout = {
    watch?: boolean;
};

// EosGetPublicKey
export type EosGetPublicKey = {
    address_n: number[];
    show_display?: boolean;
};

// EosPublicKey
export type EosPublicKey = {
    wif_public_key: string;
    raw_public_key: string;
};

export type EosTxHeader = {
    expiration: number;
    ref_block_num: number;
    ref_block_prefix: number;
    max_net_usage_words: number;
    max_cpu_usage_ms: number;
    delay_sec: number;
};

// EosSignTx
export type EosSignTx = {
    address_n: number[];
    chain_id?: string;
    header?: EosTxHeader;
    num_actions?: number;
};

// EosTxActionRequest
export type EosTxActionRequest = {
    data_size?: number;
};

export type EosAsset = {
    amount?: string;
    symbol?: string;
};

export type EosPermissionLevel = {
    actor?: string;
    permission?: string;
};

export type EosAuthorizationKey = {
    type?: number;
    key: string;
    address_n?: number[];
    weight: number;
};

export type EosAuthorizationAccount = {
    account?: EosPermissionLevel;
    weight?: number;
};

export type EosAuthorizationWait = {
    wait_sec?: number;
    weight?: number;
};

export type EosAuthorization = {
    threshold?: number;
    keys: EosAuthorizationKey[];
    accounts: EosAuthorizationAccount[];
    waits: EosAuthorizationWait[];
};

export type EosActionCommon = {
    account?: string;
    name?: string;
    authorization: EosPermissionLevel[];
};

export type EosActionTransfer = {
    sender?: string;
    receiver?: string;
    quantity?: EosAsset;
    memo?: string;
};

export type EosActionDelegate = {
    sender?: string;
    receiver?: string;
    net_quantity?: EosAsset;
    cpu_quantity?: EosAsset;
    transfer?: boolean;
};

export type EosActionUndelegate = {
    sender?: string;
    receiver?: string;
    net_quantity?: EosAsset;
    cpu_quantity?: EosAsset;
};

export type EosActionRefund = {
    owner?: string;
};

export type EosActionBuyRam = {
    payer?: string;
    receiver?: string;
    quantity?: EosAsset;
};

export type EosActionBuyRamBytes = {
    payer?: string;
    receiver?: string;
    bytes?: number;
};

export type EosActionSellRam = {
    account?: string;
    bytes?: number;
};

export type EosActionVoteProducer = {
    voter?: string;
    proxy?: string;
    producers: string[];
};

export type EosActionUpdateAuth = {
    account?: string;
    permission?: string;
    parent?: string;
    auth?: EosAuthorization;
};

export type EosActionDeleteAuth = {
    account?: string;
    permission?: string;
};

export type EosActionLinkAuth = {
    account?: string;
    code?: string;
    type?: string;
    requirement?: string;
};

export type EosActionUnlinkAuth = {
    account?: string;
    code?: string;
    type?: string;
};

export type EosActionNewAccount = {
    creator?: string;
    name?: string;
    owner?: EosAuthorization;
    active?: EosAuthorization;
};

export type EosActionUnknown = {
    data_size: number;
    data_chunk?: string;
};

// EosTxActionAck
export type EosTxActionAck = {
    common?: EosActionCommon;
    transfer?: EosActionTransfer;
    delegate?: EosActionDelegate;
    undelegate?: EosActionUndelegate;
    refund?: EosActionRefund;
    buy_ram?: EosActionBuyRam;
    buy_ram_bytes?: EosActionBuyRamBytes;
    sell_ram?: EosActionSellRam;
    vote_producer?: EosActionVoteProducer;
    update_auth?: EosActionUpdateAuth;
    delete_auth?: EosActionDeleteAuth;
    link_auth?: EosActionLinkAuth;
    unlink_auth?: EosActionUnlinkAuth;
    new_account?: EosActionNewAccount;
    unknown?: EosActionUnknown;
};

// EosSignedTx
export type EosSignedTx = {
    signature: string;
};

// EthereumGetPublicKey
export type EthereumGetPublicKey = {
    address_n: number[];
    show_display?: boolean;
};

// EthereumPublicKey
export type EthereumPublicKey = {
    node: HDNodeType;
    xpub: string;
};

// EthereumGetAddress
export type EthereumGetAddress = {
    address_n: number[];
    show_display?: boolean;
};

// EthereumAddress
export type EthereumAddress = {
    _old_address?: string;
    address: string;
};

// EthereumSignTx
export type EthereumSignTx = {
    address_n: number[];
    nonce?: string;
    gas_price?: string;
    gas_limit?: string;
    to?: string;
    value?: string;
    data_initial_chunk?: string;
    data_length?: number;
    chain_id?: number;
    tx_type?: number;
};

// EthereumTxRequest
export type EthereumTxRequest = {
    data_length?: number;
    signature_v?: number;
    signature_r?: string;
    signature_s?: string;
};

// EthereumTxAck
export type EthereumTxAck = {
    data_chunk?: string;
};

// EthereumSignMessage
export type EthereumSignMessage = {
    address_n: number[];
    message?: string;
};

// EthereumMessageSignature
export type EthereumMessageSignature = {
    signature: string;
    address: string;
};

// EthereumVerifyMessage
export type EthereumVerifyMessage = {
    signature?: string;
    message?: string;
    address?: string;
};

// LiskGetAddress
export type LiskGetAddress = {
    address_n: number[];
    show_display?: boolean;
};

// LiskAddress
export type LiskAddress = {
    address: string;
};

// LiskGetPublicKey
export type LiskGetPublicKey = {
    address_n: number[];
    show_display?: boolean;
};

// LiskPublicKey
export type LiskPublicKey = {
    public_key: string;
};

const Enum_LiskTransactionType = Object.freeze({
    Transfer: 0,
    RegisterSecondPassphrase: 1,
    RegisterDelegate: 2,
    CastVotes: 3,
    RegisterMultisignatureAccount: 4,
    CreateDapp: 5,
    TransferIntoDapp: 6,
    TransferOutOfDapp: 7,
});
export type LiskTransactionType = $Values<typeof Enum_LiskTransactionType>;

export type LiskSignatureType = {
    public_key?: string;
};

export type LiskDelegateType = {
    username?: string;
};

export type LiskMultisignatureType = {
    min?: number;
    life_time?: number;
    keys_group: string[];
};

export type LiskTransactionAsset = {
    signature?: LiskSignatureType;
    delegate?: LiskDelegateType;
    votes: string[];
    multisignature?: LiskMultisignatureType;
    data?: string;
};

export type LiskTransactionCommon = {
    type?: LiskTransactionType;
    amount?: number;
    fee?: number;
    recipient_id?: string;
    sender_public_key?: string;
    requester_public_key?: string;
    signature?: string;
    timestamp?: number;
    asset?: LiskTransactionAsset;
};

// LiskSignTx
export type LiskSignTx = {
    address_n: number[];
    transaction: LiskTransactionCommon;
};

// LiskSignedTx
export type LiskSignedTx = {
    signature: string;
};

// LiskSignMessage
export type LiskSignMessage = {
    address_n: number[];
    message: string;
};

// LiskMessageSignature
export type LiskMessageSignature = {
    public_key: string;
    signature: string;
};

// LiskVerifyMessage
export type LiskVerifyMessage = {
    public_key: string;
    signature: string;
    message: string;
};

// Initialize
export type Initialize = {
    session_id?: string;
};

// GetFeatures
export type GetFeatures = {};

const Enum_Capability = Object.freeze({
    Capability_Bitcoin: 1,
    Capability_Bitcoin_like: 2,
    Capability_Binance: 3,
    Capability_Cardano: 4,
    Capability_Crypto: 5,
    Capability_EOS: 6,
    Capability_Ethereum: 7,
    Capability_Lisk: 8,
    Capability_Monero: 9,
    Capability_NEM: 10,
    Capability_Ripple: 11,
    Capability_Stellar: 12,
    Capability_Tezos: 13,
    Capability_U2F: 14,
    Capability_Shamir: 15,
    Capability_ShamirGroups: 16,
    Capability_PassphraseEntry: 17,
});
export type Capability = $Keys<typeof Enum_Capability>;

// Features
export type Features = {
    vendor: string;
    major_version: number;
    minor_version: number;
    patch_version: number;
    bootloader_mode?: boolean | null;
    device_id: string | null;
    pin_protection: boolean;
    passphrase_protection: boolean;
    language?: string;
    label: string | null;
    initialized: boolean;
    revision: string;
    bootloader_hash?: string | null;
    imported?: boolean;
    unlocked?: boolean;
    firmware_present?: boolean | null;
    needs_backup: boolean;
    flags: number;
    model: string;
    fw_major?: number | null;
    fw_minor?: number | null;
    fw_patch?: number | null;
    fw_vendor?: string | null;
    fw_vendor_keys?: string;
    unfinished_backup: boolean;
    no_backup: boolean;
    recovery_mode?: boolean;
    capabilities: Capability[];
    backup_type?: BackupType;
    sd_card_present?: boolean;
    sd_protection?: boolean;
    wipe_code_protection?: boolean;
    session_id?: string;
    passphrase_always_on_device?: boolean;
    safety_checks?: SafetyCheckLevel;
    auto_lock_delay_ms?: number;
    display_rotation?: number;
    experimental_features?: boolean;
};

// LockDevice
export type LockDevice = {};

// EndSession
export type EndSession = {};

// ApplySettings
export type ApplySettings = {
    language?: string;
    label?: string;
    use_passphrase?: boolean;
    homescreen?: string;
    auto_lock_delay_ms?: number;
    display_rotation?: number;
    passphrase_always_on_device?: boolean;
    safety_checks?: SafetyCheckLevel;
    experimental_features?: boolean;
};

// ApplyFlags
export type ApplyFlags = {
    flags?: number;
};

// ChangePin
export type ChangePin = {
    remove?: boolean;
};

// ChangeWipeCode
export type ChangeWipeCode = {
    remove?: boolean;
};

const Enum_SdProtectOperationType = Object.freeze({
    DISABLE: 0,
    ENABLE: 1,
    REFRESH: 2,
});
export type SdProtectOperationType = $Values<typeof Enum_SdProtectOperationType>;

// SdProtect
export type SdProtect = {
    operation?: SdProtectOperationType;
};

// Ping
export type Ping = {
    message?: string;
    button_protection?: boolean;
};

// Cancel
export type Cancel = {};

// GetEntropy
export type GetEntropy = {
    size: number;
};

// Entropy
export type Entropy = {
    entropy: string;
};

// WipeDevice
export type WipeDevice = {};

// LoadDevice
export type LoadDevice = {
    mnemonics: string[];
    pin?: string;
    passphrase_protection?: boolean;
    language?: string;
    label?: string;
    skip_checksum?: boolean;
    u2f_counter?: number;
    needs_backup?: boolean;
    no_backup?: boolean;
};

// ResetDevice
export type ResetDevice = {
    display_random?: boolean;
    strength?: number;
    passphrase_protection?: boolean;
    pin_protection?: boolean;
    language?: string;
    label?: string;
    u2f_counter?: number;
    skip_backup?: boolean;
    no_backup?: boolean;
    backup_type?: BackupType;
};

// BackupDevice
export type BackupDevice = {};

// EntropyRequest
export type EntropyRequest = {};

// EntropyAck
export type EntropyAck = {
    entropy?: string;
};

const Enum_RecoveryDeviceType = Object.freeze({
    RecoveryDeviceType_ScrambledWords: 0,
    RecoveryDeviceType_Matrix: 1,
});
export type RecoveryDeviceType = $Values<typeof Enum_RecoveryDeviceType>;

// RecoveryDevice
export type RecoveryDevice = {
    word_count?: number;
    passphrase_protection?: boolean;
    pin_protection?: boolean;
    language?: string;
    label?: string;
    enforce_wordlist?: boolean;
    type?: RecoveryDeviceType;
    u2f_counter?: number;
    dry_run?: boolean;
};

const Enum_WordRequestType = Object.freeze({
    WordRequestType_Plain: 0,
    WordRequestType_Matrix9: 1,
    WordRequestType_Matrix6: 2,
});
export type WordRequestType = $Values<typeof Enum_WordRequestType>;

// WordRequest
export type WordRequest = {
    type?: WordRequestType;
};

// WordAck
export type WordAck = {
    word: string;
};

// SetU2FCounter
export type SetU2FCounter = {
    u2f_counter?: number;
};

// GetNextU2FCounter
export type GetNextU2FCounter = {};

// NextU2FCounter
export type NextU2FCounter = {
    u2f_counter?: number;
};

// DoPreauthorized
export type DoPreauthorized = {};

// PreauthorizedRequest
export type PreauthorizedRequest = {};

// CancelAuthorization
export type CancelAuthorization = {};

// NEMGetAddress
export type NEMGetAddress = {
    address_n: number[];
    network?: number;
    show_display?: boolean;
};

// NEMAddress
export type NEMAddress = {
    address: string;
};

export type NEMTransactionCommon = {
    address_n?: number[];
    network?: number;
    timestamp?: number;
    fee?: number;
    deadline?: number;
    signer?: string;
};

export type NEMMosaic = {
    namespace?: string;
    mosaic?: string;
    quantity?: number;
};

export type NEMTransfer = {
    recipient?: string;
    amount?: string | number;
    payload?: string;
    public_key?: string;
    mosaics?: NEMMosaic[];
};

export type NEMProvisionNamespace = {
    namespace?: string;
    parent?: string;
    sink?: string;
    fee?: number;
};

const Enum_NEMMosaicLevy = Object.freeze({
    MosaicLevy_Absolute: 1,
    MosaicLevy_Percentile: 2,
});
export type NEMMosaicLevy = $Values<typeof Enum_NEMMosaicLevy>;

export type NEMMosaicDefinition = {
    name?: string;
    ticker?: string;
    namespace?: string;
    mosaic?: string;
    divisibility?: number;
    levy?: NEMMosaicLevy;
    fee?: number;
    levy_address?: string;
    levy_namespace?: string;
    levy_mosaic?: string;
    supply?: number;
    mutable_supply?: boolean;
    transferable?: boolean;
    description?: string;
    networks?: number[];
};

export type NEMMosaicCreation = {
    definition?: NEMMosaicDefinition;
    sink?: string;
    fee?: number;
};

const Enum_NEMSupplyChangeType = Object.freeze({
    SupplyChange_Increase: 1,
    SupplyChange_Decrease: 2,
});
export type NEMSupplyChangeType = $Values<typeof Enum_NEMSupplyChangeType>;

export type NEMMosaicSupplyChange = {
    namespace?: string;
    mosaic?: string;
    type?: NEMSupplyChangeType;
    delta?: number;
};

const Enum_NEMModificationType = Object.freeze({
    CosignatoryModification_Add: 1,
    CosignatoryModification_Delete: 2,
});
export type NEMModificationType = $Values<typeof Enum_NEMModificationType>;

export type NEMCosignatoryModification = {
    type?: NEMModificationType;
    public_key?: string;
};

export type NEMAggregateModification = {
    modifications?: NEMCosignatoryModification[];
    relative_change?: number;
};

const Enum_NEMImportanceTransferMode = Object.freeze({
    ImportanceTransfer_Activate: 1,
    ImportanceTransfer_Deactivate: 2,
});
export type NEMImportanceTransferMode = $Values<typeof Enum_NEMImportanceTransferMode>;

export type NEMImportanceTransfer = {
    mode?: NEMImportanceTransferMode;
    public_key?: string;
};

// NEMSignTx
export type NEMSignTx = {
    transaction?: NEMTransactionCommon;
    multisig?: NEMTransactionCommon;
    transfer?: NEMTransfer;
    cosigning?: boolean;
    provision_namespace?: NEMProvisionNamespace;
    mosaic_creation?: NEMMosaicCreation;
    supply_change?: NEMMosaicSupplyChange;
    aggregate_modification?: NEMAggregateModification;
    importance_transfer?: NEMImportanceTransfer;
};

// NEMSignedTx
export type NEMSignedTx = {
    data: string;
    signature: string;
};

// NEMDecryptMessage
export type NEMDecryptMessage = {
    address_n: number[];
    network?: number;
    public_key?: string;
    payload?: string;
};

// NEMDecryptedMessage
export type NEMDecryptedMessage = {
    payload: string;
};

// RippleGetAddress
export type RippleGetAddress = {
    address_n: number[];
    show_display?: boolean;
};

// RippleAddress
export type RippleAddress = {
    address: string;
};

export type RipplePayment = {
    amount: string | number;
    destination: string;
    destination_tag?: number;
};

// RippleSignTx
export type RippleSignTx = {
    address_n: number[];
    fee?: string | number;
    flags?: number;
    sequence?: number;
    last_ledger_sequence?: number;
    payment?: RipplePayment;
};

// RippleSignedTx
export type RippleSignedTx = {
    signature: string;
    serialized_tx: string;
};

// StellarAssetType
export type StellarAssetType = {
    type: 0 | 1 | 2;
    code: string;
    issuer?: string;
};

// StellarGetAddress
export type StellarGetAddress = {
    address_n: number[];
    show_display?: boolean;
};

// StellarAddress
export type StellarAddress = {
    address: string;
};

// StellarSignTx
export type StellarSignTx = {
    address_n: number[];
    network_passphrase?: string;
    source_account?: string;
    fee?: number;
    sequence_number?: string | number;
    timebounds_start?: number;
    timebounds_end?: number;
    memo_type?: number;
    memo_text?: string;
    memo_id?: string;
    memo_hash?: Buffer | string;
    num_operations?: number;
};

// StellarTxOpRequest
export type StellarTxOpRequest = {};

// StellarPaymentOp
export type StellarPaymentOp = {
    source_account?: string;
    destination_account?: string;
    asset?: StellarAssetType;
    amount?: string | number;
};

// StellarCreateAccountOp
export type StellarCreateAccountOp = {
    source_account?: string;
    new_account?: string;
    starting_balance?: string | number;
};

// StellarPathPaymentOp
export type StellarPathPaymentOp = {
    source_account?: string;
    send_asset?: StellarAssetType;
    send_max?: string | number;
    destination_account?: string;
    destination_asset?: StellarAssetType;
    destination_amount?: string | number;
    paths?: StellarAssetType[];
};

// StellarManageOfferOp
export type StellarManageOfferOp = {
    source_account?: string;
    selling_asset?: StellarAssetType;
    buying_asset?: StellarAssetType;
    amount?: string | number;
    price_n?: number;
    price_d?: number;
    offer_id?: string | number;
};

// StellarCreatePassiveOfferOp
export type StellarCreatePassiveOfferOp = {
    source_account?: string;
    selling_asset?: StellarAssetType;
    buying_asset?: StellarAssetType;
    amount?: string | number;
    price_n?: number;
    price_d?: number;
};

// StellarSetOptionsOp
export type StellarSetOptionsOp = {
    source_account?: string;
    inflation_destination_account?: string;
    clear_flags?: number;
    set_flags?: number;
    master_weight?: string | number;
    low_threshold?: string | number;
    medium_threshold?: string | number;
    high_threshold?: string | number;
    home_domain?: string;
    signer_type?: number;
    signer_key?: Buffer | string;
    signer_weight?: number;
};

// StellarChangeTrustOp
export type StellarChangeTrustOp = {
    source_account?: string;
    asset?: StellarAssetType;
    limit?: string | number;
};

// StellarAllowTrustOp
export type StellarAllowTrustOp = {
    source_account?: string;
    trusted_account?: string;
    asset_type?: number;
    asset_code?: string;
    is_authorized?: number;
};

// StellarAccountMergeOp
export type StellarAccountMergeOp = {
    source_account?: string;
    destination_account?: string;
};

// StellarManageDataOp
export type StellarManageDataOp = {
    source_account?: string;
    key?: string;
    value?: Buffer | string;
};

// StellarBumpSequenceOp
export type StellarBumpSequenceOp = {
    source_account?: string;
    bump_to?: string | number;
};

// StellarSignedTx
export type StellarSignedTx = {
    public_key: string;
    signature: string;
};

// TezosGetAddress
export type TezosGetAddress = {
    address_n: number[];
    show_display?: boolean;
};

// TezosAddress
export type TezosAddress = {
    address: string;
};

// TezosGetPublicKey
export type TezosGetPublicKey = {
    address_n: number[];
    show_display?: boolean;
};

// TezosPublicKey
export type TezosPublicKey = {
    public_key: string;
};

const Enum_TezosContractType = Object.freeze({
    Implicit: 0,
    Originated: 1,
});
export type TezosContractType = $Values<typeof Enum_TezosContractType>;

export type TezosContractID = {
    tag: number;
    hash: Uint8Array;
};

export type TezosRevealOp = {
    source: Uint8Array;
    fee: number;
    counter: number;
    gas_limit: number;
    storage_limit: number;
    public_key: Uint8Array;
};

export type TezosManagerTransfer = {
    destination?: TezosContractID;
    amount?: number;
};

export type TezosParametersManager = {
    set_delegate?: Uint8Array;
    cancel_delegate?: boolean;
    transfer?: TezosManagerTransfer;
};

export type TezosTransactionOp = {
    source: Uint8Array;
    fee: number;
    counter: number;
    gas_limit: number;
    storage_limit: number;
    amount: number;
    destination: TezosContractID;
    parameters?: number[];
    parameters_manager?: TezosParametersManager;
};

export type TezosOriginationOp = {
    source: Uint8Array;
    fee: number;
    counter: number;
    gas_limit: number;
    storage_limit: number;
    manager_pubkey?: string;
    balance: number;
    spendable?: boolean;
    delegatable?: boolean;
    delegate?: Uint8Array;
    script: string | number[];
};

export type TezosDelegationOp = {
    source: Uint8Array;
    fee: number;
    counter: number;
    gas_limit: number;
    storage_limit: number;
    delegate: Uint8Array;
};

export type TezosProposalOp = {
    source?: string;
    period?: number;
    proposals: string[];
};

const Enum_TezosBallotType = Object.freeze({
    Yay: 0,
    Nay: 1,
    Pass: 2,
});
export type TezosBallotType = $Values<typeof Enum_TezosBallotType>;

export type TezosBallotOp = {
    source?: string;
    period?: number;
    proposal?: string;
    ballot?: TezosBallotType;
};

// TezosSignTx
export type TezosSignTx = {
    address_n: number[];
    branch: Uint8Array;
    reveal?: TezosRevealOp;
    transaction?: TezosTransactionOp;
    origination?: TezosOriginationOp;
    delegation?: TezosDelegationOp;
    proposal?: TezosProposalOp;
    ballot?: TezosBallotOp;
};

// TezosSignedTx
export type TezosSignedTx = {
    signature: string;
    sig_op_contents: string;
    operation_hash: string;
};

// custom connect definitions
export type MessageType = {
    BinanceGetAddress: BinanceGetAddress;
    BinanceAddress: $Exact<BinanceAddress>;
    BinanceGetPublicKey: BinanceGetPublicKey;
    BinancePublicKey: $Exact<BinancePublicKey>;
    BinanceSignTx: BinanceSignTx;
    BinanceTxRequest: BinanceTxRequest;
    BinanceCoin: BinanceCoin;
    BinanceInputOutput: BinanceInputOutput;
    BinanceTransferMsg: BinanceTransferMsg;
    BinanceOrderMsg: BinanceOrderMsg;
    BinanceCancelMsg: BinanceCancelMsg;
    BinanceSignedTx: $Exact<BinanceSignedTx>;
    HDNodeType: $Exact<HDNodeType>;
    HDNodePathType: $Exact<HDNodePathType>;
    MultisigRedeemScriptType: $Exact<MultisigRedeemScriptType>;
    GetPublicKey: GetPublicKey;
    PublicKey: $Exact<PublicKey>;
    GetAddress: GetAddress;
    Address: $Exact<Address>;
    GetOwnershipId: GetOwnershipId;
    OwnershipId: $Exact<OwnershipId>;
    SignMessage: $Exact<SignMessage>;
    MessageSignature: $Exact<MessageSignature>;
    VerifyMessage: $Exact<VerifyMessage>;
    SignTx: $Exact<SignTx>;
    TxRequestDetailsType: TxRequestDetailsType;
    TxRequestSerializedType: TxRequestSerializedType;
    TxRequest: TxRequest;
    TxInputType: $Exact<TxInputType>;
    TxOutputBinType: $Exact<TxOutputBinType>;
    TxOutputType: $Exact<TxOutputType>;
    TxAck: TxAck;
    TxInput: $Exact<TxInput>;
    TxOutput: $Exact<TxOutput>;
    PrevTx: $Exact<PrevTx>;
    PrevInput: $Exact<PrevInput>;
    PrevOutput: $Exact<PrevOutput>;
    TxAckInputWrapper: $Exact<TxAckInputWrapper>;
    TxAckInput: $Exact<TxAckInput>;
    TxAckOutputWrapper: $Exact<TxAckOutputWrapper>;
    TxAckOutput: $Exact<TxAckOutput>;
    TxAckPrevMeta: $Exact<TxAckPrevMeta>;
    TxAckPrevInputWrapper: $Exact<TxAckPrevInputWrapper>;
    TxAckPrevInput: $Exact<TxAckPrevInput>;
    TxAckPrevOutputWrapper: $Exact<TxAckPrevOutputWrapper>;
    TxAckPrevOutput: $Exact<TxAckPrevOutput>;
    TxAckPrevExtraDataWrapper: $Exact<TxAckPrevExtraDataWrapper>;
    TxAckPrevExtraData: $Exact<TxAckPrevExtraData>;
    GetOwnershipProof: GetOwnershipProof;
    OwnershipProof: $Exact<OwnershipProof>;
    AuthorizeCoinJoin: $Exact<AuthorizeCoinJoin>;
    FirmwareErase: FirmwareErase;
    FirmwareRequest: FirmwareRequest;
    FirmwareUpload: $Exact<FirmwareUpload>;
    SelfTest: SelfTest;
    CardanoBlockchainPointerType: $Exact<CardanoBlockchainPointerType>;
    CardanoAddressParametersType: $Exact<CardanoAddressParametersType>;
    CardanoGetAddress: $Exact<CardanoGetAddress>;
    CardanoAddress: $Exact<CardanoAddress>;
    CardanoGetPublicKey: CardanoGetPublicKey;
    CardanoPublicKey: $Exact<CardanoPublicKey>;
    CardanoTxInputType: $Exact<CardanoTxInputType>;
    CardanoTokenType: $Exact<CardanoTokenType>;
    CardanoAssetGroupType: $Exact<CardanoAssetGroupType>;
    CardanoTxOutputType: $Exact<CardanoTxOutputType>;
    CardanoPoolOwnerType: CardanoPoolOwnerType;
    CardanoPoolRelayParametersType: $Exact<CardanoPoolRelayParametersType>;
    CardanoPoolMetadataType: $Exact<CardanoPoolMetadataType>;
    CardanoPoolParametersType: $Exact<CardanoPoolParametersType>;
    CardanoTxCertificateType: $Exact<CardanoTxCertificateType>;
    CardanoTxWithdrawalType: $Exact<CardanoTxWithdrawalType>;
    CardanoSignTx: $Exact<CardanoSignTx>;
    CardanoSignedTx: $Exact<CardanoSignedTx>;
    Success: Success;
    Failure: Failure;
    ButtonRequest: ButtonRequest;
    ButtonAck: ButtonAck;
    PinMatrixRequest: PinMatrixRequest;
    PinMatrixAck: $Exact<PinMatrixAck>;
    PassphraseRequest: PassphraseRequest;
    PassphraseAck: PassphraseAck;
    Deprecated_PassphraseStateRequest: Deprecated_PassphraseStateRequest;
    Deprecated_PassphraseStateAck: Deprecated_PassphraseStateAck;
    CipherKeyValue: $Exact<CipherKeyValue>;
    CipheredKeyValue: $Exact<CipheredKeyValue>;
    IdentityType: IdentityType;
    SignIdentity: $Exact<SignIdentity>;
    SignedIdentity: $Exact<SignedIdentity>;
    GetECDHSessionKey: $Exact<GetECDHSessionKey>;
    ECDHSessionKey: $Exact<ECDHSessionKey>;
    DebugLinkDecision: DebugLinkDecision;
    DebugLinkLayout: DebugLinkLayout;
    DebugLinkReseedRandom: DebugLinkReseedRandom;
    DebugLinkRecordScreen: DebugLinkRecordScreen;
    DebugLinkShowTextItem: DebugLinkShowTextItem;
    DebugLinkShowText: DebugLinkShowText;
    DebugLinkGetState: DebugLinkGetState;
    DebugLinkState: DebugLinkState;
    DebugLinkStop: DebugLinkStop;
    DebugLinkLog: DebugLinkLog;
    DebugLinkMemoryRead: DebugLinkMemoryRead;
    DebugLinkMemory: DebugLinkMemory;
    DebugLinkMemoryWrite: DebugLinkMemoryWrite;
    DebugLinkFlashErase: DebugLinkFlashErase;
    DebugLinkEraseSdCard: DebugLinkEraseSdCard;
    DebugLinkWatchLayout: DebugLinkWatchLayout;
    EosGetPublicKey: EosGetPublicKey;
    EosPublicKey: $Exact<EosPublicKey>;
    EosTxHeader: $Exact<EosTxHeader>;
    EosSignTx: EosSignTx;
    EosTxActionRequest: EosTxActionRequest;
    EosAsset: EosAsset;
    EosPermissionLevel: EosPermissionLevel;
    EosAuthorizationKey: $Exact<EosAuthorizationKey>;
    EosAuthorizationAccount: EosAuthorizationAccount;
    EosAuthorizationWait: EosAuthorizationWait;
    EosAuthorization: EosAuthorization;
    EosActionCommon: EosActionCommon;
    EosActionTransfer: EosActionTransfer;
    EosActionDelegate: EosActionDelegate;
    EosActionUndelegate: EosActionUndelegate;
    EosActionRefund: EosActionRefund;
    EosActionBuyRam: EosActionBuyRam;
    EosActionBuyRamBytes: EosActionBuyRamBytes;
    EosActionSellRam: EosActionSellRam;
    EosActionVoteProducer: EosActionVoteProducer;
    EosActionUpdateAuth: EosActionUpdateAuth;
    EosActionDeleteAuth: EosActionDeleteAuth;
    EosActionLinkAuth: EosActionLinkAuth;
    EosActionUnlinkAuth: EosActionUnlinkAuth;
    EosActionNewAccount: EosActionNewAccount;
    EosActionUnknown: $Exact<EosActionUnknown>;
    EosTxActionAck: EosTxActionAck;
    EosSignedTx: $Exact<EosSignedTx>;
    EthereumGetPublicKey: EthereumGetPublicKey;
    EthereumPublicKey: $Exact<EthereumPublicKey>;
    EthereumGetAddress: EthereumGetAddress;
    EthereumAddress: EthereumAddress;
    EthereumSignTx: EthereumSignTx;
    EthereumTxRequest: EthereumTxRequest;
    EthereumTxAck: EthereumTxAck;
    EthereumSignMessage: EthereumSignMessage;
    EthereumMessageSignature: $Exact<EthereumMessageSignature>;
    EthereumVerifyMessage: EthereumVerifyMessage;
    LiskGetAddress: LiskGetAddress;
    LiskAddress: $Exact<LiskAddress>;
    LiskGetPublicKey: LiskGetPublicKey;
    LiskPublicKey: $Exact<LiskPublicKey>;
    LiskSignatureType: LiskSignatureType;
    LiskDelegateType: LiskDelegateType;
    LiskMultisignatureType: LiskMultisignatureType;
    LiskTransactionAsset: LiskTransactionAsset;
    LiskTransactionCommon: LiskTransactionCommon;
    LiskSignTx: $Exact<LiskSignTx>;
    LiskSignedTx: $Exact<LiskSignedTx>;
    LiskSignMessage: $Exact<LiskSignMessage>;
    LiskMessageSignature: $Exact<LiskMessageSignature>;
    LiskVerifyMessage: $Exact<LiskVerifyMessage>;
    Initialize: Initialize;
    GetFeatures: GetFeatures;
    Features: $Exact<Features>;
    LockDevice: LockDevice;
    EndSession: EndSession;
    ApplySettings: ApplySettings;
    ApplyFlags: ApplyFlags;
    ChangePin: ChangePin;
    ChangeWipeCode: ChangeWipeCode;
    SdProtect: SdProtect;
    Ping: Ping;
    Cancel: Cancel;
    GetEntropy: $Exact<GetEntropy>;
    Entropy: $Exact<Entropy>;
    WipeDevice: WipeDevice;
    LoadDevice: LoadDevice;
    ResetDevice: ResetDevice;
    BackupDevice: BackupDevice;
    EntropyRequest: EntropyRequest;
    EntropyAck: EntropyAck;
    RecoveryDevice: RecoveryDevice;
    WordRequest: WordRequest;
    WordAck: $Exact<WordAck>;
    SetU2FCounter: SetU2FCounter;
    GetNextU2FCounter: GetNextU2FCounter;
    NextU2FCounter: NextU2FCounter;
    DoPreauthorized: DoPreauthorized;
    PreauthorizedRequest: PreauthorizedRequest;
    CancelAuthorization: CancelAuthorization;
    NEMGetAddress: NEMGetAddress;
    NEMAddress: $Exact<NEMAddress>;
    NEMTransactionCommon: NEMTransactionCommon;
    NEMMosaic: NEMMosaic;
    NEMTransfer: NEMTransfer;
    NEMProvisionNamespace: NEMProvisionNamespace;
    NEMMosaicDefinition: NEMMosaicDefinition;
    NEMMosaicCreation: NEMMosaicCreation;
    NEMMosaicSupplyChange: NEMMosaicSupplyChange;
    NEMCosignatoryModification: NEMCosignatoryModification;
    NEMAggregateModification: NEMAggregateModification;
    NEMImportanceTransfer: NEMImportanceTransfer;
    NEMSignTx: NEMSignTx;
    NEMSignedTx: $Exact<NEMSignedTx>;
    NEMDecryptMessage: NEMDecryptMessage;
    NEMDecryptedMessage: $Exact<NEMDecryptedMessage>;
    RippleGetAddress: RippleGetAddress;
    RippleAddress: $Exact<RippleAddress>;
    RipplePayment: $Exact<RipplePayment>;
    RippleSignTx: RippleSignTx;
    RippleSignedTx: $Exact<RippleSignedTx>;
    StellarAssetType: $Exact<StellarAssetType>;
    StellarGetAddress: StellarGetAddress;
    StellarAddress: $Exact<StellarAddress>;
    StellarSignTx: StellarSignTx;
    StellarTxOpRequest: StellarTxOpRequest;
    StellarPaymentOp: StellarPaymentOp;
    StellarCreateAccountOp: StellarCreateAccountOp;
    StellarPathPaymentOp: StellarPathPaymentOp;
    StellarManageOfferOp: StellarManageOfferOp;
    StellarCreatePassiveOfferOp: StellarCreatePassiveOfferOp;
    StellarSetOptionsOp: StellarSetOptionsOp;
    StellarChangeTrustOp: StellarChangeTrustOp;
    StellarAllowTrustOp: StellarAllowTrustOp;
    StellarAccountMergeOp: StellarAccountMergeOp;
    StellarManageDataOp: StellarManageDataOp;
    StellarBumpSequenceOp: StellarBumpSequenceOp;
    StellarSignedTx: $Exact<StellarSignedTx>;
    TezosGetAddress: TezosGetAddress;
    TezosAddress: $Exact<TezosAddress>;
    TezosGetPublicKey: TezosGetPublicKey;
    TezosPublicKey: $Exact<TezosPublicKey>;
    TezosContractID: $Exact<TezosContractID>;
    TezosRevealOp: $Exact<TezosRevealOp>;
    TezosManagerTransfer: TezosManagerTransfer;
    TezosParametersManager: TezosParametersManager;
    TezosTransactionOp: $Exact<TezosTransactionOp>;
    TezosOriginationOp: $Exact<TezosOriginationOp>;
    TezosDelegationOp: $Exact<TezosDelegationOp>;
    TezosProposalOp: TezosProposalOp;
    TezosBallotOp: TezosBallotOp;
    TezosSignTx: $Exact<TezosSignTx>;
    TezosSignedTx: $Exact<TezosSignedTx>;
};

export type MessageKey = $Keys<MessageType>;

export type MessageResponse<T: MessageKey> = {
    type: T;
    message: $ElementType<MessageType, T>;
};

export type TypedCall = <T: MessageKey, R: MessageKey>(
    type: T,
    resType: R,
    message?: $ElementType<MessageType, T>
) => Promise<MessageResponse<R>>;
