/* @flow */

import { DataManager } from '@trezor/connect-common';
import AbstractMethod from './AbstractMethod';

export default class GetSettings extends AbstractMethod<'getSettings'> {
    init() {
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;
    }

    run() {
        return Promise.resolve(DataManager.getSettings());
    }
}
