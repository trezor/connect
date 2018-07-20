/* @flow */
'use strict';

import {
    buildTx,
} from 'hd-wallet';

import Account from '../../../account';
import BlockBook from '../../../backend';

import { init as initFees, getFeeLevels, getActualFee, getBlocks } from './fees';

import type {
    BuildTxOutputRequest,
    BuildTxResult,
} from 'hd-wallet';

import type { FeeLevel, CustomFeeLevel, SelectFeeLevel } from 'flowtype/fee';

const customFeeLevel: CustomFeeLevel = {
    name: 'custom',
    id: 4,
    info: {
        type: 'custom',
        fee: '10',
    },
};

export default class TransactionComposer {
    account: Account;
    outputs: Array<BuildTxOutputRequest>;
    currentHeight: number;
    feeLevels: Array<FeeLevel> = [];
    // composed: Array<BuildTxResult> = [];
    composed: {[key: string]: BuildTxResult} = {};

    constructor(account: Account, outputs: Array<BuildTxOutputRequest>) {
        this.account = account;
        this.outputs = outputs;
    }

    async init(backend: BlockBook) {
        await initFees(backend, this.account.coinInfo);
        this.feeLevels = [ ...getFeeLevels() ];
        this.currentHeight = await backend.loadCurrentHeight();
    }

    // Composing fee levels for SelectFee view in popup
    // async composeAllFeeLevels(): Promise<Array<BuildTxResult>> {
    async composeAllFeeLevels(): Promise<boolean> {
        const account = this.account;

        this.composed = {};

        let prevFee: number = 0;
        let level: FeeLevel;
        let atLeastOneValid: boolean = false;
        for (level of this.feeLevels) {
            let fee: number = getActualFee(level, this.account.coinInfo);
            if (prevFee > 0 && prevFee < fee) fee = prevFee;
            prevFee = fee;

            const tx: BuildTxResult = this.compose(fee);

            if (tx.type === 'final') {
                atLeastOneValid = true;
            } else if (tx.type === 'error' && tx.error === 'TWO-SEND-MAX') {
                throw new Error('Cannot compose transaction with two send-max outputs');
            }
            this.composed[ level.name ] = tx;
        }

        if (!atLeastOneValid) {
            // check with minimal fee
            const tx: BuildTxResult = this.compose(account.coinInfo.minFee);
            if (tx.type === 'final') {
                // add custom Fee level to list
                this.feeLevels.push(customFeeLevel);
                this.composed['custom'] = tx;
            } else {
                return false;
            }
        }

        return true;
    }

    composeCustomFee(fee: number): SelectFeeLevel {
        const tx: BuildTxResult = this.compose(fee);
        if (!this.composed['custom']) {
            this.feeLevels.push(customFeeLevel);
        }
        this.composed['custom'] = tx;
        if (tx.type === 'final') {
            return {
                name: 'custom',
                fee: tx.fee,
                feePerByte: tx.feePerByte,
                minutes: this.getEstimatedTime(tx.fee),
                total: tx.totalSpent,
            };
        } else {
            return {
                name: 'custom',
                fee: 0,
                disabled: true,
            };
        }
    }

    getFeeLevelList(): Array<SelectFeeLevel> {
        const list: Array<SelectFeeLevel> = [];
        this.feeLevels.forEach(level => {
            const tx: BuildTxResult = this.composed[level.name];
            if (tx && tx.type === 'final') {
                list.push({
                    name: level.name,
                    fee: tx.fee,
                    feePerByte: tx.feePerByte,
                    minutes: this.getEstimatedTime(tx.fee),
                    total: tx.totalSpent,
                });
            } else {
                list.push({
                    name: level.name,
                    fee: 0,
                    disabled: true,
                });
            }
        });
        return list;
    }

    compose(fee: number | FeeLevel): BuildTxResult {
        const account = this.account;
        const feeValue: number = typeof fee === 'number' ? fee : getActualFee(fee, account.coinInfo);

        const tx: BuildTxResult = buildTx({
            utxos: account.getUtxos(),
            outputs: this.outputs,
            height: this.currentHeight,
            feeRate: feeValue,
            segwit: account.coinInfo.segwit,
            inputAmounts: (account.coinInfo.segwit || account.coinInfo.forkid !== null),
            basePath: account.getPath(),
            network: account.coinInfo.network,
            changeId: account.getChangeIndex(),
            changeAddress: account.getNextChangeAddress(),
            dustThreshold: account.coinInfo.dustLimit,
        });

        return tx;
    }

    getEstimatedTime(fee: number): number {
        let minutes: number = 0;
        const blocks: ?number = getBlocks(fee);
        if (blocks) {
            minutes = this.account.coinInfo.blocktime * blocks;
        }
        return minutes;
    }

    dispose() {
        // TODO
    }
}
