/* @flow */

import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { CoreMessage } from '../../types';

export default class BackupDevice extends AbstractMethod {
    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;
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
            label: 'Do you want to initiate backup procedure?',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().backupDevice();
    }
}
