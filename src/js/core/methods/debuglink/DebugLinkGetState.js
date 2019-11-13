/* @flow */

import AbstractMethod from '../AbstractMethod';
import type { CoreMessage } from '../../../types';
import type { DebugLinkState } from '../../../types/trezor';

export default class DebugLinkGetState extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = true;
        this.debugLink = true;
        this.useUi = false;
        this.requiredPermissions = ['management'];
    }

    async run(): Promise<DebugLinkState> {
        if (!this.device.hasDebugLink) {
            throw new Error('Device is not a debug link');
        }

        const response: DebugLinkState = await this.device.getCommands().debugLinkGetState();
        return {
            ...response,
            debugLink: true,
        };
    }
}
