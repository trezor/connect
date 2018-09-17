/* @flow */
'use strict';

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



let coinInfo: ?CoinInfo = null;

export function getCoinInfo(): CoinInfo {
    if (coinInfo == null) {
        throw new Error('Wrong coin info');
    }
    return coinInfo;
}

// TODO nicer
function hashToCoinInfo(hash: string, btcVersion: string): ?CoinInfo {
    const result = coinInfos.find(info => hash.toLowerCase() === info.hashGenesisBlock.toLowerCase());
    if (result != null && result.isBitcoin) {
        if (btcVersion === 'bch') {
            return coinInfos.find(info => info.name === 'Bcash');
        }
        if (btcVersion === 'btg') {
            return coinInfos.find(info => info.name === 'Bgold');
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
    if (data.subversion.startsWith('/Bitcoin Gold')) {
        return 'btg';
    }
    if (data.subversion.includes('(BIP148)')) {
        return 'uasf';
    }
    return 'btc';
}

function _waitForCoinInfo(blockchain: BitcoreBlockchain): Promise<void> {
    console.log('[CoinInfo] Wait for coin info...');
    return blockchain.lookupBlockHash(0).then(hash => {
        return getNetworkInfo(blockchain).then((info) => {
            console.log("[CoinInfo]", info, hash)
            coinInfo = hashToCoinInfo(hash, detectBtcVersion(info));
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

export function waitForCoinInfo(bl:BitcoreBlockchain): Promise<void> {
    return _waitForCoinInfo(bl).catch(e => console.error(e));
}

const coins = [
{
	"coin_name": "Bitcoin",
	"coin_shortcut": "BTC",
	"address_type": 0,
	"address_type_p2sh": 5,
	"maxfee_kb": 500000,
	"minfee_kb": 1000,
	"signed_message_header": "Bitcoin Signed Message:\n",
	"hash_genesis_block": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
	"xpub_magic": "0488b21e",
	"xprv_magic": "0488ade4",
	"bip44": 0,
	"segwit": true,
	"forkid": null,
	"default_fee_b": {
		"Low": 24,
		"Economy": 48,
		"Normal": 112,
		"High": 199
	},
	"dust_limit": 546,
	"blocktime_minutes": 10,
	"firmware": "stable"
},
{
	"coin_name": "Bcash",
	"coin_shortcut": "BCH",
	"address_type": 0,
	"address_type_p2sh": 5,
	"maxfee_kb": 500000,
	"minfee_kb": 1000,
	"signed_message_header": "Bitcoin Signed Message:\n",
	"hash_genesis_block": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
	"xpub_magic": "0488b21e",
	"xprv_magic": "0488ade4",
	"bip44": 145,
	"segwit": false,
	"forkid": 0,
	"default_fee_b": {
		"Low": 24,
		"Economy": 48,
		"Normal": 112,
		"High": 199
	},
	"dust_limit": 546,
	"blocktime_minutes": 10,
	"firmware": "stable"
},
{
	"coin_name": "Litecoin",
	"coin_shortcut": "LTC",
	"address_type": 48,
	"address_type_p2sh": 50,
	"maxfee_kb": 40000000,
	"minfee_kb": 100000,
	"signed_message_header": "Litecoin Signed Message:\n",
	"hash_genesis_block": "12a765e31ffd4059bada1e25190f6e98c99d9714d334efa41a195a7e7e04bfe2",
	"xpub_magic": "019da462",
	"xprv_magic": "019d9cfe",
	"bip44": 2,
	"segwit": true,
	"forkid": null,
	"default_fee_b": {
		"Low": 100,
		"Economy": 200,
		"Normal": 400,
		"High": 800
	},
	"dust_limit": 54600,
	"blocktime_minutes": 2.5,
	"firmware": "stable"
},
{
	"coin_name": "Bgold",
	"coin_shortcut": "BTG",
	"coin_label": "Bitcoin Gold",
	"address_type": 38,
	"address_type_p2sh": 23,
	"maxfee_kb": 500000,
	"minfee_kb": 1000,
	"signed_message_header": "Bitcoin Gold Signed Message:\n",
	"hash_genesis_block": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
	"xprv_magic": "0488ade4",
	"xpub_magic": "0488b21e",
	"xpub_magic_segwit_p2sh": "049d7cb2",
	"bech32_prefix": "btg",
	"bip44": 156,
	"segwit": true,
	"forkid": 79,
	"force_bip143": true,
	"default_fee_b": {
		"Low": 10,
		"Economy": 70,
		"Normal": 140,
		"High": 200
	},
	"dust_limit": 546,
	"blocktime_minutes": 10,
	"firmware": "stable",
	"address_prefix": "bitcoingold:",
	"min_address_length": 27,
	"max_address_length": 34,
	"bitcore": []
}];

export const coinInfos = coins.map(coin => {
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
