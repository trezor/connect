/* @flow */

import AbstractMethod from './AbstractMethod';
import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';
import { validateParams } from './helpers/paramsValidator';
import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class LoadDevice extends AbstractMethod {
    params: $ElementType<MessageType, 'LoadDevice'>;
    confirmed: ?boolean;

    constructor(message: CoreMessage) {
        super(message);
        this.allowDeviceMode = [ UI.INITIALIZE, UI.SEEDLESS ];
        this.useDeviceState = false;
        this.requiredPermissions = ['management'];
        this.info = 'Load device';

        const { payload } = message;
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
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run() {
        // todo: remove when listed firmwares become mandatory
        if (!this.device.atLeast(['1.8.2', '2.1.2'])) {
            if (!this.params.mnemonics || typeof this.params.mnemonics[0] !== 'string') {
                throw ERRORS.TypedError('Method_InvalidParameter', 'invalid mnemonic array. should contain at least one mnemonic string');
            }
            // $FlowIssue older protobuf messages requires mnemonic as string
            this.params.mnemonic = this.params.mnemonics[0];
            // $FlowIssue older protobuf messages doesn't have mnemonics field
            delete this.params.mnemonics;
        }

        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('LoadDevice', 'Success', this.params);
        return response.message;
    }
}
