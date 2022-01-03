/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { MessageType } from '../../types/trezor/protobuf';

export default class ApplyFlags extends AbstractMethod<'applyFlags'> {
    params: $ElementType<MessageType, 'ApplyFlags'>;

    init() {
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;

        const { payload } = this;

        validateParams(payload, [{ name: 'flags', type: 'number', required: true }]);

        this.params = {
            flags: payload.flags,
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
                label: 'Do you really want to apply flags?',
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('ApplyFlags', 'Success', this.params);
        return response.message;
    }
}
