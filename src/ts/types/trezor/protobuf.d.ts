// This file has all various types that go into Trezor or out of it.

export interface CipheredKeyValue {
    value: string;
}

export interface Success {
    __avoid_empty?: null;
}

export interface Features {
    vendor: string;
    major_version: number;
    minor_version: number;
    patch_version: number;
    bootloader_mode: boolean;
    device_id: string;
    pin_protection: boolean;
    passphrase_protection: boolean;
    language: string;
    label: string;
    initialized: boolean;
    revision: string;
    bootloader_hash: string;
    imported: boolean;
    pin_cached: boolean;
    unlocked?: boolean; // replacement for "pin_cached" since 2.3.2
    passphrase_cached: boolean;
    firmware_present: boolean;
    needs_backup: boolean;
    flags: number;
    model: string;
    fw_major: number;
    fw_minor: number;
    fw_patch: number;
    fw_vendor: string;
    fw_vendor_keys: string;
    unfinished_backup: boolean;
    no_backup: boolean;
}

export interface HDPrivNode {
    depth: number;
    fingerprint: number;
    child_num: number;
    chain_code: string;
    private_key: string;
}

export interface HDPubNode {
    depth: number;
    fingerprint: number;
    child_num: number;
    chain_code: string;
    public_key: string;
}

export type HDNode = HDPubNode | HDPrivNode;

export interface PublicKey {
    node: HDPubNode;
    xpub: string;
}

// combined Bitcoin.PublicKey and Bitcoin.HDNode
export interface HDNodeResponse {
    path: number[];
    serializedPath: string;
    childNum: number;
    xpub: string;
    xpubSegwit?: string;
    chainCode: string;
    publicKey: string;
    fingerprint: number;
    depth: number;
}

// Bitcoin.getAddress response
export interface Address {
    address: string;
    path: number[];
}

export interface MessageSignature {
    address: string;
    signature: string;
}

// Bitcoin.signTransaction

export interface MultisigRedeemScriptType {
    pubkeys: Array<{ node: string | HDPubNode; address_n: number[] }>;
    signatures: string[];
    m?: number;
}

export type InputScriptType = 'SPENDADDRESS' | 'SPENDMULTISIG' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS';

// transaction input, parameter of SignTx message, declared by user
export interface TransactionInput {
    address_n: number[];
    prev_hash: string;
    prev_index: number;
    script_type?: InputScriptType;
    sequence?: number;
    amount?: string; // (segwit, bip143: true, zcash overwinter)
    multisig?: MultisigRedeemScriptType;
}

export type OutputScriptType = 'PAYTOADDRESS' | 'PAYTOMULTISIG' | 'PAYTOWITNESS' | 'PAYTOP2SHWITNESS';

// transaction output, parameter of SignTx message, declared by user
export type TransactionOutput =
    | {
          address: string;
          address_n?: undefined;
          script_type: 'PAYTOADDRESS';
          amount: string;
          multisig?: MultisigRedeemScriptType;
      }
    | {
          address?: undefined;
          address_n: number[];
          script_type: OutputScriptType;
          amount: string;
          multisig?: MultisigRedeemScriptType;
      }
    | {
          address?: undefined;
          address_n?: undefined;
          amount: '0';
          op_return_data: string;
          script_type: 'PAYTOOPRETURN';
      };

export interface TransactionBinOutput {
    amount: string;
    script_pubkey: string;
}

// transaction input, parameter of TxAck message, declared by user or downloaded from backend
export interface RefTransactionInput {
    prev_hash: string;
    prev_index: number;
    script_sig: string;
    sequence: number;
}

export interface RefTransaction {
    hash: string;
    version?: number;
    inputs: RefTransactionInput[];
    bin_outputs: TransactionBinOutput[];
    lock_time?: number;
    extra_data?: string;
    timestamp?: number;
    version_group_id?: number;
    expiry?: number;
    branch_id?: number;
}

export interface TransactionOptions {
    lock_time?: number;
    timestamp?: number;
    version?: number;
    expiry?: number;
    overwintered?: boolean;
    version_group_id?: number;
    branch_id?: number;
}

export interface TxRequestDetails {
    request_index: number;
    tx_hash?: string;
    extra_data_len?: number;
    extra_data_offset?: number;
}

