/* @flow */

import fs from 'fs';
import path from 'path';
import nodeFetch from 'node-fetch';

if (global && typeof global.fetch !== 'function') {
    global.fetch = nodeFetch;
}

const connectCommonFilesPath = path.resolve(
    __dirname,
    '../../../../node_modules/@trezor/connect-common/files/',
);

const getAbsolutePath = (fileUrl: string) => {
    switch (fileUrl) {
        case './data/bridge/releases.json':
            return path.join(connectCommonFilesPath, 'bridge/releases.json');
        case './data/firmware/1/releases.json':
            return path.join(connectCommonFilesPath, 'firmware/1/releases.json');
        case './data/firmware/2/releases.json':
            return path.join(connectCommonFilesPath, 'firmware/2/releases.json');
        default: {
            return path.resolve(__dirname, '../../../', fileUrl);
        }
    }
};

export const httpRequest = (url: string, type: string): any => {
    const fileUrl = url.split('?')[0];
    const absolutePath = getAbsolutePath(fileUrl);
    const content =
        type !== 'binary'
            ? fs.readFileSync(absolutePath, { encoding: 'utf8' })
            : fs.readFileSync(absolutePath);
    if (!content) return null;

    if (type === 'binary') {
        return Array.from(content);
    }
    if (type === 'json' && typeof content === 'string') {
        return JSON.parse(content);
    }
    return content;
};

export const getOrigin = (url: string) => {
    if (url.indexOf('file://') === 0) return 'file://';
    // eslint-disable-next-line no-useless-escape
    const parts = url.match(/^.+\:\/\/[^\/]+/);
    return Array.isArray(parts) && parts.length > 0 ? parts[0] : 'unknown';
};
