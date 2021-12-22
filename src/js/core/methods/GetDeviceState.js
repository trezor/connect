/* @flow */

import AbstractMethod from './AbstractMethod';

export default class GetDeviceState extends AbstractMethod<'getDeviceState'> {
    init() {
        this.requiredPermissions = [];
    }

    run() {
        return Promise.resolve({
            state: this.device.getExternalState(),
        });
    }
}
