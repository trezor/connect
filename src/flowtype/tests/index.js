/* @flow */

import type {
    TestGetAddressPayload,
    ExpectedGetAddressResponse,
} from 'flowtype/tests/get-address';

import type {
    TestSignMessagePayload,
    ExpectedSignMessageResponse,
} from 'flowtype/tests/sign-message';

import type {
    TestEthereumSignTxPayload,
    ExpectedEthereumSignTxResponse,
} from 'flowtype/tests/ethereum-sign-tx';

import type {
    TestSignTxPayload,
    ExpectedSignTxResponse,
} from 'flowtype/tests/sign-tx';

declare module 'flowtype/tests' {
    declare export type GetAddressAvailableSubtests = 'btc' | 'ltc' | 'tbtc' | 'bch';
    declare export type SignMessageAvailableSubtests = 'sign' | 'signTestnet' | 'signBch' | 'signLong';
    declare export type SignMessageSegwitAvailableSubtests = 'sign' | 'signLong';
    declare export type SignTxAvailableSubtests =
        'oneOneFee'
        | 'oneTwoFee'
        | 'oneThreeFee'
        | 'twoTwo'
        | 'testnetOneTwoFee'
        | 'testnetFeeTooHigh'
        | 'lotsOfOutputs'
        | 'feeTooHigh'
        | 'notEnoughFunds'
        /* | 'attackChangeOutputs' */
        /* | 'attackChangeInputAddress' */
        | 'spendCoinbase'
        | 'twoChanges'
        | 'p2sh'
        | 'changeOnMainChainAllowed';
    declare export type SignTxSegwitAvailableSubtests = 'sendP2sh' | 'sendP2shChange' /* | 'sendMultisig1' */;
    declare export type SignTxBgoldAvailableSubtests = 'change' | 'noChange' | 'p2sh' | 'p2shWitnessChange';
    declare export type SignTxBcashAvailableSubtests = 'change' | 'noChange' | 'oldAddr';
    declare export type VerifyMessageAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet' | 'verifyBcash' | 'verifyBitcoind';
    declare export type VerifyMessageSegwitAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type VerifyMessageSegwitNativeAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type EthereumSignTxAvailableSubtests = 'knownErc20Token' | 'unknownErc20Token' | 'noData' | 'data' | 'message' | 'newContract' | 'sanityChecks' | 'noDataEip155' | 'dataEip155';
    declare export type NemSignTransactionMosaicAvailableSubtests = 'supplyChange' | 'creation' | 'creationProperties' | 'creationLevy';
    declare export type NemSignTransactionMultisigAvailableSubtests = 'aggregatedModification' | 'multisig' | 'multisigSigner';
    declare export type NemSignTransactionOthersAvailableSubtests = 'importanceTransfer' | 'provisionNamespace';
    declare export type NemSignTransactionTransfersAvailableSubtests = 'simple' | 'encryptedPayload' | 'xemAsMosaic' | 'unknownMosaic' | 'knownMosaic' | 'knownMosaicWithLevy' | 'multipleMosaics';

    declare export type AvailableTests =
        'getPublicKey'
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
    declare export type AvailableSubtests =
        GetAddressAvailableSubtests
        | SignMessageAvailableSubtests
        | SignMessageSegwitAvailableSubtests
        | SignTxAvailableSubtests
        | SignTxSegwitAvailableSubtests
        | SignTxBgoldAvailableSubtests
        | SignTxBcashAvailableSubtests
        | VerifyMessageAvailableSubtests
        | VerifyMessageSegwitAvailableSubtests
        | VerifyMessageSegwitNativeAvailableSubtests
        | EthereumSignTxAvailableSubtests
        | NemSignTransactionMosaicAvailableSubtests
        | NemSignTransactionMultisigAvailableSubtests
        | NemSignTransactionOthersAvailableSubtests
        | NemSignTransactionTransfersAvailableSubtests;

    declare type Subtest<T, R> = {
        testPayloads: Array<T>,
        expectedResponses: Array<R>,
        specName: string,
    };
    declare export type SubtestGetAddress = Subtest<TestGetAddressPayload, ExpectedGetAddressResponse>;
    declare export type SubtestSignMessage = Subtest<TestSignMessagePayload, ExpectedSignMessageResponse>;
    declare export type SubtestEthereumSignTx = Subtest<TestEthereumSignTxPayload, ExpectedEthereumSignTxResponse>;
    declare export type SubtestSignTx = Subtest<TestSignTxPayload, ExpectedSignTxResponse>;
}
