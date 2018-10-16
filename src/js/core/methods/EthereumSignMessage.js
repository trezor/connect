/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { toChecksumAddress, getNetworkLabel, messageToHex } from '../../utils/ethereumUtils';

import type { MessageSignature } from '../../types/trezor';
import type { CoreMessage } from '../../types';
import type { EthereumNetworkInfo } from 'flowtype';

type Params = {
    path: Array<number>,
    network: ?EthereumNetworkInfo,
    message: string,
}

export default class EthereumSignMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        // this.requiredFirmware = ['1.6.2', '2.0.7'];

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);
        const network: ?EthereumNetworkInfo = getEthereumNetwork(path);

        this.info = getNetworkLabel('Sign #NETWORK message', network);

        const messageHex = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            path,
            network,
            message: messageHex,
        };
    }

    async run(): Promise<MessageSignature> {
        const response: MessageSignature = await this.device.getCommands().ethereumSignMessage(
            this.params.path,
            this.params.message
        );
        response.address = toChecksumAddress(response.address, this.params.network);
        return response;
    }
}
