/* @flow */

import AbstractMethod from './AbstractMethod';
import { getFirmwareRange } from './helpers/paramsValidator';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

export default class RebootToBootloader extends AbstractMethod<'rebootToBootloader'> {
    confirmed: ?boolean;

    init() {
        this.allowDeviceMode = [UI.INITIALIZE, UI.SEEDLESS];
        this.skipFinalReload = true;
        this.keepSession = false;
        this.requiredPermissions = ['management'];
        this.info = 'Reboot to bootloader';
        this.useDeviceState = false;
        this.firmwareRange = getFirmwareRange(this.name, null, {
            '1': { min: '1.10.0', max: '0' },
            '2': { min: '0', max: '0' },
        });
    }

    async confirmation() {
        if (this.confirmed) return true;
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
                    label: `Reboot`,
                },
                label: 'Are you sure you want to reboot to bootloader?',
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('RebootToBootloader', 'Success');
        return response.message;
    }
}
