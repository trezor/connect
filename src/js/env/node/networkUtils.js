/* @flow */

import fs from 'fs';
import path from 'path';

// default assets dir
global.TREZOR_CONNECT_ASSETS = global.TREZOR_CONNECT_ASSETS || path.resolve(__dirname, '../../assets');

export const httpRequest = async (url: string, type: string): any => {
    let fileUrl: string = url.split('?')[0];
    fileUrl = path.resolve(global.TREZOR_CONNECT_ASSETS, fileUrl);
    const content = fs.readFileSync(fileUrl, { encoding: 'utf8' });
    if (type === 'json') {
        return JSON.parse(content);
    } else if (type === 'binary') {
        return Array.from(content);
    } else {
        return content;
    }
};

export const getOrigin = (url: string) => {
    // eslint-disable-next-line no-irregular-whitespace, no-useless-escape
    const parts: ?Array<string> = url.match(/^.+\:\/\/[^\/]+/);
    return (Array.isArray(parts) && parts.length > 0) ? parts[0] : 'unknown';
};
