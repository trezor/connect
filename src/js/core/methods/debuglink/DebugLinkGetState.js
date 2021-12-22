/* @flow */

import AbstractMethod from '../AbstractMethod';
import { ERRORS } from '../../../constants';
import type { DebugLinkState } from '../../../types/trezor/protobuf';

// TODO: remove unused method
export default class DebugLinkGetState extends AbstractMethod<'debugLinkGetState'> {
    init() {
        this.useDevice = true;
        this.debugLink = true;
        this.useUi = false;
        this.requiredPermissions = ['management'];
    }

    async run() {
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
