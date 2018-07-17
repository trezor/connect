/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getCoinInfoByCurrency, getCoinInfoFromPath } from '../../data/CoinInfo';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { MessageSignature } from '../../types/trezor';
import type { CoinInfo } from 'flowtype';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
    message: string;
    coinInfo: ?CoinInfo;
}

export default class SignMessage extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['write'];
        this.info = 'Sign message';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'coin', type: 'string' },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path)
        let coinInfo: ?CoinInfo;
        if (payload.coin) {
            coinInfo = getCoinInfoByCurrency(payload.coin);
            validateCoinPath(coinInfo, path);
        } else {
            coinInfo = getCoinInfoFromPath(path);
        }

        if (coinInfo) {
            // check required firmware with coinInfo support
            this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
        }
        // TODO: check if it's already a hex
        const messageHex: string = new Buffer(payload.message, 'utf8').toString('hex');

        this.params = {
            path,
            message: messageHex,
            coinInfo
        }
    }

    async run(): Promise<MessageSignature> {
        const response: MessageSignature = await this.device.getCommands().signMessage(
            this.params.path,
            this.params.message,
            this.params.coinInfo ? this.params.coinInfo.name : null
        );
        return response;
    }
}
