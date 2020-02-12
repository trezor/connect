/* @flow */
// import * as CONST from './_const';
import * as P from './params';
import * as Trezor from './trezor';
import * as Bitcoin from './bitcoin';
import * as Misc from './misc';

import * as Events from './events';
// import * as Account from './account';
// import * as Blockchain from './blockchain';

interface Bundled<T, R> {
    (params: P.CommonParams & T): P.Message<R>;
    (params: P.CommonParams & P.Bundle<T>): P.BundledMessage<R>;
}

type Method<T, R> = (params: P.CommonParams & T) => P.Message<R>;

export type API = {
    /**
     * Retrieves the settings that TrezorConnect was initialized with.
     */
    manifest: (params: P.Manifest) => P.Message<void>;

    /**
     * Initializes TrezorConnect.
     */
    init: (settings: P.Settings) => P.Message<void>;

    /**
     * Retrieves the settings that TrezorConnect was initialized with.
     */
    getSettings: () => P.Message<P.Settings>;

    dispose: () => void;

    cancel: (params?: string) => void;

    renderWebUSBButton: () => void;

    disableWebUSB: () => void;

    on: Events.Emitter;

    // uiResponse: (a: Events.UIResponse) => void;

    // // Methods

    // function blockchainDisconnect(
    //     params: Blockchain.BlockchainParams.disconnect,
    // ): P.Message<Blockchain.BlockchainResponses.disconnect>;

    // function blockchainEstimateFee(
    //     params: Blockchain.BlockchainParams.estimateFee,
    // ): P.Message<Blockchain.BlockchainResponses.estimateFee>;

    // function blockchainGetTransactions(
    //     params: Blockchain.BlockchainParams.getTransactions,
    // ): P.Message<Blockchain.BlockchainResponses.getTransactions>;

    // function blockchainSubscribe(
    //     params: Blockchain.BlockchainParams.subscribe,
    // ): P.Message<Blockchain.BlockchainResponses.subscribe>;

    // function blockchainUnsubscribe(
    //     params: Blockchain.BlockchainParams.unsubscribe,
    // ): P.Message<Blockchain.BlockchainResponses.unsubscribe>;

    /**
     * Challenge-response authentication via Trezor.
     * To protect against replay attacks you should use a server-side generated
     * and randomized challengeHidden for every attempt. You can also provide a
     * visual challenge that will be shown on the device.
     */
    requestLogin: Method<Misc.RequestLogin, Misc.Login>;

    /**
     * Asks device to encrypt value using the private key derived by given BIP32
     * path and the given key. IV is always computed automatically.
     */
    cipherKeyValue: Bundled<Misc.CipherKeyValue, Misc.CipherKeyValue>;
    // cipherKeyValue: (params: P.Bundle<P.CipherKeyValue>) => R.BundledMessage<P.CipherKeyValue>;

    /**
     * Retrieves the set of features associated with the device.
     */
    getFeatures: Method<{}, Trezor.Features>;

    /**
     * Retrieves device state associated with passphrase.
     */
    getDeviceState: Method<{}, Trezor.DeviceStateResponse>;

    // /**
    //  * Resets device to factory defaults and removes all private data.
    //  */
    // wipeDevice: (params?: P.CommonParams) => P.Message<R.DefaultMessage>;

    // /**
    //  * Performs device setup and generates a new seed.
    //  */
    // resetDevice: (params: P.ResetDevice) => P.Message<R.DefaultMessage>;

    // applySettings: (params: P.ApplySettings) => P.Message<R.DefaultMessage>;

    // /**
    //  * Increment saved flag on device
    //  */
    // applyFlags: (params: P.ApplyFlags) => P.Message<R.DefaultMessage>;

    // changePin: (params?: P.ChangePin) => P.Message<R.DefaultMessage>;

    // /**
    //  * Sends FirmwareErase message followed by FirmwareUpdate message
    //  */
    // firmwareUpdate: (params: P.FirmwareUpdate) => P.Message<R.DefaultMessage>;

    // /**
    //  * Asks device to initiate seed backup procedure
    //  */
    // backupDevice: (params?: P.CommonParams) => P.Message<R.DefaultMessage>;

    // /**
    //  * Ask device to initiate recovery procedure
    //  */
    // recoveryDevice: (params: P.RecoveryDevice) => P.Message<R.DefaultMessage>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Display requested address derived by given BIP32 path on device and
    //  * returns it to caller. User is asked to confirm the export on Trezor.
    //  */
    getAddress: Bundled<Bitcoin.GetAddress, Bitcoin.Address>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Retrieves BIP32 extended public derived by given BIP32 path.
    //  * User is presented with a description of the requested key and asked to
    //  * confirm the export.
    //  */
    // getPublicKey: (params: Bitcoin.GetPublicKey) => P.Message<Bitcoin.PublicKey>;
    // function getPublicKey(
    //     params: P.Bundle<Bitcoin.GetPublicKey>,
    // ): R.BundledMessage<Bitcoin.PublicKey>;

    // /**
    //  * Bitcoin, Bitcoin-like, Ethereum-like, Ripple
    //  * Gets an info of specified account.
    //  */
    // getAccountInfo: (params: P.GetAccountInfo) => P.Message<Account.AccountInfo>;
    // function getAccountInfo(
    //     params: P.Bundle<P.GetAccountInfo>,
    // ): R.BundledMessage<Account.AccountInfo>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Requests a payment from the users wallet to a set of given outputs.
    //  * Internally a BIP-0044 account discovery is performed and user is presented
    //  * with a list of accounts. After account selection user is presented with
    //  * list of fee selection. After selecting a fee transaction is signed and
    //  * returned in hexadecimal format. Change output is added automatically, if
    //  * needed.
    //  */
    // composeTransaction: (params: P.ComposeTransaction) => P.Message<Bitcoin.SignedTransaction>;
    // function composeTransaction(
    //     params: P.PrecomposeTransaction,
    // ): P.Message<Account.PrecomposedTransaction[]>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Asks device to sign given inputs and outputs of pre-composed transaction.
    //  * User is asked to confirm all transaction details on Trezor.
    //  */
    // signTransaction: (params: P.SignTransaction) => P.Message<Bitcoin.SignedTransaction>;

    // /**
    //  * Bitcoin, Bitcoin-like, Ethereum-like, Ripple
    //  * Broadcasts the transaction to the selected network.
    //  */
    // pushTransaction: (params: P.PushTransaction) => P.Message<R.PushTransaction>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Asks device to sign a message using the private key derived by given BIP32
    //  * path.
    //  */
    // signMessage: (params: P.SignMessage) => P.Message<Bitcoin.SignedMessage>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Asks device to verify a message using the signer address and signature.
    //  */
    // verifyMessage: (params: P.VerifyMessage) => P.Message<R.DefaultMessage>;

    // // Cardano (ADA)
    // cardanoGetAddress: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // cardanoGetPublicKey: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // function cardanoSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Message<Bitcoin.SignedTransaction>;

    // // Ethereum and Ethereum-like
    // ethereumGetAddress: (params: P.GetAddress) => P.Message<R.GetAddress>;
    // ethereumGetAddress: (params: P.Bundle<P.GetAddress>) => R.BundledMessage<R.GetAddress>;
    // ethereumGetPublicKey: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // ethereumSignMessage: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // function ethereumSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Message<Bitcoin.SignedTransaction>;
    // function ethereumVerifyMessage(
    //     params: P.SignTransaction1,
    // ): P.Message<Bitcoin.SignedTransaction>;

    // // Lisk
    // liskGetAddress: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // liskGetPublicKey: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // liskSignMessage: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // liskSignTransaction: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // liskVerifyMessage: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;

    // // NEM
    // nemGetAddress: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // nemSignTransaction: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;

    // // Ripple
    // rippleGetAddress: (params: P.GetAddress) => P.Message<R.GetAddress>;
    // rippleGetAddress: (params: P.Bundle<P.GetAddress>) => R.BundledMessage<R.GetAddress>;
    // function rippleSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Message<Bitcoin.SignedTransaction>;

    // // Stellar
    // stellarGetAddress: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // function stellarSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Message<Bitcoin.SignedTransaction>;

    // // Tezos
    // tezosGetAddress: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // tezosGetPublicKey: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // tezosSignTransaction: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;

    // // EOS
    // eosGetPublicKey: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // eosSignTransaction: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // binanceGetAddress: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // binanceGetPublicKey: (params: P.SignTransaction1) => P.Message<Bitcoin.SignedTransaction>;
    // function binanceSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Message<Bitcoin.SignedTransaction>;

    // // Event listeners
    // function on(
    //     event: typeof CONST.TRANSPORT_EVENT,
    //     callback: (event: Events.TransportEvent) => void,
    // ): void;
    // function on(
    //     event: typeof CONST.UI_EVENT,
    //     callback: (event: { event: typeof CONST.UI_EVENT } & Events.UiEvent) => void,
    // ): void;
    // function on(
    //     event: typeof CONST.DEVICE_EVENT,
    //     callback: (event: Events.DeviceEvent) => void,
    // ): void;
    // on(event: any, callback: : (event: any) => void) => void;

    // off(event: any, callback: : (event: any) => void) => void;

    // // Developer mode
    // function customMessage(
    //     params: Blockchain.BlockchainSubscribeParams1,
    // ): P.Message<Blockchain.BlockchainSubscribeResponse>;
}
