/* @flow */
'use strict';

export class TrezorError extends Error {
    code: number | string;
    message: string;

    constructor(code: number | string, message: string) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

// level 100 error during initialization
export const NO_IFRAME: TrezorError = new TrezorError(100, 'Trezor.js not yet initialized');
export const IFRAME_INITIALIZED: TrezorError = new TrezorError(101, 'Trezor.js has been already initialized');
export const IFRAME_TIMEOUT: TrezorError = new TrezorError(102, 'Iframe timeout');
export const POPUP_TIMEOUT: TrezorError = new TrezorError(103, 'Popup timeout');

export const NO_TRANSPORT: TrezorError = new TrezorError(500, 'Transport is missing');
export const WRONG_TRANSPORT_CONFIG: TrezorError = new TrezorError(5002, 'Wrong config response'); // config_signed
export const DEVICE_NOT_FOUND: TrezorError = new TrezorError(501, 'Device not found');
// export const DEVICE_CALL_IN_PROGRESS: TrezorError = new TrezorError(502, "Device call in progress.");
export const DEVICE_CALL_IN_PROGRESS: TrezorError = new TrezorError(503, 'Device call in progress');
export const INVALID_PARAMETERS: TrezorError = new TrezorError(504, 'Invalid parameters');
export const POPUP_CLOSED = new Error('Popup closed');

export const PERMISSIONS_NOT_GRANTED: TrezorError = new TrezorError(600, 'Permissions not granted');

export const DEVICE_USED_ELSEWHERE: TrezorError = new TrezorError(700, 'Device is used in another window');
export const INITIALIZATION_FAILED: TrezorError = new TrezorError(701, 'Initialization failed');

export const CALL_OVERRIDE: TrezorError = new TrezorError('Failure_ActionOverride', 'override');

// a slight hack
// this error string is hard-coded
// in both bridge and extension
export const WRONG_PREVIOUS_SESSION_ERROR_MESSAGE: string = 'wrong previous session';
export const INVALID_PIN_ERROR_MESSAGE: string = 'PIN invalid';
export const WEBUSB_ERROR_MESSAGE: string = 'NetworkError: Unable to claim interface.';

