/* eslint-disable global-require */

exports.httpRequest = function httpRequest(url, _type) {
    const fileUrl = url.split('?')[0];

    switch (fileUrl) {
        case './data/config.json':
            return require('../../../data/config.json');
        case './data/coins.json':
            return require('../../../data/coins.json');
        case './data/bridge/releases.json':
            return require('@trezor/connect-common/files/bridge/releases.json');
        case './data/firmware/1/releases.json':
            return require('@trezor/connect-common/files/firmware/1/releases.json');
        case './data/firmware/2/releases.json':
            return require('@trezor/connect-common/files/firmware/2/releases.json');
        case './data/messages/messages-v6.json':
            return require('../../../data/messages/messages-v6.json');
        case './data/messages/messages-v7.json':
            return require('../../../data/messages/messages-v7.json');
        case './data/messages/messages.json':
            return require('../../../data/messages/messages.json');
        default:
            return null;
    }
};

exports.getOrigin = function getOrigin(url) {
    if (url.indexOf('file://') === 0) return 'file://';

    // eslint-disable-next-line no-useless-escape
    const parts = url.match(/^.+\:\/\/[^\/]+/);
    return Array.isArray(parts) && parts.length > 0 ? parts[0] : 'unknown';
};
