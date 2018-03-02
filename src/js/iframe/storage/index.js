/* @flow */
'use strict';

export const save = (storageKey: string, value: any): void => {
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

export const load = (storageKey: string): ?JSON => {
    let value: ?string;
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
                value = /^([^;]+)/.exec(cookie.slice(location))[1];
            }
        } catch (ignore) {
            // empty
        }
    }
    if (!value) return null;
    return JSON.parse(value);
};
