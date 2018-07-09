/* @flow */

// empty module for css/less imports
declare module 'CSSModule' {
    declare var exports: { [key: string]: string };
}

// Override Navigator to have access to "usb" field
declare var navigator: Navigator & {
    +usb?: USB;
};

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
        support: CoinSupport,
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
