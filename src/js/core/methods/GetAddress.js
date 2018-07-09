/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import { getCoinInfoByCurrency, getCoinInfoFromPath, getAccountCoinInfo } from '../../data/CoinInfo';

import type { MessageResponse } from '../../device/DeviceCommands';
import type { Address } from '../../types/trezor';
import type { CoinInfo } from 'flowtype';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
    coinInfo: CoinInfo;
    showOnTrezor: boolean;
}

export default class GetAddress extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.info = 'Export address';

        const payload: Object = message.payload;
        let coinInfo: ?CoinInfo;
        if (payload.hasOwnProperty('coin')) {
            if (typeof payload.coin === 'string') {
                coinInfo = getCoinInfoByCurrency(payload.coin);
            } else {
                throw new Error('Parameter "coin" has invalid type. String expected.');
            }
        }

        if (payload.hasOwnProperty('path')) {
            payload.path = validatePath(payload.path);
        } else {
            throw new Error('Parameter "path" is missing');
        }

        if (!coinInfo) {
            coinInfo = getCoinInfoFromPath(payload.path);
        } else {
            const coinInfoFromPath: ?CoinInfo = getCoinInfoFromPath(payload.path);
            if (coinInfoFromPath && coinInfo.shortcut !== coinInfoFromPath.shortcut) {
                throw new Error('Parameters "path" and "coin" dont match');
            }
        }

        if (!coinInfo) {
            throw new Error('Coin not found');
        }

        coinInfo = getAccountCoinInfo(coinInfo, payload.path);

        let showOnTrezor: boolean = true;
        if (payload.hasOwnProperty('showOnTrezor')){
            if (typeof payload.showOnTrezor !== 'boolean') {
                throw new Error('Parameter "showOnTrezor" has invalid type. Boolean expected.');
            } else {
                showOnTrezor = payload.showOnTrezor;
            }
        }

        this.useUi = showOnTrezor;

        this.params = {
            path: payload.path,
            coinInfo,
            showOnTrezor
        }
    }

    async run(): Promise<Address> {
        const response: MessageResponse<Address> = await this.device.getCommands().getAddress(
            this.params.path,
            this.params.coinInfo,
            this.params.showOnTrezor
        );
        return {
            ...response.message
        };
    }
}
