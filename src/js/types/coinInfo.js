/* @flow */

type CoinSupport = {
    connect: boolean,
    // electrum not used,
    trezor1: string,
    trezor2: string,
    // webwallet not used
};

// copy-paste from 'bitcoinjs-lib-zcash' module
type Network = {
    messagePrefix: string,
    bech32: ?string,
    bip32: {
        public: number,
        private: number,
    },
    pubKeyHash: number,
    scriptHash: number,
    wif: number,
    dustThreshold: number,
    bech32: ?string,
    coin: string,
};

type BlockchainLink = {
    type: string,
    url: Array<string>,
};

export type BitcoinNetworkInfo = {
    +type: 'bitcoin',
    // address_type: in Network
    // address_type_p2sh: in Network
    // bech32_prefix: in Network
    // bip115: not used
    bitcore: Array<string>,
    blockbook: Array<string>,
    blockchainLink: ?BlockchainLink,
    blocktime: number,
    cashAddrPrefix: ?string,
    label: string, // this is human readable format, could be different from "name"
    name: string, // this is Trezor readable format
    shortcut: string,
    // cooldown no used
    curveName: string,
    decred: boolean,
    defaultFees: {[level: string]: number},
    dustLimit: number,
    forceBip143: boolean,
    forkid: ?number,
    // github: not used
    hashGenesisBlock: string,
    // key not used
    // maintainer: not used
    maxAddressLength: number,
    maxFeeSatoshiKb: number,
    minAddressLength: number,
    minFeeSatoshiKb: number,
    // name: same as coin_label
    segwit: boolean,
    // signed_message_header: in Network
    slip44: number,
    support: CoinSupport,
    // uri_prefix not used
    // version_group_id: not used
    // website: not used
    // xprv_magic: in Network
    xPubMagic: number,
    xPubMagicSegwitNative: ?number,
    xPubMagicSegwit: ?number,

    // custom
    network: Network,
    isBitcoin: boolean,
    hasTimestamp: boolean,
    minFee: number,
    maxFee: number,
    // used in backend
    blocks?: number,
};

export type EthereumNetworkInfo = {
    +type: 'ethereum',
    bitcore: Array<string>, // compatibility
    blockbook: Array<string>,
    blockchainLink: ?BlockchainLink,
    chain: string,
    chainId: number,
    // key not used
    label: string, // compatibility
    name: string,
    shortcut: string,
    rskip60: boolean,
    slip44: number,
    support: CoinSupport,
    // url not used
    network: typeof undefined, // compatibility
};

export type MiscNetworkInfo = {
    +type: 'misc',
    bitcore: Array<string>, // compatibility
    blockbook: Array<string>, // compatibility
    blockchainLink: ?BlockchainLink,
    curve: string,
    // key not used
    // links not used
    label: string, // compatibility
    name: string,
    shortcut: string,
    slip44: number,
    support: CoinSupport,
    network: typeof undefined, // compatibility
};

export type CoinInfo = BitcoinNetworkInfo | EthereumNetworkInfo | MiscNetworkInfo;
