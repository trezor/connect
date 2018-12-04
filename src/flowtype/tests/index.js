/* @flow */

import type {
    TestCardanoGetAddressPayload,
    ExpectedCardanoGetAddressResponse,
} from 'flowtype/tests/cardano-get-address';

import type {
    TestCardanoSignTransactionPayload,
    ExpectedCardanoSignTransactionResponse,
} from 'flowtype/tests/cardano-sign-transaction';

import type {
    TestEthereumGetAddressPayload,
    ExpectedEthereumGetAddressResponse,
} from 'flowtype/tests/ethereum-get-address';

import type {
    TestCardanoGetPublicKeyPayload,
    ExpectedCardanoGetPublicKeyResponse,
} from 'flowtype/tests/cardano-get-public-key';

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

import type {
    TestLiskGetAddressPayload,
    ExpectedLiskGetAddressResponse,
} from 'flowtype/tests/lisk-get-address';

import type {
    TestLiskSignMessagePayload,
    ExpectedLiskSignMessageResponse,
} from 'flowtype/tests/lisk-sign-message';

import type {
    TestLiskVerifyMessagePayload,
    ExpectedLiskVerifyMessageResponse,
} from 'flowtype/tests/lisk-verify-message';

import type {
    TestLiskSignTransactionPayload,
    ExpectedLiskSignTransactionResponse,
} from 'flowtype/tests/lisk-sign-transaction';

import type {
    TestRippleGetAddressPayload,
    ExpectedRippleGetAddressResponse,
} from 'flowtype/tests/ripple-get-address';

import type {
    TestRippleSignTransactionPayload,
    ExpectedRippleSignTransactionResponse,
} from 'flowtype/tests/ripple-sign-transaction';

import type {
    TestTezosGetAddressPayload,
    ExpectedTezosGetAddressResponse,
} from 'flowtype/tests/tezos-get-address';

import type {
    TestTezosGetPublicKeyPayload,
    ExpectedTezosGetPublicKeyResponse,
} from 'flowtype/tests/tezos-get-public-key';

import type {
    TestTezosSignTransactionPayload,
    ExpectedTezosSignTransactionResponse,
} from 'flowtype/tests/tezos-sign-transaction';

declare module 'flowtype/tests' {
    // declare export type GetAddressAvailableSubtests = 'btc' | 'ltc' | 'tbtc' | 'bch';
    // declare export type GetAddressSegwitAvailableSubtests = 'showSegwit';
    // declare export type SignMessageAvailableSubtests = 'sign' | 'signTestnet' | 'signBch' | 'signLong';
    // declare export type SignMessageSegwitAvailableSubtests = 'sign' | 'signLong';
    // declare export type SignTransactionAvailableSubtests =
    //     'oneOneFee'
    //     | 'oneTwoFee'
    //     | 'oneThreeFee'
    //     | 'twoTwo'
    //     | 'testnetOneTwoFee'
    //     | 'testnetFeeTooHigh'
    //     | 'lotsOfOutputs'
    //     | 'feeTooHigh'
    //     | 'notEnoughFunds'
    //     | 'spendCoinbase'
    //     | 'twoChanges'
    //     | 'p2sh'
    //     | 'changeOnMainChainAllowed';
    // declare export type SignTransactionSegwitAvailableSubtests = 'sendP2sh' | 'sendP2shChange' | 'sendMultisig1';
    // declare export type SignTransactionBgoldAvailableSubtests = 'change' | 'noChange' | 'p2sh' | 'p2shWitnessChange' | 'sendMultisig1';
    // declare export type SignTransactionBcashAvailableSubtests = 'change' | 'noChange' | 'oldAddr';
    // declare export type SignTransactionMultisigAvailableSubtests = 'twoOfThree' | 'fifteenOfFifteen' | 'missingPubkey';
    // declare export type SignTransactionMultisigChangeAvailableSubtests = 'externalExternal' | 'externalInternal' | 'internalExternal' | 'multisigExternalExternal';
    // declare export type VerifyMessageAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet' | 'verifyBcash' | 'verifyBitcoind';
    // declare export type VerifyMessageSegwitAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    // declare export type VerifyMessageSegwitNativeAvailableSubtests = 'verify' | 'verifyLong' | 'verifyTestnet';
    // declare export type EthereumSignTransactionAvailableSubtests = 'knownErc20Token' | 'unknownErc20Token' | 'noData' | 'data' | 'message' | 'newContract' | 'sanityChecks' | 'noDataEip155' | 'dataEip155';
    // declare export type NemSignTransactionMosaicAvailableSubtests = 'supplyChange' | 'creation' | 'creationProperties' | 'creationLevy';
    // declare export type NemSignTransactionMultisigAvailableSubtests = 'aggregateModification' | 'multisig' | 'multisigSigner';
    // declare export type NemSignTransactionOthersAvailableSubtests = 'importanceTransfer' | 'provisionNamespace';
    // declare export type NemSignTransactionTransfersAvailableSubtests = 'simple' | 'xemAsMosaic' | 'unknownMosaic' | 'knownMosaic' | 'knownMosaicWithLevy' | 'multipleMosaics';
    // declare export type GetAccountInfoAvailableSubtests = 'firstAccount' | 'zeroBalance' | 'pathInvalid' | 'zeroBalance' | 'xpubInsteadOfPath';
    // declare export type PassphraseAvailableSubtests = 'correctPassphrase' | 'wrongPassphrase';

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
    declare export type SubtestLiskSignTransaction = Subtest<TestLiskSignTransactionPayload, ExpectedLiskSignTransactionResponse>;
    declare export type SubtestTezosSignTransaction = Subtest<TestTezosSignTransactionPayload, ExpectedTezosSignTransactionResponse>;

