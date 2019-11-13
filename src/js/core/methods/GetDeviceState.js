/* @flow */

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../../types';

export default class GetDeviceState extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
    }

    async run(): Promise<Object> {
        if (this.device.getState()) {
            return {
                state: this.device.getState(),
            };
        }

        const response: string = await this.device.getCommands().getDeviceState();
        const state: string = this.device.getState() || response;

        return {
            state,
        };
    }
}
