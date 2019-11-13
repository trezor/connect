/* @flow */

import AbstractMethod from './AbstractMethod';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';

import type { ResetDeviceFlags, Success } from '../../types/trezor';
import type { CoreMessage, UiPromiseResponse } from '../../types';

export default class ResetDevice extends AbstractMethod {
    params: ResetDeviceFlags;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.allowDeviceMode = [ UI.INITIALIZE, UI.SEEDLESS ];
        this.useDeviceState = false;
        this.requiredPermissions = ['management'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Setup device';

        const payload: Object = message.payload;
        // validate bundle type
        validateParams(payload, [
            { name: 'displayRandom', type: 'boolean' },
            { name: 'strength', type: 'number' },
            { name: 'passphraseProtection', type: 'boolean' },
            { name: 'pinProtection', type: 'boolean' },
            { name: 'language', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'u2fCounter', type: 'number' },
            { name: 'skipBackup', type: 'boolean' },
            { name: 'noBackup', type: 'boolean' },
            { name: 'backupType', type: 'number' },
        ]);

        this.params = {
            display_random: payload.displayRandom,
            strength: payload.strength || 256,
            passphrase_protection: payload.passphraseProtection,
            pin_protection: payload.pinProtection,
            language: payload.language,
            label: payload.label,
            u2f_counter: payload.u2fCounter || Math.floor(Date.now() / 1000),
            skip_backup: payload.skipBackup,
            no_backup: payload.noBackup,
            backup_type: payload.backupType,
        };
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'device-management',
            label: 'Do you really you want to create a new wallet?',
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run(): Promise<Success> {
        return await this.device.getCommands().reset(this.params);
    }
}
