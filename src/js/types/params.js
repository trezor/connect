/* @flow */

export type Unsuccessful = {|
    success: false;
    payload: { error: string; code?: string | number };
|};

export type Success<T> = {|
    success: true;
    id: number;
    payload: T;
|};

export type Response<T> = Promise<Success<T> | Unsuccessful>;
export type BundledResponse<T> = Promise<Success<T[]> | Unsuccessful>;

export type DefaultMessage = {
    message: string;
};

export type Manifest = {
    appUrl: string;
    email: string;
};

export type ConnectSettings = {
    manifest: ?Manifest;
    connectSrc?: string;
    debug?: boolean;
    hostLabel?: string;
    hostIcon?: string;
    popup?: boolean;
    transportReconnect?: boolean;
    webusb?: boolean;
    pendingTransportEvent?: boolean;
    lazyLoad?: boolean;
    // internal part, not to be accepted from .init()
    origin: ?string;
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
}

export type CommonParams = {
    device?: {
        path: string;
        state?: string;
        instance?: number;
    };
    useEmptyPassphrase?: boolean;
    allowSeedlessDevice?: boolean;
    keepSession?: boolean;
    skipFinalReload?: boolean;
};

export type Bundle<T> = {
    bundle: T[];
};
