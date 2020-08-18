/* @flow */
import BigNumber from 'bignumber.js';
import { buildTx } from 'hd-wallet';

import Fees from './Fees';
import BlockchainLink from '../../../backend/BlockchainLink';
import { getHDPath } from '../../../utils/pathUtils';

import type {
    UtxoInfo,
    BuildTxOutputRequest,
    BuildTxResult,
} from 'hd-wallet';

import type { BitcoinNetworkInfo } from '../../../types';
import type { DiscoveryAccount, AccountUtxo, SelectFeeLevel } from '../../../types/account';

type Options = {
    account: DiscoveryAccount;
    utxo: AccountUtxo[];
    outputs: BuildTxOutputRequest[];
    coinInfo: BitcoinNetworkInfo;
}

export default class TransactionComposer {
    account: DiscoveryAccount;
    utxos: UtxoInfo[];
    outputs: BuildTxOutputRequest[];
    coinInfo: BitcoinNetworkInfo;
    blockHeight: number = 0;
    feeLevels: Fees;
    composed: {[key: string]: BuildTxResult} = {};

    constructor(options: Options) {
        this.account = options.account;
        this.outputs = options.outputs;
        this.coinInfo = options.coinInfo;
        this.blockHeight = 0;
        this.feeLevels = new Fees(options.coinInfo);

        // map to hd-wallet/buildTx format
        const { addresses } = options.account;
        const allAddresses: string[] = !addresses ? [] : addresses.used.concat(addresses.unused).concat(addresses.change).map(a => a.address);
        this.utxos = options.utxo.map(u => {
            const addressPath = getHDPath(u.path);
            return {
                index: u.vout,
                transactionHash: u.txid,
                value: u.amount,
                addressPath: [addressPath[3], addressPath[4]],
                height: u.blockHeight,
                tsize: 0, // doesn't matter
                vsize: 0, // doesn't matter
                coinbase: typeof u.coinbase === 'boolean' ? u.coinbase : false, // decide it it can be spent immediately (false) or after 100 conf (true)
                own: allAddresses.indexOf(u.address) >= 0, // decide if it can be spent immediately (own) or after 6 conf (not own)
            };
        });
    }

    async init(blockchain: BlockchainLink) {
        const { blockHeight } = await blockchain.getNetworkInfo();
        this.blockHeight = blockHeight;

        await this.feeLevels.load(blockchain);
    }

    // Composing fee levels for SelectFee view in popup
    composeAllFeeLevels() {
        const { levels } = this.feeLevels;
        if (this.utxos.length < 1) return false;

        this.composed = {};
        let atLeastOneValid = false;
        for (const level of levels) {
            if (level.feePerUnit !== '0') {
                const tx = this.compose(level.feePerUnit);
                if (tx.type === 'final') {
                    atLeastOneValid = true;
                }
                this.composed[level.label] = tx;
            }
        }

        if (!atLeastOneValid) {
            const lastLevel = levels[levels.length - 1];
            let lastFee = new BigNumber(lastLevel.feePerUnit);
            while (lastFee.gt(this.coinInfo.minFee) && this.composed['custom'] === undefined) {
                lastFee = lastFee.minus(1);

                const tx = this.compose(lastFee.toString());
                if (tx.type === 'final') {
                    this.feeLevels.updateCustomFee(lastFee.toString());
                    this.composed['custom'] = tx;
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    composeCustomFee(fee: string) {
        const tx = this.compose(fee);
        this.composed['custom'] = tx;
        if (tx.type === 'final') {
            this.feeLevels.updateCustomFee(tx.feePerByte);
        } else {
            this.feeLevels.updateCustomFee(fee);
        }
    }

    getFeeLevelList() {
        const list: SelectFeeLevel[] = [];
        const { levels } = this.feeLevels;
        levels.forEach(level => {
            const tx = this.composed[level.label];
            if (tx && tx.type === 'final') {
                list.push({
                    name: level.label,
                    fee: tx.fee,
                    feePerByte: level.feePerUnit,
                    minutes: level.blocks * this.coinInfo.blocktime,
                    total: tx.totalSpent,
                });
            } else {
                list.push({
                    name: level.label,
                    fee: '0',
                    disabled: true,
                });
            }
        });
        return list;
    }

    compose(feeRate: string) {
        const { account, coinInfo } = this;
        const { addresses } = account;
        if (!addresses) return { type: 'error', error: 'ADDRESSES-NOT-SET' };
        const changeId = addresses.change.findIndex(a => a.transfers < 1);
        if (changeId < 0) return { type: 'error', error: 'CHANGE-ADDRESS-NOT-SET' };
        const changeAddress = addresses.change[changeId].address;
        const inputAmounts = coinInfo.segwit || coinInfo.forkid !== null || coinInfo.network.consensusBranchId !== null;

        const result = buildTx({
            utxos: this.utxos,
            outputs: this.outputs,
            height: this.blockHeight,
            feeRate,
            segwit: coinInfo.segwit,
            inputAmounts,
            basePath: account.address_n,
            network: coinInfo.network,
            changeId,
            changeAddress,
            dustThreshold: coinInfo.dustLimit,
        });
        // hd-wallet returns `max = -1` when sendMax is not requested
        // https://github.com/trezor/hd-wallet/blob/master/src/build-tx/coinselect.js#L101
        // delete this value from the result, it should be either string or undefined
        if (result.type !== 'error' && result.max === -1) delete result.max;
        return result;
    }

    dispose() {
        // TODO
    }
}
