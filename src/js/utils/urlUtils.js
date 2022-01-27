/* @flow */

export const getOrigin = (url: string) => {
    if (url.indexOf('file://') === 0) return 'file://';
    // eslint-disable-next-line no-useless-escape
    const parts = url.match(/^.+\:\/\/[^\/]+/);
    return Array.isArray(parts) && parts.length > 0 ? parts[0] : 'unknown';
};
