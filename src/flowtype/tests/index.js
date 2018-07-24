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
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

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

import type {
    TestPassphrasePayload,
    ExpectedPassphraseResponse,
} from 'flowtype/tests/passphrase';



declare module 'flowtype/tests' {
    declare export type GetAddressAvailableSubtests = 'btc' | 'ltc' | 'tbtc' | 'bch';
    declare export type GetAddressSegwitAvailableSubtests = 'showSegwit';
    declare export type SignMessageAvailableSubtests = 'sign' | 'signTestnet' | 'signBch' | 'signLong';
    declare export type SignMessageSegwitAvailableSubtests = 'sign' | 'signLong';
    declare export type SignTransactionAvailableSubtests =
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
    declare export type SignTransactionSegwitAvailableSubtests = 'sendP2sh' | 'sendP2shChange' | 'sendMultisig1';
    declare export type SignTransactionBgoldAvailableSubtests = 'change' | 'noChange' | 'p2sh' | 'p2shWitnessChange' | 'sendMultisig1';
    declare export type SignTransactionBcashAvailableSubtests = 'change' | 'noChange' | 'oldAddr';
    declare export type SignTransactionMultisigAvailableSubtests = 'twoOfThree' | 'fifteenOfFifteen' | 'missingPubkey';
    declare export type SignTransactionMultisigChangeAvailableSubtests = 'externalExternal' | 'externalInternal' | 'internalExternal' | 'multisigExternalExternal';
    declare export type VerifyMessageAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet' | 'verifyBcash' | 'verifyBitcoind';
    declare export type VerifyMessageSegwitAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type VerifyMessageSegwitNativeAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    declare export type EthereumSignTransactionAvailableSubtests = 'knownErc20Token' | 'unknownErc20Token' | 'noData' | 'data' | 'message' | 'newContract' | 'sanityChecks' | 'noDataEip155' | 'dataEip155';
    declare export type NemSignTransactionMosaicAvailableSubtests = 'supplyChange' | 'creation' | 'creationProperties' | 'creationLevy';
    declare export type NemSignTransactionMultisigAvailableSubtests = 'aggregateModification' | 'multisig' | 'multisigSigner';
    declare export type NemSignTransactionOthersAvailableSubtests = 'importanceTransfer' | 'provisionNamespace';
    declare export type NemSignTransactionTransfersAvailableSubtests = 'simple' | 'encryptedPayload' | 'xemAsMosaic' | 'unknownMosaic' | 'knownMosaic' | 'knownMosaicWithLevy' | 'multipleMosaics';
    declare export type GetAccountInfoAvailableSubtests = 'firstAccount' | 'zeroBalance' | 'pathInvalid' | 'zeroBalance' | 'xpubInsteadOfPath';
    declare export type PassphraseAvailableSubtests = 'correctPassphrase' | 'wrongPassphrase';

    declare type Subtest<T, R> = {
        testPayloads: Array<T>,
        expectedResponses: Array<R>,
        specName: string,
    };
    declare export type SubtestGetAddress = Subtest<TestGetAddressPayload, ExpectedGetAddressResponse>;
    declare export type SubtestSignMessage = Subtest<TestSignMessagePayload, ExpectedSignMessageResponse>;
    declare export type SubtestEthereumSignTransaction = Subtest<TestEthereumSignTransactionPayload, ExpectedEthereumSignTransactionResponse>;
    declare export type SubtestSignTransaction = Subtest<TestSignTransactionPayload, ExpectedSignTransactionResponse>;
    declare export type SubtestVerifyMessage = Subtest<TestVerifyMessagePayload, ExpectedVerifyMessageResponse>;
    declare export type SubtestGetAccountInfo = Subtest<TestGetAccountInfoPayload, ExpectedGetAccountInfoResponse>;
    declare export type SubtestNemSignTransaction = Subtest<TestNemSignTransactionPayload, ExpectedNemSignTransactionResponse>;
    declare export type SubtestPassphrase = Subtest<TestPassphrasePayload, ExpectedPassphraseResponse>;

    declare export type TestPayload =
        TestEthereumGetAddressPayload
        | TestEthereumSignMessagePayload
        | TestEthereumSignTransactionPayload
        | TestGetAddressPayload
        | TestGetPublicKeyPayload
        | TestNemGetAddressPayload
        | TestSignMessagePayload
        | TestSignTransactionPayload
        | TestVerifyMessagePayload
        | TestGetAccountInfoPayload
        | TestNemSignTransactionPayload
        | TestPassphrasePayload;
    declare export type ExpectedResponse =
        ExpectedEthereumGetAddressResponse
        | ExpectedEthereumSignMessageResponse
        | ExpectedEthereumSignTransactionResponse
        | ExpectedGetAddressResponse
        | ExpectedGetPublicKeyResponse
        | ExpectedNemGetAddressResponse
        | ExpectedSignMessageResponse
        | ExpectedSignTransactionResponse
        | ExpectedVerifyMessageResponse
        | ExpectedGetAccountInfoResponse
        | ExpectedNemSignTransactionResponse
        | ExpectedPassphraseResponse;
}
