/* @flow */

import type { Device, CoreMessage } from './index';

import * as POPUP from '../constants/popup';
import * as UI from '../constants/ui';

import type { BitcoinAccount } from './account';
import type { BitcoinNetworkInfo } from './coinInfo';
import type { SelectFeeLevel } from './fee';

import type { UiResponseFactory } from './uiResponse';
import type { ConnectSettings } from '../data/ConnectSettings';

export type TransportInfo = {
    type: string,
    version: string,
    outdated: boolean,
}

export type BrowserState = {
    name: string,
    osname: string,
    supported: boolean,
    outdated: boolean,
    mobile: boolean,
}

/*
* Messages without payload
*/

export type MessageWithoutPayload = {
    +type: typeof UI.REQUEST_UI_WINDOW |
        typeof POPUP.CANCEL_POPUP_REQUEST |
        typeof POPUP.OPENED |
        typeof UI.TRANSPORT |
        typeof UI.RECEIVE_BROWSER |
        typeof UI.CHANGE_ACCOUNT |
        typeof UI.INSUFFICIENT_FUNDS |
        typeof UI.CLOSE_UI_WINDOW |
        typeof UI.LOGIN_CHALLENGE_REQUEST,
}

/*
* Common message to UI with assigned device
*/

export type DeviceMessage = {
    +type: typeof UI.REQUEST_PIN |
        typeof UI.INVALID_PIN |
        typeof UI.REQUEST_PASSPHRASE_ON_DEVICE |
        typeof UI.REQUEST_PASSPHRASE |
        typeof UI.INVALID_PASSPHRASE |
        typeof UI.REQUEST_WORD,
    payload: {
        device: Device,
        type?: string, // todo: better flow enum
    },
};

export type ButtonRequestAddressData = {|
    type: 'address',
    serializedPath: string,
    address: string,
|};

export type ButtonRequestData = ButtonRequestAddressData;

export type ButtonRequestMessage = {
    +type: typeof UI.REQUEST_BUTTON,
    payload: {
        device: Device,
        code: string,
        data: ?ButtonRequestData,
    },
}

export type AddressValidationMessage = {
    +type: typeof UI.ADDRESS_VALIDATION,
    payload: ?ButtonRequestData,
}

/*
* Messages to UI
*/

export type IFrameHandshake = {
    +type: typeof UI.IFRAME_HANDSHAKE,
    payload: {
        browser: BrowserState,
    },
}

export type PopupHandshake = {
    +type: typeof POPUP.HANDSHAKE,
    payload?: {
        settings: ConnectSettings,
        method: ?string,
        transport: ?TransportInfo,
    },
}

export type RequestPermission = {
    +type: typeof UI.REQUEST_PERMISSION,
    payload: {
        permissions: Array<string>,
        device: Device,
    },
}

export type RequestConfirmation = {
    +type: typeof UI.REQUEST_CONFIRMATION,
    payload: {
        view: string,
        label?: string,
        customConfirmButton?: {
            className: string,
            label: string,
        },
        customCancelButton?: {
            className: string,
            label: string,
        },
    },
}

export type SelectDevice = {
    +type: typeof UI.SELECT_DEVICE,
    payload: {
        devices: Array<Device>,
        webusb: boolean,
    },
}

export type BrowserMessage = {
    +type: typeof UI.BROWSER_NOT_SUPPORTED | typeof UI.BROWSER_OUTDATED,
    payload: BrowserState,
}

export type UnexpectedDeviceMode = {
    +type: typeof UI.BOOTLOADER | typeof UI.NOT_IN_BOOTLOADER | typeof UI.INITIALIZE | typeof UI.SEEDLESS | typeof UI.DEVICE_NEEDS_BACKUP,
    payload: Device,
}

export type FirmwareException = {
    +type: typeof UI.FIRMWARE_OLD
        | typeof UI.FIRMWARE_OUTDATED
        | typeof UI.FIRMWARE_NOT_SUPPORTED
        | typeof UI.FIRMWARE_NOT_COMPATIBLE
        | typeof UI.FIRMWARE_NOT_INSTALLED,
    payload: Device,
}

export type SelectAccount = {
    +type: typeof UI.SELECT_ACCOUNT,
    payload: {
        accounts: Array<BitcoinAccount>,
        coinInfo: BitcoinNetworkInfo,
        complete?: boolean,
        start?: boolean,
        checkBalance?: boolean,
    },
}

export type SelectFee = {
    +type: typeof UI.SELECT_FEE,
    payload: {
        coinInfo: BitcoinNetworkInfo,
        feeLevels: Array<SelectFeeLevel>,
    },
}

export type UpdateCustomFee = {
    +type: typeof UI.UPDATE_CUSTOM_FEE,
    payload: {
        coinInfo: BitcoinNetworkInfo,
        level: SelectFeeLevel,
    },
}

export type BundleProgress = {
    +type: typeof UI.BUNDLE_PROGRESS,
    payload: {
        progress: number,
        response: Object,
    },
}

export type UiRequest =
    MessageWithoutPayload
    | DeviceMessage
    | IFrameHandshake
    | PopupHandshake
    | RequestPermission
    | RequestConfirmation
    | SelectDevice
    | BrowserMessage
    | UnexpectedDeviceMode
    | SelectAccount
    | SelectFee
    | UpdateCustomFee
    | BundleProgress

/* eslint-disable no-redeclare */
declare function MessageFactory(type: $PropertyType<MessageWithoutPayload, 'type'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<DeviceMessage, 'type'>, payload: $PropertyType<DeviceMessage, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ButtonRequestMessage, 'type'>, payload: $PropertyType<ButtonRequestMessage, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<AddressValidationMessage, 'type'>, payload: $PropertyType<AddressValidationMessage, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<IFrameHandshake, 'type'>, payload: $PropertyType<IFrameHandshake, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<PopupHandshake, 'type'>, payload: $PropertyType<PopupHandshake, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<RequestPermission, 'type'>, payload: $PropertyType<RequestPermission, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<RequestConfirmation, 'type'>, payload: $PropertyType<RequestConfirmation, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<SelectDevice, 'type'>, payload: $PropertyType<SelectDevice, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BrowserMessage, 'type'>, payload: $PropertyType<BrowserMessage, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<UnexpectedDeviceMode, 'type'>, payload: $PropertyType<UnexpectedDeviceMode, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<FirmwareException, 'type'>, payload: $PropertyType<FirmwareException, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<SelectAccount, 'type'>, payload: $PropertyType<SelectAccount, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<SelectFee, 'type'>, payload: $PropertyType<SelectFee, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<UpdateCustomFee, 'type'>, payload: $PropertyType<UpdateCustomFee, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BundleProgress, 'type'>, payload: $PropertyType<BundleProgress, 'payload'>): CoreMessage;
/* eslint-enable no-redeclare */

export type UiMessageFactory = UiResponseFactory & typeof MessageFactory;
