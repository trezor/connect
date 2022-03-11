/* @flow */

import { DataManager } from '@trezor/connect-common';
import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { reconnectAllBackends } from '../../backend/BlockchainLink';

export default class SetProxy extends AbstractMethod<'setProxy'> {
    init() {
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;

        validateParams(this.payload, [{ name: 'useOnionLinks', type: 'boolean' }]);
    }

    async run() {
        const { proxy, useOnionLinks } = DataManager.getSettings();
        const isChanged =
            proxy !== this.payload.proxy || useOnionLinks !== this.payload.useOnionLinks;
        if (isChanged) {
            DataManager.settings.proxy = this.payload.proxy;
            DataManager.settings.useOnionLinks = this.payload.useOnionLinks;
            await reconnectAllBackends();
        }

        return { message: 'Success' };
    }
}
