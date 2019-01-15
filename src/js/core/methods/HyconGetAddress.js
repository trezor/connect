/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath, fromHardened, getSerializedPath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { UiPromiseResponse } from 'flowtype';
import type { HyconAddress } from '../../types/trezor';
import type { HyconAddress as HyconAddressResponse } from '../../types/hycon';
import type { CoreMessage } from '../../types';

type Batch = {
    path: Array<number>,
    showOnTrezor: boolean,
}

type Params = {
    bundle: Array<Batch>,
    bundledResponse: boolean,
}

export default class HyconGetAddress extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = ['0', '2.0.8'];
        this.info = 'Export Hycon address';

        const payload: Object = message.payload;
        let bundledResponse: boolean = true;
        // create a bundle with only one batch
        if (!payload.hasOwnProperty('bundle')) {
            payload.bundle = [ ...payload ];
            bundledResponse = false;
        }

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
        ]);

        const bundle = [];
        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            const path: Array<number> = validatePath(batch.path, 3);
            let showOnTrezor: boolean = true;
            if (batch.hasOwnProperty('showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            bundle.push({
                path,
                showOnTrezor,
            });
        });

        this.params = {
            bundle,
            bundledResponse,
        };
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        let label: string;
        if (this.params.bundle.length > 1) {
            label = 'Export multiple Hycon addresses';
        } else {
            label = `Export Hycon address for account #${ (fromHardened(this.params.bundle[0].path[2]) + 1) }`;
        }

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<HyconAddressResponse | Array<HyconAddressResponse>> {
        const responses: Array<HyconAddressResponse> = [];
        for (let i = 0; i < this.params.bundle.length; i++) {
            const response: HyconAddress = await this.device.getCommands().hyconGetAddress(
                this.params.bundle[i].path,
                this.params.bundle[i].showOnTrezor
            );
            responses.push({
                address: response.address,
                path: this.params.bundle[i].path,
                serializedPath: getSerializedPath(this.params.bundle[i].path),
            });

            if (this.params.bundledResponse) {
                // send progress
                this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }
        }
        return this.params.bundledResponse ? responses : responses[0];
    }
}
