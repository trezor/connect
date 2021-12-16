/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { toChecksumAddress, getNetworkLabel } from '../../utils/ethereumUtils';
import type { CoreMessage, EthereumNetworkInfo } from '../../types';
import * as helper from './helpers/ethereumSignTypedData';

type Params = {
    path: number[],
    message: any,
    metamaskV4Compat: boolean,
    network?: EthereumNetworkInfo,
};

export default class EthereumSignTypedData extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'message', type: 'object', obligatory: true },
            { name: 'metamaskV4Compat', type: 'boolean' },
        ]);

        const path = validatePath(payload.path, 3);
        const network = getEthereumNetwork(path);
        this.firmwareRange = getFirmwareRange(this.name, network, this.firmwareRange);

        this.info = getNetworkLabel('Sign #NETWORK typed data', network);

        this.params = {
            path,
            message: payload.message,
            network,
            metamaskV4Compat: !!payload.metamaskV4Compat,
        };
    }

    async run() {
        const typedCall = this.device.getCommands().typedCall.bind(this.device.getCommands());
        const response = await helper.ethereumSignTypedData(
            typedCall,
            this.params.path,
            this.params.message,
            this.params.metamaskV4Compat,
        );

        response.address = toChecksumAddress(response.address, this.params.network);
        response.signature = `0x${response.signature}`;
        return response;
    }
}
