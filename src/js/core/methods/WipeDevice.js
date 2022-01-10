/* @flow */

import AbstractMethod from './AbstractMethod';

import * as UI from '../../constants/ui';
import * as DEVICE from '../../constants/device';
import { UiMessage } from '../../message/builder';
import { getFirmwareRange } from './helpers/paramsValidator';

export default class WipeDevice extends AbstractMethod<'wipeDevice'> {
    confirmed: ?boolean;

    init() {
        this.allowDeviceMode = [UI.INITIALIZE, UI.SEEDLESS, UI.BOOTLOADER];
        this.useDeviceState = false;
        this.requiredPermissions = ['management'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Wipe device';
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
                    className: 'wipe',
                    label: `Wipe ${this.device.toMessageObject().label}`,
                },
                label: 'Are you sure you want to wipe your device?',
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run() {
        const cmd = this.device.getCommands();

        if (this.device.isBootloader()) {
            // firmware doesn't send this button request in bootloader mode
            this.device.emit(DEVICE.BUTTON, this.device, { code: 'ButtonRequest_WipeDevice' });
        }

        const response = await cmd.typedCall('WipeDevice', 'Success');

        return response.message;
    }
}
