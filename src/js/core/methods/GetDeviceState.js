/* @flow */

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../../types';

export default class GetDeviceState extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
    }

    async run(): Promise<Object> {
        return {
            state: this.device.getExternalState(),
        };
    }
}
