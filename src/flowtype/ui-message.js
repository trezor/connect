import type { Device } from 'trezor-connect';
import type { CoreMessage, BrowserState } from 'flowtype';

declare module 'flowtype/ui-message' {

    declare type T_UI_EVENT = 'UI_EVENT';
    declare type T_UI = {
        IFRAME_HANDSHAKE: 'iframe_handshake',
        POPUP_HANDSHAKE: 'popup_handshake', // from popup constants
        CANCEL_POPUP_REQUEST: 'ui_cancel-popup-request', // from popup constants
        POPUP_OPENED: 'popup_opened', // from popup constants

        TRANSPORT: 'ui-no_transport',
        BOOTLOADER: 'ui-device_bootloader_mode',
        INITIALIZE: 'ui-device_not_initialized',
        FIRMWARE: 'ui-device_firmware_old',
        BROWSER_NOT_SUPPORTED: 'ui-browser_not_supported',
        BROWSER_OUTDATED: 'ui-browser_outdated',
        RECEIVE_BROWSER: 'ui-receive_browser',
        REQUEST_UI_WINDOW: 'ui-request_window',
        CLOSE_UI_WINDOW: 'ui-close_window',
        REQUEST_PERMISSION: 'ui-request_permission',
        REQUEST_CONFIRMATION: 'ui-request_confirmation',
        REQUEST_PIN: 'ui-request_pin',
        INVALID_PIN: 'ui-invalid_pin',
        REQUEST_PASSPHRASE: 'ui-request_passphrase',
        REQUEST_PASSPHRASE_ON_DEVICE: 'ui-request_passphrase_on_device',
        CONNECT: 'ui-connect',
        LOADING: 'ui-loading',
        SET_OPERATION: 'ui-set_operation',
        SELECT_DEVICE: 'ui-select_device',
        SELECT_ACCOUNT: 'ui-select_account',
        SELECT_FEE: 'ui-select_fee',
        UPDATE_CUSTOM_FEE: 'ui-update_custom_fee',
        INSUFFICIENT_FUNDS: 'ui-insufficient_funds',
        REQUEST_BUTTON: 'ui-button',
        RECEIVE_PERMISSION: 'ui-receive_permission',
        RECEIVE_CONFIRMATION: 'ui-receive_confirmation',
        RECEIVE_PIN: 'ui-receive_pin',
        RECEIVE_PASSPHRASE: 'ui-receive_passphrase',
        RECEIVE_DEVICE: 'ui-receive_device',
        CHANGE_ACCOUNT: 'ui-change_account',
        RECEIVE_ACCOUNT: 'ui-receive_account',
        RECEIVE_FEE: 'ui-receive_fee',
        CHANGE_SETTINGS: 'ui-change_settings',
    };

    declare type WithoutPayload = {
        +type: $PropertyType<T_UI, 'REQUEST_UI_WINDOW'> |
            $PropertyType<T_UI, 'CANCEL_POPUP_REQUEST'> |
            $PropertyType<T_UI, 'TRANSPORT'> |
            $PropertyType<T_UI, 'POPUP_OPENED'> |
            $PropertyType<T_UI, 'RECEIVE_BROWSER'> |
            $PropertyType<T_UI, 'CHANGE_ACCOUNT'> |
            $PropertyType<T_UI, 'CLOSE_UI_WINDOW'>
    }

    declare type IFrameHandshake = {
        +type: $PropertyType<T_UI, 'IFRAME_HANDSHAKE'>,
        payload: {
            browser: BrowserState;
        }
    }

    declare type PopupHandshake = {
        +type: $PropertyType<T_UI, 'POPUP_HANDSHAKE'>,
        payload?: {
            settings: any, // TODO
            method: any // TODO
        }
    }

    declare type RequestPermission = {
        +type: $PropertyType<T_UI, 'REQUEST_PERMISSION'>,
        payload: Array<string>
    }

    declare type ReceivePermission = {
        +type: $PropertyType<T_UI, 'RECEIVE_PERMISSION'>,
        payload: {
            granted: boolean;
            remember: boolean;
        }
    }

    declare type RequestConfirmation = {
        +type: $PropertyType<T_UI, 'REQUEST_CONFIRMATION'>,
        payload: {
            view: string,
            accountType: {
                account: number;
                legacy: boolean;
                label: string;
            }
        }
    }

