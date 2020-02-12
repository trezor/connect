/* @flow */
import * as CONSTANTS from '../constants';
import * as P from './params';
import * as Device from './trezor/device';
import * as Account from './account';
import * as Bitcoin from './networks/bitcoin';
import * as Misc from './misc';

import * as Events from './events';
import * as Blockchain from './backend/blockchain';

interface Bundled<Parm, Resp, BP = P.Bundle<Parm>, R = P.BundledResponse<Resp>> {
    (params: P.CommonParams & Parm): P.Response<Resp>;
    (params: P.CommonParams & BP): R;
}

type Method<T, R> = (params: P.CommonParams & T) => P.Response<R>;

interface Emitter {
    (type: typeof CONSTANTS.DEVICE_EVENT, cb: (event: Device.DeviceEvent) => void): void;
    (type: typeof CONSTANTS.TRANSPORT_EVENT, cb: (event: Events.TransportEvent) => void): void;
    (type: typeof CONSTANTS.UI_EVENT, cb: (event: Events.UiEvent) => void): void;
    (type: typeof CONSTANTS.BLOCKCHAIN_EVENT, cb: (event: Blockchain.BlockchainEvent) => void): void;
}

export type API = {
    /**
     * Set TrezorConnect manifest.
     */
    manifest: (params: P.Manifest) => void;

    /**
     * Initializes TrezorConnect.
     * `manifest` is required
     */
    init: (settings: { manifest: P.Manifest } & $Shape<P.ConnectSettings>) => Promise<void>;

    /**
     * Retrieves the settings that TrezorConnect was initialized with.
     */
    getSettings: () => P.Response<P.ConnectSettings>;

    dispose: () => void;

    cancel: (params?: string) => void;

    renderWebUSBButton: () => void;

    disableWebUSB: () => void;

    /**
     * Event listeners
     */
    on: Emitter;
    off: Emitter;

    uiResponse: (response: Events.UiResponse) => void;

    // Methods

    blockchainDisconnect: Method<Blockchain.BlockchainDisconnectParams, Blockchain.BlockchainDisconnectResponse>;
    blockchainEstimateFee: Method<Blockchain.BlockchainEstimateFeeParams, Blockchain.BlockchainEstimateFeeResponse>;
    blockchainGetTransactions: Method<Blockchain.BlockchainGetTransactionsParams, Blockchain.BlockchainGetTransactionResponse>;
    blockchainSubscribe: Method<Blockchain.BlockchainSubscribeParams, Blockchain.BlockchainSubscribeResponse>;
    blockchainUnsubscribe: Method<Blockchain.BlockchainSubscribeParams, Blockchain.BlockchainSubscribeResponse>;

    /**
     * Challenge-response authentication via Trezor.
     * To protect against replay attacks you should use a server-side generated
     * and randomized challengeHidden for every attempt. You can also provide a
     * visual challenge that will be shown on the device.
     */
    requestLogin: Bundled<Misc.RequestLoginAsync, Misc.Login, Misc.LoginChallenge, Misc.Login>;

    /**
     * Asks device to encrypt value using the private key derived by given BIP32
     * path and the given key. IV is always computed automatically.
     */
    cipherKeyValue: Bundled<Misc.CipherKeyValue, Misc.CipherKeyValue>;
    // cipherKeyValue: (params: P.Bundle<P.CipherKeyValue>) => R.BundledMessage<P.CipherKeyValue>;

    /**
     * Retrieves the set of features associated with the device.
     */
    getFeatures: Method<{}, Device.Features>;

    /**
     * Retrieves device state associated with passphrase.
     */
    getDeviceState: Method<{}, Device.DeviceStateResponse>;

    /**
     * Resets device to factory defaults and removes all private data.
     */
    wipeDevice: Method<{}, P.DefaultMessage>;

    /**
     * Performs device setup and generates a new seed.
     */
    resetDevice: Method<Misc.ResetDevice, P.DefaultMessage>;

    applySettings: Method<Misc.ApplySettings, P.DefaultMessage>;

    /**
     * Increment saved flag on device
     */
    applyFlags: Method<Misc.ApplyFlags, P.DefaultMessage>;

    // changePin: (params?: P.ChangePin) => P.Response<R.DefaultMessage>;

    // /**
    //  * Sends FirmwareErase message followed by FirmwareUpdate message
    //  */
    // firmwareUpdate: (params: P.FirmwareUpdate) => P.Response<R.DefaultMessage>;

    // /**
    //  * Asks device to initiate seed backup procedure
    //  */
    // backupDevice: (params?: P.CommonParams) => P.Response<R.DefaultMessage>;

    // /**
    //  * Ask device to initiate recovery procedure
    //  */
    // recoveryDevice: (params: P.RecoveryDevice) => P.Response<R.DefaultMessage>;

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
    // getPublicKey: (params: Bitcoin.GetPublicKey) => P.Response<Bitcoin.PublicKey>;
    // function getPublicKey(
    //     params: P.Bundle<Bitcoin.GetPublicKey>,
    // ): R.BundledMessage<Bitcoin.PublicKey>;

    // /**
    //  * Bitcoin, Bitcoin-like, Ethereum-like, Ripple
    //  * Gets an info of specified account.
    //  */
    // getAccountInfo: (params: P.GetAccountInfo) => P.Response<Account.AccountInfo>;
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
    composeTransaction: Account.ComposeTransaction;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Asks device to sign given inputs and outputs of pre-composed transaction.
    //  * User is asked to confirm all transaction details on Trezor.
    //  */
    // signTransaction: (params: P.SignTransaction) => P.Response<Bitcoin.SignedTransaction>;

    // /**
    //  * Bitcoin, Bitcoin-like, Ethereum-like, Ripple
    //  * Broadcasts the transaction to the selected network.
    //  */
    // pushTransaction: (params: P.PushTransaction) => P.Response<R.PushTransaction>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Asks device to sign a message using the private key derived by given BIP32
    //  * path.
    //  */
    // signMessage: (params: P.SignMessage) => P.Response<Bitcoin.SignedMessage>;

    // /**
    //  * Bitcoin and Bitcoin-like
    //  * Asks device to verify a message using the signer address and signature.
    //  */
    // verifyMessage: (params: P.VerifyMessage) => P.Response<R.DefaultMessage>;

    // // Cardano (ADA)
    // cardanoGetAddress: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // cardanoGetPublicKey: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // function cardanoSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Response<Bitcoin.SignedTransaction>;

    // // Ethereum and Ethereum-like
    // ethereumGetAddress: (params: P.GetAddress) => P.Response<R.GetAddress>;
    // ethereumGetAddress: (params: P.Bundle<P.GetAddress>) => R.BundledMessage<R.GetAddress>;
    // ethereumGetPublicKey: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // ethereumSignMessage: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // function ethereumSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Response<Bitcoin.SignedTransaction>;
    // function ethereumVerifyMessage(
    //     params: P.SignTransaction1,
    // ): P.Response<Bitcoin.SignedTransaction>;

    // // Lisk
    // liskGetAddress: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // liskGetPublicKey: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // liskSignMessage: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // liskSignTransaction: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // liskVerifyMessage: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;

    // // NEM
    // nemGetAddress: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // nemSignTransaction: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;

    // // Ripple
    // rippleGetAddress: (params: P.GetAddress) => P.Response<R.GetAddress>;
    // rippleGetAddress: (params: P.Bundle<P.GetAddress>) => R.BundledMessage<R.GetAddress>;
    // function rippleSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Response<Bitcoin.SignedTransaction>;

    // // Stellar
    // stellarGetAddress: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // function stellarSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Response<Bitcoin.SignedTransaction>;

    // // Tezos
    // tezosGetAddress: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // tezosGetPublicKey: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // tezosSignTransaction: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;

    // // EOS
    // eosGetPublicKey: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // eosSignTransaction: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // binanceGetAddress: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // binanceGetPublicKey: (params: P.SignTransaction1) => P.Response<Bitcoin.SignedTransaction>;
    // function binanceSignTransaction(
    //     params: P.SignTransaction1,
    // ): P.Response<Bitcoin.SignedTransaction>;

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
    // ): P.Response<Blockchain.BlockchainSubscribeResponse>;
}
