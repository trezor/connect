/* @flow */
import { getBinary } from '@trezor/rollout';
import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { validateParams } from './helpers/paramsValidator';
import { uploadFirmware } from './helpers/uploadFirmware';
import { UiMessage } from '../../message/builder';
import type { FirmwareUpload } from '../../types/trezor/protobuf'; // flowtype only
import DataManager from '../../data/DataManager';

import type { CoreMessage } from '../../types';

export default class FirmwareUpdate extends AbstractMethod {
    params: FirmwareUpload;
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

        // validateParams(payload, [
        //     { name: 'payload', type: 'buffer' },
        //     { name: 'hash', type: 'string' },
        // ]);

        this.params = {
            // payload: payload.payload,
            // length: payload.payload.byteLength,
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
        const { device } = this;

        const firmware = await getBinary({
            features: device.features,
            releases: DataManager.assets[`firmware-t${device.features.major_version}`],
            baseUrl: 'https://wallet.trezor.io',
        });

        const response = await uploadFirmware(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.postMessage,
            device,
            {
                payload: firmware.binary,
                length: firmware.binary.byteLength,
            }
        );

        return response;
    }
}
