/* @flow */

import AbstractMethod from './AbstractMethod';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';
import { validateParams } from './helpers/paramsValidator';

import type { LoadDeviceFlags, Success } from '../../types/trezor/protobuf';
import type { CoreMessage, UiPromiseResponse } from '../../types';

export default class LoadDevice extends AbstractMethod {
    confirmed: boolean = false;
    params: LoadDeviceFlags;

    constructor(message: CoreMessage) {
        super(message);
        this.allowDeviceMode = [ UI.INITIALIZE, UI.SEEDLESS ];
        this.useDeviceState = false;
        this.requiredPermissions = ['management'];
        this.info = 'Load device';

        const payload: Object = message.payload;
        // validate bundle type
        validateParams(payload, [
            { name: 'mnemonics', type: 'array' },
            { name: 'node', type: 'object' },
            { name: 'pin', type: 'string' },
            { name: 'passphraseProtection', type: 'boolean' },
            { name: 'language', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'skipChecksum', type: 'boolean' },
            { name: 'u2fCounter', type: 'number' },
        ]);

        this.params = {
            mnemonics: payload.mnemonics,
            node: payload.node,
            pin: payload.pin,
            passphrase_protection: payload.passphraseProtection,
            language: payload.language,
            label: payload.label,
            skip_checksum: payload.skipChecksum,
            u2f_counter: payload.u2fCounter || Math.floor(Date.now() / 1000),
        };
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'device-management',
            customConfirmButton: {
                className: 'wipe',
                label: `Load ${this.device.toMessageObject().label}`,
            },
            label: 'Are you sure you want to load your device?',
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run(): Promise<Success> {
        // todo: remove when listed firmwares become mandatory
        if (!this.device.atLeast(['1.8.2', '2.1.2'])) {
            if (!this.params.mnemonics || typeof this.params.mnemonics[0] !== 'string') {
                throw ERRORS.TypedError('Method_InvalidParameter', 'invalid mnemonic array. should contain at least one mnemonic string');
            }
            this.params.mnemonic = this.params.mnemonics[0];
            delete this.params.mnemonics;
        }

        return await this.device.getCommands().load(this.params);
    }
}
