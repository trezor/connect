/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type { CoreMessage } from '../../types';
import type { LiskMessageSignature } from '../../types/networks/lisk';
import type { MessageType } from '../../types/trezor/protobuf';

export default class LiskSignMessage extends AbstractMethod {
    params: $ElementType<MessageType, 'LiskSignMessage'>;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Lisk'), this.firmwareRange);

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        this.info = 'Sign Lisk Message';

        // TODO: check if message is already in hex format
        const messageHex = Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            address_n: path,
            message: messageHex,
        };
    }

    async run(): Promise<LiskMessageSignature> {
        const cmd = this.device.getCommands();
        const { message } = await cmd.typedCall('LiskSignMessage', 'LiskMessageSignature', this.params);
        return {
            publicKey: message.public_key,
            signature: message.signature,
        };
    }
}
