// type rule fixes, ideally it should not be here
const RULE_PATCH = {
    'MultisigRedeemScriptType.nodes': 'optional', // its valid to be undefined according to implementation/tests
    'MultisigRedeemScriptType.address_n': 'optional', // its valid to be undefined according to implementation/tests
    'TxRequestDetailsType.request_index': 'required',
    'TxRequest.request_type': 'required',
    'TxRequest.details': 'required',
    'TxInputType.amount': 'required', // since 1.9.4/2.3.5
    'CardanoPoolOwnerType.staking_key_path': 'optional',
    'CardanoPoolOwner.staking_key_path': 'optional',
    'CardanoTxCertificateType.path': 'optional',
    'CardanoTxCertificate.path': 'optional',
    'CardanoTxInputType.address_n': 'optional',
    'Success.message': 'required', // didn't find use case where it's not sent
    'SignedIdentity.address': 'required',
    'EosAuthorizationKey.key': 'required', // its valid to be undefined according to implementation/tests
    'EosAuthorizationKey.type': 'optional', // its valid to be undefined according to implementation/tests
    'EosAuthorizationKey.address_n': 'optional', // its valid to be undefined according to implementation/tests
    'EthereumAddress.address': 'required', // address is transformed from legacy type _old_address
    // TODO: Features should be union: bootloader|normal
    // fields below are marked as required because of backward compatibility (suite implementation)
    'Features.vendor': 'required',
    'Features.bootloader_mode': 'required',
    'Features.device_id': 'required',
    'Features.major_version': 'required',
    'Features.minor_version': 'required',
    'Features.patch_version': 'required',
    'Features.pin_protection': 'required',
    'Features.passphrase_protection': 'required',
    'Features.language': 'required',
    'Features.label': 'required',
    'Features.initialized': 'required',
    'Features.revision': 'required',
    'Features.bootloader_hash': 'required',
    'Features.imported': 'required',
    'Features.unlocked': 'required',
    'Features.firmware_present': 'required',
    'Features.needs_backup': 'required',
    'Features.flags': 'required',
    'Features.fw_major': 'required',
    'Features.fw_minor': 'required',
    'Features.fw_patch': 'required',
    'Features.fw_vendor': 'required',
    'Features.model': 'required',
    'Features.fw_vendor_keys': 'required',
    'Features.unfinished_backup': 'required',
    'Features.no_backup': 'required',
    'Features.recovery_mode': 'required',
    'Features.backup_type': 'required',
    'Features.sd_card_present': 'required',
    'Features.sd_protection': 'required',
    'Features.wipe_code_protection': 'required',
    'Features.session_id': 'required',
    'Features.passphrase_always_on_device': 'required',
    'Features.safety_checks': 'required',
    'Features.auto_lock_delay_ms': 'required',
    'Features.display_rotation': 'required',
    'Features.experimental_features': 'required',
    'NEMTransactionCommon.address_n': 'optional', // no address_n in multisig
    'NEMTransfer.mosaics': 'optional', // its valid to be undefined according to implementation/tests
    'NEMMosaicDefinition.networks': 'optional', // never used according to implementation/tests
    'NEMAggregateModification.modifications': 'optional', // its valid to be undefined according to implementation/tests
    'StellarAssetType.code': 'required',
    'StellarPathPaymentOp.paths': 'optional', // its valid to be undefined according to implementation/tests
};

