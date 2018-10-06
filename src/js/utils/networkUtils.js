/* @flow */
'use strict';

import 'whatwg-fetch';

export const httpRequest = async (url: string, type: string = 'text'): any => {
    const response: Response = await fetch(url, { credentials: 'same-origin' });
    if (response.ok) {
        if (type === 'json') {
            const txt: string = await response.text();
            return JSON.parse(txt);
        } else if (type === 'binary') {
            return await response.arrayBuffer();
        } else {
            return await response.text();
        }
    } else {
        throw new Error(`httpRequest error: ${ url} ${response.statusText}`);
    }

    // return fetch(url, { credentials: 'same-origin' }).then((response) => {
    //     if (response.status === 200) {

    //         return response.text().then(result => (json ? JSON.parse(result) : result));
    //     } else {
    //         throw new Error(response.statusText);
    //     }
    // })
};

export const getOrigin = (url: string) => {
    // eslint-disable-next-line no-irregular-whitespace, no-useless-escape
    const parts: ?Array<string> = url.match(/^.+\:\/\/[^\/]+/);
    return (Array.isArray(parts) && parts.length > 0) ? parts[0] : 'unknown';
};
