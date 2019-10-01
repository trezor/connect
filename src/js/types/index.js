/* @flow */

/*
* Public types accessible from npm library
*/

import { UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT, BLOCKCHAIN_EVENT } from '../constants';
import * as TRANSPORT from '../constants/transport';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';
import * as DEVICE from '../constants/device';

export type CoreMessage = {
    +event: string,
    +type: string,
    +payload: any,

    id?: number, // response id in ResponseMessage
    success?: boolean, // response status in ResponseMessage
};

export type UiPromiseResponse = {
    event: string,
    payload: any,
};

// Override MessageEvent type to have access to "ports" field and typed "data"
export interface PostMessageEvent extends Event {
    +origin: string,
    +lastEventId: string,
    +source: WindowProxy,
    +ports: Array<MessagePort>,
    +data: ?CoreMessage,
}

export type Deferred<T> = {
    id?: string,
    device: ?any,
    promise: Promise<T>,
    resolve: (t: T) => void,
    reject: (e: Error) => void,
}

export type FirmwareRange = {
    '1': {
        min: string,
        max: string,
    },
    '2': {
        min: string,
        max: string,
    },
}

// copy/paste from trezor.js
export type Features = {
    vendor: string,
    major_version: number,
    minor_version: number,
    patch_version: number,
    bootloader_mode: boolean,
    device_id: string,
    pin_protection: boolean,
    passphrase_protection: boolean,
    language: string,
    label: string,
    initialized: boolean,
    revision: string,
    bootloader_hash: string,
    imported: boolean,
    pin_cached: boolean,
    passphrase_cached: boolean,
    firmware_present: boolean,
    needs_backup: boolean,
    flags: number,
    model: string,
    fw_major: number,
    fw_minor: number,
    fw_patch: number,
    fw_vendor: string,
    fw_vendor_keys: string,
    unfinished_backup: boolean,
    no_backup: boolean,
    features: Array<string>,
};

export type FirmwareRelease = {
    required: true,
    version: Array<number>,
    min_bridge_version: Array<number>,
    min_firmware_version: Array<number>,
    bootloader_version: Array<number>,
    min_bootloader_version: Array<number>,
    url: string,
    channel: string,
    fingerprint: string,
    changelog: string,
};

export type DeviceStatus = 'available' | 'occupied' | 'used';
export type DeviceMode = 'normal' | 'bootloader' | 'initialize' | 'seedless';
export type DeviceFirmwareStatus = 'valid' | 'outdated' | 'required' | 'unknown' | 'none';

export type Device = $Exact<{
    +type: 'acquired',
    +path: string,
    +label: string,
    +firmware: DeviceFirmwareStatus,
    +firmwareRelease: ?FirmwareRelease,
    +status: DeviceStatus,
    +mode: DeviceMode,
    state: ?string,
    features: Features,
}> | $Exact<{
    +type: 'unacquired',
    +path: string,
    +label: string,
}> | $Exact<{
    +type: 'unreadable',
    +path: string,
    +label: string,
}>

export type Settings = {
    priority?: number,
    connectSrc?: string,
    popup?: boolean,
    transportReconnect?: boolean,
    webusb?: boolean,
    pendingTransportEvent?: boolean,
};

export type T_POPUP = typeof POPUP;
export type DeviceMessageType = $Values<typeof DEVICE>;
export type DeviceMessage = {
    event: typeof DEVICE_EVENT,
    type: DeviceMessageType,
    payload: Device,
}

export type T_UI_EVENT = typeof UI_EVENT;
export type T_UI = typeof UI;
export type UiMessageType = $Values<typeof UI> | typeof IFRAME.LOADED | typeof IFRAME.ERROR;
export type UiMessage = {
    event: typeof UI_EVENT,
    type: UiMessageType,
    payload: {
        device: Device,
        code?: string,
        browser?: any,
        data?: any,
    },
}

export type { UiResponse } from './uiResponse';

export type TransportMessageType = $Values<typeof TRANSPORT>;
export type TransportMessage = {
    event: typeof TRANSPORT_EVENT,
    type: TransportMessageType,
    payload: Object,
}

import type { BlockchainEvent } from './blockchainEvent';

