/* @flow */

import AbstractMethod from './AbstractMethod';
import DataManager from '../../data/DataManager';
import type { CoreMessage } from '../../types';
import type { ConnectSettings } from '../../data/ConnectSettings';

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
