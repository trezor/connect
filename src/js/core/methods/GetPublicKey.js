/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath, getPathFromIndex } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import { getCoinInfoByCurrency, getCoinInfoFromPath } from '../../data/CoinInfo';
import { getPublicKeyLabel, isSegwitPath } from '../../utils/pathUtils';
import type { CoinInfo, UiPromiseResponse } from 'flowtype';
import type { Success, HDNodeResponse } from '../../types/trezor';
import type { CoreMessage } from '../../types';

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
        this.requiredFirmware = ['1.0.0', '2.0.0'];
        // If permission is granted and export confirmed, set to false
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
                throw new Error('Parameters "path" and "coin" do not match');
            }
        }

        if (coinInfo) {
            // check required firmware with coinInfo support
            this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
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
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        const label = getPublicKeyLabel(this.params.path, this.params.coinInfo);

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

    async run(): Promise<HDNodeResponse> {

        const response: HDNodeResponse = await this.device.getCommands().getHDNode(
            this.params.path,
            this.params.coinInfo
        );

        return response;
    }
}
