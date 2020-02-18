/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import type { Success } from '../../types/trezor/protobuf';
import type { CoreMessage } from '../../types';

type Params = {
    publicKey: string;
    signature: string;
    message: string;
}

export default class LiskVerifyMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Lisk'), this.firmwareRange);
        this.info = 'Verify Lisk message';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'publicKey', type: 'string', obligatory: true },
            { name: 'signature', type: 'string', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        // TODO: check if message is already in hex format
        const messageHex: string = Buffer.from(payload.message, 'utf8').toString('hex');

        this.params = {
            publicKey: payload.publicKey,
            signature: payload.signature,
            message: messageHex,
        };
    }

    async run(): Promise<Success> {
        return await this.device.getCommands().liskVerifyMessage(
            this.params.publicKey,
            this.params.signature,
            this.params.message,
        );
    }
}
