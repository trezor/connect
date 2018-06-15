/* @flow */
'use strict';

import {
    buildTx,
} from 'hd-wallet';

import type {
    AccountInfo,
    BuildTxResult,
} from 'hd-wallet';

import {
    Transaction as BitcoinJsTransaction,
} from 'bitcoinjs-lib-zcash';

import Account from '../account/Account';
import type { CoinInfo } from 'flowtype';

import { init as initFees, feeLevels, getActualFee, getBlocks } from './fees/index';
import type { CustomFeeLevel, FeeLevel } from './fees/index';

import { uniq, reverseBuffer } from '../utils/bufferUtils';
import BitcoreBackend from '../backend/BitcoreBackend';

// duplicate from hd-wallet (it's not exported there)
export type Output = {
    path: Array<number>,
    value: number,
    segwit: boolean,
} | {
    address: string,
    value: number,
} | {
    opReturnData: Buffer,
};
// duplicate from hd-wallet (it's not exported there)
export type Input = {
    hash: Buffer,
    index: number,
    path?: Array<number>, // necessary for trezor.js
    segwit: boolean,
    amount?: number, // only with segwit
};

export default class TransactionComposer {
    account: Account;
    coinInfo: CoinInfo;
    outputs: Array<any>;
    feeLevels: $ReadOnlyArray<FeeLevel>;
    selectedFeeLevel: FeeLevel;
    customFeeLevel: CustomFeeLevel = {
        name: 'custom',
        id: 4,
        info: {
            type: 'custom',
            fee: '10',
        },
    };
    currentHeight: number;
    composed: Array<BuildTxResult>;

    constructor(account?: Account, outputs?: Array<any>) {
        if (account) {
            this.account = account;
            // this.coinInfo = account.backend.coinInfo;
            this.coinInfo = account.coinInfo;
        }
        if (outputs) { this.outputs = outputs; }
    }

    async init(level: ?string, customFee: ?string): Promise<void> {
        await initFees(this.account.backend);

        const levels: $ReadOnlyArray<FeeLevel> = feeLevels().concat([this.customFeeLevel]);
        this.feeLevels = levels;

        const findingString: ?string = level == null ? 'normal' : (
            /^\d$/.test(level) ? 'normal' : level
        );

        this.selectedFeeLevel = levels.filter(l => l.name === findingString)[0];

        if (this.selectedFeeLevel == null) {
            this.selectedFeeLevel = levels.filter(l => l.name === 'normal')[0];
        }

        if (typeof customFee === 'string') {
            this.customFeeLevel.info.fee = customFee;
        }

        this.currentHeight = await this.account.backend.loadCurrentHeight();
    }

    async composeAllLevels(): Promise<Array<BuildTxResult>> {
        const accountInfo: AccountInfo = this.account.getAccountInfo();

        this.composed = [];

        let prevFee: number = 0;
        let level: FeeLevel;
        for (level of this.feeLevels) {
            let fee: number = getActualFee(level);
            if (prevFee > 0 && prevFee < fee) fee = prevFee;
            prevFee = fee;

            const tx: BuildTxResult = buildTx({
                utxos: this.account.getUtxos(),
                outputs: this.outputs,
                height: this.currentHeight,
                feeRate: fee,
                segwit: this.coinInfo.segwit,
                inputAmounts: (this.coinInfo.segwit || this.coinInfo.forkid !== null),
                basePath: this.account.getPath(),
                network: this.coinInfo.network,
                changeId: accountInfo.changeIndex,
                changeAddress: accountInfo.changeAddresses[ accountInfo.changeIndex ],
                dustThreshold: this.coinInfo.dustLimit,
            });
            this.composed.push(tx);
        }
        return this.composed;
    }

    getEstimatedTime(fee: number): number {
        let minutes: number = 0;
        const blocks: ?number = getBlocks(fee);
        if (blocks) {
            minutes = this.coinInfo.blocktime * blocks;
        }
        return minutes;
    }

    compose(fee: number | FeeLevel): BuildTxResult {
        const accountInfo: AccountInfo = this.account.getAccountInfo();
        const feeValue: number = typeof fee === 'number' ? fee : getActualFee(fee);

        const tx: BuildTxResult = buildTx({
            utxos: this.account.getUtxos(),
            outputs: this.outputs,
            height: this.currentHeight,
            feeRate: feeValue,
            segwit: this.coinInfo.segwit,
            inputAmounts: (this.coinInfo.segwit || this.coinInfo.forkid !== null),
            basePath: this.account.getPath(),
            network: this.coinInfo.network,
            changeId: accountInfo.changeIndex,
            changeAddress: accountInfo.changeAddresses[ accountInfo.changeIndex ],
            dustThreshold: this.coinInfo.dustLimit,
        });

        return tx;
    }

    // TODO: move this to hd-wallet
    async getReferencedTx(inputs: any, backend?: BitcoreBackend): Promise<Array<BitcoinJsTransaction>> {
        const legacyInputs = [];
        for (const utxo of inputs) {
            if (!utxo.segwit) {
                legacyInputs.push(utxo);
            }
        }

        if (legacyInputs.length < 1) {
            return Promise.resolve([]);
        } else {
            // const uins: Array<string> = uniq(nonSegwitInputs, inp => reverseBuffer(inp.hash).toString('hex')).map(tx => reverseBuffer(tx.hash).toString('hex'));
            const uins: Array<string> = uniq(legacyInputs, inp => reverseBuffer(inp.hash).toString('hex')).map(tx => reverseBuffer(tx.hash).toString('hex'));
            const bitcore: BitcoreBackend = backend || this.account.backend;
            return Promise.all(
                // uins.map(id => this.backend.loadTransaction(id))
                uins.map(id => bitcore.loadTransaction(id))
            );
        }
    }
}
