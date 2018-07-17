/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import type { MessageSignature } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
    message: string;
}

export default class EthereumSignMessage extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['write'];
        this.requiredFirmware = ['1.6.2', '2.0.7'];
        this.info = 'Sign Ethereum message';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);
        // TODO: check if message is already in hex format
        const messageHex: string = new Buffer(payload.message, 'utf8').toString('hex');
        this.params = {
            path,
            message: messageHex
        }
    }

    async run(): Promise<MessageSignature> {
        return await this.device.getCommands().ethereumSignMessage(
            this.params.path,
            this.params.message
        );
    }
}