    declare export type TestPayload =
        TestCardanoGetAddressPayload
        | TestCardanoGetPublicKeyPayload
        | TestCardanoSignTransactionPayload
        | TestEthereumGetAddressPayload
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
        | TestPassphrasePayload
        | TestLiskGetAddressPayload
        | TestLiskSignMessagePayload
        | TestLiskVerifyMessagePayload
        | TestLiskSignTransactionPayload
        | TestTezosGetAddressPayload
        | TestTezosGetPublicKeyPayload
        | TestTezosSignTransactionPayload
        | TestRippleGetAddressPayload
        | TestRippleSignTransactionPayload;

    declare export type ExpectedResponse =
        ExpectedCardanoGetAddressResponse
        | ExpectedCardanoGetPublicKeyResponse
        | ExpectedCardanoSignTransactionResponse
        | ExpectedEthereumGetAddressResponse
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
        | ExpectedPassphraseResponse
        | ExpectedLiskGetAddressResponse
        | ExpectedLiskSignMessageResponse
        | ExpectedLiskVerifyMessageResponse
        | ExpectedLiskSignTransactionResponse
        | ExpectedTezosGetAddressResponse
        | ExpectedTezosGetPublicKeyResponse
        | ExpectedTezosSignTransactionResponse
        | ExpectedRippleGetAddressResponse
        | ExpectedRippleSignTransactionResponse;

    declare export type SubtestFunction = SubtestGetAddress
    | SubtestSignMessage
    | SubtestEthereumSignTransaction
    | SubtestSignTransaction
    | SubtestVerifyMessage
    | SubtestGetAccountInfo
    | SubtestNemSignTransaction
    | SubtestPassphrase
    | SubtestTezosSignTransaction
    | SubtestLiskSignTransaction;

    declare export type TestFunction = {
        testName: string,
        testPayloads?: Array<TestPayload>,
        expectedResponses?: Array<ExpectedResponse>,
        subtests?: { [k: string]: () => SubtestFunction },
    };

    declare export type AvailableTestFunctions = {
        getPublicKey(): TestFunction,
        getAddress(): TestFunction,
        getAddressSegwit(): TestFunction,
        signMessage(): TestFunction,
        signMessageSegwit(): TestFunction,
        signTransaction(): TestFunction,
        signTransactionSegwit(): TestFunction,
        signTransactionBgold(): TestFunction,
        signTransactionBcash(): TestFunction,
        signTransactionMultisig(): TestFunction,
        signTransactionMultisigChange(): TestFunction,
        verifyMessage(): TestFunction,
        verifyMessageSegwit(): TestFunction,
        verifyMessageSegwitNative(): TestFunction,
        ethereumGetAddress(): TestFunction,
        ethereumSignMessage(): TestFunction,
        ethereumSignTransaction(): TestFunction,
        ethereumVerifyMessage(): TestFunction,
        getAccountInfo(): TestFunction,
        nemGetAddress(): TestFunction,
        nemSignTransactionMosaic(): TestFunction,
        nemSignTransactionMultisig(): TestFunction,
        nemSignTransactionOthers(): TestFunction,
        nemSignTransactionTransfers(): TestFunction,
        passphrase(): TestFunction,
        liskGetAddress(): TestFunction,
        liskSignMessage(): TestFunction,
        liskVerifyMessage(): TestFunction,
        liskSignTransaction(): TestFunction,
        rippleGetAddress(): TestFunction,
        rippleSignTransaction(): TestFunction,
        tezosGetAddress(): TestFunction,
        tezosGetPublicKey(): TestFunction,
        tezosSignTransaction(): TestFunction,
    };
}
