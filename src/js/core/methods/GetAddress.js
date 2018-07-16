/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getCoinInfoByCurrency, getCoinInfoFromPath, getAccountCoinInfo } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';

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
        this.info = 'Export address';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'coin', type: 'string' },
            { name: 'showOnTrezor', type: 'boolean' },
        ]);

        const path: Array<number> = validatePath(payload.path);
        let coinInfo: ?CoinInfo;

        if (payload.coin) {
            coinInfo = getCoinInfoByCurrency(payload.coin);
            validateCoinPath(coinInfo, path);
        } else {
            coinInfo = getCoinInfoFromPath(path);
        }

        if (!coinInfo) {
            throw NO_COIN_INFO;
        } else {
            // set required firmware from coinInfo support
            this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
        }

        // set coinInfo network values (segwit/legacy)
        coinInfo = getAccountCoinInfo(coinInfo, payload.path);

        let showOnTrezor: boolean = true;
        if (payload.hasOwnProperty('showOnTrezor')){
            showOnTrezor = payload.showOnTrezor;
        }

        this.useUi = showOnTrezor;

        this.params = {
            path,
            coinInfo,
            showOnTrezor
        }
    }

    async run(): Promise<Address> {
        const response:Address = await this.device.getCommands().getAddress(
            this.params.path,
            this.params.coinInfo,
            this.params.showOnTrezor
        );
        return response;
    }
}
