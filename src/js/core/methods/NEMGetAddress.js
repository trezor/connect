/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath, fromHardened, getSerializedPath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { NEMAddress } from '../../types/trezor';
import type { NEMAddress as NEMAddressResponse } from '../../types/nem';
import type { UiPromiseResponse } from 'flowtype';
import type { CoreMessage } from '../../types';

type Batch = {
    path: Array<number>,
    network: number,
    showOnTrezor: boolean,
}

type Params = {
    bundle: Array<Batch>,
    bundledResponse: boolean,
}

const MAINNET: number = 0x68; // 104
const TESTNET: number = 0x98; // 152
const MIJIN: number = 0x60; // 96

export default class NEMGetAddress extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = ['1.6.2', '2.0.7'];
        this.info = 'Export NEM address';

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
                { name: 'network', type: 'number' },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            const path: Array<number> = validatePath(batch.path, 3);
            let showOnTrezor: boolean = true;
            if (batch.hasOwnProperty('showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            bundle.push({
                path,
                network: batch.network || MAINNET,
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
            label = 'Export multiple NEM addresses';
        } else {
            let network: string = 'Unknown';
            switch (this.params.bundle[0].network) {
                case MAINNET :
                    network = 'Mainnet';
                    break;
                case TESTNET :
                    network = 'Testnet';
                    break;
                case MIJIN :
                    network = 'Mijin';
                    break;
            }

            label = `Export NEM address for account #${ (fromHardened(this.params.bundle[0].path[2]) + 1) } on ${ network } network`;
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

    async run(): Promise<NEMAddressResponse | Array<NEMAddressResponse>> {
        const responses: Array<NEMAddressResponse> = [];
        for (let i = 0; i < this.params.bundle.length; i++) {
            const response: NEMAddress = await this.device.getCommands().nemGetAddress(
                this.params.bundle[i].path,
                this.params.bundle[i].network,
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
