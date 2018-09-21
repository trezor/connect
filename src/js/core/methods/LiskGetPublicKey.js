/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath, fromHardened, getSerializedPath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { UiPromiseResponse } from 'flowtype';
import type { LiskPublicKey } from '../../types/trezor';
import type { CoreMessage } from '../../types';
import type { LiskPublicKey as LiskPublicKeyResponse } from '../../types/lisk';

type Batch = {
    path: Array<number>,
    showOnTrezor: boolean,
}

type Params = {
    bundle: Array<Batch>,
    bundledResponse: boolean,
}

export default class LiskGetPublicKey extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = ['1.6.3', '2.0.7'];
        this.info = 'Export Lisk public key';

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
            let showOnTrezor: boolean = false;
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
            label = 'Export multiple Lisk public keys';
        } else {
            label = `Export Lisk public key for account #${ (fromHardened(this.params.bundle[0].path[2]) + 1) }`;
        }

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-xpub',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<LiskPublicKeyResponse | Array<LiskPublicKeyResponse>> {
        const responses: Array<LiskPublicKeyResponse> = [];
        for (let i = 0; i < this.params.bundle.length; i++) {
            const response: LiskPublicKey = await this.device.getCommands().liskGetPublicKey(
                this.params.bundle[i].path,
                this.params.bundle[i].showOnTrezor
            );
            responses.push({
                publicKey: response.public_key,
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
