/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath, fromHardened, getSerializedPath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { BinancePublicKey } from '../../types/trezor';
import type { BinancePublicKey as BinancePublicKeyResponse } from '../../types/binance';
import type { CoreMessage, UiPromiseResponse } from '../../types';

type Batch = {
    path: Array<number>,
    showOnTrezor: boolean,
}

type Params = Array<Batch>;

export default class BinanceGetPublicKey extends AbstractMethod {
    params: Params;
    hasBundle: boolean;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Binance'), this.firmwareRange);
        this.info = 'Export Binance public key';

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = message.payload.hasOwnProperty('bundle');
        const payload: Object = !this.hasBundle ? { ...message.payload, bundle: [ ...message.payload ] } : message.payload;

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

        this.params = bundle;
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        let label: string;
        if (this.params.length > 1) {
            label = 'Export multiple Binance public keys';
        } else {
            label = `Export Binance public key for account #${ (fromHardened(this.params[0].path[2]) + 1) }`;
        }

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run(): Promise<BinancePublicKeyResponse | Array<BinancePublicKeyResponse>> {
        const responses: Array<BinancePublicKeyResponse> = [];
        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];
            const response: BinancePublicKey = await this.device.getCommands().binanceGetPublicKey(
                batch.path,
                batch.showOnTrezor
            );
            responses.push({
                path: batch.path,
                serializedPath: getSerializedPath(batch.path),
                publicKey: response.public_key,
            });

            if (this.hasBundle) {
                // send progress
                this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }
        }
        return this.hasBundle ? responses : responses[0];
    }
}
