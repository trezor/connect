/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from 'flowtype';

export default class GetPublicKey extends AbstractMethod {

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = false;
    }

    async run(): Promise<Object> {
        return { ...this.device.features };
    }
}
