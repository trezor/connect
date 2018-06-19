/* @flow */

declare module 'trezor-connect' {

    // CONSTANTS (from trezor-connect/src/js/constants)

    declare export type T_POPUP = {
        // LOG: 'popup_log',
        OPENED: 'popup_opened',
        // OPEN_TIMEOUT: 'popup_open_timeout',
        HANDSHAKE: 'popup_handshake',
        // CLOSE: 'popup_close',
        // CLOSED: 'popup_closed',
        CANCEL_POPUP_REQUEST: 'ui_cancel-popup-request',
    }

    declare type T_DEVICE_EVENT = 'DEVICE_EVENT';
    declare type T_DEVICE = {
        CONNECT: 'device__connect',
        CONNECT_UNACQUIRED: 'device__connect_unacquired',
        DISCONNECT: 'device__disconnect',
        DISCONNECT_UNACQUIRED: 'device__disconnect_unacquired',

        ACQUIRE: 'device__acquire', // remove? internal
        RELEASE: 'device__release', // internal
        ACQUIRED: 'device__acquired',
        RELEASED: 'device__released', // internal
        USED_ELSEWHERE: 'device__used_elsewhere', // internal
        CHANGED: 'device__changed',

        LOADING: 'device__loading', // internal

        // trezor-link events
        BUTTON: 'button',
        PIN: 'pin',
        PASSPHRASE: 'passphrase',
        PASSPHRASE_ON_DEVICE: 'passphrase_on_device',
        WORD: 'word',

        // custom (not emitted)
        // AUTHENTICATED: 'device__authenticated',
        // WAIT_FOR_SELECTION: 'device__wait_for_selection',
    };

    declare export type T_UI_EVENT = 'UI_EVENT';
    declare export type T_UI = {
        IFRAME_HANDSHAKE: 'iframe_handshake',
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
        CUSTOM_MESSAGE_REQUEST: 'ui-custom_request',
        CUSTOM_MESSAGE_RESPONSE: 'ui-custom_response',
    };

    declare type T_TRANSPORT_EVENT = 'TRANSPORT_EVENT';
    declare type T_TRANSPORT = {
        START: 'transport__start',
        ERROR: 'transport__error',
        UPDATE: 'transport__update',
        STREAM: 'transport__stream',
        REQUEST: 'transport__request_device',
        UNREADABLE: 'transport__unreadable_hid_device',
        RECONNECT: 'transport__reconnect'
    };


    declare type T_RESPONSE_EVENT = 'RESPONSE_EVENT';
    declare export type ResponseMessage = {
        event: T_RESPONSE_EVENT;
        type: T_RESPONSE_EVENT;
        id: number;
        success: boolean;
        payload: Object;
    }

    declare export type UiMessageType = $Values<T_UI>;
    declare export type UiMessage = {
        event: string;
        type: UiMessageType;
        // payload: Object;
        payload: {
            device: Device;
            code?: string;
            browser?: any;
        }
    }

    declare export type DeviceMessageType = $Values<T_DEVICE>;
    declare export type DeviceMessage = {
        event: string;
        type: DeviceMessageType;
        payload: Device;
    }

    declare export type TransportMessageType = $Values<T_TRANSPORT>;
    declare export type TransportMessage = {
        event: string;
        type: TransportMessageType;
        payload: Object;
    }

    declare export type Device = {
        path: string,
        label: string,
        isUsedElsewhere: boolean,
        featuresNeedsReload: boolean,
        features?: Features,
        unacquired?: boolean,
        unreadable?: boolean,
    }

    declare export type Features = {
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
        // coins: CoinType[],
        coins: Array<any>,
        initialized: boolean,
        revision: string,
        bootloader_hash: string,
        imported: boolean,
        pin_cached: boolean,
        passphrase_cached: boolean,
        state?: string;
        needs_backup?: boolean,
        firmware_present?: boolean,
    }

    // declare export interface TrezorConnect = {
    //     on: (type: string, handler: (event: any) => void) => void;
    // }

    declare type OnEvents = "device__event";

    // declare type TRANSPORT = {
    //     ERROR: 'transport__error';
    //     READY: 'transport__ready';
    // }

    declare type DeviceEventListener = (type: T_DEVICE_EVENT, handler: (event: DeviceMessage) => void) => void;
    declare type DeviceEventListenerByType = (type: DeviceMessageType, handler: (device: Device) => void) => void;
    declare type UiEventListener = (type: T_UI_EVENT, handler: (event: UiMessage) => void) => void;
    declare type TransportEventListener = (type: T_TRANSPORT_EVENT, handler: (event: TransportMessage) => void) => void;


    import type {
        R_GetDeviceState,
        R_GetFeatures,
        R_GetPublicKey,
        R_EthereumGetAddress,
        R_EthereumSignTransaction,
    } from 'trezor-connect/response';

    import type {
        P_EthereumGetAddress,
        P_EthereumSignTransaction
    } from 'trezor-connect/params';

    declare module.exports: {
        init: (options: Object) => Promise<Object>;
        on: DeviceEventListener & DeviceEventListenerByType & UiEventListener & TransportEventListener;
        off: (type: string, handler: (event: any) => void) => void;
        getVersion: () => any;
        renderWebUSBButton: (className?: string) => void;
        uiResponse: (options: Object) => void;

        customMessage: (options: Object) => Promise<Object>;
        cipherKeyValue: (options: Object) => Promise<Object>;
        ethereumGetAddress: (options: P_EthereumGetAddress) => Promise<R_EthereumGetAddress>;
        ethereumSignTransaction: (options: P_EthereumSignTransaction) => Promise<R_EthereumSignTransaction>;
        ethereumSignMessage: (options: Object) => Promise<Object>;
        ethereumVerifyMessage: (options: Object) => Promise<Object>;
        getDeviceState: (options: Object) => Promise<R_GetDeviceState>;
        getFeatures: (options: Object) => Promise<R_GetFeatures>;
        getPublicKey: (options: Object) => Promise<R_GetPublicKey>;
        nemGetAddress: (options: Object) => Promise<Object>;
        nemSignTransaction: (options: Object) => Promise<Object>;
        stellarGetAddress: (options: Object) => Promise<Object>;
        stellarGetPublicKey: (options: Object) => Promise<Object>;
        stellarSignTransaction: (options: Object) => Promise<Object>;

        DEVICE_EVENT: T_DEVICE_EVENT;
        DEVICE: T_DEVICE;

        UI_EVENT: T_UI_EVENT;
        UI: T_UI;

        TRANSPORT_EVENT: T_TRANSPORT_EVENT;
        TRANSPORT: T_TRANSPORT;
    };
}
