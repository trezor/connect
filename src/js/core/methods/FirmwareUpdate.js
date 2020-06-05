/* @flow */
import { getBinary } from '@trezor/rollout';
import AbstractMethod from './AbstractMethod';
import { UI, ERRORS } from '../../constants';
import { uploadFirmware } from './helpers/uploadFirmware';
import { UiMessage } from '../../message/builder';
import { validateParams } from './helpers/paramsValidator';
import { getReleases } from '../../data/FirmwareInfo';

import type { CoreMessage } from '../../types';

type Params = {
    binary?: Buffer;
    version?: Array<number>;
    btcOnly?: boolean;
    baseUrl?: string;
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

        const payload: Params = message.payload;

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
            baseUrl: payload.baseUrl || 'https://data.trezor.io',
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
        try {
            if (this.params.binary) {
                binary = this.params.binary;
            } else {
                const firmware = await getBinary({
                    // features and releases are used for sanity checking inside @trezor/rollout
                    features: device.features,
                    releases: getReleases(device.features.major_version),
                    // version argument is used to find and fetch concrete release from releases list
                    version: this.params.version,
                    btcOnly: this.params.btcOnly,
                    baseUrl: this.params.baseUrl,
                    baseUrlBeta: 'https://beta-wallet.trezor.io',
                });
                binary = firmware.binary;
            }
        } catch (err) {
            throw ERRORS.TypedError('Method_FirmwareUpdate_DownloadFailed', 'Failed to download firmware binary');
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