// custom types IN to trezor
// protobuf lib will handle the translation to required type
// connect or other 3rd party libs are using compatible types (string as number etc...)
const TYPE_PATCH = {
    'Features.bootloader_mode': 'boolean | null',
    'Features.device_id': 'string | null',
    'Features.pin_protection': 'boolean | null',
    'Features.passphrase_protection': 'boolean | null',
    'Features.language': 'string | null',
    'Features.label': 'string | null',
    'Features.initialized': 'boolean | null',
    'Features.revision': 'string | null',
    'Features.bootloader_hash': 'string | null',
    'Features.imported': 'boolean | null',
    'Features.unlocked': 'boolean | null',
    'Features.firmware_present': 'boolean | null',
    'Features.needs_backup': 'boolean | null',
    'Features.flags': 'number | null',
    'Features.fw_major': 'number | null',
    'Features.fw_minor': 'number | null',
    'Features.fw_patch': 'number | null',
    'Features.fw_vendor': 'string | null',
    'Features.fw_vendor_keys': 'string | null',
    'Features.unfinished_backup': 'boolean | null',
    'Features.no_backup': 'boolean | null',
    'Features.recovery_mode': 'boolean | null',
    'Features.backup_type': 'BackupType | null',
    'Features.sd_card_present': 'boolean | null',
    'Features.sd_protection': 'boolean | null',
    'Features.wipe_code_protection': 'boolean | null',
    'Features.session_id': 'string | null',
    'Features.passphrase_always_on_device': 'boolean | null',
    'Features.safety_checks': 'SafetyCheckLevel | null',
    'Features.auto_lock_delay_ms': 'number | null',
    'Features.display_rotation': 'number | null',
    'Features.experimental_features': 'boolean | null',
    'HDNodePathType.node': 'HDNodeType | string',
    'TxInputType.amount': 'number | string',
    'TxOutputBinType.amount': 'number | string',
    'TxInput.amount': 'string | number',
    'PrevOutput.amount': 'string | number',
    'FirmwareUpload.payload': 'Buffer',
    'CardanoCatalystRegistrationParametersType.nonce': 'string | number',
    'CardanoPoolParametersType.pledge': 'string | number',
    'CardanoPoolParametersType.cost': 'string | number',
    'CardanoPoolParametersType.margin_numerator': 'string | number',
    'CardanoPoolParametersType.margin_denominator': 'string | number',
    'CardanoSignTx.fee': 'string | number',
    'CardanoSignTx.ttl': 'string | number',
    'CardanoSignTx.validity_interval_start': 'string | number',
    'CardanoSignTxInit.fee': 'string | number',
    'CardanoSignTxInit.ttl': 'string | number',
    'CardanoSignTxInit.validity_interval_start': 'string | number',
    'CardanoTokenType.amount': 'string | number',
    'CardanoToken.amount': 'string | number',
    'CardanoTxOutputType.amount': 'string | number',
    'CardanoTxOutput.amount': 'string | number',
    'EosAsset.amount': 'string',
    'EosAsset.symbol': 'string',
    'EosPermissionLevel.actor': 'string',
    'EosPermissionLevel.permission': 'string',
    'EosAuthorizationKey.key': 'string',
    'EosActionCommon.account': 'string',
    'EosActionCommon.name': 'string',
    'EosActionTransfer.sender': 'string',
    'EosActionTransfer.receiver': 'string',
    'EosActionDelegate.sender': 'string',
    'EosActionDelegate.receiver': 'string',
    'EosActionUndelegate.sender': 'string',
    'EosActionUndelegate.receiver': 'string',
    'EosActionRefund.owner': 'string',
    'EosActionBuyRam.payer': 'string',
    'EosActionBuyRam.receiver': 'string',
    'EosActionBuyRamBytes.payer': 'string',
    'EosActionBuyRamBytes.receiver': 'string',
    'EosActionSellRam.account': 'string',
    'EosActionVoteProducer.voter': 'string',
    'EosActionVoteProducer.proxy': 'string',
    'EosActionVoteProducer.producers': 'string',
    'EosActionUpdateAuth.account': 'string',
    'EosActionUpdateAuth.permission': 'string',
    'EosActionUpdateAuth.parent': 'string',
    'EosActionDeleteAuth.account': 'string',
    'EosActionDeleteAuth.permission': 'string',
    'EosActionLinkAuth.account': 'string',
    'EosActionLinkAuth.code': 'string',
    'EosActionLinkAuth.type': 'string',
    'EosActionLinkAuth.requirement': 'string',
    'EosActionUnlinkAuth.account': 'string',
    'EosActionUnlinkAuth.code': 'string',
    'EosActionUnlinkAuth.type': 'string',
    'EosActionNewAccount.creator': 'string',
    'EosActionNewAccount.name': 'string',
    'NEMTransfer.amount': 'string | number',
    'RipplePayment.amount': 'string | number',
    'RippleSignTx.fee': 'string | number',
    'StellarAssetType.type': '0 | 1 | 2',
    'StellarSignTx.sequence_number': 'string | number',
    'StellarSignTx.memo_id': 'string',
    'StellarSignTx.memo_hash': 'Buffer | string',
    'StellarPaymentOp.amount': 'string | number',
    'StellarCreateAccountOp.starting_balance': 'string | number',
    'StellarPathPaymentOp.send_max': 'string | number',
    'StellarPathPaymentOp.destination_amount': 'string | number',
    'StellarManageOfferOp.amount': 'string | number',
    'StellarManageOfferOp.offer_id': 'string | number',
    'StellarCreatePassiveOfferOp.amount': 'string | number',
    'StellarSetOptionsOp.master_weight': 'string | number',
    'StellarSetOptionsOp.low_threshold': 'string | number',
    'StellarSetOptionsOp.medium_threshold': 'string | number',
    'StellarSetOptionsOp.high_threshold': 'string | number',
    'StellarSetOptionsOp.signer_key': 'Buffer | string',
    'StellarChangeTrustOp.limit': 'string | number',
    'StellarManageDataOp.value': 'Buffer | string',
    'StellarBumpSequenceOp.bump_to': 'string | number',
    'TezosContractID.tag': 'number',
    'TezosContractID.hash': 'Uint8Array',
    'TezosRevealOp.source': 'Uint8Array',
    'TezosRevealOp.public_key': 'Uint8Array',
    'TezosParametersManager.set_delegate': 'Uint8Array',
    'TezosTransactionOp.source': 'Uint8Array',
    'TezosTransactionOp.parameters': 'number[]',
    'TezosOriginationOp.source': 'Uint8Array',
    'TezosOriginationOp.delegate': 'Uint8Array',
    'TezosOriginationOp.script': 'string | number[]',
    'TezosDelegationOp.source': 'Uint8Array',
    'TezosDelegationOp.delegate': 'Uint8Array',
    'TezosSignTx.branch': 'Uint8Array',
};

