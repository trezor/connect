/* @flow */

declare module 'flowtype/tests' {
    declare export type GetAddressSubtests = 'btc' | 'ltc' | 'tbtc' | 'bch';
    declare export type SignMessageSubtests = 'sign' | 'signTestnet' | 'signBch' | 'signLong';
    declare export type SignMessageSegwitSubtests = 'sign' | 'signLong';
    declare export type SignTxSubtests = 'oneOneFee'
        | 'oneTwoFee'
        | 'oneThreeFee'
        | 'twoTwo'
        | 'testnetOneTwoFee'
        | 'testnetFeeTooHigh'
        | 'lotsOfOutputs'
        | 'feeTooHigh'
        | 'notEnoughFunds'
        | 'attackChangeOutputs'
        | 'attackChangeInputAddress'
        | 'spendCoinbase'
        | 'twoChanges'
        | 'p2sh'
        | 'changeOnMainChainAllowed';
    declare export type SignTxSegwitSubtests = 'sendP2Sh' | 'sendP2shChange';
    declare export type SignTxBgoldSubtests = 'change' | 'noChange' | 'p2sh' | 'p2shWitnessChange';
    declare export type SignTxBcashSubtests = 'change' | 'noChange' | 'oldAddr';
    declare export type VerifyMessageSubtests = 'verify' | 'verifyLong' | 'verifyTestnet' | 'verifyBcash' | 'verifyBitcoind';
    declare export type VerifyMessageSegwitSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type VerifyMessageSegwitNativeSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type EthereumSignTxSubtests = 'knownErc20Token' | 'unknownErc20Token' | 'noData' | 'data' | 'message' | 'newContract' | 'sanityChecks' | 'noDataEip155' | 'dataEip155';
    declare export type NemSignTransactionMosaicSubtests = 'supplyChange' | 'creation' | 'creationProperties' | 'creationLevy';
    declare export type NemSignTransactionMultisigSubtests = 'aggregatedModification' | 'multisig' | 'multisigSigner';
    declare export type NemSignTransactionOthersSubtests = 'importanceTransfer' | 'provisionNamespace';
    declare export type NemSignTransactionTransfersSubtests = 'simple' | 'encryptedPayload' | 'xemAsMosaic' | 'unknownMosaic' | 'knownMosaic' | 'knownMosaicWithLevy' | 'multipleMosaics';

    declare export type AvailableTests = 'getPublicKey'
        | 'getAddress'
        | 'getAddressSegwit'
        | 'signMessage'
        | 'signMessageSegwit'
        | 'signTx'
        | 'signTxSegwit'
        | 'signTxBgold'
        | 'signTxBcash'
        | 'verifyMessage'
        | 'verifyMessageSegwit'
        | 'ethereumGetAddress'
        | 'ethereumSignMessage'
        | 'ethereumSignTx'
        | 'ethereumVerifyMessage'
        | 'nemGetAddress';
    declare export type AvailableSubtests = GetAddressSubtests
        | SignMessageSubtests
        | SignMessageSegwitSubtests
        | SignTxSubtests
        | SignTxSegwitSubtests
        | SignTxBgoldSubtests
        | SignTxBcashSubtests
        | VerifyMessageSubtests
        | VerifyMessageSegwitSubtests
        | VerifyMessageSegwitNativeSubtests
        | EthereumSignTxSubtests
        | NemSignTransactionMosaicSubtests
        | NemSignTransactionMultisigSubtests
        | NemSignTransactionOthersSubtests
        | NemSignTransactionTransfersSubtests;
}