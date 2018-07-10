/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { getCoinInfoByCurrency } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import BlockBook, { create as createBackend } from '../../backend';
import * as helper from './helpers/signtx';
import {
    validateInputs,
    validateOutputs,
    getReferencedTransactions,
    transformReferencedTransactions
} from './tx';

import type {
    TransactionInput,
    TransactionOutput,
    SignedTx
} from '../../types/trezor';

import type {
    BuildTxInput,
    BuildTxOutput
} from 'hd-wallet';

import type { CoinInfo } from 'flowtype';
import type { CoreMessage } from '../../types';



type Params = {
    inputs: Array<TransactionInput>;
    hdInputs:Array<BuildTxInput>;
    outputs: Array<any>;
    coinInfo: CoinInfo;
}

export default class SignTransaction extends AbstractMethod {

    params: Params;
    backend: BlockBook;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.info = 'Sign transaction';

        const payload: any = message.payload;
        if (!payload.hasOwnProperty('inputs')) {
            throw new Error('Parameter "inputs" is missing');
        }

        if (!payload.hasOwnProperty('outputs')) {
            throw new Error('Parameter "outputs" is missing');
        } else {

        }

        let coinInfo: ?CoinInfo;
        if (!payload.hasOwnProperty('coin')) {
            throw new Error('Parameter "coin" is missing');
        } else {
            if (typeof payload.coin === 'string') {
                coinInfo = getCoinInfoByCurrency(payload.coin);
            } else {
                throw new Error('Parameter "coin" has invalid type. String expected.');
            }
        }

        if (!coinInfo) {
            throw new Error('Coin not found');
        } else {
            // check required firmware with coinInfo support
            this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];
        }

        const {
            inputs,
            hdInputs
        } = validateInputs(payload.inputs, coinInfo.network);

        const outputs = validateOutputs(payload.outputs, coinInfo.network);

        const total = outputs.reduce((t, r) => t + r.amount, 0);
        if (total <= coinInfo.dustLimit) {
            throw new Error('AMOUNT_TOO_LOW');
        }

        this.params = {
            inputs,
            hdInputs,
            outputs: payload.outputs,
            coinInfo,
        }
    }

    async run(): Promise<SignedTx> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);
        const bjsRefTxs = await this.backend.loadTransactions( getReferencedTransactions(this.params.hdInputs) );
        const refTxs = transformReferencedTransactions(bjsRefTxs);

        const response = await helper.signTx(
            this.device.getCommands().typedCall.bind( this.device.getCommands() ),
            this.params.inputs,
            this.params.outputs,
            refTxs,
            this.params.coinInfo,
        );

        return response.message
    }
}
