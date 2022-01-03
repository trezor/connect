/* @flow */

import AbstractMethod from '../AbstractMethod';
import { validateParams } from '../helpers/paramsValidator';
import { ERRORS } from '../../../constants';
import type { MessageType } from '../../../types/trezor/protobuf';

// TODO: remove unused method
export default class DebugLinkDecision extends AbstractMethod<any> {
    params: $ElementType<MessageType, 'DebugLinkDecision'>;

    init() {
        this.useDevice = true;
        this.debugLink = true;
        this.useUi = false;
        this.requiredPermissions = ['management'];

        const { payload } = this;
        validateParams(payload, [
            { name: 'yes_no', type: 'boolean' },
            { name: 'up_down', type: 'boolean' },
            { name: 'input', type: 'string' },
        ]);

        this.params = {
            yes_no: payload.yes_no,
            // up_down: payload.up_down,
            input: payload.input,
        };
    }

    async run() {
        if (!this.device.hasDebugLink) {
            throw ERRORS.TypedError('Runtime', 'Device is not a debug link');
        }
        if (!this.device.isUsedHere()) {
            throw ERRORS.TypedError('Runtime', 'DebugLinkDecision: Device is not acquired!');
        }

        const cmd = this.device.getCommands();
        await cmd.typedCall('DebugLinkDecision', 'Success', this.params);
        return {
            debugLink: true,
        };
    }
}
