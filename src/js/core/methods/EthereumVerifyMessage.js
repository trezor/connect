/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { Success } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    address: string;
    signature: string;
    message: string;
}

export default class EthereumVerifyMessage extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['write'];
        this.requiredFirmware = ['1.6.2', '2.0.7'];
        this.info = 'Verify Ethereum message';

        const payload: any = message.payload;

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
            message: messageHex
        }
    }

    async run(): Promise<Success> {
        const response: MessageResponse<Success> = await this.device.getCommands().ethereumVerifyMessage(
            this.params.address,
            this.params.signature,
            this.params.message,
        );
        return response.message;
    }
}
