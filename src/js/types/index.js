/* @flow */
'use strict';

/*
* Public types accessible from npm library
*/

import { UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT, BLOCKCHAIN_EVENT } from '../constants';
import * as TRANSPORT from '../constants/transport';
import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';
import * as DEVICE from '../constants/device';
import * as BLOCKCHAIN from '../constants/blockchain';

export type CoreMessage = {
    +event: string,
    +type: string,
    +payload: any,

    id?: number, // response id in ResponseMessage
    success?: boolean, // response status in ResponseMessage
}

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
};

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
}

export type DeviceStatus = 'available' | 'occupied' | 'used';
export type DeviceMode = 'normal' | 'bootloader' | 'initialize' | 'seedless';
export type DeviceFirmwareStatus = 'valid' | 'outdated' | 'required';

export type Device = $Exact<{
    +type: 'acquired',
    +path: string,
    +label: string,
    +firmware: DeviceFirmwareStatus,
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
}

export type T_POPUP = typeof POPUP;
export type DeviceMessageType = $Values<typeof DEVICE>;
export type DeviceMessage = {
    event: typeof DEVICE_EVENT,
    type: DeviceMessageType,
    payload: Device,
}

export type T_UI_EVENT = typeof UI_EVENT;
export type T_UI = typeof UI;
export type UiMessageType = $Values<typeof UI>;
export type UiMessage = {
    event: typeof UI_EVENT,
    type: UiMessageType,
    payload: {
        device: Device,
        code?: string,
        browser?: any,
    },
}

export type { UiResponse } from './ui-response';

export type TransportMessageType = $Values<typeof TRANSPORT>;
export type TransportMessage = {
    event: typeof TRANSPORT_EVENT,
    type: TransportMessageType,
    payload: Object,
}

export type BlockchainMessageType = $Values<typeof BLOCKCHAIN>;
export type BlockchainMessage = {
    event: typeof BLOCKCHAIN_EVENT,
    type: BlockchainMessageType,
    payload: Object,
}

/* eslint-disable no-redeclare */
declare function F_EventListener(type: typeof DEVICE_EVENT, handler: (event: DeviceMessage) => void): void;
declare function F_EventListener(type: typeof UI_EVENT, handler: (event: UiMessage) => void): void;
declare function F_EventListener(type: typeof TRANSPORT_EVENT, handler: (event: TransportMessage) => void): void;
declare function F_EventListener(type: typeof BLOCKCHAIN_EVENT, handler: (event: BlockchainMessage) => void): void;
declare function F_EventListener(type: DeviceMessageType, handler: (device: Device) => void): void;
/* eslint-enable no-redeclare */
export type EventListener = typeof F_EventListener;

import * as P from './params';
import * as R from './response';
import * as CARDANO from './cardano';
import * as RIPPLE from './ripple';
import * as ETHEREUM from './ethereum';
import * as NEM from './nem';
import * as STELLAR from './stellar';
import * as LISK from './lisk';

// export type UiResponseFn = (settings: UiResponse) => void;
export type ChangeSettings = (settings: Settings) => void;
export type BlockchainDisconnect = (P.$BlockchainDisconnect) => Promise<R.BlockchainDisconnect$>;
export type BlockchainSubscribe = (P.$BlockchainSubscribe) => Promise<R.BlockchainSubscribe$>;
export type CustomMessage = (P.$CustomMessage) => Promise<R.CustomMessage$>;
export type RequestLogin = (P.$RequestLogin) => Promise<R.RequestLogin$>;
export type ResetDevice = (P.$ResetDevice) => Promise<R.ResetDevice$>;

/* eslint-disable no-redeclare */
declare function F_CardanoGetAddress(params: (P.$Common & CARDANO.$CardanoGetAddress)): Promise<CARDANO.CardanoGetAddress$>;
declare function F_CardanoGetAddress(params: (P.$Common & { bundle: Array<CARDANO.$CardanoGetAddress> })): Promise<CARDANO.CardanoGetAddress$$>;
/* eslint-enable no-redeclare */
export type CardanoGetAddress = typeof F_CardanoGetAddress;