export interface TxRequestSerialized {
    signature_index?: number;
    signature?: string;
    serialized_tx?: string;
}

export interface TxRequest {
    request_type: 'TXINPUT' | 'TXOUTPUT' | 'TXMETA' | 'TXFINISHED' | 'TXEXTRADATA';
    details: TxRequestDetails;
    serialized: TxRequestSerialized;
}

export interface SignedTx {
    signatures: string[];
    serializedTx: string;
}

// Ethereum.signTransaction

export interface EthereumTxRequest {
    data_length?: number;
    signature_v?: number;
    signature_r?: string;
    signature_s?: string;
}

export interface EthereumAddress {
    address: string;
}

export interface EthereumSignedTx {
    // v: number,
    v: string;
    r: string;
    s: string;
}

export interface Identity {
    proto?: string;
    user?: string;
    host?: string;
    port?: string;
    path?: string;
    index?: number;
}

export interface SignedIdentity {
    address: string;
    public_key: string;
    signature: string;
}

// this is what Trezor asks for
export type SignTxInfoToTrezor =
    | {
          inputs: Array<TransactionInput | RefTransactionInput>;
      }
    | {
          bin_outputs: TransactionBinOutput[];
      }
    | {
          outputs: TransactionOutput[];
      }
    | {
          extra_data: string;
      }
    | {
          version: number;
          lock_time: number;
          inputs_cnt: number;
          outputs_cnt: number;
          extra_data_len?: number;
          timestamp: number;
          version_group_id: number;
      };

// NEM types
export interface NEMAddress {
    address: string;
}

export interface NEMSignedTx {
    data: string;
    signature: string;
}

export interface NEMTransactionCommon {
    address_n: number[];
    network: number;
    timestamp: number;
    fee: number;
    deadline: number;
    signer: string;
}

export interface NEMMosaic {
    namespace: string;
    mosaic: string;
    quantity: number;
}

export interface NEMTransfer {
    mosaics: NEMMosaic[];
    public_key: string;
    recipient: string;
    amount: number | string;
    payload: string;
}

export interface NEMProvisionNamespace {
    namespace: string;
    sink: string;
    fee: number;
    parent: string;
}

export type NEMMosaicLevyType =
    | {
          id: 1;
          name: 'MosaicLevy_Absolute';
      }
    | {
          id: 2;
          name: 'MosaicLevy_Percentile';
      };

export type NEMSupplyChangeType =
    | {
          id: 1;
          name: 'SupplyChange_Increase';
      }
    | {
          id: 2;
          name: 'SupplyChange_Decrease';
      };

export type NEMModificationType =
    | {
          id: 1;
          name: 'CosignatoryModification_Add';
      }
    | {
          id: 2;
          name: 'CosignatoryModification_Delete';
      };

export type NEMImportanceTransferMode =
    | {
          id: 1;
          name: 'ImportanceTransfer_Activate';
      }
    | {
          id: 2;
          name: 'ImportanceTransfer_Deactivate';
      };

