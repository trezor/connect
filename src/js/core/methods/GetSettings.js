/* @flow */

import AbstractMethod from './AbstractMethod';
import DataManager from '../../data/DataManager';

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
