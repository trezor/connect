/* @flow */

import type {
    TestEthereumGetAddressPayload,
    ExpectedEthereumGetAddressResponse,
} from 'flowtype/tests/ethereum-get-address';

import type {
    TestEthereumSignMessagePayload,
    ExpectedEthereumSignMessageResponse,
} from 'flowtype/tests/ethereum-sign-message';

import type {
    TestEthereumSignTransactionPayload,
    ExpectedEthereumSignTransactionResponse,
} from 'flowtype/tests/ethereum-sign-transaction';

import type {
    TestGetAddressPayload,
    ExpectedGetAddressResponse,
} from 'flowtype/tests/get-address';

import type {
    TestGetPublicKeyPayload,
    ExpectedGetPublicKeyResponse,
} from 'flowtype/tests/get-public-key';

import type {
    TestNemGetAddressPayload,
    ExpectedNemGetAddressResponse,
} from 'flowtype/tests/nem-get-address';

import type {
    TestSignMessagePayload,
    ExpectedSignMessageResponse,
} from 'flowtype/tests/sign-message';

import type {
    TestSignTxPayload,
    ExpectedSignTxResponse,
} from 'flowtype/tests/sign-tx';

import type {
    TestVerifyMessagePayload,
    ExpectedVerifyMessageResponse,
} from 'flowtype/tests/verify-message';

import type {
    TestGetAccountInfoPayload,
    ExpectedGetAccountInfoResponse,
} from 'flowtype/tests/get-account-info';

import type {
    TestNemSignTransactionPayload,
    ExpectedNemSignTransactionResponse,
} from 'flowtype/tests/nem-sign-transaction';

declare module 'flowtype/tests' {
    declare export type GetAddressAvailableSubtests = 'btc' | 'ltc' | 'tbtc' | 'bch';
    declare export type GetAddressSegwitAvailableSubtests = 'showSegwit' /* | 'showMultisig3' */;
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
        | 'spendCoinbase'
        | 'twoChanges'
        | 'p2sh'
        | 'changeOnMainChainAllowed';
    declare export type SignTxSegwitAvailableSubtests = 'sendP2sh' | 'sendP2shChange' | 'sendMultisig1';
    declare export type SignTxBgoldAvailableSubtests = 'change' | 'noChange' | 'p2sh' | 'p2shWitnessChange' | 'sendMultisig1';
    declare export type SignTxBcashAvailableSubtests = 'change' | 'noChange' | 'oldAddr';
    declare export type SignTxMultisigAvailableSubtests = 'twoOfThree' | 'fifteenOfFifteen' | 'missingPubkey';
    declare export type SignTxMultisigChangeAvailableSubtests = 'externalExternal' | 'externalInternal' | 'internalExternal' | 'multisigExternalExternal';
    declare export type VerifyMessageAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet' | 'verifyBcash' | 'verifyBitcoind';
    declare export type VerifyMessageSegwitAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type VerifyMessageSegwitNativeAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type EthereumSignTransactionAvailableSubtests = 'knownErc20Token' | 'unknownErc20Token' | 'noData' | 'data' | 'message' | 'newContract' | 'sanityChecks' | 'noDataEip155' | 'dataEip155';
    declare export type NemSignTransactionMosaicAvailableSubtests = 'supplyChange' | 'creation' | 'creationProperties' | 'creationLevy';
    declare export type NemSignTransactionMultisigAvailableSubtests = 'aggregateModification' | 'multisig' | 'multisigSigner';
    declare export type NemSignTransactionOthersAvailableSubtests = 'importanceTransfer' | 'provisionNamespace';
    declare export type NemSignTransactionTransfersAvailableSubtests = 'simple' | 'encryptedPayload' | 'xemAsMosaic' | 'unknownMosaic' | 'knownMosaic' | 'knownMosaicWithLevy' | 'multipleMosaics';
    declare export type GetAccountInfoAvailableSubtests = 'firstAccount' | 'zeroBalance' | 'pathInvalid' | 'noAddressIndex' | 'zeroBalance' | 'xpubInsteadOfPath';

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
        | 'signTxMultisig'
        | 'signTxMultisigChange'
        | 'verifyMessage'
        | 'verifyMessageSegwit'
        | 'verifyMessageSegwitNative'
        | 'ethereumGetAddress'
        | 'ethereumSignMessage'
        | 'ethereumSignTransaction'
        | 'ethereumVerifyMessage'
        | 'nemGetAddress'
        | 'getAccountInfo'
        | 'nemSignTransactionMosaic'
        | 'nemSignTransactionMultisig';
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
        | EthereumSignTransactionAvailableSubtests
        | NemSignTransactionMosaicAvailableSubtests
        | NemSignTransactionMultisigAvailableSubtests
        | NemSignTransactionOthersAvailableSubtests
        | NemSignTransactionTransfersAvailableSubtests
        | GetAccountInfoAvailableSubtests;

    declare type Subtest<T, R> = {
        testPayloads: Array<T>,
        expectedResponses: Array<R>,
        specName: string,
    };
    declare export type SubtestGetAddress = Subtest<TestGetAddressPayload, ExpectedGetAddressResponse>;
    declare export type SubtestSignMessage = Subtest<TestSignMessagePayload, ExpectedSignMessageResponse>;
    declare export type SubtestEthereumSignTransaction = Subtest<TestEthereumSignTransactionPayload, ExpectedEthereumSignTransactionResponse>;
    declare export type SubtestSignTx = Subtest<TestSignTxPayload, ExpectedSignTxResponse>;
    declare export type SubtestVerifyMessage = Subtest<TestVerifyMessagePayload, ExpectedVerifyMessageResponse>;
    declare export type SubtestGetAccountInfo = Subtest<TestGetAccountInfoPayload, ExpectedGetAccountInfoResponse>;
    declare export type SubtestNemSignTransaction = Subtest<TestNemSignTransactionPayload, ExpectedNemSignTransactionResponse>;

    declare export type TestPayload =
        TestEthereumGetAddressPayload
        | TestEthereumSignMessagePayload
        | TestEthereumSignTransactionPayload
        | TestGetAddressPayload
        | TestGetPublicKeyPayload
        | TestNemGetAddressPayload
        | TestSignMessagePayload
        | TestSignTxPayload
        | TestVerifyMessagePayload
        | TestGetAccountInfoPayload
        | TestNemSignTransactionPayload;
    declare export type ExpectedResponse =
        ExpectedEthereumGetAddressResponse
        | ExpectedEthereumSignMessageResponse
        | ExpectedEthereumSignTransactionResponse
        | ExpectedGetAddressResponse
        | ExpectedGetPublicKeyResponse
        | ExpectedNemGetAddressResponse
        | ExpectedSignMessageResponse
        | ExpectedSignTxResponse
        | ExpectedVerifyMessageResponse
        | ExpectedGetAccountInfoResponse
        | ExpectedNemSignTransactionResponse;
}
