/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import type { CardanoMessageSignature } from '../../types/trezor';
import type { CardanoMessageSignature as CardanoSignedMessage } from '../../types/cardano';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>,
    message: string,
}

export default class CardanoSignMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = ['0', '2.0.7'];
        this.info = 'Sign Cardano message';

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
            message: messageHex,
        };
    }

    async run(): Promise<CardanoSignedMessage> {
        const response: CardanoMessageSignature = await this.device.getCommands().cardanoSignMessage(
            this.params.path,
            this.params.message
        );
        return {
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
