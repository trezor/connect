/* @flow */

import AbstractMethod from '../AbstractMethod';
import { ERRORS } from '../../../constants';
import type { CoreMessage } from '../../../types';
import type { DebugLinkState } from '../../../types/trezor/protobuf';

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
            throw ERRORS.TypedError('Runtime', 'Device is not a debug link');
        }

        const response: DebugLinkState = await this.device.getCommands().debugLinkGetState();
        return {
            ...response,
            debugLink: true,
        };
    }
}
