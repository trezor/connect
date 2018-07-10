/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath, fromHardened } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { UiPromiseResponse } from 'flowtype';
import type { StellarPublicKey } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
}

export default class StellarGetPublicKey extends AbstractMethod {

    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.info = 'Export Stellar public key';

        const payload: any = message.payload;

        let path: Array<number>;
        if (payload.hasOwnProperty('path')) {
            path = validatePath(payload.path);
        } else {
            throw new Error('Parameters "path" are missing');
        }

        this.params = {
            path
        }
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-xpub',
            label: `Export public key of Stellar Account#${ (fromHardened(this.params.path[2]) + 1) }`
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device).promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<StellarPublicKey> {
        const response: MessageResponse<StellarPublicKey> = await this.device.getCommands().stellarGetPublicKey(this.params.path);
        return response.message;
    }
}
