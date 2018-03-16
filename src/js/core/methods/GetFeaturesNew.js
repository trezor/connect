/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../CoreMessage';

export default class GetPublicKey extends AbstractMethod {

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = true;
    }

    async run(): Promise<Object> {
        return { ...this.device.features };
    }
}
