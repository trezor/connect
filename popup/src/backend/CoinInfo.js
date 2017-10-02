/* @flow */
'use strict';

import { httpRequest } from '../utils/utils';

import type {
    Network as BitcoinJsNetwork,
} from 'bitcoinjs-lib-zcash';


import {
    BitcoreBlockchain
} from 'hd-wallet';

export type CoinInfo = {
    name: string,
    shortcut: string,
    network: BitcoinJsNetwork,
    hashGenesisBlock: string,
    bip44: number,
    defaultFees: {[level: string]: number},
    dustLimit: number,
    zcash: boolean,
    minFeeSatoshiKb: number,
    maxFeeSatoshiKb: number,
    blocktime: number,
    segwit: boolean,
    isBitcoin: boolean,
    forkid: ?number,
};


let coins: Array<CoinInfo>;
let coinInfo: ?CoinInfo = null;

export function getCoinInfo(): CoinInfo {
    if (coinInfo == null) {
        throw new Error('Wrong coin info');
    }
    return coinInfo;
}

// TODO nicer
function hashToCoinInfo(hash: string, btcVersion: string): ?CoinInfo {
    const result = coins.find(info => hash.toLowerCase() === info.hashGenesisBlock.toLowerCase());
    if (result != null && result.isBitcoin) {
        if (btcVersion === 'bch') {
            return coins.find(info => info.name === 'Bcash');
        }
    }
    return result;
}

export let coinInfoError: ?Error;

// TODO quick and dirty - move this to hd-wallet ASAP
function getNetworkInfo(blockchain) {
    return blockchain.socket.promise.then(socket => {
        const method = 'getInfo';
        const params = [];
        return socket.send({method, params});
    });
}

function detectBtcVersion(data) {
    if (data.subversion == null) {
        return 'btc';
    }
    if (data.subversion.startsWith('/Bitcoin ABC')) {
        return 'bch';
    }
    if (data.subversion.includes('(BIP148)')) {
        return 'uasf';
    }
    return 'btc';
}

const _waitForCoinInfo = (blockchain: BitcoreBlockchain): Promise<CoinInfo> => {
    console.log('[CoinInfo] Wait for coin info...');
    return blockchain.lookupBlockHash(0).then(hash => {
        return getNetworkInfo(blockchain).then((info) => {
            coinInfo = hashToCoinInfo(hash, detectBtcVersion(info));
            coinInfo.blocks = info.blocks;
            console.log('[CoinInfo] Done reading coin; ' + (coinInfo == null ? 'nothing' : coinInfo.shortcut));
            console.log('[CoinInfo] Current backend URL : ' + blockchain.workingUrl);
            if (coinInfo != null) {
                return coinInfo;
            } else {
                console.error('Cannot find blockhash ', hash);
                throw new Error('Wrong coin info.');
            }
        });
    }).catch(e => {
        coinInfoError = e;
        throw e;
    });
}

export const waitForCoinInfo = (bl: BitcoreBlockchain, coinInfoUrl: string): Promise<CoinInfo> => {
    return httpRequest(coinInfoUrl, true).then(resp => {
        coins = parseCoinsJson(resp);
        return _waitForCoinInfo(bl).catch(e => { throw e });
    }).catch(error => {
        throw new Error('Coin info file not found at ' + coinInfoUrl);
    })
}

const parseCoinsJson = (coins: JSON): Array<CoinInfo> => {
    return coins.map(coin => {
        const name = coin.coin_name;
        const shortcut = coin.coin_shortcut;
        const network: BitcoinJsNetwork = {
            messagePrefix: 'N/A',
            bip32: {
                public: parseInt(coin.xpub_magic, 16),
                private: parseInt(coin.xprv_magic, 16),
            },
            pubKeyHash: coin.address_type,
            scriptHash: coin.address_type_p2sh,
            wif: 0x80, // doesn't matter, for type correctness
            dustThreshold: 0, // doesn't matter, for type correctness
        };
        const hashGenesisBlock = coin.hash_genesis_block;
        const bip44 = coin.bip44;
        const defaultFees = coin.default_fee_b;
        const dustLimit = coin.dust_limit;
        const zcash = coin.coin_name.startsWith('Zcash');
        const maxFeeSatoshiKb = coin.maxfee_kb;
        const minFeeSatoshiKb = coin.minfee_kb;
        const blocktime = coin.blocktime_minutes;
        const forkid = coin.forkid;
        const segwit = coin.segwit;
        const isBitcoin = shortcut === 'BTC' || shortcut === 'TEST';
    
        return {
            name,
            shortcut,
            network,
            hashGenesisBlock,
            bip44,
            defaultFees,
            dustLimit,
            zcash,
            maxFeeSatoshiKb,
            minFeeSatoshiKb,
            blocktime,
            segwit,
            isBitcoin,
            forkid,
        };
    });
}