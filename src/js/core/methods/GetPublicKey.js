/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinInfo } from './helpers/paramsValidator';
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

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(message.payload, [
            { name: 'path', obligatory: true },
            { name: 'coin', type: 'string' },
        ]);

        const path: Array<number> = validatePath(payload.path);
        const coinInfoFromPath: ?CoinInfo = getCoinInfoFromPath(path);
        let coinInfo: ?CoinInfo;

        if (payload.coin) {
            coinInfo = getCoinInfoByCurrency(payload.coin);
            validateCoinInfo(coinInfoFromPath, coinInfo);
        } else {
            coinInfo = coinInfoFromPath;
        }

        // set required firmware from coinInfo support
        if (coinInfo) {
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
