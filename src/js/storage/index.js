/* @flow */

export const BROWSER_KEY: string = 'trezorconnect_browser';
export const PERMISSIONS_KEY: string = 'trezorconnect_permissions';
export const CONFIRMATION_KEY: string = 'trezorconnect_confirmations';

const _storage: {[k: string]: string} = {};

export const save = (storageKey: string, value: any, temporary: boolean = false): void => {
    if (temporary) {
        _storage[ storageKey ] = JSON.stringify(value);
        return;
    }
    try {
        window.localStorage[storageKey] = JSON.stringify(value);
        return;
    } catch (ignore) {
        // empty
    }

    // Fallback cookie
    try {
        window.document.cookie = encodeURIComponent(storageKey) + '=' + JSON.stringify(value) + ';';
    } catch (ignore) {
        // empty
    }
};

export const load = (storageKey: string, temporary: boolean = false): ?JSON => {
    let value: ?string;

    if (temporary) {
        value = _storage[ storageKey ];
        return value ? JSON.parse(value) : null;
    }

    try {
        value = window.localStorage[storageKey];
    } catch (ignore) {
        // empty
    }

    // Fallback cookie if local storage gives us nothing
    if (typeof value === 'undefined') {
        try {
            const cookie: string = window.document.cookie;
            const location: number = cookie.indexOf(encodeURIComponent(storageKey) + '=');
            if (location !== -1) {
                const matches = /^([^;]+)/.exec(cookie.slice(location));
                if (matches) {
                    value = matches[1];
                }
            }
        } catch (ignore) {
            // empty
        }
    }
    return value ? JSON.parse(value) : null;
};
