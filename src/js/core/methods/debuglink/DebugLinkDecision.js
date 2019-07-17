/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import type { CoreMessage } from '../../../types';
import type { DebugLinkDecision as $DebugLinkDecision } from '../../../types/trezor';

export default class DebugLinkDecision extends AbstractMethod {
    params: $DebugLinkDecision;

    constructor(message: CoreMessage) {
        super(message);
        this.useDevice = true;
        this.debugLink = true;
        this.useUi = false;
        this.requiredPermissions = ['management'];

        const payload: Object = message.payload;
        validateParams(payload, [
            { name: 'yes_no', type: 'boolean' },
            { name: 'up_down', type: 'boolean' },
            { name: 'input', type: 'string' },
        ]);

        this.params = {
            yes_no: payload.yes_no,
            up_down: payload.up_down,
            input: payload.input,
        };
    }

    async run(): Promise<{ debugLink: true }> {
        if (!this.device.hasDebugLink) {
            throw new Error('Device is not a debug link');
        }
        if (!this.device.isUsedHere()) {
            throw new Error('Device is not acquired!');
        }

        await this.device.getCommands().debugLinkDecision(this.params);

        return {
            debugLink: true,
        };
    }
}
