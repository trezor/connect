/* @flow */

import AbstractMethod from './AbstractMethod';
import DataManager from '../../data/DataManager';
import type { CoreMessage } from '../../types';

export default class GetPublicKey extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;
    }

    async run(): Promise<Object> {
        return DataManager.getSettings();
    }
}
