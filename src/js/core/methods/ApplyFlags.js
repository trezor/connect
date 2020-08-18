/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { CoreMessage } from '../../types';

type Params = {
    flags: number;
}

export default class ApplyFlags extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;

        const payload: Object = message.payload;

        validateParams(payload, [
            { name: 'flags', type: 'number', obligatory: true },
        ]);

        this.params = {
            flags: payload.flags,
        };
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
            label: 'Do you really want to apply flags?',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().applyFlags(this.params);
    }
}