/* eslint-disable no-redeclare */
declare function F_EventListener(type: typeof DEVICE_EVENT, handler: (event: DeviceMessage) => void): void;
declare function F_EventListener(type: typeof UI_EVENT, handler: (event: UiMessage) => void): void;
declare function F_EventListener(type: typeof TRANSPORT_EVENT, handler: (event: TransportMessage) => void): void;
declare function F_EventListener(type: typeof BLOCKCHAIN_EVENT, handler: (event: BlockchainEvent) => void): void;
declare function F_EventListener(type: DeviceMessageType, handler: (device: Device) => void): void;
export type EventListener = typeof F_EventListener;

import * as P from './params';
import * as R from './response';
import * as CARDANO from './cardano';
import * as RIPPLE from './ripple';
import * as ETHEREUM from './ethereum';
import * as NEM from './nem';
import * as STELLAR from './stellar';
import * as LISK from './lisk';
import * as TEZOS from './tezos';
import * as EOS from './eos';
import * as BINANCE from './binance';

// export type UiResponseFn = (settings: UiResponse) => void;
export type ChangeSettings = (settings: Settings) => void;
export type BlockchainDisconnect = (P.$BlockchainDisconnect) => Promise<R.BlockchainDisconnect$>;
export type BlockchainEstimateFee = (P.$BlockchainEstimateFee) => Promise<R.BlockchainEstimateFee$>;
export type BlockchainGetTransactions = (P.$BlockchainGetTransactions) => Promise<R.BlockchainGetTransactions$>;
export type BlockchainSubscribe = (P.$BlockchainSubscribe) => Promise<R.BlockchainSubscribe$>;
export type CustomMessage = (P.$CustomMessage) => Promise<R.CustomMessage$>;
export type RequestLogin = (P.$RequestLogin) => Promise<R.RequestLogin$>;
export type ResetDevice = (P.$ResetDevice) => Promise<R.ResetDevice$>;

declare function F_CardanoGetAddress(params: (P.$Common & CARDANO.$CardanoGetAddress)): Promise<CARDANO.CardanoGetAddress$>;
declare function F_CardanoGetAddress(params: (P.$Common & { bundle: Array<CARDANO.$CardanoGetAddress> })): Promise<CARDANO.CardanoGetAddress$$>;
export type CardanoGetAddress = typeof F_CardanoGetAddress;

declare function F_CardanoGetPublicKey(params: (P.$Common & CARDANO.$CardanoGetPublicKey)): Promise<CARDANO.CardanoGetPublicKey$>;
declare function F_CardanoGetPublicKey(params: (P.$Common & { bundle: Array<CARDANO.$CardanoGetPublicKey> })): Promise<CARDANO.CardanoGetPublicKey$$>;
export type CardanoGetPublicKey = typeof F_CardanoGetPublicKey;

export type CardanoSignTransaction = (CARDANO.$CardanoSignTransaction) => Promise<CARDANO.CardanoSignTransaction$>;

declare function F_TezosGetAddress(params: (P.$Common & TEZOS.$TezosGetAddress)): Promise<TEZOS.TezosGetAddress$>;
declare function F_TezosGetAddress(params: (P.$Common & { bundle: Array<TEZOS.$TezosGetAddress> })): Promise<TEZOS.TezosGetAddress$$>;
export type TezosGetAddress = typeof F_TezosGetAddress;

declare function F_TezosGetPublicKey(params: (P.$Common & TEZOS.$TezosGetPublicKey)): Promise<TEZOS.TezosGetPublicKey$>;
declare function F_TezosGetPublicKey(params: (P.$Common & { bundle: Array<TEZOS.$TezosGetPublicKey> })): Promise<TEZOS.TezosGetPublicKey$$>;
export type TezosGetPublicKey = typeof F_TezosGetPublicKey;
export type TezosSignTransaction = (TEZOS.$TezosSignTransaction) => Promise<TEZOS.TezosSignTransaction$>;

declare function F_CipherKeyValue(params: (P.$Common & P.$CipherKeyValue)): Promise<R.CipherKeyValue$>;
declare function F_CipherKeyValue(params: (P.$Common & { bundle: Array<P.$CipherKeyValue> })): Promise<R.CipherKeyValue$$>;
export type CipherKeyValue = typeof F_CipherKeyValue;

