/* @flow */

import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { validateParams } from './helpers/paramsValidator';
import { UiMessage } from '../../message/builder';

import type { MessageType } from '../../types/trezor/protobuf';

export default class ApplySettings extends AbstractMethod<'applySettings'> {
    params: $ElementType<MessageType, 'ApplySettings'>;

    init() {
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;
        const { payload } = this;

        validateParams(payload, [
            { name: 'language', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'use_passphrase', type: 'boolean' },
            { name: 'homescreen', type: 'string' },
            { name: 'passphrase_source', type: 'number' },
            { name: 'passphrase_always_on_device', type: 'boolean' },
            { name: 'auto_lock_delay_ms', type: 'number' },
            { name: 'display_rotation', type: 'number' },
            { name: 'safety_checks', type: 'string' },
            { name: 'experimental_features', type: 'boolean' },
        ]);

        this.params = {
            language: payload.language,
            label: payload.label,
            use_passphrase: payload.use_passphrase,
            homescreen: payload.homescreen,
            passphrase_always_on_device: payload.passphrase_always_on_device,
            auto_lock_delay_ms: payload.auto_lock_delay_ms,
            display_rotation: payload.display_rotation,
            safety_checks: payload.safety_checks,
            experimental_features: payload.experimental_features,
            // $FlowIssue passphrase_source is a legacy param
            _passphrase_source: payload.passphrase_source,
        };
    }

    async confirmation() {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(
            UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'device-management',
                customConfirmButton: {
                    className: 'confirm',
                    label: 'Proceed',
                },
                label: 'Do you really want to change device settings?',
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('ApplySettings', 'Success', this.params);
        return response.message;
    }
}
