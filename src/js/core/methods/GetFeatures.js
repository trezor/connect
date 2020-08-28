/* @flow */

import AbstractMethod from './AbstractMethod';

import type { CoreMessage } from '../../types';
import * as UI from '../../constants/ui';

export default class GetFeatures extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.useUi = false;
        this.allowDeviceMode = [...this.allowDeviceMode, UI.INITIALIZE, UI.BOOTLOADER];
        this.useDeviceState = false;
        this.skipFirmwareCheck = true;
    }

    async run() {
        return this.device.features;
    }
}