declare function F_ComposeTransaction(params: (P.$Common & P.$ComposeTransaction)): Promise<R.ComposeTransaction$>;
declare function F_ComposeTransaction(params: (P.$Common & P.$$ComposeTransaction)): Promise<R.ComposeTransaction$$>;
export type ComposeTransaction = typeof F_ComposeTransaction;
// export type ComposeTransaction = (P.$ComposeTransaction) => Promise<R.ComposeTransaction$>;

export type DebugLinkDecision = (P.$DebugLinkDecision) => Promise<R.DebugLinkDecision$>;
export type DebugLinkGetState = (P.$DebugLinkGetState) => Promise<R.DebugLinkGetState$>;

declare function F_EthereumGetAddress(params: (P.$Common & ETHEREUM.$EthereumGetAddress)): Promise<ETHEREUM.EthereumGetAddress$>;
declare function F_EthereumGetAddress(params: (P.$Common & { bundle: Array<ETHEREUM.$EthereumGetAddress> })): Promise<ETHEREUM.EthereumGetAddress$$>;
export type EthereumGetAddress = typeof F_EthereumGetAddress;

declare function F_EthereumGetPublicKey(params: (P.$Common & ETHEREUM.$EthereumGetPublicKey)): Promise<ETHEREUM.EthereumGetPublicKey$>;
declare function F_EthereumGetPublicKey(params: (P.$Common & { bundle: Array<ETHEREUM.$EthereumGetPublicKey> })): Promise<ETHEREUM.EthereumGetPublicKey$$>;
export type EthereumGetPublicKey = typeof F_EthereumGetPublicKey;

export type EthereumSignMessage = (ETHEREUM.$EthereumSignMessage) => Promise<ETHEREUM.EthereumSignMessage$>;
export type EthereumSignTransaction = (ETHEREUM.$EthereumSignTransaction) => Promise<ETHEREUM.EthereumSignTransaction$>;
export type EthereumVerifyMessage = (ETHEREUM.$EthereumVerifyMessage) => Promise<ETHEREUM.EthereumVerifyMessage$>;

declare function F_GetAccountInfo(params: (P.$Common & P.$GetAccountInfo)): Promise<R.GetAccountInfo$>;
declare function F_GetAccountInfo(params: (P.$Common & { bundle: Array<P.$GetAccountInfo> })): Promise<R.GetAccountInfo$$>;
export type GetAccountInfo = typeof F_GetAccountInfo;
// export type GetAccountInfo = (P.$GetAccountInfo) => Promise<R.GetAccountInfo$>;

declare function F_GetAddress(params: (P.$Common & P.$GetAddress)): Promise<R.GetAddress$>;
declare function F_GetAddress(params: (P.$Common & { bundle: Array<P.$GetAddress> })): Promise<R.GetAddress$$>;
export type GetAddress = typeof F_GetAddress;

export type GetDeviceState = (P.$GetDeviceState) => Promise<R.GetDeviceState$>;
export type GetFeatures = (P.$GetFeatures) => Promise<R.GetFeatures$>;

declare function F_GetPublicKey(params: (P.$Common & P.$GetPublicKey)): Promise<R.GetPublicKey$>;
declare function F_GetPublicKey(params: (P.$Common & { bundle: Array<P.$GetPublicKey> })): Promise<R.GetPublicKey$$>;
export type GetPublicKey = typeof F_GetPublicKey;

declare function F_LiskGetAddress(params: (P.$Common & LISK.$LiskGetAddress)): Promise<LISK.LiskGetAddress$>;
declare function F_LiskGetAddress(params: (P.$Common & { bundle: Array<LISK.$LiskGetAddress> })): Promise<LISK.LiskGetAddress$$>;
export type LiskGetAddress = typeof F_LiskGetAddress;

declare function F_LiskGetPublicKey(params: (P.$Common & LISK.$LiskGetPublicKey)): Promise<LISK.LiskGetPublicKey$>;
declare function F_LiskGetPublicKey(params: (P.$Common & { bundle: Array<LISK.$LiskGetPublicKey> })): Promise<LISK.LiskGetPublicKey$$>;
export type LiskGetPublicKey = typeof F_LiskGetPublicKey;

export type LiskSignMessage = (LISK.$LiskSignMessage) => Promise<LISK.LiskSignMessage$>;
export type LiskSignTransaction = (LISK.$LiskSignTransaction) => Promise<LISK.LiskSignTransaction$>
export type LiskVerifyMessage = (LISK.$LiskVerifyMessage) => Promise<LISK.LiskVerifyMessage$>;

