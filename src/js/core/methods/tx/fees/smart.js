/* @flow */
import BigNumber from 'bignumber.js';
import { btckb2satoshib } from '../../../../utils/formatUtils';
import BlockBook from '../../../../backend';
import type { FeeHandler } from './index';
import type { FeeLevel, FeeLevelInfo, SmartBitcoreFeeLevel } from '../../../../types/fee';

const feeLevels: $ReadOnlyArray<SmartBitcoreFeeLevel> = [
    {
        name: 'high',
        id: 0,
        info: {
            type: 'bitcore-smart',
            blocks: 2, // lowest possible
        },
    }, {
        name: 'normal',
        id: 1,
        info: {
            type: 'bitcore-smart',
            blocks: 6, // 1 hour
        },
    }, {
        name: 'economy',
        id: 2,
        info: {
            type: 'bitcore-smart',
            blocks: 36, // 6 hours
        },
    }, {
        name: 'low',
        id: 3,
        info: {
            type: 'bitcore-smart',
            blocks: 144 * 3, // 3 days
        },
    },
];

type Fees = {[i: number]: string};
let fees: Fees = {};
let backend: BlockBook;

function range(from: number, length: number): Array<number> {
    const res = [];
    for (let i = 0; i < length; i++) {
        res.push(i + from);
    }
    return res;
}

async function _refreshQuery(query: Array<number>, res: Fees): Promise<boolean> {
    const fees = await backend.blockchain.estimateSmartTxFees(query, true);
    for (const blocksS in fees) {
        const blocks = parseInt(blocksS);
        const fee = fees[blocks];
        res[blocks] = btckb2satoshib(fee);
    }
    for (let i = 0; i <= query.length - 2; i++) {
        if (res[query[i]] === '-1') {
            for (let j = query.length - 1; j >= i + 1; j--) {
                const bn = new BigNumber(res[query[j]]);
                if (bn.gt(0)) {
                    res[query[i]] = res[query[j]];
                }
            }
        }
    }
    if (res[query[query.length - 1]] === '1') {
        return false;
    }
    return true;
}

async function refresh(first: boolean): Promise<void> {
    const res = {};

    if (first) {
        // first -> only query the fee levels, so we don't need to wait for all levels
        // and we see levels immediately, with worse time estimate
        const query = feeLevels.map(level => level.info.blocks);
        await _refreshQuery(query, res);
    } else {
        // next refreshes -> query all levels for more exact time estimates
        let cont = true;
        let last = 2;
        const end = feeLevels[feeLevels.length - 1].info.blocks;

        while (cont) {
            const query = range(last, 10);
            cont = await _refreshQuery(query, res);
            last += 10;
            cont = cont && last <= end;
        }
    }
    fees = res;
}

async function detectWorking($backend: BlockBook): Promise<boolean> {
    backend = $backend;
    if (!backend.blockchain.hasSmartTxFees) {
        return false;
    }
    const lfees = await backend.blockchain.estimateSmartTxFees([1007], true);
    if (lfees[1007] === '-1') {
        return false;
    }
    await refresh(true);
    refresh(false);
    return new BigNumber(fees[2]).gt(0);
}

function getFeeList(): $ReadOnlyArray<FeeLevel> {
    return feeLevels;
}

function getFee(level: FeeLevelInfo): string {
    if (level.type === 'bitcore-smart') {
        if (fees == null) {
            throw new Error('fees is null');
        }
        if (fees[level.blocks] == null) {
            return '1';
        }
        return fees[level.blocks];
    }
    throw new Error('Wrong level type');
}

function getBlocks(fee: string): ?number {
    const bn = new BigNumber(fee);
    if (bn.lt(1)) {
        return null;
    }
    for (let block = 1008; block >= 2; block--) {
        const blockfee = fees[block] === null ? '1' : fees[block];
        if (bn.lt(blockfee)) {
            for (let biggerBlock = block + 1; biggerBlock < 1008; biggerBlock++) {
                if (fees[biggerBlock] != null) {
                    return biggerBlock;
                }
            }
            return block + 1;
        }
    }
    return 2;
}

export const smartBitcoreHandler: FeeHandler = {
    refresh: () => refresh(false),
    detectWorking,
    getFeeList,
    getFee,
    getBlocks,
};
