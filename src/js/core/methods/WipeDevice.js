/* @flow */

import AbstractMethod from './AbstractMethod';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import { getFirmwareRange } from './helpers/paramsValidator';
import type { CoreMessage } from '../../types';

export default class WipeDevice extends AbstractMethod {
    confirmed: ?boolean;

    constructor(message: CoreMessage) {
        super(message);

        this.allowDeviceMode = [ UI.INITIALIZE, UI.SEEDLESS ];
        this.useDeviceState = false;
        this.requiredPermissions = ['management'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Wipe device';
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
                label: `Wipe ${this.device.toMessageObject().label}`,
            },
            label: 'Are you sure you want to wipe your device?',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('WipeDevice', 'Success');
        return response.message;
    }
}