declare function F_NEMGetAddress(params: (P.$Common & NEM.$NEMGetAddress)): Promise<NEM.NEMGetAddress$>;
declare function F_NEMGetAddress(params: (P.$Common & { bundle: Array<NEM.$NEMGetAddress> })): Promise<NEM.NEMGetAddress$$>;
export type NEMGetAddress = typeof F_NEMGetAddress;

export type NEMSignTransaction = (NEM.$NEMSignTransaction) => Promise<NEM.NEMSignTransaction$>;

export type PushTransaction = (P.$PushTransaction) => Promise<R.PushTransaction$>;

declare function F_RippleGetAddress(params: (P.$Common & RIPPLE.$RippleGetAddress)): Promise<RIPPLE.RippleGetAddress$>;
declare function F_RippleGetAddress(params: (P.$Common & { bundle: Array<RIPPLE.$RippleGetAddress> })): Promise<RIPPLE.RippleGetAddress$$>;
export type RippleGetAddress = typeof F_RippleGetAddress;

export type RippleSignTransaction = (RIPPLE.$RippleSignTransaction) => Promise<RIPPLE.RippleSignTransaction$>;

export type SignMessage = (P.$SignMessage) => Promise<R.SignMessage$>;
export type SignTransaction = (P.$SignTransaction) => Promise<R.SignTransaction$>;

declare function F_StellarGetAddress(params: (P.$Common & STELLAR.$StellarGetAddress)): Promise<STELLAR.StellarGetAddress$>;
declare function F_StellarGetAddress(params: (P.$Common & { bundle: Array<STELLAR.$StellarGetAddress> })): Promise<STELLAR.StellarGetAddress$$>;
export type StellarGetAddress = typeof F_StellarGetAddress;

export type StellarSignTransaction = (STELLAR.$StellarSignTransaction) => Promise<STELLAR.StellarSignTransaction$>;
export type VerifyMessage = (P.$VerifyMessage) => Promise<R.VerifyMessage$>;
export type WipeDevice = (P.$WipeDevice) => Promise<R.WipeDevice$>;
export type GetSettings = () => Promise<R.GetSettings$>;
export type ApplyFlags = (P.$ApplyFlags) => Promise<R.ApplyFlags$>;
export type ApplySettings = (P.$ApplySettings) => Promise<R.ApplySettings$>;
export type BackupDevice = (P.$BackupDevice) => Promise<R.BackupDevice$>;
export type ChangePin = (P.$ChangePin) => Promise<R.ChangePin$>;
export type FirmwareUpload = (P.$FirmwareUpload) => Promise<R.FirmwareUpload$>;
export type RecoveryDevice = (P.$RecoveryDevice) => Promise<R.RecoveryDevice$>;

declare function F_EosGetPublicKey(params: (P.$Common & EOS.$EosGetPublicKey)): Promise<EOS.EosGetPublicKey$>;
declare function F_EosGetPublicKey(params: (P.$Common & { bundle: Array<EOS.$EosGetPublicKey> })): Promise<EOS.EosGetPublicKey$$>;

export type EosGetPublicKey = typeof F_EosGetPublicKey;
export type EosSignTx = (EOS.$EosSignTx) => Promise<EOS.EosSignTx$>;

declare function F_BinanceGetAddress(params: (P.$Common & BINANCE.$BinanceGetAddress)): Promise<BINANCE.BinanceGetAddress$>;
declare function F_BinanceGetAddress(params: (P.$Common & { bundle: Array<BINANCE.$BinanceGetAddress> })): Promise<BINANCE.BinanceGetAddress$$>;
export type BinanceGetAddress = typeof F_BinanceGetAddress;

declare function F_BinanceGetPublicKey(params: (P.$Common & BINANCE.$BinanceGetPublicKey)): Promise<BINANCE.BinanceGetPublicKey$>;
declare function F_BinanceGetPublicKey(params: (P.$Common & { bundle: Array<BINANCE.$BinanceGetPublicKey> })): Promise<BINANCE.BinanceGetPublicKey$$>;
export type BinanceGetPublicKey = typeof F_BinanceGetPublicKey;
export type BinanceSignTransaction = (BINANCE.$BinanceSignTransaction) => Promise<BINANCE.BinanceSignTransaction$>;

/* eslint-enable no-redeclare */

export * from './response';
export * from './coinInfo';
