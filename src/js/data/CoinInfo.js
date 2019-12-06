/* @flow */

import { toHardened, fromHardened } from '../utils/pathUtils';
import type { CoinInfo, BitcoinNetworkInfo, EthereumNetworkInfo, MiscNetworkInfo } from '../types';

const bitcoinNetworks: Array<BitcoinNetworkInfo> = [];
const ethereumNetworks: Array<EthereumNetworkInfo> = [];
const miscNetworks: Array<MiscNetworkInfo> = [];

export function cloneCoinInfo<T>(info: T): T {
    const jsonString = JSON.stringify(info);
    if (jsonString === undefined) {
        // jsonString === undefined IF and only IF obj === undefined
        // therefore no need to clone
        return info;
    }
    return JSON.parse(jsonString);
}

export const getBitcoinNetwork = (pathOrName: Array<number> | string): ?BitcoinNetworkInfo => {
    const networks: Array<BitcoinNetworkInfo> = cloneCoinInfo(bitcoinNetworks);
    if (typeof pathOrName === 'string') {
        const name: string = pathOrName.toLowerCase();
        return networks.find(n => n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name || n.label.toLowerCase() === name);
    } else {
        const slip44: number = fromHardened(pathOrName[1]);
        return networks.find(n => n.slip44 === slip44);
    }
};

export const getEthereumNetwork = (pathOrName: Array<number> | string): ?EthereumNetworkInfo => {
    const networks: Array<EthereumNetworkInfo> = cloneCoinInfo(ethereumNetworks);
    if (typeof pathOrName === 'string') {
        const name: string = pathOrName.toLowerCase();
        return networks.find(n => n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name);
    } else {
        const slip44: number = fromHardened(pathOrName[1]);
        return networks.find(n => n.slip44 === slip44);
    }
};

export const getMiscNetwork = (pathOrName: Array<number> | string): ?MiscNetworkInfo => {
    const networks: Array<MiscNetworkInfo> = cloneCoinInfo(miscNetworks);
    if (typeof pathOrName === 'string') {
        const name: string = pathOrName.toLowerCase();
        return networks.find(n => n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name);
    } else {
        const slip44: number = fromHardened(pathOrName[1]);
        return networks.find(n => n.slip44 === slip44);
    }
};

/*
* Bitcoin networks
*/

export const getSegwitNetwork = (coin: BitcoinNetworkInfo): ?$ElementType<BitcoinNetworkInfo, 'network'> => {
    if (coin.segwit && typeof coin.xPubMagicSegwit === 'number') {
        return {
            ...coin.network,
            bip32: {
                ...coin.network.bip32,
                public: coin.xPubMagicSegwit,
            },
        };
    }
    return null;
};

export const getBech32Network = (coin: BitcoinNetworkInfo): ?$ElementType<BitcoinNetworkInfo, 'network'> => {
    if (coin.segwit && typeof coin.xPubMagicSegwitNative === 'number') {
        return {
            ...coin.network,
            bip32: {
                ...coin.network.bip32,
                public: coin.xPubMagicSegwitNative,
            },
        };
    }
    return null;
};

