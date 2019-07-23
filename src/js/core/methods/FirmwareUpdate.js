/* @flow */

import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { validateParams } from './helpers/paramsValidator';
import { uploadFirmware } from './helpers/uploadFirmware';
import { UiMessage } from '../../message/builder';

import type { CoreMessage } from '../../types';

type Params = {
    payload: Buffer,
    hash?: string,
    offset?: number,
    length?: number,
}

export default class FirmwareUpdate extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.useEmptyPassphrase = true;
        this.requiredPermissions = ['management'];
        this.allowDeviceMode = [UI.BOOTLOADER, UI.INITIALIZE];
        this.requireDeviceMode = [UI.BOOTLOADER];
        this.useDeviceState = false;
        this.skipFirmwareCheck = true;

        const payload: Object = message.payload;

        validateParams(payload, [
            { name: 'payload', type: 'buffer', obligatory: true },
            { name: 'hash', type: 'string' },
            { name: 'offset', type: 'number' },
            { name: 'length', type: 'number' },
        ]);

        this.params = {
            payload: payload.payload,
            offset: payload.offset,
            length: payload.length,
        };
    }

    async confirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'device-management',
            customConfirmButton: {
                className: 'wipe',
                label: 'Proceed',
            },
            label: 'Do you want to update firmware? Never do this without your recovery card.',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run(): Promise<Object> {
        const { device, params } = this;
        await this.device.getCommands().firmwareErase({
            length: this.params.length,
        });

        const response = await uploadFirmware(
            device.getCommands().typedCall.bind(device.getCommands()),
            params.payload,
            params.offset,
            params.length,
            device.features.major_version,
        );

        return response;
    }
}
