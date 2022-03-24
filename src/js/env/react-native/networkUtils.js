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
        case './data/messages/messages.json':
            return require('@trezor/transport/messages.json');
        default:
            return null;
    }
};