/* eslint-disable no-redeclare */
declare function F_CardanoGetPublicKey(params: (P.$Common & CARDANO.$CardanoGetPublicKey)): Promise<CARDANO.CardanoGetPublicKey$>;
declare function F_CardanoGetPublicKey(params: (P.$Common & { bundle: Array<CARDANO.$CardanoGetPublicKey> })): Promise<CARDANO.CardanoGetPublicKey$$>;
/* eslint-enable no-redeclare */
export type CardanoGetPublicKey = typeof F_CardanoGetPublicKey;

export type CardanoSignTransaction = (CARDANO.$CardanoSignTransaction) => Promise<CARDANO.CardanoSignTransaction$>;

/* eslint-disable no-redeclare */
declare function F_CipherKeyValue(params: (P.$Common & P.$CipherKeyValue)): Promise<R.CipherKeyValue$>;
declare function F_CipherKeyValue(params: (P.$Common & { bundle: Array<P.$CipherKeyValue> })): Promise<R.CipherKeyValue$$>;
/* eslint-enable no-redeclare */
export type CipherKeyValue = typeof F_CipherKeyValue;

export type ComposeTransaction = (P.$ComposeTransaction) => Promise<R.ComposeTransaction$>;

/* eslint-disable no-redeclare */
declare function F_EthereumGetAccountInfo(params: (ETHEREUM.$EthereumGetAccountInfo)): Promise<ETHEREUM.EthereumGetAccountInfo$>;
declare function F_EthereumGetAccountInfo(params: (ETHEREUM.$$EthereumGetAccountInfo)): Promise<ETHEREUM.EthereumGetAccountInfo$$>;
/* eslint-enable no-redeclare */
export type EthereumGetAccountInfo = typeof F_EthereumGetAccountInfo;

/* eslint-disable no-redeclare */
declare function F_EthereumGetAddress(params: (P.$Common & ETHEREUM.$EthereumGetAddress)): Promise<ETHEREUM.EthereumGetAddress$>;
declare function F_EthereumGetAddress(params: (P.$Common & { bundle: Array<ETHEREUM.$EthereumGetAddress> })): Promise<ETHEREUM.EthereumGetAddress$$>;
/* eslint-enable no-redeclare */
export type EthereumGetAddress = typeof F_EthereumGetAddress;

export type EthereumSignMessage = (ETHEREUM.$EthereumSignMessage) => Promise<ETHEREUM.EthereumSignMessage$>;
export type EthereumSignTransaction = (ETHEREUM.$EthereumSignTransaction) => Promise<ETHEREUM.EthereumSignTransaction$>;
export type EthereumVerifyMessage = (ETHEREUM.$EthereumVerifyMessage) => Promise<ETHEREUM.EthereumVerifyMessage$>;
export type GetAccountInfo = (P.$GetAccountInfo) => Promise<R.GetAccountInfo$>;

/* eslint-disable no-redeclare */
declare function F_GetAddress(params: (P.$Common & P.$GetAddress)): Promise<R.GetAddress$>;
declare function F_GetAddress(params: (P.$Common & { bundle: Array<P.$GetAddress> })): Promise<R.GetAddress$$>;
/* eslint-enable no-redeclare */
export type GetAddress = typeof F_GetAddress;

export type GetDeviceState = (P.$GetDeviceState) => Promise<R.GetDeviceState$>;
export type GetFeatures = (P.$GetFeatures) => Promise<R.GetFeatures$>;

/* eslint-disable no-redeclare */
declare function F_GetPublicKey(params: (P.$Common & P.$GetPublicKey)): Promise<R.GetPublicKey$>;
declare function F_GetPublicKey(params: (P.$Common & { bundle: Array<P.$GetPublicKey> })): Promise<R.GetPublicKey$$>;
/* eslint-enable no-redeclare */
export type GetPublicKey = typeof F_GetPublicKey;

