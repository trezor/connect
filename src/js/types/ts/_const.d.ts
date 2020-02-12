/* eslint-disable flowtype/no-types-missing-file-annotation */

export namespace DEVICE {
    // device list events
    export const CONNECT = 'device-connect';
    export const CONNECT_UNACQUIRED = 'device-connect_unacquired';
    export const DISCONNECT = 'device-disconnect';
    export const CHANGED = 'device-changed';
    export const ACQUIRE = 'device-acquire';
    export const RELEASE = 'device-release';
    export const ACQUIRED = 'device-acquired';
    export const RELEASED = 'device-released';
    export const USED_ELSEWHERE = 'device-used_elsewhere';

    export const LOADING = 'device-loading';

    // trezor-link events in protobuf format
    export const BUTTON = 'button';
    export const PIN = 'pin';
    export const PASSPHRASE = 'passphrase';
    export const PASSPHRASE_ON_DEVICE = 'passphrase_on_device';
    export const WORD = 'word';

    // custom
    export const WAIT_FOR_SELECTION = 'device-wait_for_selection';

    // this string has different prefix than other constants and it's used as device path
    export const UNREADABLE = 'unreadable-device';
}
export const DEVICE_EVENT = 'DEVICE_EVENT';

export namespace TRANSPORT {
    export const START = 'transport-start';
    export const ERROR = 'transport-error';
    export const UPDATE = 'transport-update';
    export const STREAM = 'transport-stream';
    export const REQUEST = 'transport-request_device';
    export const RECONNECT = 'transport-reconnect';
    export const DISABLE_WEBUSB = 'transport-disable_webusb';
    export const START_PENDING = 'transport-start_pending';
}
export const TRANSPORT_EVENT = 'TRANSPORT_EVENT';

export namespace UI {
    export const TRANSPORT = 'ui-no_transport';
    export const BOOTLOADER = 'ui-device_bootloader_mode';
    export const NOT_IN_BOOTLOADER = 'ui-device_not_in_bootloader_mode';
    export const REQUIRE_MODE = 'ui-device_require_mode';
    export const INITIALIZE = 'ui-device_not_initialized';
    export const SEEDLESS = 'ui-device_seedless';
    export const FIRMWARE_OLD = 'ui-device_firmware_old';
    export const FIRMWARE_OUTDATED = 'ui-device_firmware_outdated';
    export const FIRMWARE_NOT_SUPPORTED = 'ui-device_firmware_unsupported';
    export const FIRMWARE_NOT_COMPATIBLE = 'ui-device_firmware_not_compatible';
    export const FIRMWARE_NOT_INSTALLED = 'ui-device_firmware_not_installed';
    export const DEVICE_NEEDS_BACKUP = 'ui-device_needs_backup';
    export const BROWSER_NOT_SUPPORTED = 'ui-browser_not_supported';
    export const BROWSER_OUTDATED = 'ui-browser_outdated';
    export const RECEIVE_BROWSER = 'ui-receive_browser';

    export const REQUEST_UI_WINDOW = 'ui-request_window';
    export const CLOSE_UI_WINDOW = 'ui-close_window';

    export const REQUEST_PERMISSION = 'ui-request_permission';
    export const REQUEST_CONFIRMATION = 'ui-request_confirmation';
    export const REQUEST_PIN = 'ui-request_pin';
    export const INVALID_PIN = 'ui-invalid_pin';
    export const REQUEST_PASSPHRASE = 'ui-request_passphrase';
    export const REQUEST_PASSPHRASE_ON_DEVICE = 'ui-request_passphrase_on_device';
    export const INVALID_PASSPHRASE = 'ui-invalid_passphrase';
    export const INVALID_PASSPHRASE_ACTION = 'ui-invalid_passphrase_action';
    export const CONNECT = 'ui-connect';
    export const LOADING = 'ui-loading';
    export const SET_OPERATION = 'ui-set_operation';
    export const SELECT_DEVICE = 'ui-select_device';
    export const SELECT_ACCOUNT = 'ui-select_account';
    export const SELECT_FEE = 'ui-select_fee';
    export const UPDATE_CUSTOM_FEE = 'ui-update_custom_fee';
    export const INSUFFICIENT_FUNDS = 'ui-insufficient_funds';
    export const REQUEST_BUTTON = 'ui-button';
    export const REQUEST_WORD = 'ui-request_word';

    export const RECEIVE_PERMISSION = 'ui-receive_permission';
    export const RECEIVE_CONFIRMATION = 'ui-receive_confirmation';
    export const RECEIVE_PIN = 'ui-receive_pin';
    export const RECEIVE_PASSPHRASE = 'ui-receive_passphrase';
    export const RECEIVE_DEVICE = 'ui-receive_device';
    export const CHANGE_ACCOUNT = 'ui-change_account';
    export const RECEIVE_ACCOUNT = 'ui-receive_account';
    export const RECEIVE_FEE = 'ui-receive_fee';
    export const RECEIVE_WORD = 'ui-receive_word';

    export const CHANGE_SETTINGS = 'ui-change_settings';

    export const CUSTOM_MESSAGE_REQUEST = 'ui-custom_request';
    export const CUSTOM_MESSAGE_RESPONSE = 'ui-custom_response';

    export const LOGIN_CHALLENGE_REQUEST = 'ui-login_challenge_request';
    export const LOGIN_CHALLENGE_RESPONSE = 'ui-login_challenge_response';

    export const BUNDLE_PROGRESS = 'ui-bundle_progress';
    export const ADDRESS_VALIDATION = 'ui-address_validation';
    export const FIRMWARE_PROGRESS = 'ui-firmware_progress';
}
export const UI_EVENT = 'UI_EVENT';

export namespace BLOCKCHAIN {
    export const CONNECT = 'blockchain-connect';
    export const ERROR = 'blockchain-error';
    export const NOTIFICATION = 'blockchain-notification';
    export const BLOCK = 'blockchain-block';
}
export const BLOCKCHAIN_EVENT = 'BLOCKCHAIN_EVENT';

export namespace IFRAME {
    export const BOOTSTRAP = 'iframe-bootstrap';
    export const LOADED = 'iframe-loaded';
    export const INIT = 'iframe-init';
    export const ERROR = 'iframe-error';
    export const CALL = 'iframe-call';
}
