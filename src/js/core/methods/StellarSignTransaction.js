/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/stellarSignTx';

import type { StellarTransaction } from '../../types/networks/stellar';
import type { CoreMessage } from '../../types';

type Params = {
    path: number[];
    networkPassphrase: string;
    transaction: any;
}

export default class StellarSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Stellar'), this.firmwareRange);
        this.info = 'Sign Stellar transaction';

        const { payload } = message;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'networkPassphrase', type: 'string', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in stellar-sdk format
        const transaction: StellarTransaction = payload.transaction;
        this.params = {
            path,
            networkPassphrase: payload.networkPassphrase,
            transaction,
        };
    }

    async run() {
        const response = await helper.stellarSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.networkPassphrase,
            this.params.transaction
        );

        return {
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
