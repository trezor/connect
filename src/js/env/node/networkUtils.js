/* @flow */

import fs from 'fs';
import path from 'path';
import nodeFetch from 'node-fetch';

if (global && typeof global.fetch !== 'function') {
    global.fetch = nodeFetch;
}

export const httpRequest = async (url: string, type: string): any => {
    let fileUrl: string = url.split('?')[0];
    fileUrl = path.resolve(__dirname, '../../../', fileUrl);
    const content = type !== 'binary' ? fs.readFileSync(fileUrl, { encoding: 'utf8' }) : fs.readFileSync(fileUrl);
    if (!content) return null;

    if (type === 'binary') {
        return Array.from(content);
    } else if (type === 'json' && typeof content === 'string') {
        return JSON.parse(content);
    }
    return content;
};

export const getOrigin = (url: string) => {
    if (url.indexOf('file://') === 0) return 'file://';
    // eslint-disable-next-line no-irregular-whitespace, no-useless-escape
    const parts: ?Array<string> = url.match(/^.+\:\/\/[^\/]+/);
    return (Array.isArray(parts) && parts.length > 0) ? parts[0] : 'unknown';
};
