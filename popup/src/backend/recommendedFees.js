/* @flow */
'use strict';

// FeeLevel represents the choosing of the fees
type BitcoreFeeLevelInfo = {
    +type: 'bitcore',
    +blocks: number,
    +fee: number,
    +halved: boolean, // low is economy halved
};

type CustomFeeLevelInfo = {
    +type: 'custom',
    fee: string,
}
type PreloadedFeeLevelInfo = {
    +type: 'preloaded',
    +fee: number,
}

type FeeLevelInfo = BitcoreFeeLevelInfo | PreloadedFeeLevelInfo | CustomFeeLevelInfo;

type PreloadedFeeLevel = {
    +name: string,
    +id: number,
    +info: PreloadedFeeLevelInfo,
}

export type CustomFeeLevel = {
    +name: string,
    +id: number,
    +info: CustomFeeLevelInfo,
}

type BitcoreFeeLevel = {
    +name: string,
    +id: number,
    +info: BitcoreFeeLevelInfo,
}

export type FeeLevel = {
    +name: string,
    +id: number,
    +info: FeeLevelInfo,
}

// this is fee levels that are currently displayed
export let feeLevels: $ReadOnlyArray<FeeLevel> = [];

// bitcore returns btc/byte, we need satoshis/byte
let _bitcoreActualFees: ?{[i: number]: number};
// bitcore levels are always the same but they aren't always *the displayed ones* (if bitcore fails)
// !! EDIT HERE if you want to edit lengths !!
export const bitcoreFeeLevels: Array<BitcoreFeeLevel> = [
    {
        id: 0,
        name: 'high',
        info: {
            type: 'bitcore',
            blocks: 2,
            halved: false,
        },
    }, {
        name: 'normal',
        id: 1,
        info: {
            type: 'bitcore',
            blocks: 6,
            halved: false,
        },
    }, {
        name: 'economy',
        id: 2,
        info: {
            type: 'bitcore',
            blocks: 25, // 25 is max
            halved: false,
        },
    }, {
        name: 'low',
        id: 3,
        info: {
            type: 'bitcore',
            blocks: 25, // 25 is max
            halved: true,
        },
    },
];

// This gets "dirty" bitcore output as input and returns something usable, level -> fee
export const deriveFeeListFromBitcore = (input: {[blocks: number]: number}): Array<FeeLevel> => {
    const res = {};
    const feeLevels: Array<FeeLevel> = bitcoreFeeLevels.reduce((pr, level) => {
        let newLevel: FeeLevel = { ...level };
        newLevel.info.fee = _getMinFeeFromBitcore(level.info.blocks, input);
        if (newLevel.info.fee == null) return pr; // if not even one is found for this level
        if (newLevel.info.halved) {
            // Low fee
            newLevel.info.fee = newLevel.info.fee / 2;
            newLevel.info.blocks = 0;
        }
        return pr.concat([ newLevel ]);
    }, []);
    return feeLevels;
}

// We have stuff from bitcore in blocks, BUT
// bitcore sometimes returns "-1" randomly (as does bitcoind)
// we try all the bigger ones, hopefully we get hit
// 25 is the largest we can ask
const _getMinFeeFromBitcore = (start: number, input: {[blocks: number]: number}): ?number => {
    for (let i = start; i <= 25; i++) {
        if (input[i]) {
            return input[i]; // trying all the bigger ones until the end
        }
    }
    return null;
}


// this represents fee levels preloaded from coins.json
export const preloadFeeLevel = (coinInfo: CoinInfo) => {
    return Object.keys(coinInfo.defaultFees)
    .sort((levelA, levelB) =>
        coinInfo.defaultFees[levelB] - coinInfo.defaultFees[levelA]
    ).map((level, i) => {
        return {
            name: level.toLowerCase(),
            id: i,
            info: {
                // converting sat/B -> btc/B
                fee: coinInfo.defaultFees[level] / 10e4,
                blocks: 0
            }
        };
    });
}

// Filter and return usable fees
export const getRecommendedFees = (fees: Array<FeeLevel>, coinInfo: CoinInfo): Array<Object> => {
    const minFee: number = Math.round(coinInfo.minFeeSatoshiKb / 1000); // converting sat/kB -> sat/B
    const feeList: Array<Object> = [];

    return fees.reduce((prev, level) => {
        // converting btc/B -> sat/B
        const fee = Math.max( Math.round(level.info.fee * 10e4), minFee);
        // TODO: altcoins should have 1 fee (normal) 

        return prev.concat([
            {
                name: level.name,
                fee: fee,
                minutes: level.info.blocks * coinInfo.blocktime
            }
        ]);
    }, []);
}
