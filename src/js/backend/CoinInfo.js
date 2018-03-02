/* @flow */
'use strict';

import { HD_HARDENED, toHardened, fromHardened } from '../utils/pathUtils';
import BIP_44 from 'bip44-constants';

import type {
    Network as BitcoinJsNetwork,
} from 'bitcoinjs-lib-zcash';

export type CoinInfo = {
    name: string,
    shortcut: string,
    label: string,
    network: BitcoinJsNetwork,
    hashGenesisBlock: string,
    bip44: number,
    segwit: boolean,
    legacyPubMagic: string,
    segwitPubMagic: ?string,
    hasSegwit: boolean,
    zcash: boolean,
    isBitcoin: boolean,
    forkid: ?number,
    defaultFees: {[level: string]: number},
    minFee: number,
    maxFee: number,
    dustLimit: number,
    minFeeSatoshiKb: number,
    maxFeeSatoshiKb: number,
    blocktime: number,
    bitcore: Array<string>,
    addressPrefix: string,
    minAddressLength: number,
    maxAddressLength: number,

    // used in backend
    blocks?: number,
};

const coins: Array<CoinInfo> = [];

export const getCoins = (): $ReadOnlyArray<CoinInfo> => {
    // return coins.slice(0);
    return JSON.parse(JSON.stringify(coins));
};

export const cloneCoinInfo = (ci: CoinInfo): CoinInfo => {
    return JSON.parse(JSON.stringify(ci));
}

export const generateCoinInfo = (coinName: string): CoinInfo => {
    switch (coinName) {
        case 'Ether' :
            coinName = 'Ethereum';
            break;
        case 'Ether Classic' :
            coinName = 'Ethereum Classic';
            break;
    }

    return {
        name: coinName,
        shortcut: 'N/A',
        label: coinName,
        network: {
            messagePrefix: 'N/A',
            bip32: {
                private: 0,
                public: 0,
            },
            pubKeyHash: 0,
            scriptHash: 0,
            wif: 0x80, // doesn't matter, for type correctness
            dustThreshold: 0, // doesn't matter, for type correctness
        },
        hashGenesisBlock: 'N/A',
        bip44: 149,
        segwit: false,
        legacyPubMagic: 'N/A',
        segwitPubMagic: null,
        hasSegwit: false,
        zcash: false,
        isBitcoin: false,
        forkid: null,
        defaultFees: { },
        minFee: 0,
        maxFee: 0,
        dustLimit: 0,
        minFeeSatoshiKb: 0,
        maxFeeSatoshiKb: 0,
        blocktime: 0,
        bitcore: [],
        addressPrefix: 'N/A',
        minAddressLength: 0,
        maxAddressLength: 0,
    };
};

const detectBtcVersion = (data): string => {
    if (data.subversion == null) {
        return 'btc';
    }
    if (data.subversion.startsWith('/Bitcoin ABC')) {
        return 'bch';
    }
    if (data.subversion.startsWith('/Bitcoin Gold')) {
        return 'btg';
    }
    return 'btc';
};

export const getCoinInfoByHash = (hash: string, networkInfo: any): CoinInfo => {
    const result: ?CoinInfo = getCoins().find(info => hash.toLowerCase() === info.hashGenesisBlock.toLowerCase());
    if (!result) {
        throw new Error('Coin info not found for hash: ' + hash + ' ' + networkInfo.hashGenesisBlock);
    }

    if (result.isBitcoin) {
        const btcVersion: string = detectBtcVersion(networkInfo);
        let fork: ?CoinInfo;
        if (btcVersion === 'bch') {
            fork = coins.find(info => info.name === 'Bcash');
        } else if (btcVersion === 'btg') {
            fork = coins.find(info => info.name === 'Bitcoin Gold');
        }
        if (fork) {
            return fork;
        }
    }
    return result;
};

export const getCoinInfoByCurrency = (currency: string): ?CoinInfo => {
    // TODO: Ethereum & NEM
    const lower: string = currency.toLowerCase();
    return getCoins().find((coin: CoinInfo) => (
            coin.name.toLowerCase() === lower ||
            coin.shortcut.toLowerCase() === lower ||
            coin.label.toLowerCase() === lower
    ));
};

