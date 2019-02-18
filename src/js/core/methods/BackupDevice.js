/* @flow */

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../../types';

export default class BackupDevice extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.useUi = false;
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().backupDevice();
    }
}