export interface NEMMosaicDefinition {
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

export interface NEMMosaicCreation {
    definition: NEMMosaicDefinition;
    sink: string;
    fee: number;
}

export interface NEMMosaicSupplyChange {
    namespace?: string;
    type?: NEMSupplyChangeType;
    mosaic?: string;
    delta?: number;
}

export interface NEMCosignatoryModification {
    type?: NEMModificationType;
    public_key?: string;
}

export interface NEMAggregateModification {
    modifications: NEMCosignatoryModification[];
    relative_change: number; // TODO: "sint32"
}

export interface NEMImportanceTransfer {
    mode?: NEMImportanceTransferMode;
    public_key?: string;
}

export interface NEMSignTxMessage {
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

// Stellar types

export interface StellarAddress {
    address: string;
}

export interface StellarSignedTx {
    public_key: string;
    signature: string;
}

export interface StellarPaymentOp {
    type: 'StellarTxOpRequest';
    message: {};
}

export interface StellarSignTxMessage {
    address_n: number[];
    source_account: string;
    fee: number;
    sequence_number: string | number;
    network_passphrase: string;
    timebounds_start?: number;
    timebounds_end?: number;
    memo_type?: number;
    memo_text?: string | typeof undefined;
    memo_id?: string | typeof undefined;
    memo_hash?: string | Buffer | typeof undefined;
    num_operations: number;
}

export interface StellarAsset {
    type: 0 | 1 | 2;
    code: string;
    issuer?: string;
}

export type StellarOperationMessage =
    | {
          type: 'StellarCreateAccountOp';
          source_account?: string;
          new_account: string;
          starting_balance: string;
      }
    | {
          type: 'StellarPaymentOp';
          source_account?: string;
          destination_account: string;
          asset: StellarAsset | typeof undefined;
          amount: string;
      }
    | {
          type: 'StellarPathPaymentOp';
          source_account?: string;
          send_asset: StellarAsset;
          send_max: string;
          destination_account: string;
          destination_asset: StellarAsset;
          destination_amount: string;
          paths?: StellarAsset[] | typeof undefined;
      }
    | {
          type: 'StellarManageOfferOp';
          source_account?: string;
          offer_id?: string;
          amount: string;
          buying_asset: StellarAsset;
          selling_asset: StellarAsset;
          price_n: number;
          price_d: number;
      }
    | {
          type: 'StellarCreatePassiveOfferOp';
          source_account?: string;
          offer_id?: string;
          amount: string;
          buying_asset: StellarAsset;
          selling_asset: StellarAsset;
          price_n: number;
          price_d: number;
      }
    | {
          type: 'StellarSetOptionsOp';
          source_account?: string;
          signer_type?: number | typeof undefined;
          signer_key?: string | Buffer | typeof undefined;
          signer_weight?: number | typeof undefined;
          clear_flags: number;
          set_flags: number;
          master_weight: number | string;
          low_threshold: number | string;
          medium_threshold: number | string;
          high_threshold: number | string;
          home_domain: string;
          inflation_destination_account: string;
      }
    | {
          type: 'StellarChangeTrustOp';
          source_account?: string;
          asset: StellarAsset;
          limit?: string;
      }
    | {
          type: 'StellarAllowTrustOp';
          source_account?: string;
          trusted_account: string;
          asset_type: number;
          asset_code: string;
          is_authorized: number;
      }
    | {
          type: 'StellarAccountMergeOp';
          source_account?: string;
          destination_account: string;
      }
    | {
          type: 'StellarManageDataOp';
          source_account?: string;
          key: string;
          value: string | Buffer;
      }
    | {
          type: 'StellarBumpSequenceOp';
          source_account?: string;
          bump_to: string | number;
      };

// Tezos types
export interface TezosAddress {
    address: string;
}

export interface TezosPublicKey {
    public_key: string;
}

export interface TezosContractID {
    tag: number;
    hash: Uint8Array;
}

export interface TezosRevealOp {
    source: Uint8Array;
    fee: number;
    counter: number;
    gas_limit: number;
    storage_limit: number;
    public_key: Uint8Array;
}

export interface TezosManagerTransfer {
    amount: number;
    destination: TezosContractID;
}

export interface TezosParametersManager {
    set_delegate?: Uint8Array;
    cancel_delegate?: boolean;
    transfer?: TezosManagerTransfer;
}

export interface TezosTransactionOp {
    source: Uint8Array;
    destination: TezosContractID;
    amount: number;
    counter: number;
    fee: number;
    gas_limit: number;
    storage_limit: number;
    parameters?: number[];
    parameters_manager?: TezosParametersManager;
}

export interface TezosOriginationOp {
    source: Uint8Array;
    balance: number;
    delegate?: Uint8Array;
    fee: number;
    counter: number;
    gas_limit: number;
    storage_limit: number;
    script: string | number[];
}

export interface TezosDelegationOp {
    source: Uint8Array;
    delegate: Uint8Array;
    fee: number;
    counter: number;
    gas_limit: number;
    storage_limit: number;
}

export interface TezosTransaction {
    address_n: number[];
    branch: Uint8Array;
    reveal?: TezosRevealOp;
    transaction?: TezosTransactionOp;
    origination?: TezosOriginationOp;
    delegation?: TezosDelegationOp;
}

export interface TezosSignedTx {
    signature: string;
    sig_op_contents: string;
    operation_hash: string;
}

// Cardano types
export interface CardanoAddress {
    address: string;
    address_n?: number[];
}

export interface CardanoPublicKey {
    xpub: string;
    node: HDPubNode;
}

export interface CardanoSignedTx {
    tx_hash: string;
    serialized_tx: string;
}
export interface CardanoTxInput {
    tx_hash: string;
    address_n: number[];
    output_index: number;
}
export interface CardanoTxOutput {
    address?: string;
    address_n?: number[];
    amount: string;
}

// Lisk types
export interface LiskAddress {
    address: string;
}

export interface LiskPublicKey {
    public_key: string;
}

export interface LiskMessageSignature {
    public_key: string;
    signature: string;
}

export type LiskAsset =
    | { data: string }
    | { votes: string[] }
    | { delegate: { username: string } }
    | { signature: { public_key: string } }
    | {
          multisignature: {
              min: number;
              life_time: number;
              keys_group: string[];
          };
      };

export interface LiskTransaction {
    type: number;
    fee: string;
    amount: string;
    timestamp: number;
    recipient_id?: string;
    sender_public_key?: string;
    requester_public_key?: string;
    signature?: string;
    asset?: LiskAsset | {};
}

export interface LiskSignedTx {
    signature: string;
}

// Ripple types
export interface RippleAddress {
    address: string;
}

export interface RippleTransaction {
    address_n: number[];
    fee?: number;
    flags?: number;
    sequence?: number;
    last_ledger_sequence?: number;
    payment: {
        amount: string;
        destination: string;
    };
}

export interface RippleSignedTx {
    signature: string;
    serialized_tx: string;
}

// EOS types
export interface EosPublicKey {
    wif_public_key: string;
    raw_public_key: string;
}

export interface EosTxActionRequest {
    data_size: number;
}

export interface EosTxHeader {
    expiration: number;
    ref_block_num: number;
    ref_block_prefix: number;
    max_net_usage_words: number;
    max_cpu_usage_ms: number;
    delay_sec: number;
}

export interface EosSignTx {
    address_n: number[];
    chain_id: string;
    header: EosTxHeader;
    num_actions: number;
}

export interface EosAsset {
    amount: string; // uint64 as string
    symbol: string; // uint64 as string
}

export interface EosPermissionLevel {
    actor: string; // uint64 as string
    permission: string; // uint64 as string
}

export interface EosAuthorizationKey {
    type?: number;
    key: string;
    address_n?: number[]; // this field is not implemented in FW?
    weight: number;
}

export interface EosAuthorization {
    threshold: number;
    keys: EosAuthorizationKey[];
    accounts: Array<{
        account: EosPermissionLevel;
        weight: number;
    }>;
    waits: Array<{
        wait_sec: number;
        weight: number;
    }>;
}

export interface EosActionCommon {
    account: string; // uint64 as string
    name: string; // uint64 as string
    authorization: EosPermissionLevel[];
}

export interface EosActionTransfer {
    sender: string; // uint64 as string
    receiver: string; // uint64 as string
    quantity: EosAsset;
    memo?: string;
}

export interface EosActionDelegate {
    sender: string; // uint64 as string
    receiver: string; // uint64 as string
    net_quantity: EosAsset;
    cpu_quantity: EosAsset;
    transfer?: boolean;
}

export interface EosActionUndelegate {
    sender: string; // uint64 as string
    receiver: string; // uint64 as string
    net_quantity: EosAsset;
    cpu_quantity: EosAsset;
}

export interface EosActionBuyRam {
    payer: string; // uint64 as string
    receiver: string; // uint64 as string
    quantity: EosAsset;
}

export interface EosActionBuyRamBytes {
    payer: string; // uint64 as string
    receiver: string; // uint64 as string
    bytes: number;
}

export interface EosActionSellRam {
    account: string; // uint64 as string
    bytes: number;
}

export interface EosActionVoteProducer {
    voter: string; // uint64 as string
    proxy: string; // uint64 as string
    producers: string[]; // uint64[] as string
}

export interface EosActionRefund {
    owner: string; // uint64 as string
}

export interface EosActionUpdateAuth {
    account: string; // uint64 as string
    permission: string; // uint64 as string
    parent: string; // uint64 as string
    auth: EosAuthorization;
}

export interface EosActionDeleteAuth {
    account: string; // uint64 as string
    permission: string; // uint64 as string
}

export interface EosActionLinkAuth {
    account: string; // uint64 as string
    code: string; // uint64 as string
    type: string; // uint64 as string
    requirement: string; // uint64 as string
}

export interface EosActionUnlinkAuth {
    account: string; // uint64 as string
    code: string; // uint64 as string
    type: string; // uint64 as string
}

export interface EosActionNewAccount {
    creator: string; // uint64 as string
    name: string; // uint64 as string
    owner: EosAuthorization;
    active: EosAuthorization;
}

export interface EosActionUnknown {
    data_size: number;
    data_chunk: string;
}

export interface EosTxActionAck {
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
}

export interface EosSignedTx {
    signature: string;
}

// Binance types
export interface BinanceAddress {
    address: string;
}

export interface BinancePublicKey {
    public_key: string;
}

export interface BinanceSignTx {
    address_n: number[];
    msg_count: number;
    chain_id: string;
    account_number: number;
    memo?: string;
    sequence: number;
    source: number;
}

export interface BinanceTxRequest {
    __avoid_empty?: null;
}

export interface BinanceInputOutput {
    address: string;
    coins: Array<{
        amount: number;
        denom: string;
    }>;
}

export interface BinanceTransferMsg {
    inputs: BinanceInputOutput[];
    outputs: BinanceInputOutput[];
}

export interface BinanceOrderMsg {
    id: string;
    ordertype: number; // 'OT_UNKNOWN' | 'MARKET' | 'LIMIT' | 'OT_RESERVED',
    price: number;
    quantity: number;
    sender: string;
    side: number; // 'SIDE_UNKNOWN' | 'BUY' | 'SELL',
    symbol: string;
    timeinforce: number; // 'TIF_UNKNOWN' | 'GTE' | 'TIF_RESERVED' | 'IOC',
}

export interface BinanceCancelMsg {
    refid: string;
    sender: string;
    symbol: string;
}

export type BinanceMessage = BinanceTransferMsg | BinanceOrderMsg | BinanceCancelMsg;

export interface BinanceSignedTx {
    signature: string;
    public_key: string;
}

// Reset device flags
export interface ResetDeviceFlags {
    display_random?: boolean;
    strength?: number;
    passphrase_protection?: boolean;
    pin_protection?: boolean;
    language?: string;
    label?: string;
    u2f_counter?: number;
    skip_backup?: boolean;
    no_backup?: boolean;
}

export interface FirmwareErase {
    length?: number;
}

export interface FirmwareUpload {
    payload: Buffer;
    length: number;
    // hash?: string,
}

export interface ChangePin {
    remove?: boolean;
}

export interface Flags {
    flags: number;
}

export interface DebugLinkDecision {
    yes_no?: boolean;
    up_down?: boolean;
    input?: string;
}

export interface DebugLinkState {
    layout: string;
    pin: string;
    matrix: string;
    mnemonic: string;
    node: HDNode;
    passphrase_protection: boolean;
    reset_word: string;
    reset_entropy: string;
    recovery_fake_word: string;
    recovery_word_pos: number;
    reset_word_pos: number;
}

export interface LoadDeviceFlags {
    mnemonics?: string[];
    mnemonic?: string;
    node?: HDNode;
    pin?: string;
    passphrase_protection?: boolean;
    language?: string;
    label?: string;
    skip_checksum?: boolean;
    u2f_counter?: number;
}

export interface RecoverDeviceSettings {
    word_count?: number;
    passphrase_protection?: boolean;
    pin_protection?: boolean;
    language?: string;
    label?: string;
    enforce_wordlist?: boolean;
    type?: number;
    u2f_counter?: number;
}

export interface LoadDeviceSettings {
    pin?: string;
    passphrase_protection?: boolean;
    language?: string;
    label?: string;
    skip_checksum?: boolean;
    mnemonics?: string[];
    mnemonic?: string;
    node?: HDNode;
    payload?: string; // will be converted

    u2f_counter?: number;
}

export interface ResetDeviceSettings {
    display_random?: boolean;
    strength?: number;
    passphrase_protection?: boolean;
    pin_protection?: boolean;
    language?: string;
    label?: string;
    u2f_counter?: number;
    skip_backup?: boolean;
}

export interface ApplySettings {
    language?: string;
    label?: string;
    use_passphrase?: boolean;
    homescreen?: string;
}
