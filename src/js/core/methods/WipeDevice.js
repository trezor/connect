/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { UiPromiseResponse } from 'flowtype';
import type { Success } from '../../types/trezor';
import type { CoreMessage } from '../../types';

export default class GetPublicKey extends AbstractMethod {
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.allowDeviceMode = [ UI.INITIALIZE, UI.SEEDLESS ];
        this.useDeviceState = false;
        this.requiredPermissions = ['management'];
        this.info = 'Wipe device';
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
            customConfirmButton: {
                className: 'wipe',
                label: `Wipe ${this.device.toMessageObject().label}`,
            },
            label: 'Are you sure you want to wipe your device?',
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<Success> {
        return await this.device.getCommands().wipe();
    }
}
