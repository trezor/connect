/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { toChecksumAddress, getNetworkLabel } from '../../utils/ethereumUtils';
import { messageToHex } from '../../utils/formatUtils';

import type { MessageSignature } from '../../types/trezor/protobuf';
import type { CoreMessage, EthereumNetworkInfo } from '../../types';

type Params = {
    path: Array<number>;
    network: ?EthereumNetworkInfo;
    message: string;
}

export default class EthereumSignMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);
        const network: ?EthereumNetworkInfo = getEthereumNetwork(path);
        this.firmwareRange = getFirmwareRange(this.name, network, this.firmwareRange);

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
