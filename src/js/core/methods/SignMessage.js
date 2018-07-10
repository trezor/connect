/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
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

        const payload: any = message.payload;
        let coinInfo: ?CoinInfo;

        if (payload.hasOwnProperty('coin') && payload.coin) {
            if (typeof payload.coin === 'string') {
                coinInfo = getCoinInfoByCurrency(payload.coin);
            } else {
                throw new Error('Parameter "coin" has invalid type. String expected.');
            }
        }

        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path);
        }

        if (!coinInfo) {
            coinInfo = getCoinInfoFromPath(payload.path);
        } else {
            const coinInfoFromPath: ?CoinInfo = getCoinInfoFromPath(payload.path);
            if (coinInfoFromPath && coinInfo.shortcut !== coinInfoFromPath.shortcut) {
                throw new Error('Parameters "path" and "coin" do not match');
            }
        }

        if (coinInfo) {
            // check required firmware with coinInfo support
            this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
        }

        if (!payload.hasOwnProperty('message')){
            throw new Error('Parameter "message" is missing');
        } else if (typeof payload.message !== 'string') {
            throw new Error('Parameter "message" has invalid type. String expected.');
        }

        const messageHex: string = new Buffer(payload.message, 'utf8').toString('hex');

        this.params = {
            path: payload.path,
            message: messageHex,
            coinInfo
        }
    }

    async run(): Promise<MessageSignature> {
        const response: MessageResponse<MessageSignature> = await this.device.getCommands().signMessage(
            this.params.path,
            this.params.message,
            this.params.coinInfo ? this.params.coinInfo.name : null
        );
        return response.message;
    }
}
