/* @flow */
import { getBinary } from '@trezor/rollout';
import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { uploadFirmware } from './helpers/uploadFirmware';
import { UiMessage } from '../../message/builder';
import DataManager from '../../data/DataManager';
import { validateParams } from './helpers/paramsValidator';
import type { FirmwareUpdate as FirmwareUpdateParams } from '../../types/trezor/management'; // flowtype only

import type { CoreMessage } from '../../types';

export default class FirmwareUpdate extends AbstractMethod {
    params: FirmwareUpdateParams;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.useEmptyPassphrase = true;
        this.requiredPermissions = ['management'];
        this.allowDeviceMode = [UI.BOOTLOADER, UI.INITIALIZE];
        this.requireDeviceMode = [UI.BOOTLOADER];
        this.useDeviceState = false;
        this.skipFirmwareCheck = true;

        const payload: FirmwareUpdateParams = message.payload;

        validateParams(payload, [
            { name: 'version', type: 'array' },
            { name: 'btcOnly', type: 'boolean' },
            { name: 'baseUrl', type: 'string' },
            { name: 'binary', type: 'buffer' },
        ]);

        this.params = {
            // either receive version and btcOnly
            version: payload.version,
            btcOnly: payload.btcOnly,
            baseUrl: payload.baseUrl || 'https://wallet.trezor.io/',
            // or binary
            binary: payload.binary,
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

        let binary;

        if (this.params.binary) {
            binary = this.params.binary;
        } else {
            const firmware = await getBinary({
                // features and releases are used for sanity checking inside @trezor/rollout
                features: device.features,
                releases: DataManager.assets[`firmware-t${device.features.major_version}`],
                // version argument is used to find and fetch concrete release from releases list
                version: this.params.version,
                btcOnly: this.params.btcOnly,
                baseUrl: this.params.baseUrl,
                baseUrlBeta: 'https://beta-wallet.trezor.io/',
            });
            binary = firmware.binary;
        }

        return uploadFirmware(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.postMessage,
            device,
            {
                payload: binary,
                length: binary.byteLength,
            }
        );
    }
}