    declare type ReceiveConfirmation = {
        +type: $PropertyType<T_UI, 'RECEIVE_CONFIRMATION'>,
        payload: string; // TODO: boolean
    }

    declare type ReceivePassphrase = {
        +type: $PropertyType<T_UI, 'RECEIVE_PASSPHRASE'>,
        payload: {
            save: boolean;
            value: string
        }
    }

    declare type ReceivePin = {
        +type: $PropertyType<T_UI, 'RECEIVE_PIN'>,
        payload: string
    }

    declare type BrowserMessage = {
        +type: $PropertyType<T_UI, 'BROWSER_NOT_SUPPORTED'> | $PropertyType<T_UI, 'BROWSER_OUTDATED'>,
        payload: BrowserState
    }

    declare type PassphraseOnDevice = {
        +type: $PropertyType<T_UI, 'REQUEST_PASSPHRASE_ON_DEVICE'> |
            $PropertyType<T_UI, 'REQUEST_BUTTON'> |
            $PropertyType<T_UI, 'REQUEST_PIN'> |
            $PropertyType<T_UI, 'REQUEST_PASSPHRASE'> |
            $PropertyType<T_UI, 'INVALID_PIN'>,
        payload: {
            device: Device
        }
    }

    declare type SelectDevice = {
        +type: $PropertyType<T_UI, 'SELECT_DEVICE'>,
        payload: {
            devices: Array<Device>;
            webusb: boolean;
        }
    }

    declare type ReceiveDevice = {
        +type: $PropertyType<T_UI, 'RECEIVE_DEVICE'>,
        payload: {
            device: boolean;
            remember: boolean;
        }
    }

    declare type ReceiveAccount = {
        +type: $PropertyType<T_UI, 'RECEIVE_ACCOUNT'>,
        payload: ?string
    }

    declare type ReceiveFee = {
        +type: $PropertyType<T_UI, 'RECEIVE_FEE'>,
        payload: {
            type: string;
            value: string | number; // TODO
        }
    }

    declare type UnexpectedDeviceMode = {
        +type: $PropertyType<T_UI, 'BOOTLOADER'> | $PropertyType<T_UI, 'INITIALIZE'> | $PropertyType<T_UI, 'FIRMWARE'>,
        payload: Device
    }

    declare export type UiMessage = IFrameHandshake
        | PopupHandshake
        | SelectDevice
        | ReceiveDevice;


    declare function MessageFactory(type: $PropertyType<WithoutPayload, 'type'>): CoreMessage;

    declare function MessageFactory(type: $PropertyType<IFrameHandshake, 'type'>, payload: $PropertyType<IFrameHandshake, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<PopupHandshake, 'type'>, payload: $PropertyType<PopupHandshake, 'payload'>): CoreMessage;

    declare function MessageFactory(type: $PropertyType<BrowserMessage, 'type'>, payload: $PropertyType<BrowserMessage, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<PassphraseOnDevice, 'type'>, payload: $PropertyType<PassphraseOnDevice, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<RequestPermission, 'type'>, payload: $PropertyType<RequestPermission, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<RequestConfirmation, 'type'>, payload: $PropertyType<RequestConfirmation, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<ReceiveConfirmation, 'type'>, payload: $PropertyType<ReceiveConfirmation, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<ReceivePermission, 'type'>, payload: $PropertyType<ReceivePermission, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<ReceivePassphrase, 'type'>, payload: $PropertyType<ReceivePassphrase, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<ReceivePin, 'type'>, payload: $PropertyType<ReceivePin, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<ReceiveAccount, 'type'>, payload: $PropertyType<ReceiveAccount, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<ReceiveFee, 'type'>, payload: $PropertyType<ReceiveFee, 'payload'>): CoreMessage;

    declare function MessageFactory(type: $PropertyType<SelectDevice, 'type'>, payload: $PropertyType<SelectDevice, 'payload'>): CoreMessage;
    declare function MessageFactory(type: $PropertyType<ReceiveDevice, 'type'>, payload: $PropertyType<ReceiveDevice, 'payload'>): CoreMessage;

    declare function MessageFactory(type: $PropertyType<UnexpectedDeviceMode, 'type'>, payload: $PropertyType<UnexpectedDeviceMode, 'payload'>): CoreMessage;

    declare export type UiMessageFactory = typeof MessageFactory;

}

