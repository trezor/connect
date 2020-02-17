import { TRANSPORT, TRANSPORT_EVENT, UI, IFRAME, POPUP } from './constants';
import { ConnectSettings } from './params';
import { Device } from './trezor/device';
import { DiscoveryAccount, SelectFeeLevel } from './account';
import { CoinInfo, BitcoinNetworkInfo } from './networks/coinInfo';

export interface TransportInfo {
    type: string;
    version: string;
    outdated: boolean;
}

export type TransportEvent =
    | {
          event: typeof TRANSPORT_EVENT;
          type: typeof TRANSPORT.START;
          payload: TransportInfo;
      }
    | {
          event: typeof TRANSPORT_EVENT;
          type: typeof TRANSPORT.ERROR;
          payload: string;
      };

/*
 * messages to UI emitted as UI_EVENT
 */

export interface MessageWithoutPayload {
    type:
        | typeof UI.REQUEST_UI_WINDOW
        | typeof POPUP.CANCEL_POPUP_REQUEST
        | typeof IFRAME.LOADED
        | typeof POPUP.LOADED
        | typeof UI.TRANSPORT
        | typeof UI.CHANGE_ACCOUNT
        | typeof UI.INSUFFICIENT_FUNDS
        | typeof UI.CLOSE_UI_WINDOW
        | typeof UI.LOGIN_CHALLENGE_REQUEST;
}

export interface DeviceMessage {
    type:
        | typeof UI.REQUEST_PIN
        | typeof UI.INVALID_PIN
        | typeof UI.REQUEST_PASSPHRASE_ON_DEVICE
        | typeof UI.REQUEST_PASSPHRASE
        | typeof UI.INVALID_PASSPHRASE
        | typeof UI.REQUEST_WORD;
    payload: {
        device: Device;
        type?: string; // todo: better flow enum
    };
}

export interface ButtonRequestData {
    type: 'address';
    serializedPath: string;
    address: string;
}

export interface ButtonRequestMessage {
    type: typeof UI.REQUEST_BUTTON;
    payload: {
        device: Device;
        code: string;
        data?: ButtonRequestData;
    };
}

export interface AddressValidationMessage {
    type: typeof UI.ADDRESS_VALIDATION;
    payload?: ButtonRequestData;
}

export interface FrameError {
    type: typeof IFRAME.ERROR;
    payload: {
        error: string;
    };
}

export interface PopupInit {
    type: typeof POPUP.INIT;
    payload: {
        settings: ConnectSettings; // those are settings from window.opener
    };
}

export interface PopupError {
    type: typeof POPUP.ERROR;
    payload: {
        error: string;
    };
}

export interface PopupHandshake {
    type: typeof POPUP.HANDSHAKE;
    payload?: {
        settings: ConnectSettings; // those are settings from the iframe, they could be different from window.opener settings
        method?: string;
        transport?: TransportInfo;
    };
}

export interface RequestPermission {
    type: typeof UI.REQUEST_PERMISSION;
    payload: {
        permissions: string[];
        device: Device;
    };
}

export interface RequestConfirmation {
    type: typeof UI.REQUEST_CONFIRMATION;
    payload: {
        view: string;
        label?: string;
        customConfirmButton?: {
            className: string;
            label: string;
        };
        customCancelButton?: {
            className: string;
            label: string;
        };
    };
}

export interface SelectDevice {
    type: typeof UI.SELECT_DEVICE;
    payload: {
        devices: Device[];
        webusb: boolean;
    };
}

export interface UnexpectedDeviceMode {
    type:
        | typeof UI.BOOTLOADER
        | typeof UI.NOT_IN_BOOTLOADER
        | typeof UI.INITIALIZE
        | typeof UI.SEEDLESS
        | typeof UI.DEVICE_NEEDS_BACKUP;
    payload: Device;
}

export interface FirmwareException {
    type:
        | typeof UI.FIRMWARE_OLD
        | typeof UI.FIRMWARE_OUTDATED
        | typeof UI.FIRMWARE_NOT_SUPPORTED
        | typeof UI.FIRMWARE_NOT_COMPATIBLE
        | typeof UI.FIRMWARE_NOT_INSTALLED;
    payload: Device;
}

export interface SelectAccount {
    type: typeof UI.SELECT_ACCOUNT;
    payload: {
        type: 'start' | 'progress' | 'end';
        coinInfo: CoinInfo;
        accountTypes?: Array<'normal' | 'segwit' | 'legacy'>;
        accounts?: DiscoveryAccount[];
        preventEmpty?: boolean;
    };
}

export interface SelectFee {
    type: typeof UI.SELECT_FEE;
    payload: {
        coinInfo: BitcoinNetworkInfo;
        feeLevels: SelectFeeLevel[];
    };
}

export interface UpdateCustomFee {
    type: typeof UI.UPDATE_CUSTOM_FEE;
    payload: {
        coinInfo: BitcoinNetworkInfo;
        feeLevels: SelectFeeLevel[];
    };
}

export interface BundleProgress {
    type: typeof UI.BUNDLE_PROGRESS;
    payload: {
        progress: number;
        response: object;
    };
}

export interface FirmwareProgress {
    type: typeof UI.FIRMWARE_PROGRESS;
    payload: {
        device: Device;
        progress: number;
    };
}

/*
 * Callback message for CustomMessage method
 */
export interface CustomMessageRequest {
    type: typeof UI.CUSTOM_MESSAGE_REQUEST;
    payload: {
        type: string;
        message: object;
    };
}

export type UiEvent =
    | MessageWithoutPayload
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
    | CustomMessageRequest;

export interface ReceivePermission {
    type: typeof UI.RECEIVE_PERMISSION;
    payload: {
        granted: boolean;
        remember: boolean;
    };
}

export interface ReceiveConfirmation {
    type: typeof UI.RECEIVE_CONFIRMATION;
    payload: boolean;
}

export interface ReceiveDevice {
    type: typeof UI.RECEIVE_DEVICE;
    payload: {
        device: Device;
        remember: boolean;
    };
}

export interface ReceivePin {
    type: typeof UI.RECEIVE_PIN;
    payload: string;
}

export interface ReceiveWord {
    type: typeof UI.RECEIVE_WORD;
    payload: string;
}

export interface ReceivePassphrase {
    type: typeof UI.RECEIVE_PASSPHRASE;
    payload: {
        save: boolean;
        value: string;
        passphraseOnDevice?: boolean;
    };
}

export interface ReceivePassphraseAction {
    type: typeof UI.INVALID_PASSPHRASE_ACTION;
    payload: boolean;
}

export interface ReceiveAccount {
    type: typeof UI.RECEIVE_ACCOUNT;
    payload?: number;
}

export interface ReceiveFee {
    type: typeof UI.RECEIVE_FEE;
    payload:
        | {
              type: 'compose-custom';
              value: number;
          }
        | {
              type: 'change-account';
          }
        | {
              type: 'send';
              value: string;
          };
}

export type UiResponse =
    | ReceivePermission
    | ReceiveConfirmation
    | ReceiveDevice
    | ReceivePin
    | ReceiveWord
    | ReceivePassphrase
    | ReceivePassphraseAction
    | ReceiveAccount
    | ReceiveFee
    | CustomMessageRequest;
