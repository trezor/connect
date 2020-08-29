/* @flow */

import { ERRORS } from '../constants';
import { toHardened, fromHardened } from '../utils/pathUtils';
import type { CoinInfo, BitcoinNetworkInfo, EthereumNetworkInfo, MiscNetworkInfo } from '../types';

const bitcoinNetworks: BitcoinNetworkInfo[] = [];
const ethereumNetworks: EthereumNetworkInfo[] = [];
const miscNetworks: MiscNetworkInfo[] = [];

export function cloneCoinInfo<T>(info: T): T {
    const jsonString = JSON.stringify(info);
    if (jsonString === undefined) {
        // jsonString === undefined IF and only IF obj === undefined
        // therefore no need to clone
        return info;
    }
    return JSON.parse(jsonString);
}

export const getBitcoinNetwork = (pathOrName: number[] | string): ?BitcoinNetworkInfo => {
    const networks: BitcoinNetworkInfo[] = cloneCoinInfo(bitcoinNetworks);
    if (typeof pathOrName === 'string') {
        const name = pathOrName.toLowerCase();
        return networks.find(n => n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name || n.label.toLowerCase() === name);
    } else {
        const slip44 = fromHardened(pathOrName[1]);
        return networks.find(n => n.slip44 === slip44);
    }
};

export const getEthereumNetwork = (pathOrName: number[] | string): ?EthereumNetworkInfo => {
    const networks: EthereumNetworkInfo[] = cloneCoinInfo(ethereumNetworks);
    if (typeof pathOrName === 'string') {
        const name = pathOrName.toLowerCase();
        return networks.find(n => n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name);
    } else {
        const slip44 = fromHardened(pathOrName[1]);
        return networks.find(n => n.slip44 === slip44);
    }
};

export const getMiscNetwork = (pathOrName: number[] | string): ?MiscNetworkInfo => {
    const networks: MiscNetworkInfo[] = cloneCoinInfo(miscNetworks);
    if (typeof pathOrName === 'string') {
        const name = pathOrName.toLowerCase();
        return networks.find(n => n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name);
    } else {
        const slip44 = fromHardened(pathOrName[1]);
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

const detectBtcVersion = (data) => {
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
    const networks: BitcoinNetworkInfo[] = cloneCoinInfo(bitcoinNetworks);
    const result: ?BitcoinNetworkInfo = networks.find(info => hash.toLowerCase() === info.hashGenesisBlock.toLowerCase());
    if (!result) {
        throw ERRORS.TypedError('Method_UnknownCoin', 'Coin info not found for hash: ' + hash + ' ' + networkInfo.hashGenesisBlock);
    }

    if (result.isBitcoin) {
        const btcVersion = detectBtcVersion(networkInfo);
        let fork: ?BitcoinNetworkInfo;
        if (btcVersion === 'bch') {
            fork = networks.find(info => info.name === 'Bcash');
        } else if (btcVersion === 'btg') {
            fork = networks.find(info => info.name === 'Bgold');
        }
        if (fork) {
            return fork;
        } else {
            throw ERRORS.TypedError('Method_UnknownCoin', 'Coin info not found for hash: ' + hash + ' ' + networkInfo.hashGenesisBlock + ' BTC version:' + btcVersion);
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

export const getCoinName = (path: Array<number>) => {
    const slip44: number = fromHardened(path[1]);
    for (const network of ethereumNetworks) {
        if (network.slip44 === slip44) {
            return network.name;
        }
    }
    return 'Unknown coin';
};

const parseBitcoinNetworksJson = (json: JSON) => {
    const coinsObject: Object = json;
    Object.keys(coinsObject).forEach(key => {
        const coin = coinsObject[key];
        const shortcut = coin.coin_shortcut;
        const isBitcoin = shortcut === 'BTC' || shortcut === 'TEST';
        const hasTimestamp = shortcut === 'CPC' || shortcut === 'PPC' || shortcut === 'tPPC';

        const network = {
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
            blocktime: -1, // unknown
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

const parseMiscNetworksJSON = (json: JSON, type?: 'misc' | 'nem') => {
    const networksObject: Object = json;
    Object.keys(networksObject).forEach(key => {
        const network = networksObject[key];
        let minFee = -1; // unknown
        let maxFee = -1; // unknown
        let defaultFees = {'Normal': -1}; // unknown
        const shortcut = network.shortcut.toLowerCase();
        if (shortcut === 'xrp' || shortcut === 'txrp') {
            minFee = 10;
            maxFee = 10000;
            defaultFees = {'Normal': 12};
        }
        miscNetworks.push({
            type: type || 'misc',
            blockchainLink: network.blockchain_link,
            blocktime: -1,
            curve: network.curve,
            defaultFees,
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

export const parseCoinsJson = (json: JSON) => {
    const coinsObject: Object = json;
    Object.keys(coinsObject).forEach(key => {
        switch (key) {
            case 'bitcoin' :
                return parseBitcoinNetworksJson(coinsObject[key]);
            case 'eth' :
                return parseEthereumNetworksJson(coinsObject[key]);
            case 'misc' :
                return parseMiscNetworksJSON(coinsObject[key]);
            case 'nem' :
                return parseMiscNetworksJSON(coinsObject[key], 'nem');
        }
    });
};

export const getUniqueNetworks = (networks: Array<?CoinInfo>): CoinInfo[] => {
    return networks.reduce((result: CoinInfo[], info: ?CoinInfo) => {
        if (!info || result.find(i => i.shortcut === info.shortcut)) return result;
        return result.concat(info);
    }, []);
};

export const getAllNetworks = (): CoinInfo[] => [].concat(bitcoinNetworks).concat(ethereumNetworks).concat(miscNetworks);

export const getCoinInfoByCapability = (capabilities: string[]): CoinInfo[] => {
    const networks: Array<?CoinInfo> = capabilities.reduce((result: Array<?CoinInfo>, c: string) => {
        if (c === 'Capability_Bitcoin') {
            return result.concat(getCoinInfo('Bitcoin')).concat(getCoinInfo('Testnet'));
        } else if (c === 'Capability_Bitcoin_like') {
            return result.concat(bitcoinNetworks);
        } else if (c === 'Capability_Binance') {
            return result.concat(getCoinInfo('BNB'));
        } else if (c === 'Capability_Ethereum') {
            return result.concat(ethereumNetworks);
        } else if (c === 'Capability_Ripple') {
            return result.concat(getCoinInfo('xrp')).concat(getCoinInfo('txrp'));
        } else {
            const [, networkName] = c.split('_');
            if (typeof networkName === 'string') {
                return result.concat(getCoinInfo(networkName));
            }
        }
        return result;
    }, []);
    return getUniqueNetworks(networks);
};
