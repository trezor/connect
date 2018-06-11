/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath, getPathFromIndex } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';

import { getCoinInfoByCurrency, getCoinInfoFromPath } from '../../backend/CoinInfo';
import type { CoinInfo } from '../../backend/CoinInfo';
import type { UiPromiseResponse, CoreMessage } from 'flowtype';
import type { Success, HDNodeResponse } from 'flowtype/trezor';

type Params = {
    path: Array<number>;
    coinInfo: CoinInfo;
    confirmation?: boolean;
}

export default class GetPublicKey extends AbstractMethod {

    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = true; // If permission is granted and export confirmed, set to false
        this.info = 'Export public key';

        const payload: any = message.payload;

        let path: Array<number>;
        let coinInfo: ?CoinInfo;

        if (payload.hasOwnProperty('coin')) {
            if (typeof payload.coin === 'string') {
                coinInfo = getCoinInfoByCurrency(payload.coin);
            } else {
                throw new Error('Parameter "coin" has invalid type. String expected.');
            }
        }

        /*
        if (payload.hasOwnProperty('account')) {
            if (!payload.hasOwnProperty('coin')) {
                throw new Error('Parameter "account" cannot be has invalid type. String expected.');
            }
            if (payload.hasOwnProperty('accountLegacy')) {

            }
            path = [1];
        } else
        */

        if (payload.hasOwnProperty('path')) {
            path = validatePath(payload.path);
        } else {
            throw new Error('Parameters "path" or "account" are missing');
        }

        if (!coinInfo) {
            coinInfo = getCoinInfoFromPath(path);
        }

        if (!coinInfo) {
            throw new Error(`CoinInfo for path: ${ path.toString() } could not be found`);
        }

        this.params = {
            path,
            coinInfo,
        }
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-xpub',
            accountType: {
                account: 1,
                legacy: true,
                label: "public key of bitcoin legacy Account #1"
            },
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device).promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<Object> {

        const response: HDNodeResponse = await this.device.getCommands().getHDNode(
            this.params.path,
            this.params.coinInfo
        );

        return { ...response };
    }
}