// returned CoinInfo could be generated not from coins.json
export const getCoinInfoFromPath = (path: Array<number>): ?CoinInfo => {
    const coinInfo: ?CoinInfo = getCoins().find((coin: CoinInfo) => toHardened(coin.bip44) === path[1]);
    if (coinInfo && fromHardened(path[0]) === 44) {
        coinInfo.network.bip32.public = parseInt(coinInfo.legacyPubMagic, 16);
    }
    return coinInfo;
};

export type AccountType = {
    label: string,
    legacy: boolean,
    account: number,
}

export const getAccountLabelFromPath = (coinLabel: string, path: Array<number>, segwit: boolean): AccountType => {
    // let hardened = (i) => path[i] & ~HD_HARDENED;
    // return hardened(0) === 44 ? 'legacy' : 'segwit';
    const p1: number = fromHardened(path[0]);
    let label: string;
    let account: number = fromHardened(path[2]);
    let realAccountId: number = account + 1;
    let legacy: boolean = false;
    // Copay id
    if (p1 === 45342) {
        const p2: number = fromHardened(path[1]);
        account = fromHardened(path[3]);
        realAccountId = account + 1;
        label = `Copay ID of account #${realAccountId}`;
        if (p2 === 48) {
            label = `Copay ID of multisig account #${realAccountId}`;
        } else if (p2 === 44) {
            label = `Copay ID of legacy account #${realAccountId}`;
            legacy = true;
        }
    } else if (p1 === 48) {
        label = `public key for multisig <strong>${coinLabel}</strong> account #${realAccountId}`;
    } else if (p1 === 44 && segwit) {
        label = `public key for legacy <strong>${coinLabel}</strong> account #${realAccountId}`;
        legacy = true;
    } else {
        label = `public key for <strong>${coinLabel}</strong> account #${realAccountId}`;
    }

    return {
        label: label,
        account: account,
        legacy: legacy,
    };
};

export const getCoinName = (path: Array<number>): string => {
    for (const name of Object.keys(BIP_44)) {
        const number = parseInt(BIP_44[name]);
        if (number === path[1]) {
            return name;
        }
    }
    return 'Unknown coin';
};

export const getAccountType = (path: Array<number>): string => {
    const hardened = (i) => path[i] & ~HD_HARDENED; // TODO: from utils
    return hardened(0) === 44 ? 'legacy' : 'segwit';
};

export const parseCoinsJson = (json: JSON): void => {
    if (!Array.isArray(json)) {
        throw new Error('coins.json is not an array');
    }

    const coinsJSON: Array<any> = json;
    coinsJSON.map(coin => {
        let networkPublic: string = coin.xpub_magic;
        if (typeof coin.xpub_magic_segwit_p2sh === 'string' && coin.segwit) {
            networkPublic = coin.xpub_magic_segwit_p2sh;
        }

        const network: BitcoinJsNetwork = {
            messagePrefix: coin.signed_message_header,
            // messagePrefix: 'N/A',
            bip32: {
                private: parseInt(coin.xprv_magic, 16),
                public: parseInt(networkPublic, 16),
            },
            pubKeyHash: coin.address_type,
            scriptHash: coin.address_type_p2sh,
            wif: 0x80, // doesn't matter, for type correctness
            dustThreshold: 0, // doesn't matter, for type correctness
        };

        const zcash = coin.coin_name.startsWith('Zcash');
        const shortcut = coin.coin_shortcut;
        const isBitcoin = shortcut === 'BTC' || shortcut === 'TEST';

        coins.push({
            name: coin.coin_name,
            shortcut: coin.coin_shortcut,
            label: coin.coin_label,
            network,
            hashGenesisBlock: coin.hash_genesis_block,
            bip44: coin.bip44,
            segwit: coin.segwit,
            legacyPubMagic: coin.xpub_magic,
            segwitPubMagic: coin.xpub_magic_segwit_p2sh || null,
            hasSegwit: coin.segwit,
            zcash,
            isBitcoin,
            forkid: coin.forkid,
            defaultFees: coin.default_fee_b,
            minFee: Math.round(coin.minfee_kb / 1000),
            maxFee: Math.round(coin.maxfee_kb / 1000),
            dustLimit: coin.dust_limit,
            maxFeeSatoshiKb: coin.maxfee_kb,
            minFeeSatoshiKb: coin.minfee_kb,
            blocktime: coin.blocktime_minutes,
            bitcore: coin.bitcore,
            addressPrefix: coin.address_prefix,
            minAddressLength: coin.min_address_length,
            maxAddressLength: coin.max_address_length,
        });
    });
};
