/* @flow */

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../../types';
import { validateParams } from './helpers/paramsValidator';

type Params = {
    language?: string,
    label?: string,
    use_passphrase?: boolean,
    homescreen?: string,
    passhprase_source?: number,
    auto_lock_delay_ms?: number,
}

export default class ApplySettings extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;
    constructor(message: CoreMessage) {
        super(message);
        this.useUi = false;
        const payload: Object = message.payload;

        validateParams(payload, [
            { name: 'language', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'use_passphrase', type: 'boolean' },
            { name: 'homescreen', type: 'string' },
            { name: 'passphrase_source', type: 'number' },
            { name: 'auto_lock_delay_ms', type: 'number' },
        ]);

        this.params = {
            label: payload.label,
        };
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().applySettings(this.params);
    }
}
