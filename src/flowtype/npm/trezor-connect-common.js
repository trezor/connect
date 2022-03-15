/* @flow */

declare module '@trezor/connect-common' {
    
    // CoinInfo
    declare type Network = {
        messagePrefix: string,
        bech32: string,
        bip32: {
            public: number,
            private: number,
        },
        pubKeyHash: number,
        scriptHash: number,
        wif: number,
        consensusBranchId?: { [version: number]: number },
        forkId?: number,
    };
    
    declare type CoinSupport = {
        connect: boolean,
        trezor1: string,
        trezor2: string,
    };
    
    declare type BlockchainLink = {
        type: string,
        url: string[],
    };
    
    declare type BitcoinDefaultFees = { [level: 'High' | 'Normal' | 'Economy' | 'Low']: number };
    
    declare type Common = {
        label: string, // Human readable format, label != name
        name: string, // Trezor readable format
        shortcut: string,
        slip44: number,
        support: CoinSupport,
        decimals: number,
        blockchainLink?: BlockchainLink,
        blocktime: number,
        minFee: number,
        maxFee: number,
    };
    
    declare type BitcoinNetworkInfo = Common & {
        type: 'bitcoin',
        cashAddrPrefix?: string,
        curveName: string,
        dustLimit: number,
        forceBip143: boolean,
        hashGenesisBlock: string,
        maxAddressLength: number,
        maxFeeSatoshiKb: number,
        minAddressLength: number,
        minFeeSatoshiKb: number,
        defaultFees: BitcoinDefaultFees,
        segwit: boolean,
    
        xPubMagic: number,
        xPubMagicSegwitNative?: number,
        xPubMagicSegwit?: number,
        taproot?: boolean,
    
        // custom
        network: Network,
        isBitcoin: boolean,
        hasTimestamp: boolean,
        // used in backend
        blocks?: number,
    };
    
    declare type EthereumNetworkInfo = Common & {
        type: 'ethereum',
        chain: string,
        chainId: number,
        rskip60: boolean,
        defaultFees: {
            label: 'high' | 'normal' | 'low',
            feePerUnit: string,
            feeLimit: string,
        }[],
        network: typeof undefined,
    };
    
    declare type MiscNetworkInfo = Common & {
        type: 'misc' | 'nem',
        curve: string,
        defaultFees: BitcoinDefaultFees,
        network: typeof undefined,
    };
    
    declare type CoinInfo = BitcoinNetworkInfo | EthereumNetworkInfo | MiscNetworkInfo;

    declare type GetCoinInfo = {
        coin: string,
    };

    declare function getBitcoinNetwork(pathOrName: number[] | string): BitcoinNetworkInfo;
    declare function getEthereumNetwork(pathOrName: number[] | string): EthereumNetworkInfo;
    declare function getMiscNetwork(pathOrName: number[] | string): MiscNetworkInfo;
    declare function getCoinInfo(network: string): CoinInfo;
    declare function getSegwitNetwork(coin: BitcoinNetworkInfo): Network | null;
    declare function getBech32Network(coin: BitcoinNetworkInfo): Network | null;
    declare function getUniqueNetworks(networks: Array<?CoinInfo>): CoinInfo[];
    declare function fixCoinInfoNetwork(ci: BitcoinNetworkInfo, path: number[]): BitcoinNetworkInfo;
    declare function getCoinName(path: number[]): string;
    declare function getAllNetworks(): (EthereumNetworkInfo | MiscNetworkInfo | BitcoinNetworkInfo)[];
    
    // TransportInfo

    declare interface BridgeInfo {
        version: number[];
        directory: string;
        packages: Array<{
            name: string,
            platform: string[],
            url: string,
            signature?: string,
            preferred?: boolean,
        }>;
        changelog: string;
    }
    declare function getBridgeInfo(): BridgeInfo;
    declare interface UdevInfo {
        directory: string;
        packages: Array<{
            name: string,
            platform: string[],
            url: string,
            signature?: string,
            preferred?: boolean,
        }>;
    }
    declare function getUdevInfo(): UdevInfo;
    declare type TransportInfo = {
        type: string,
        version: string,
        outdated: boolean,
        bridge?: BridgeInfo,
        udev?: UdevInfo,
    };
    

    declare function parseConnectSettings(settings: any): ConnectSettings;
    
    declare type Manifest =$Exact< {
        appUrl: string;
        email: string;
    }>
    
    declare type Proxy =
        | string
        | {
              // Partial (useful) BlockchainLinkOptions.proxy
              protocol?: 'socks4' | 'socks4a' | 'socks' | 'socks5' | 'socks5h';
              host: string;
              port: string | number;
              username?: string;
              password?: string;
          };
    
    declare type ConnectSettings = {
        manifest?: Manifest;
        connectSrc?: string;
        debug?: boolean;
        hostLabel?: string;
        hostIcon?: string;
        popup?: boolean;
        transportReconnect?: boolean;
        webusb?: boolean;
        pendingTransportEvent?: boolean;
        lazyLoad?: boolean;
        interactionTimeout?: number;
        // internal part, not to be accepted from .init()
        origin?: string;
        configSrc: string;
        iframeSrc: string;
        popupSrc: string;
        webusbSrc: string;
        version: string;
        priority: number;
        trustedHost: boolean;
        supportedBrowser?: boolean;
        extension?: string;
        env: 'node' | 'web' | 'webextension' | 'electron' | 'react-native';
        timestamp: number;
        proxy?: Proxy;
        useOnionLinks?: boolean;
    }
    
    declare type WhiteList = {
        priority: number;
        origin: string;
    };
    
    declare type KnownHost = {
        origin: string;
        label?: string;
        icon?: string;
    };
    
    declare type SupportedBrowser = {
        version: number;
        download: string;
        update: string;
    };
    
    declare type WebUSB = {
        vendorId: string;
        productId: string;
    };
    
    declare type Resources = {
        bridge: string;
    };

    declare type Config = {
        whitelist: WhiteList[];
        management: WhiteList[];
        knownHosts: KnownHost[];
        onionDomains: { [key: string]: string };
        webusb: WebUSB[];
        resources: Resources;
    
        // todo: change
        messages: any;
        supportedBrowsers: { [key: string]: SupportedBrowser };
        supportedFirmware: Array<{
            coinType?: string;
            coin?: string | string[];
            methods?: string[];
            capabilities?: string[];
            min?: string[];
            max?: string[];
        }>;
    };

    declare class DataManager {
        static settings: ConnectSettings;
        static load(settings: ConnectSettings): void;
        static getConfig(): Config;

        // todo: should be something like this. How do I write in Flow?
        
        static getSettings(key?: string): any;
        
        static isWhitelisted(domain: string): boolean;
        static getProtobufMessages(): Object;
        static isManagementAllowed(): boolean;
    }

    // FirmwareInfo

    declare function getFirmwareStatus(features: any): 'valid' | 'outdated' | 'required' | 'unknown' | 'none';
    declare function getReleases(features: any): any;
    declare function getRelease(features: any): any;

}
