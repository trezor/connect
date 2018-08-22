/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import type { LiskMessageSignature } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>,
    message: string,
}

export default class LiskSignMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['1.7.0', '2.0.7'];

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);
        this.info = 'Sign Lisk Message';

        // TODO: check if message is already in hex format
        const messageHex: string = new Buffer(payload.message, 'utf8').toString('hex');
        this.params = {
            path,
            message: messageHex,
        };
    }

    async run(): Promise<LiskMessageSignature> {
        const response: LiskMessageSignature = await this.device.getCommands().liskSignMessage(
            this.params.path,
            this.params.message
        );
        return response;
    }
}
