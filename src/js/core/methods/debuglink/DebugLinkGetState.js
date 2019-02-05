/* @flow */

import AbstractMethod from '../AbstractMethod';
import type { CoreMessage } from '../../../types';
import type { $DebugLinkDecision } from '../../../types/trezor';

export default class DebugLinkGetState extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = true;
        this.debugLink = true;
        this.useUi = false;
    }

    async run(): Promise<{ debugLinkDecision: any }> {
        if (!this.device.hasDebugLink) {
            throw new Error('Device is not a debug link');
        }

        return await this.device.getCommands().debugLinkGetState();
    }
}
