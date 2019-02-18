/* @flow */

import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { validateParams } from './helpers/paramsValidator';

import type { CoreMessage } from '../../types';

type Params = {
    word_count?: number,
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    language?: string,
    label?: string,
    enforce_wordlist?: boolean,
    type?: number,
    u2f_counter?: number,
    dry_run?: boolean,
}

export default class RecoveryDevice extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.useUi = false;

        const payload: Object = message.payload;

        validateParams(payload, [
            { name: 'word_count', type: 'number' },
            { name: 'passphrase_protection', type: 'boolean' },
            { name: 'pin_protection', type: 'boolean' },
            { name: 'language', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'enforce_wordlist', type: 'boolean' },
            { name: 'type', type: 'number' },
            { name: 'u2f_counter', type: 'number' },
            { name: 'dry_run', type: 'boolean' },
        ]);
        this.params = {
            word_count: payload.word_count,
            passphrase_protection: payload.passphrase_protection,
            pin_protection: payload.pin_protection,
            language: payload.language,
            label: payload.label,
            enforce_wordlist: payload.enforce_wordlist,
            type: payload.type,
            u2f_counter: payload.u2f_counter,
            dry_run: payload.dry_run,

        };
        this.allowDeviceMode = [...this.allowDeviceMode, UI.INITIALIZE];
        this.useDeviceState = false;
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().recoveryDevice(this.params);
    }
}
