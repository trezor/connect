/* @flow */

// empty module for css/less imports
declare module 'CSSModule' {
    declare var exports: { [key: string]: string };
}

// Override Navigator to have access to "usb" field
declare var navigator: Navigator & {
    +usb?: USB;
};

declare type ChromeTab = {
    id: number;
    index: number;
}

declare type ChromePort = {
    name: string;
    onMessage: (message: Object) => void;
    postMessage: (message: Object) => void;
    sender: any;
    disconnect: () => void;
}

declare function $RuntimeSendMessage(message: any, options: Object, callback: () => void): void;
declare function $RuntimeSendMessage(id: string, message: any, options: ?Object, callback: () => void): void;

declare var chrome: {
    runtime: {
        id: string;
        onConnect: {
            addListener: ((port: ChromePort) => void) => void;
            removeListener: ((port: ChromePort) => void) => void;
        };
        sendMessage: typeof $RuntimeSendMessage;
        lastError?: string;
    },
    tabs: {
        create: ({
            url?: string;
            index?: number;
        }, callback?: (tab: ?ChromeTab) => void) => void;
        get: (id: number, callback: (tab: ?ChromeTab) => void) => void;
        highlight: (options: Object, callback?: () => void) => void;
        update: (id: number, options: Object) => void;
        remove: (id: number) => void;
    }
}

declare interface BroadcastChannel {
    constructor: (id: string) => void;
    onmessage: (message: Object) => void;
    postMessage: (message: Object) => void;
}

// Common types used across library
declare module 'flowtype' {

    import type {
        Network as BitcoinJsNetwork,
    } from 'bitcoinjs-lib-zcash';

    declare export type UiPromiseResponse = {
        event: string,
        payload: any,
    }

    declare export type BrowserState = {
        name: string;
        osname: string;
        supported: boolean;
        outdated: boolean;
        mobile: boolean;
    }

    declare type CoinSupport = {
        connect: boolean,
        // "electrum": "https://electrum.org/",
        trezor1: string,
        trezor2: string,
        // "webwallet": true
    }

    declare export type CoinInfo = {
        // address_type: in Network
        // address_type_p2sh: in Network
        // bech32_prefix: in Network
        // bip115: not used
        bitcore: Array<string>,
        blockbook: Array<string>,
        blocktime: number,
        cashAddrPrefix: ?string,
        label: string,
        name: string,
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
        network: BitcoinJsNetwork,
        zcash: boolean,
        isBitcoin: boolean,
        minFee: number,
        maxFee: number,
        // used in backend
        blocks?: number,
    }

    declare export type EthereumNetworkInfo = {
        bitcore: Array<string>, // compatibility
        blockbook: Array<string>,
        chain: string;
        chainId: number;
        // key not used
        name: string;
        rskip60: boolean;
        shortcut: string;
        slip44: number;
        support: CoinSupport;
        // url not used
    }

    declare export type SimpleAccount = {
        id: number;
        path: Array<number>;
        coinInfo: CoinInfo;
        xpub: string;
        label: string,
        balance: number;
        transactions: number;
    }
}