/* eslint-disable no-redeclare */
declare function F_LiskGetAddress(params: (P.$Common & LISK.$LiskGetAddress)): Promise<LISK.LiskGetAddress$>;
declare function F_LiskGetAddress(params: (P.$Common & { bundle: Array<LISK.$LiskGetAddress> })): Promise<LISK.LiskGetAddress$$>;
/* eslint-enable no-redeclare */
export type LiskGetAddress = typeof F_LiskGetAddress;

/* eslint-disable no-redeclare */
declare function F_LiskGetPublicKey(params: (P.$Common & LISK.$LiskGetPublicKey)): Promise<LISK.LiskGetPublicKey$>;
declare function F_LiskGetPublicKey(params: (P.$Common & { bundle: Array<LISK.$LiskGetPublicKey> })): Promise<LISK.LiskGetPublicKey$$>;
/* eslint-enable no-redeclare */
export type LiskGetPublicKey = typeof F_LiskGetPublicKey;

export type LiskSignMessage = (LISK.$LiskSignMessage) => Promise<LISK.LiskSignMessage$>;
export type LiskSignTransaction = (LISK.$LiskSignTransaction) => Promise<LISK.LiskSignTransaction$>
export type LiskVerifyMessage = (LISK.$LiskVerifyMessage) => Promise<LISK.LiskVerifyMessage$>;

/* eslint-disable no-redeclare */
declare function F_NEMGetAddress(params: (P.$Common & NEM.$NEMGetAddress)): Promise<NEM.NEMGetAddress$>;
declare function F_NEMGetAddress(params: (P.$Common & { bundle: Array<NEM.$NEMGetAddress> })): Promise<NEM.NEMGetAddress$$>;

/* eslint-enable no-redeclare */
export type NEMGetAddress = typeof F_NEMGetAddress;

export type NEMSignTransaction = (NEM.$NEMSignTransaction) => Promise<NEM.NEMSignTransaction$>;
export type PushTransaction = (P.$PushTransaction) => Promise<R.PushTransaction$>;

/* eslint-disable no-redeclare */
declare function F_RippleGetAddress(params: (P.$Common & RIPPLE.$RippleGetAddress)): Promise<RIPPLE.RippleGetAddress$>;
declare function F_RippleGetAddress(params: (P.$Common & { bundle: Array<RIPPLE.$RippleGetAddress> })): Promise<RIPPLE.RippleGetAddress$$>;
/* eslint-enable no-redeclare */
export type RippleGetAddress = typeof F_RippleGetAddress;

export type RippleSignTransaction = (RIPPLE.$RippleSignTransaction) => Promise<RIPPLE.RippleSignTransaction$>;

export type SignMessage = (P.$SignMessage) => Promise<R.SignMessage$>;
export type SignTransaction = (P.$SignTransaction) => Promise<R.SignTransaction$>;

/* eslint-disable no-redeclare */
declare function F_StellarGetAddress(params: (P.$Common & STELLAR.$StellarGetAddress)): Promise<STELLAR.StellarGetAddress$>;
declare function F_StellarGetAddress(params: (P.$Common & { bundle: Array<STELLAR.$StellarGetAddress> })): Promise<STELLAR.StellarGetAddress$$>;
/* eslint-enable no-redeclare */
export type StellarGetAddress = typeof F_StellarGetAddress;

export type StellarSignTransaction = (STELLAR.$StellarSignTransaction) => Promise<STELLAR.StellarSignTransaction$>;
export type VerifyMessage = (P.$VerifyMessage) => Promise<R.VerifyMessage$>;
export type WipeDevice = (P.$WipeDevice) => Promise<R.WipeDevice$>;

// export * from './params';
export * from './response';
