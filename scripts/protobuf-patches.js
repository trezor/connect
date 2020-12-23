
// type rule fixes, ideally it should not be here
const RULE_PATCH = {
    'BinanceAddress.address': 'required',
    'BinancePublicKey.public_key': 'required',
    'BinanceSignedTx.signature': 'required',
    'BinanceSignedTx.public_key': 'required',
    'MultisigRedeemScriptType.nodes': 'optional', // its valid to be undefined according to implementation/tests
    'MultisigRedeemScriptType.address_n': 'optional', // its valid to be undefined according to implementation/tests
    'PublicKey.node': 'required',
    'PublicKey.xpub': 'required',
    'MessageSignature.address': 'required',
    'MessageSignature.signature': 'required',
    'TxRequestDetailsType.request_index': 'required',
    'TxRequest.request_type': 'required',
    'TxRequest.details': 'required',
    'TxInputType.amount': 'required', // since 1.9.4/2.3.5
    'CardanoBlockchainPointerType.block_index': 'required',
    'CardanoBlockchainPointerType.tx_index': 'required',
    'CardanoBlockchainPointerType.certificate_index': 'required',
    'CardanoAddressParametersType.address_type': 'required',
    'CardanoGetAddress.protocol_magic': 'required',
    'CardanoGetAddress.network_id': 'required',
    'CardanoGetAddress.address_parameters': 'required',
    'CardanoAddress.address': 'required',
    'CardanoPublicKey.xpub': 'required',
    'CardanoPublicKey.node': 'required',
    'CardanoSignedTx.tx_hash': 'required',
    'CardanoSignedTx.serialized_tx': 'required',
    'Success.message': 'required',
    'HDNodeType.public_key': 'required',
    'SignedIdentity.address': 'required',
    'SignedIdentity.public_key': 'required',
    'SignedIdentity.signature': 'required',
    'EosPublicKey.wif_public_key': 'required',
    'EosPublicKey.raw_public_key': 'required',
    'EosAuthorizationKey.key': 'required',
    'EosAuthorizationKey.address_n': 'optional', // its valid to be undefined according to implementation/tests
    'EosAuthorizationKey.weight': 'required',
    'EosActionUnknown.data_size': 'required',
    'EosSignedTx.signature': 'required',
    'EthereumPublicKey.node': 'required',
    'EthereumPublicKey.xpub': 'required',
    'EthereumAddress.address': 'required',
    'EthereumMessageSignature.signature': 'required',
    'EthereumMessageSignature.address': 'required',
    'LiskAddress.address': 'required',
    'LiskPublicKey.public_key': 'required',
    'LiskSignTx.transaction': 'required',
    'LiskSignedTx.signature': 'required',
    'LiskSignMessage.message': 'required',
    'LiskMessageSignature.public_key': 'required',
    'LiskMessageSignature.signature': 'required',
    'Features.major_version': 'required',
    'Features.minor_version': 'required',
    'Features.patch_version': 'required',
    'Features.model': 'required',
    'NEMSignedTx.data': 'required',
    'NEMSignedTx.signature': 'required',
    'NEMTransactionCommon.address_n': 'optional', // no address_n in multisig
    'NEMTransfer.mosaics': 'optional', // its valid to be undefined according to implementation/tests
    'NEMMosaicDefinition.networks': 'optional', // never used according to implementation/tests
    'NEMAggregateModification.modifications': 'optional', // its valid to be undefined according to implementation/tests
    'RippleAddress.address': 'required',
    'RipplePayment.amount': 'required',
    'RippleSignedTx.signature': 'required',
    'RippleSignedTx.serialized_tx': 'required',
    'StellarAssetType.type': 'required',
    'StellarAssetType.code': 'required',
    'StellarAddress.address': 'required',
    'StellarPathPaymentOp.paths': 'optional', // its valid to be undefined according to implementation/tests
    'StellarSignedTx.public_key': 'required',
    'StellarSignedTx.signature': 'required',
    'TezosAddress.address': 'required',
    'TezosPublicKey.public_key': 'required',
    'TezosContractID.tag': 'required',
    'TezosContractID.hash': 'required',
    'TezosRevealOp.source': 'required',
    'TezosRevealOp.fee': 'required',
    'TezosRevealOp.counter': 'required',
    'TezosRevealOp.gas_limit': 'required',
    'TezosRevealOp.storage_limit': 'required',
    'TezosRevealOp.public_key': 'required',
    'TezosTransactionOp.source': 'required',
    'TezosTransactionOp.fee': 'required',
    'TezosTransactionOp.counter': 'required',
    'TezosTransactionOp.gas_limit': 'required',
    'TezosTransactionOp.storage_limit': 'required',
    'TezosTransactionOp.amount': 'required',
    'TezosTransactionOp.destination': 'required',
    'TezosOriginationOp.source': 'required',
    'TezosOriginationOp.fee': 'required',
    'TezosOriginationOp.counter': 'required',
    'TezosOriginationOp.gas_limit': 'required',
    'TezosOriginationOp.storage_limit': 'required',
    'TezosOriginationOp.balance': 'required',
    'TezosOriginationOp.script': 'required',
    'TezosDelegationOp.source': 'required',
    'TezosDelegationOp.fee': 'required',
    'TezosDelegationOp.counter': 'required',
    'TezosDelegationOp.gas_limit': 'required',
    'TezosDelegationOp.storage_limit': 'required',
    'TezosDelegationOp.delegate': 'required',
    'TezosSignTx.branch': 'required',
    'TezosSignedTx.signature': 'required',
    'TezosSignedTx.sig_op_contents': 'required',
    'TezosSignedTx.operation_hash': 'required',
};

// custom types IN to trezor
// protobuf lib will handle the translation to required type
// connect or other 3rd party libs are using compatible types (string as number etc...)
const TYPE_PATCH = {
    'Features.bootloader_mode': 'boolean | null',
    'Features.device_id': 'string | null',
    'Features.label': 'string | null',
    'Features.bootloader_hash': 'string | null',
    'Features.firmware_present': 'boolean | null',
    'Features.fw_major': 'number | null',
    'Features.fw_minor': 'number | null',
    'Features.fw_patch': 'number | null',
    'Features.fw_vendor': 'string | null',
    'HDNodePathType.node': 'HDNodeType | string',
    'TxInputType.amount': 'number | string',
    'TxOutputBinType.amount': 'number | string',
    'TxInput.amount': 'string | number',
    'PrevOutput.amount': 'string | number',
    'FirmwareUpload.payload': 'Buffer',
    'CardanoSignTx.fee': 'string | number',
    'CardanoSignTx.ttl': 'string | number',
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
    TxOutputType:
`// - TxOutputType replacement
// TxOutputType needs more exact types
// differences: external output (no address_n), opreturn output (no address_n, no address)
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
    script_type: OutputScriptType;
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

    TxAck:
`// - TxAck replacement
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
`,

    TxOutput:
`
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
