/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import type { Success } from '../../types/trezor/protobuf';
import type { CoreMessage } from '../../types';

import { stripHexPrefix, messageToHex } from '../../utils/formatUtils';

type Params = {
    address: string;
    signature: string;
    message: string;
}

export default class EthereumVerifyMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Verify message';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'address', type: 'string', obligatory: true },
            { name: 'signature', type: 'string', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const messageHex = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            address: stripHexPrefix(payload.address),
            signature: stripHexPrefix(payload.signature),
            message: messageHex,
        };
    }

    async run(): Promise<Success> {
        return await this.device.getCommands().ethereumVerifyMessage(
            this.params.address,
            this.params.signature,
            this.params.message,
        );
    }
}
