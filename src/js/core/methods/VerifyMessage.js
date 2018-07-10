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
    address: string;
    signature: string;
    message: string;
    coinInfo: CoinInfo;
}

export default class VerifyMessage extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.info = 'Verify message';

        const payload: any = message.payload;

        if (!payload.hasOwnProperty('coin')) {
            throw new Error('Parameter "coin" is missing.');
        } else if (typeof payload.coin !== 'string') {
            throw new Error('Parameter "coin" has invalid type. String expected.');
        }

        const coinInfo: ?CoinInfo = getCoinInfoByCurrency(payload.coin);
        if (!coinInfo) {
            throw new Error('Coin not found.');
        }

        if (!payload.hasOwnProperty('address')) {
            throw new Error('Parameter "address" is missing');
        } else if (typeof payload.address !== 'string') {
            throw new Error('Parameter "address" has invalid type. String expected.');
        }

        if (!payload.hasOwnProperty('signature')){
            throw new Error('Parameter "signature" is missing');
        } else if (typeof payload.signature !== 'string') {
            throw new Error('Parameter "signature" has invalid type. String expected.');
        }

        if (!payload.hasOwnProperty('message')){
            throw new Error('Parameter "message" is missing');
        } else if (typeof payload.message !== 'string') {
            throw new Error('Parameter "message" has invalid type. String expected.');
        }

        const messageHex: string = new Buffer(payload.message, 'utf8').toString('hex');

        this.params = {
            address: payload.address,
            signature: payload.signature,
            message: messageHex,
            coinInfo
        }
    }

    async run(): Promise<Object> {
        const response: MessageResponse<MessageSignature> = await this.device.getCommands().verifyMessage(
            this.params.address,
            this.params.signature,
            this.params.message,
            this.params.coinInfo.name
        );
        return {
            ...response.message
        }
    }
}
