/* @flow */

import type { Device, CoreMessage } from './index';

import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';

import type { DiscoveryAccount } from './account';
import type { BitcoinNetworkInfo, CoinInfo } from './coinInfo';
import type { SelectFeeLevel } from './fee';

import type { UiResponseFactory } from './uiResponse';
import type { ConnectSettings } from '../data/ConnectSettings';

export type TransportInfo = {
    type: string,
    version: string,
    outdated: boolean,
}

/*
* Messages without payload
*/

export type MessageWithoutPayload = {
    +type: typeof UI.REQUEST_UI_WINDOW |
        typeof POPUP.CANCEL_POPUP_REQUEST |
        typeof IFRAME.LOADED |
        typeof POPUP.LOADED |
        typeof UI.TRANSPORT |
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

export type IFrameError = {
    type: typeof IFRAME.ERROR,
    payload: {
        error: string,
    },
}

export type PopupInit = {
    +type: typeof POPUP.INIT,
    payload: {
        settings: ConnectSettings, // those are settings from window.opener
    },
}

export type PopupError = {
    type: typeof POPUP.ERROR,
    payload: {
        error: string,
    },
}

export type PopupHandshake = {
    +type: typeof POPUP.HANDSHAKE,
    payload?: {
        settings: ConnectSettings, // those are settings from the iframe, they could be different from window.opener settings
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
        type: 'start' | 'progress' | 'end',
        coinInfo: CoinInfo,
        accountTypes?: Array<'normal' | 'segwit' | 'legacy'>,
        accounts?: Array<DiscoveryAccount>,
        preventEmpty?: boolean,
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
        feeLevels: Array<SelectFeeLevel>,
    },
}

export type BundleProgress = {
    +type: typeof UI.BUNDLE_PROGRESS,
    payload: {
        progress: number,
        response: Object,
    },
}

export type FirmwareProgress = {
    +type: typeof UI.FIRMWARE_PROGRESS,
    payload: {
        device: Device,
        progress: number,
    },
}

export type UiRequest =
    MessageWithoutPayload
    | DeviceMessage
    | PopupHandshake
    | RequestPermission
    | RequestConfirmation
    | SelectDevice
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
declare function MessageFactory(type: $PropertyType<IFrameError, 'type'>, payload: $PropertyType<IFrameError, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<PopupError, 'type'>, payload: $PropertyType<PopupError, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<PopupHandshake, 'type'>, payload: $PropertyType<PopupHandshake, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<RequestPermission, 'type'>, payload: $PropertyType<RequestPermission, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<RequestConfirmation, 'type'>, payload: $PropertyType<RequestConfirmation, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<SelectDevice, 'type'>, payload: $PropertyType<SelectDevice, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<UnexpectedDeviceMode, 'type'>, payload: $PropertyType<UnexpectedDeviceMode, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<FirmwareException, 'type'>, payload: $PropertyType<FirmwareException, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<SelectAccount, 'type'>, payload: $PropertyType<SelectAccount, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<SelectFee, 'type'>, payload: $PropertyType<SelectFee, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<UpdateCustomFee, 'type'>, payload: $PropertyType<UpdateCustomFee, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BundleProgress, 'type'>, payload: $PropertyType<BundleProgress, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<FirmwareProgress, 'type'>, payload: $PropertyType<FirmwareProgress, 'payload'>): CoreMessage;

/* eslint-enable no-redeclare */

export type UiMessageFactory = UiResponseFactory & typeof MessageFactory;
