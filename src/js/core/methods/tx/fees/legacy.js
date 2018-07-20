/* @flow */
'use strict';

import { btckb2satoshib } from '../../../../utils/formatUtils';
import BlockBook from '../../../../backend';

import type { FeeHandler } from './index';
import type {
    FeeLevel,
    FeeLevelInfo,
    LegacyBitcoreFeeLevel,
} from 'flowtype/fee';

// special case - when blockchain is empty and returns same levels for all 3,
// we don't want to show 3 levels
let emptyBlockchain: boolean = false;

const feeLevels: $ReadOnlyArray<LegacyBitcoreFeeLevel> = [
    {
        id: 0,
        name: 'high',
        info: {
            type: 'bitcore-legacy',
            blocks: 2,
        },
    }, {
        name: 'normal',
        id: 1,
        info: {
            type: 'bitcore-legacy',
            blocks: 6,
        },
    }, {
        name: 'economy',
        id: 2,
        info: {
            type: 'bitcore-legacy',
            blocks: 25, // 25 is max
        },
    },
];

const oneFeeLevel: LegacyBitcoreFeeLevel = {
    name: 'normal',
    id: 1,
    info: {
        type: 'bitcore-legacy',
        blocks: 6,
    },
};

type Fees = {[i: number]: number};
// blocks => sat/B
let fees: ?Fees = null;

const detectEmptyBlockchain = (fees: Fees): boolean => {
    const setFees = new Set();
    Object.keys(fees).forEach(f => setFees.add(fees[parseInt(f)])); // parseInt for flow
    return setFees.size === 1;
};

// We have stuff from bitcore in blocks, BUT
// bitcore sometimes returns "-1" randomly (as does bitcoind)
// we try all the bigger ones, hopefully we get hit
// 25 is the largest we can ask
const getMinFee = (start: number, input: {[blocks: number]: number}): ?number => {
    for (let i = start; i <= 145; i++) {
        if (input[i]) {
            return input[i]; // trying all the bigger ones until the end
        }
    }
    return null;
};

// This gets "dirty" bitcore output as input and returns something usable, level -> fee
const deriveFeeList = (input: Fees): ?Fees => {
    const res: {[i: number]: number} = {};
    const allblocks = feeLevels.reduce((pr, level) => pr.concat([level.info.blocks]), []);

    for (const blocks of allblocks) {
        const fee = getMinFee(blocks, input);
        if (fee == null) {
            return; // if even one is not found at all -> fail
        }

        res[blocks] = Math.round(btckb2satoshib(fee));
    }
    return res;
};

const refresh = async (backend: BlockBook): Promise<any> => {
    // I need blocks and blocks+1 in the case that bitcore returns -1 for low levels
    const blockquery = feeLevels.reduce((pr, level) => pr.concat([level.info.blocks, level.info.blocks + 1]), []);

    const readFees: Fees = await backend.blockchain.estimateTxFees(blockquery, true);
    const newActualFees: ?Fees = deriveFeeList(readFees);
    if (newActualFees != null) {
        fees = newActualFees;
        emptyBlockchain = detectEmptyBlockchain(newActualFees);
    }
};

const detectWorking = async (backend: BlockBook): Promise<boolean> => {
    await refresh(backend);
    return fees != null;
};

const getFeeList = (): $ReadOnlyArray<FeeLevel> => {
    return emptyBlockchain ? [ oneFeeLevel ] : feeLevels;
};

const getFee = (level: FeeLevelInfo): number => {
    if (level.type === 'bitcore-legacy') {
        if (fees == null) {
            throw new Error('actualFees is null');
        }
        return fees[level.blocks];
    }
    throw new Error('Wrong level type');
};

const getBlocks = (fee: number): ?number => {
    if (fees == null) {
        throw new Error('actualFees is null');
    }
    for (const blocks of Object.keys(fees).map(k => parseInt(k)).sort((a, b) => a - b)) {
        if (fees[blocks] === fee) {
            return blocks;
        }
    }
    return null;
};

export const legacyBitcoreHandler: FeeHandler = {
    refresh,
    detectWorking,
    getFeeList,
    getFee,
    getBlocks,
};
