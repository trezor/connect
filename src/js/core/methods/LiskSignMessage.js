/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type { LiskMessageSignature } from '../../types/trezor/protobuf';
import type { CoreMessage } from '../../types';
import type { LiskMessageSignature as LiskMessageSignatureResponse } from '../../types/networks/lisk';

type Params = {
    path: Array<number>;
    message: string;
}

export default class LiskSignMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Lisk'), this.firmwareRange);

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);
        this.info = 'Sign Lisk Message';

        // TODO: check if message is already in hex format
        const messageHex: string = Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            path,
            message: messageHex,
        };
    }

    async run(): Promise<LiskMessageSignatureResponse> {
        const response: LiskMessageSignature = await this.device.getCommands().liskSignMessage(
            this.params.path,
            this.params.message
        );
        return {
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
