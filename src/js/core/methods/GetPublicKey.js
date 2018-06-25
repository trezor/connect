/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath, getPathFromIndex } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';

import { getCoinInfoByCurrency, getCoinInfoFromPath, getCoinName } from '../../data/CoinInfo';
import { getPublicKeyLabel, isSegwitPath } from '../../utils/pathUtils';
import type { CoinInfo, UiPromiseResponse, CoreMessage } from 'flowtype';
import type { Success, HDNodeResponse } from 'flowtype/trezor';

type Params = {
    path: Array<number>;
    coinInfo: ?CoinInfo;
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

        if (payload.hasOwnProperty('coin') && payload.coin) {
            if (typeof payload.coin === 'string') {
                coinInfo = getCoinInfoByCurrency(payload.coin);
            } else {
                throw new Error('Parameter "coin" has invalid type. String expected.');
            }
        }

        if (payload.hasOwnProperty('path')) {
            path = validatePath(payload.path);
        } else {
            throw new Error('Parameters "path" is missing');
        }

        if (!coinInfo) {
            coinInfo = getCoinInfoFromPath(path);
        } else {
            const coinInfoFromPath: ?CoinInfo = getCoinInfoFromPath(path);
            if (coinInfoFromPath && coinInfo.shortcut !== coinInfoFromPath.shortcut) {
                throw new Error('Parameters "path" and "coin" dont match');
            }
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

        const coinName: string = getCoinName(this.params.path);
        const label = getPublicKeyLabel(this.params.path, this.params.coinInfo || coinName);

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-xpub',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device).promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<HDNodeResponse> {

        const response: HDNodeResponse = await this.device.getCommands().getHDNode(
            this.params.path,
            this.params.coinInfo
        );

        return response;
    }
}
