/* @flow */

import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { validateParams } from './helpers/paramsValidator';
import { UiMessage } from '../../message/builder';

import type { CoreMessage } from '../../types';

type Params = {
    language?: string;
    label?: string;
    use_passphrase?: boolean;
    homescreen?: string;
    passphrase_source?: number;
    auto_lock_delay_ms?: number;
}

export default class ApplySettings extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;
        const payload: Object = message.payload;

        validateParams(payload, [
            { name: 'language', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'use_passphrase', type: 'boolean' },
            { name: 'homescreen', type: 'string' },
            { name: 'passphrase_source', type: 'number' },
            { name: 'auto_lock_delay_ms', type: 'number' },
            { name: 'display_rotation', type: 'number' },
        ]);

        this.params = {
            language: payload.language,
            label: payload.label,
            use_passphrase: payload.use_passphrase,
            homescreen: payload.homescreen,
            passphrase_source: payload.passphrase_source,
            auto_lock_delay_ms: payload.auto_lock_delay_ms,
            display_rotation: payload.display_rotation,
        };
    }

    async confirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'device-management',
            customConfirmButton: {
                className: 'confirm',
                label: 'Proceed',
            },
            label: 'Do you really want to change device settings?',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().applySettings(this.params);
    }
}