const DEFINITION_PATCH = {
    TxOutputType: `// - TxOutputType replacement
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
`,

    TxAck: `// - TxAck replacement
// TxAck needs more exact types
// PrevInput and TxInputType requires exact responses in TxAckResponse
// main difference: PrevInput should not contain address_n (unexpected field by protobuf)

export type TxAckResponse = {|
    inputs: Array<TxInputType | PrevInput>;
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
`,

    TxOutput: `
// - TxOutput replacement
export type TxOutput = TxOutputType;
// - TxOutput replacement end
`,
};

// skip unnecessary types
const SKIP = [
    'MessageType', // connect uses custom definition
    'TransactionType', // connect uses custom definition
    // not implemented
    'CosiCommit',
    'CosiCommitment',
    'CosiSign',
    'CosiSignature',
    'MoneroRctKeyPublic',
    'MoneroOutputEntry',
    'MoneroMultisigKLRki',
    'MoneroTransactionSourceEntry',
    'MoneroAccountPublicAddress',
    'MoneroTransactionDestinationEntry',
    'MoneroTransactionRsigData',
    'MoneroGetAddress',
    'MoneroAddress',
    'MoneroGetWatchKey',
    'MoneroWatchKey',
    'MoneroTransactionData',
    'MoneroTransactionInitRequest',
    'MoneroTransactionInitAck',
    'MoneroTransactionSetInputRequest',
    'MoneroTransactionSetInputAck',
    'MoneroTransactionInputsPermutationRequest',
    'MoneroTransactionInputsPermutationAck',
    'MoneroTransactionInputViniRequest',
    'MoneroTransactionInputViniAck',
    'MoneroTransactionAllInputsSetRequest',
    'MoneroTransactionAllInputsSetAck',
    'MoneroTransactionSetOutputRequest',
    'MoneroTransactionSetOutputAck',
    'MoneroTransactionAllOutSetRequest',
    'MoneroRingCtSig',
    'MoneroTransactionAllOutSetAck',
    'MoneroTransactionSignInputRequest',
    'MoneroTransactionSignInputAck',
    'MoneroTransactionFinalRequest',
    'MoneroTransactionFinalAck',
    'MoneroSubAddressIndicesList',
    'MoneroKeyImageExportInitRequest',
    'MoneroKeyImageExportInitAck',
    'MoneroTransferDetails',
    'MoneroKeyImageSyncStepRequest',
    'MoneroExportedKeyImage',
    'MoneroKeyImageSyncStepAck',
    'MoneroKeyImageSyncFinalRequest',
    'MoneroKeyImageSyncFinalAck',
    'MoneroGetTxKeyRequest',
    'MoneroGetTxKeyAck',
    'MoneroLiveRefreshStartRequest',
    'MoneroLiveRefreshStartAck',
    'MoneroLiveRefreshStepRequest',
    'MoneroLiveRefreshStepAck',
    'MoneroLiveRefreshFinalRequest',
    'MoneroLiveRefreshFinalAck',
    'DebugMoneroDiagRequest',
    'DebugMoneroDiagAck',
    'WebAuthnListResidentCredentials',
    'WebAuthnAddResidentCredential',
    'WebAuthnRemoveResidentCredential',
    'WebAuthnCredential',
    'WebAuthnCredentials',
];

module.exports = {
    RULE_PATCH,
    TYPE_PATCH,
    DEFINITION_PATCH,
    SKIP,
};
