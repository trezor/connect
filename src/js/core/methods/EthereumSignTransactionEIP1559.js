/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { getNetworkLabel } from '../../utils/ethereumUtils';
import { stripHexPrefix } from '../../utils/formatUtils';
import * as helper from './helpers/ethereumSignTx';

import type { CoreMessage } from '../../types';
import type { EthereumTransactionEIP1559 } from '../../types/networks/ethereum';

type Params = {
    path: number[],
    transaction: EthereumTransactionEIP1559,
};

export default class EthereumSignTx extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        const network = getEthereumNetwork(path);
        this.firmwareRange = getFirmwareRange(this.name, network, this.firmwareRange);

        this.info = getNetworkLabel('Sign #NETWORK transaction', network);

        // incoming transaction should be in EthereumTx format
        // https://github.com/ethereumjs/ethereumjs-tx
        const tx: EthereumTransactionEIP1559 = payload.transaction;
        validateParams(tx, [
            { name: 'to', type: 'string', obligatory: true },
            { name: 'value', type: 'string', obligatory: true },
            { name: 'gasLimit', type: 'string', obligatory: true },
            { name: 'maxFeePerGas', type: 'string', obligatory: true },
            { name: 'maxPriorityFeePerGas', type: 'string', obligatory: true },
            { name: 'nonce', type: 'string', obligatory: true },
            { name: 'data', type: 'string' },
            { name: 'chainId', type: 'number', obligatory: true },
        ]);

        // TODO: check if tx data is a valid hex

        // strip '0x' from values
        Object.keys(tx).forEach(key => {
            if (typeof tx[key] === 'string') {
                let value = stripHexPrefix(tx[key]);
                // pad left even
                if (value.length % 2 !== 0) {
                    value = `0${value}`;
                }
                // $FlowIssue
                tx[key] = value;
            }
        });

        this.params = {
            path,
            transaction: tx,
        };
    }

    run() {
        const tx = this.params.transaction;
        return helper.ethereumSignTxEIP1559(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            tx.to,
            tx.value,
            tx.gasLimit,
            tx.maxFeePerGas,
            tx.maxPriorityFeePerGas,
            tx.nonce,
            tx.chainId,
            tx.data,
        );
    }
}