// fix coinInfo network values from path (segwit/legacy)
export const fixCoinInfoNetwork = (ci: BitcoinNetworkInfo, path: Array<number>): BitcoinNetworkInfo => {
    const coinInfo = cloneCoinInfo(ci);
    if (path[0] === toHardened(84)) {
        const bech32Network = getBech32Network(coinInfo);
        if (bech32Network) {
            coinInfo.network = bech32Network;
        }
    } else if (path[0] === toHardened(49)) {
        const segwitNetwork = getSegwitNetwork(coinInfo);
        if (segwitNetwork) {
            coinInfo.network = segwitNetwork;
        }
    } else {
        coinInfo.segwit = false;
    }
    return coinInfo;
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

export const getCoinInfoByHash = (hash: string, networkInfo: any): BitcoinNetworkInfo => {
    const networks: Array<BitcoinNetworkInfo> = cloneCoinInfo(bitcoinNetworks);
    const result: ?BitcoinNetworkInfo = networks.find(info => hash.toLowerCase() === info.hashGenesisBlock.toLowerCase());
    if (!result) {
        throw new Error('Coin info not found for hash: ' + hash + ' ' + networkInfo.hashGenesisBlock);
    }

    if (result.isBitcoin) {
        const btcVersion: string = detectBtcVersion(networkInfo);
        let fork: ?BitcoinNetworkInfo;
        if (btcVersion === 'bch') {
            fork = networks.find(info => info.name === 'Bcash');
        } else if (btcVersion === 'btg') {
            fork = networks.find(info => info.name === 'Bgold');
        }
        if (fork) {
            return fork;
        } else {
            throw new Error('Coin info not found for hash: ' + hash + ' ' + networkInfo.hashGenesisBlock + ' BTC version:' + btcVersion);
        }
    }
    return result;
};

export const getCoinInfo = (currency: string): ?CoinInfo => {
    let coinInfo: ?CoinInfo = getBitcoinNetwork(currency);
    if (!coinInfo) {
        coinInfo = getEthereumNetwork(currency);
    }
    if (!coinInfo) {
        coinInfo = getMiscNetwork(currency);
    }
    return coinInfo;
};

export const getCoinName = (path: Array<number>): string => {
    const slip44: number = fromHardened(path[1]);
    for (const network of ethereumNetworks) {
        if (network.slip44 === slip44) {
            return network.name;
        }
    }
    return 'Unknown coin';
};

const parseBitcoinNetworksJson = (json: JSON): void => {
    const coinsObject: Object = json;
    Object.keys(coinsObject).forEach(key => {
        const coin = coinsObject[key];
        const shortcut = coin.coin_shortcut;
        const isBitcoin = shortcut === 'BTC' || shortcut === 'TEST';
        const hasTimestamp = shortcut === 'CPC' || shortcut === 'PPC' || shortcut === 'tPPC';

        const network: $ElementType<BitcoinNetworkInfo, 'network'> = {
            messagePrefix: coin.signed_message_header,
            bech32: coin.bech32_prefix,
            bip32: {
                public: coin.xpub_magic,
                private: coin.xprv_magic,
            },
            pubKeyHash: coin.address_type,
            scriptHash: coin.address_type_p2sh,
            wif: 0x80, // doesn't matter, for type correctness
            dustThreshold: 0, // doesn't matter, for type correctness,
            coin: shortcut.toLowerCase(),
            consensusBranchId: coin.consensus_branch_id, // zcash, komodo
        };

        const blockchainLink = Array.isArray(coin.blockbook) && coin.blockbook.length > 0 ? {
            type: 'blockbook',
            url: coin.blockbook,
        } : undefined;

        bitcoinNetworks.push({
            type: 'bitcoin',
            // address_type in Network
            // address_type_p2sh in Network
            // bech32_prefix in Network
            // consensus_branch_id in Network
            // bip115: not used
            // bitcore: not used,
            // blockbook: not used,
            blockchainLink,
            blocktime: Math.round(coin.blocktime_seconds / 60),
            cashAddrPrefix: coin.cashaddr_prefix,
            label: coin.coin_label,
            name: coin.coin_name,
            shortcut,
            // cooldown not used
            curveName: coin.curve_name,
            // decred not used
            defaultFees: coin.default_fee_b,
            dustLimit: coin.dust_limit,
            forceBip143: coin.force_bip143,
            forkid: coin.fork_id,
            // github not used
            hashGenesisBlock: coin.hash_genesis_block,
            // key not used
            // maintainer not used
            maxAddressLength: coin.max_address_length,
            maxFeeSatoshiKb: coin.maxfee_kb,
            minAddressLength: coin.min_address_length,
            minFeeSatoshiKb: coin.minfee_kb,
            // name: same as coin_label
            segwit: coin.segwit,
            // signed_message_header in Network
            slip44: coin.slip44,
            support: coin.support,
            // uri_prefix not used
            // version_group_id not used
            // website not used
            // xprv_magic in Network
            xPubMagic: coin.xpub_magic,
            xPubMagicSegwitNative: coin.xpub_magic_segwit_native,
            xPubMagicSegwit: coin.xpub_magic_segwit_p2sh,

            // custom
            network, // bitcoinjs network
            isBitcoin,
            hasTimestamp,
            maxFee: Math.round(coin.maxfee_kb / 1000),
            minFee: Math.round(coin.minfee_kb / 1000),

            // used in backend ?
            blocks: Math.round(coin.blocktime_seconds / 60),
            decimals: coin.decimals,
        });
    });
};

const parseEthereumNetworksJson = (json: JSON): void => {
    const networksObject: Object = json;
    Object.keys(networksObject).forEach(key => {
        const network = networksObject[key];
        const blockchainLink = Array.isArray(network.blockbook) && network.blockbook.length > 0 ? {
            type: 'blockbook',
            url: network.blockbook,
        } : undefined;
        ethereumNetworks.push({
            type: 'ethereum',
            blockchainLink,
            blocktime: Math.round(network.blocktime_seconds / 60),
            chain: network.chain,
            chainId: network.chain_id,
            // key not used
            defaultFees: [
                {
                    label: 'normal',
                    feePerUnit: '5000000000',
                    feeLimit: '21000',
                },
            ],
            minFee: 1,
            maxFee: 10000,
            label: network.name,
            name: network.name,
            shortcut: network.shortcut,
            rskip60: network.rskip60,
            slip44: network.slip44,
            support: network.support,
            // url not used
            network: undefined,
            decimals: 16,
        });
    });
};

const parseMiscNetworksJSON = (json: JSON): void => {
    const networksObject: Object = json;
    Object.keys(networksObject).forEach(key => {
        const network = networksObject[key];
        let minFee = 1;
        let maxFee = 1;
        const shortcut = network.shortcut.toLowerCase();
        if (shortcut === 'xrp' || shortcut === 'txrp') {
            minFee = 10;
            maxFee = 10000;
        }
        miscNetworks.push({
            type: 'misc',
            blockchainLink: network.blockchain_link,
            blocktime: 0,
            curve: network.curve,
            defaultFees: {'Normal': 1},
            minFee,
            maxFee,
            label: network.name,
            name: network.name,
            shortcut: network.shortcut,
            slip44: network.slip44,
            support: network.support,
            network: undefined,
            decimals: network.decimals,
        });
    });
};

export const parseCoinsJson = (json: JSON): void => {
    const coinsObject: Object = json;
    Object.keys(coinsObject).forEach(key => {
        switch (key) {
            case 'bitcoin' :
                return parseBitcoinNetworksJson(coinsObject[key]);
            case 'eth' :
                return parseEthereumNetworksJson(coinsObject[key]);
            case 'misc' :
            case 'nem' :
                return parseMiscNetworksJSON(coinsObject[key]);
        }
    });
};

export const getUniqueNetworks = (networks: Array<?CoinInfo>): CoinInfo[] => {
    return networks.reduce((result: CoinInfo[], info: ?CoinInfo) => {
        if (!info || result.find(i => i.shortcut === info.shortcut)) return result;
        return result.concat(info);
    }, []);
};
