/* @flow */

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../../types';

export default class GetDeviceState extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
    }

    run() {
        return Promise.resolve({
            state: this.device.getExternalState(),
        });
    }
}
