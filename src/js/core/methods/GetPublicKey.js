/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath } from './helpers/paramsValidator';
import { validatePath, getPathFromIndex } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import { getCoinInfoByCurrency, getCoinInfoFromPath } from '../../data/CoinInfo';
import { getPublicKeyLabel, isSegwitPath } from '../../utils/pathUtils';
import type { CoinInfo, UiPromiseResponse } from 'flowtype';
import type { Success, HDNodeResponse } from '../../types/trezor';
import type { CoreMessage } from '../../types';


type Batch = {
    path: Array<number>;
    coinInfo: ?CoinInfo;
}
type Params = {
    bundle: Array<Batch>;
    bundledResponse: boolean;
}

export default class GetPublicKey extends AbstractMethod {

    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = ['1.0.0', '2.0.0'];
        // If permission is granted and export confirmed, set to false
        this.info = 'Export public key';

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

        // let coinInfo: ?CoinInfo;
        // if (payload.coin) {
        //     coinInfo = getCoinInfoByCurrency(payload.coin);
        // }

        const bundle = [];
        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            const path: Array<number> = validatePath(batch.path);
            let coinInfo: ?CoinInfo;
            if (batch.coin) {
                coinInfo = getCoinInfoByCurrency(batch.coin);
            }
            if (coinInfo && !batch.crossChain) {
                validateCoinPath(coinInfo, path);
            } else if (!coinInfo) {
                coinInfo = getCoinInfoFromPath(path);
            }
            bundle.push({
                path,
                coinInfo,
            });
        });

        // if (!coinInfo) {
        //     // coinInfo = getCoinInfoFromPath(path);
        // }

        // set required firmware from coinInfo support
        // if (coinInfo) {
        //     this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
        // }

        this.params = {
            bundle,
            bundledResponse,
        }
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // const label = getPublicKeyLabel(this.params.path, this.params.coinInfo);
        let label: string;
        if (this.params.bundle.length > 1) {
            label = 'Export multiple keys';
        } else {
            label = getPublicKeyLabel(this.params.bundle[0].path, this.params.bundle[0].coinInfo);
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

    async run(): Promise<HDNodeResponse | Array<HDNodeResponse>> {
        const responses: Array<HDNodeResponse> = [];
        for (let i = 0; i < this.params.bundle.length; i++) {
            console.warn("CI",this.params.bundle[i].coinInfo )
            const response: HDNodeResponse = await this.device.getCommands().getHDNode(
                this.params.bundle[i].path,
                this.params.bundle[i].coinInfo
            );
            responses.push(response);
        }
        return this.params.bundledResponse ? responses : responses[0];
    }
}
