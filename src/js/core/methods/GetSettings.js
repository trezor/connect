/* @flow */

import AbstractMethod from './AbstractMethod';
import DataManager from '../../data/DataManager';
import type { ConnectSettings, CoreMessage } from '../../types';

export default class GetSettings extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.useDevice = false;
        this.useUi = false;
    }

    async run(): Promise<ConnectSettings> {
        return DataManager.getSettings();
    }
}
