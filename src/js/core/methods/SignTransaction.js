/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import { getLabel } from '../../utils/pathUtils';
import { NO_COIN_INFO } from '../../constants/errors';

import BlockBook, { create as createBackend } from '../../backend';
import * as helper from './helpers/signtx';

import {
    validateTrezorInputs,
    validateTrezorOutputs,
    inputToHD,
    getReferencedTransactions,
    transformReferencedTransactions,
} from './tx';

import type {
    TransactionInput,
    TransactionOutput,
    TransactionOptions,
    SignedTx,
} from '../../types/trezor';

import type {
    BuildTxInput,
} from 'hd-wallet';

import type { CoreMessage, BitcoinNetworkInfo } from '../../types';

type Params = {
    inputs: Array<TransactionInput>,
    hdInputs: Array<BuildTxInput>,
    outputs: Array<TransactionOutput>,
    options: TransactionOptions,
    coinInfo: BitcoinNetworkInfo,
    push: boolean,
}

export default class SignTransaction extends AbstractMethod {
    params: Params;
    backend: BlockBook;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.info = 'Sign transaction';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'inputs', type: 'array', obligatory: true },
            { name: 'outputs', type: 'array', obligatory: true },
            { name: 'locktime', type: 'number' },
            { name: 'timestamp', type: 'number' },
            { name: 'version', type: 'number' },
            { name: 'expiry', type: 'number' },
            { name: 'overwintered', type: 'boolean' },
            { name: 'versionGroupId', type: 'number' },
            { name: 'branchId', type: 'number' },
            { name: 'push', type: 'boolean' },
        ]);

        const coinInfo: ?BitcoinNetworkInfo = getBitcoinNetwork(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        } else {
            // set required firmware from coinInfo support
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
            this.info = getLabel('Sign #NETWORK transaction', coinInfo);
        }

        payload.inputs.forEach(utxo => {
            validateParams(utxo, [
                { name: 'amount', type: 'string' },
            ]);
        });

        payload.outputs.forEach(utxo => {
            validateParams(utxo, [
                { name: 'amount', type: 'string' },
            ]);
        });

        const inputs: Array<TransactionInput> = validateTrezorInputs(payload.inputs, coinInfo);
        const hdInputs: Array<BuildTxInput> = inputs.map(inputToHD);
        const outputs: Array<TransactionOutput> = validateTrezorOutputs(payload.outputs, coinInfo);

        const total: number = outputs.reduce((t, r) => t + r.amount, 0);
        if (total <= coinInfo.dustLimit) {
            throw new Error('Total amount is too low.');
        }

        this.params = {
            inputs,
            hdInputs,
            outputs: payload.outputs,
            options: {
                lock_time: payload.locktime,
                timestamp: payload.timestamp,
                version: payload.version,
                expiry: payload.expiry,
                overwintered: payload.overwintered,
                version_group_id: payload.versionGroupId,
                branch_id: payload.branchId,
            },
            coinInfo,
            push: payload.hasOwnProperty('push') ? payload.push : false,
        };

        if (coinInfo.hasTimestamp && !payload.hasOwnProperty('timestamp')) {
            const d = new Date();
            this.params.options.timestamp = Math.round(d.getTime() / 1000);
        }
    }

    async run(): Promise<SignedTx> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);
        const bjsRefTxs = await this.backend.loadTransactions(getReferencedTransactions(this.params.hdInputs));
        const refTxs = transformReferencedTransactions(bjsRefTxs);

        const response = await helper.signTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.inputs,
            this.params.outputs,
            refTxs,
            this.params.options,
            this.params.coinInfo,
        );

        if (this.params.push) {
            const txid = await this.backend.sendTransactionHex(response.serializedTx);
            return {
                ...response,
                txid,
            };
        }

        return response;
    }
}
