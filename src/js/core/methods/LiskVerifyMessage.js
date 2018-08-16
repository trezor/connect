/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import type { Success } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    public_key: string,
    signature: string,
    message: string,
}

export default class LiskVerifyMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['1.7.0', '2.0.7'];
        this.info = 'Verify Lisk message';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'public_key', type: 'string', obligatory: true },
            { name: 'signature', type: 'string', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        // TODO: check if message is already in hex format
        const messageHex: string = new Buffer(payload.message, 'utf8').toString('hex');

        this.params = {
            public_key: payload.public_key,
            signature: payload.signature,
            message: messageHex,
        };
    }

    async run(): Promise<Success> {
        return await this.device.getCommands().liskVerifyMessage(
            this.params.public_key,
            this.params.signature,
            this.params.message,
        );
    }
}
