/* @flow */

export class TrezorError extends Error {
    code: number | string;
    message: string;

    constructor(code: number | string, message: string) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

export const invalidParameter = (message: string): TrezorError => {
    return new TrezorError('Connect_InvalidParameter', message);
};

// level 100 error during initialization
export const NO_IFRAME: TrezorError = new TrezorError(100, 'TrezorConnect not yet initialized');
export const IFRAME_BLOCKED: TrezorError = new TrezorError('iframe_blocked', 'TrezorConnect iframe was blocked');
export const IFRAME_INITIALIZED: TrezorError = new TrezorError(101, 'TrezorConnect has been already initialized');
export const IFRAME_TIMEOUT: TrezorError = new TrezorError(102, 'Iframe timeout');
export const POPUP_TIMEOUT: TrezorError = new TrezorError(103, 'Popup timeout');
export const BROWSER_NOT_SUPPORTED: TrezorError = new TrezorError(104, 'Browser not supported');
export const MANIFEST_NOT_SET: TrezorError = new TrezorError(105, 'Manifest not set. Read more at https://github.com/trezor/connect/blob/develop/docs/index.md');
export const MANAGEMENT_NOT_ALLOWED: TrezorError = new TrezorError(105, 'Management method not allowed for this configuration');

export const NO_TRANSPORT: TrezorError = new TrezorError(500, 'Transport is missing');
export const WRONG_TRANSPORT_CONFIG: TrezorError = new TrezorError(5002, 'Wrong config response'); // config_signed
export const DEVICE_NOT_FOUND: TrezorError = new TrezorError(501, 'Device not found');
// export const DEVICE_CALL_IN_PROGRESS: TrezorError = new TrezorError(502, "Device call in progress.");
export const DEVICE_CALL_IN_PROGRESS: TrezorError = new TrezorError(503, 'Device call in progress');
export const INVALID_PARAMETERS: TrezorError = new TrezorError(504, 'Invalid parameters');
export const POPUP_CLOSED = new Error('Popup closed');

export const PERMISSIONS_NOT_GRANTED: TrezorError = new TrezorError(403, 'Permissions not granted');

export const DEVICE_USED_ELSEWHERE: TrezorError = new TrezorError(700, 'Device is used in another window');
export const INITIALIZATION_FAILED: TrezorError = new TrezorError('Failure_Initialize', 'Initialization failed');

export const CALL_OVERRIDE: TrezorError = new TrezorError('Failure_ActionOverride', 'override');
export const INVALID_STATE: TrezorError = new TrezorError('Failure_PassphraseState', 'Passphrase is incorrect');

// a slight hack
// this error string is hard-coded
// in both bridge and extension
export const WRONG_PREVIOUS_SESSION_ERROR_MESSAGE: string = 'wrong previous session';
export const INVALID_PIN_ERROR_MESSAGE: string = 'PIN invalid';
export const WEBUSB_ERROR_MESSAGE: string = 'NetworkError: Unable to claim interface.';

// BlockBook
export const backendNotSupported = (coinName: string): TrezorError => {
    return new TrezorError('backend_error', `BlockchainLink support not found for ${coinName}`);
};
export const BACKEND_NO_URL: TrezorError = new TrezorError('Backend_init', 'Url not found');

export const NO_COIN_INFO: TrezorError = invalidParameter('Coin not found.');

