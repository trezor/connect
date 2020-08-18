/* @flow */

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../../types';
import { validateParams } from './helpers/paramsValidator';

type Params = {
    remove?: boolean;
}

export default class ChangePin extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;

        const payload: Object = message.payload;
        validateParams(payload, [
            { name: 'remove', type: 'boolean' },
        ]);

        this.params = {
            remove: payload.remove,
        };
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().changePin(this.params);
    }
}
