/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import DataManager from '../../data/DataManager';
import { reconnectAllBackends } from '../../backend/BlockchainLink';

export default class SetProxy extends AbstractMethod<'setProxy'> {
    init() {
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;

        validateParams(this.payload, [{ name: 'useOnionLinks', type: 'boolean' }]);
    }

    async run() {
        DataManager.settings.proxy = this.payload.proxy
            ? this.payload.proxy.replace('socks5', 'socks') // socks5 doesnt work
            : undefined;
        DataManager.settings.useOnionLinks = this.payload.useOnionLinks;
        await reconnectAllBackends();
        return { message: 'Success' };
    }
}
