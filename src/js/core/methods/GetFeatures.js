/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../../types';

export default class GetPublicKey extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.useUi = false;
    }

    async run(): Promise<Object> {
        return { ...this.device.features };
    }
}
