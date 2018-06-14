/* @flow */
'use strict';

import { HD_HARDENED, toHardened, fromHardened } from '../utils/pathUtils';
import BIP_44 from 'bip44-constants';

import type {
    Network as BitcoinJsNetwork,
} from 'bitcoinjs-lib-zcash';

type Support = {
    connect: boolean,
    // "electrum": "https://electrum.org/",
    trezor1: string,
    trezor2: string,
    // "webwallet": true
}

export type CoinInfo = {
    addressPrefix: string,
    // address_type in Network
    // address_type_p2sh in Network
    bitcore: Array<string>,
    blockbook: Array<string>,
    blocktime: number,
    cashAddrPrefix: ?string,
    label: string,
    name: string,
    shortcut: string,
    curveName: string,
    decred: boolean,
    defaultFees: {[level: string]: number},
    dustLimit: number,
    forceBip143: boolean,
    forkid: ?number,
    hashGenesisBlock: string,
    maxAddressLength: number,
    maxFeeSatoshiKb: number,
    minAddressLength: number,
    minFeeSatoshiKb: number,
    segwit: boolean,
    slip44: number,
    support: Support,
    xPubMagic: string,
    xPubMagicSegwit: ?string,
    xPubMagicSegwitNative: ?string,

    network: BitcoinJsNetwork,
    zcash: boolean,
    isBitcoin: boolean,
    hasSegwit: boolean,
    minFee: number,
    maxFee: number,
    blocktime: number,
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

export const getCoinInfoByCurrency = (currency: string): CoinInfo => {
    const lower: string = currency.toLowerCase();
    const coinInfo: ?CoinInfo = getCoins().find((coin: CoinInfo) => (
        coin.name.toLowerCase() === lower ||
        coin.shortcut.toLowerCase() === lower ||
        coin.label.toLowerCase() === lower
    ));
    if (!coinInfo) {
        return cloneCoinInfo(coins[0]);
    }
    return coinInfo;
};

export const getCoinInfoFromPath = (path: Array<number>): ?CoinInfo => {
    const coinInfo: ?CoinInfo = getCoins().find((coin: CoinInfo) => toHardened(coin.slip44) === path[1]);
    if (coinInfo && fromHardened(path[0]) === 44) {
        coinInfo.network.bip32.public = parseInt(coinInfo.xPubMagic, 16);
    }
    if (!coinInfo) {
        return cloneCoinInfo(coins[0]);
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
    const coinsObject: Object = json;
    Object.keys(coinsObject).forEach(key => {
        const coin = coinsObject[key];
        let networkPublic: number = coin.xpub_magic;
        if (typeof coin.xpub_magic_segwit_p2sh === 'string' && coin.segwit) {
            networkPublic = coin.xpub_magic_segwit_p2sh;
        }

        const network: BitcoinJsNetwork = {
            messagePrefix: coin.signed_message_header,
            // messagePrefix: 'N/A',
            bip32: {
                public: networkPublic,
                private: coin.xprv_magic,
                //public: parseInt(networkPublic, 16),

            },
            pubKeyHash: coin.address_type,
            scriptHash: coin.address_type_p2sh,
            wif: 0x80, // doesn't matter, for type correctness
            dustThreshold: 0, // doesn't matter, for type correctness,
            bech32: coin.bech32_prefix,
        };

        const zcash = coin.coin_name.startsWith('Zcash');
        const shortcut = coin.coin_shortcut;
        const isBitcoin = shortcut === 'BTC' || shortcut === 'TEST';

        coins.push({
            addressPrefix: coin.address_prefix,
            // address_type in Network
            // address_type_p2sh in Network
            // bech32_prefix in Network
            bitcore: coin.bitcore,
            blockbook: coin.blockbook,
            blocktime: coin.blocktime_seconds,
            cashAddrPrefix: coin.cashaddr_prefix,
            label: coin.coin_label,
            name: coin.coin_name,
            shortcut: coin.coin_shortcut,
            curveName: coin.curve_name,
            decred: coin.decred,
            defaultFees: coin.default_fee_b,
            dustLimit: coin.dust_limit,
            forceBip143: coin.force_bip143,
            forkid: coin.forkid,
            // github not used
            hashGenesisBlock: coin.hash_genesis_block,
            // maintainer not used
            maxAddressLength: coin.max_address_length,
            maxFeeSatoshiKb: coin.maxfee_kb,
            minAddressLength: coin.min_address_length,
            minFeeSatoshiKb: coin.minfee_kb,
            segwit: coin.segwit,
            // signed_message_header in Network
            slip44: coin.slip44,
            support: coin.support,
            // version_group_id not used
            // website not used
            // xprv_magic in Network
            xPubMagic: coin.xpub_magic,
            xPubMagicSegwit: coin.xpub_magic_segwit_p2sh,
            xPubMagicSegwitNative: coin.xpub_magic_segwit_native,

            // custom
            network,
            zcash,
            isBitcoin,
            hasSegwit: coin.segwit,
            maxFee: Math.round(coin.maxfee_kb / 1000),
            minFee: Math.round(coin.minfee_kb / 1000),
        });
    });
};
