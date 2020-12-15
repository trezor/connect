/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { toChecksumAddress, getNetworkLabel } from '../../utils/ethereumUtils';
import { messageToHex } from '../../utils/formatUtils';
import type { CoreMessage, EthereumNetworkInfo } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

type Params = {
    ...$ElementType<MessageType, 'EthereumSignMessage'>,
    network?: EthereumNetworkInfo;
};

export default class EthereumSignMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const path = validatePath(payload.path, 3);
        const network = getEthereumNetwork(path);
        this.firmwareRange = getFirmwareRange(this.name, network, this.firmwareRange);

        this.info = getNetworkLabel('Sign #NETWORK message', network);

        const messageHex = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            address_n: path,
            message: messageHex,
            network,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const { address_n, message, network } = this.params;
        const response = await cmd.typedCall('EthereumSignMessage', 'EthereumMessageSignature', {
            address_n,
            message,
        });
        response.message.address = toChecksumAddress(response.message.address, network);
        return response.message;
    }
}
