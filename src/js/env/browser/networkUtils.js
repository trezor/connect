/* @flow */

import fetch from 'cross-fetch';

export const httpRequest = async (url: string, type: string = 'text'): any => {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (response.ok) {
        if (type === 'json') {
            const txt = await response.text();
            return JSON.parse(txt);
        }
        if (type === 'binary') {
            return response.arrayBuffer();
        }
        return response.text();
    }
    throw new Error(`httpRequest error: ${url} ${response.statusText}`);
};
