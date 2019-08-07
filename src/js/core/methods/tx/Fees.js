/* @flow */
import BigNumber from 'bignumber.js';
import BlockchainLink from '../../../backend/BlockchainLink';
import { feePerUnit } from '../../../utils/formatUtils';
import type { CoinInfo } from '../../../types';
import type { FeeLevel } from '../../../types/fee';

const BLOCKS = {
    'high': 1,
    'normal': 6,
    'economy': 36,
    'low': 144 * 3,
};

export default class FeeLevels {
    coinInfo: CoinInfo;
    levels: FeeLevel[];
    blocks: string[] = [];

    constructor(coinInfo: CoinInfo) {
        this.coinInfo = coinInfo;

        // sort fee levels from coinInfo
        // and transform in to FeeLevel object
        this.levels = Object.keys(coinInfo.defaultFees).sort((levelA, levelB) =>
            coinInfo.defaultFees[levelB] - coinInfo.defaultFees[levelA]
        ).map((level, id) => {
            const name = level.toLowerCase();
            const blocks = BLOCKS[name] || 0; // TODO: get this value from trezor-common
            return {
                type: 'bitcoin',
                name,
                info: {
                    fee: coinInfo.defaultFees[level].toString(),
                    blocks,
                },
            };
        });

        // if there is only one fee level in coinInfo ("Normal")
        // assume that it will be probably mined in next two blocks
        if (this.levels.length === 1) {
            this.levels[0].info.blocks = 1;
        }
    }

    async load(blockchain: BlockchainLink) {
        try {
            // get predefined blocks and fill gaps between them
            const blocks: number[] = this.levels.map(l => l.info.blocks).reduce((result: any, bl: number) => {
                // return first value
                if (result.length === 0) return result.concat([bl]);
                // get previous block request
                const from = result[result.length - 1];
                // calculate gap between previous and current
                const gap = bl - from;
                // if gap is lower than 30 blocks (normal and economy)
                // fill every block in range
                // otherwise fill every 6th block (1h)
                const incr = gap <= 30 ? 1 : 6;

                const fill: number[] = [];
                for (let i = from + incr; i <= from + gap; i += incr) {
                    fill.push(i);
                }

                // if filling doesn't contains current block
                if (fill.indexOf(bl) < 0) fill.push(bl);
                // add to result
                return result.concat(fill);
            }, []);

            // estimate fees for requested blocks
            const response = await blockchain.estimateFee({ blocks });
            response.forEach((r, i) => {
                this.blocks[blocks[i]] = feePerUnit(r.feePerUnit, this.coinInfo);
            });

            // if last known fee level is not a coin minimum fee
            // then get more results until minimum is reached
            let lastKnown = new BigNumber(this.blocks[this.blocks.length - 1]);
            while (lastKnown.gt(this.coinInfo.minFee)) {
                const request = [];
                if (this.levels.length === 1) {
                    // there is only 1 fee level ("Normal")
                    // check results for one hour period with 1 block interval
                    const range = this.blocks.length + 6;
                    for (let i = this.blocks.length; i < range; i += 1) {
                        request.push(i);
                    }
                } else {
                    // check results for one day period with 6 blocks interval
                    const range = this.blocks.length + 144;
                    for (let i = this.blocks.length + 5; i < range; i += 6) {
                        request.push(i);
                    }
                }
                const search = await blockchain.estimateFee({ blocks: request });
                // add results to array
                search.forEach((r, i) => {
                    this.blocks[request[i]] = feePerUnit(r.feePerUnit, this.coinInfo);
                });
                // assign last known fee
                lastKnown = new BigNumber(this.blocks[this.blocks.length - 1]);
            }

            // finally update fee levels with new values
            this.levels.forEach(l => {
                l.info.blocks = this.updateBlocks(l.info.blocks);
                l.info.fee = this.blocks[l.info.blocks];
            });
        } catch (error) {
            // empty
        }

        return this.levels;
    }

    updateBlocks(b: number): number {
        const fee = this.blocks[b];
        // return first occurrence of requested block value
        if (typeof fee === 'string') return this.blocks.indexOf(fee);

        // there is no information for this block entry
        if (b >= this.blocks.length) {
            // requested block is greater than known range
            // return first occurrence of the lowest fee
            return this.blocks.indexOf(this.blocks[this.blocks.length - 1]);
        } else {
            // try to find nearest lower value
            let index = b;
            while (typeof this.blocks[index] !== 'string') {
                index++;
            }
            return this.blocks.indexOf(this.blocks[index]);
        }
    }

    getBlocks(fee: string): number {
        const bn = new BigNumber(fee);
        const lower = this.blocks.find(b => typeof b === 'string' && bn.gte(b)) || this.blocks[this.blocks.length - 1];
        return this.blocks.indexOf(lower);
    }

    updateCustomFee(fee: string) {
        this.levels = this.levels.filter(l => l.name !== 'custom');

        const blocks = this.getBlocks(fee);
        this.levels.push({
            type: 'bitcoin',
            name: 'custom',
            info: {
                fee,
                blocks,
            },
        });
    }
}
