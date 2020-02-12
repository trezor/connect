/* @flow */

export type Unsuccessful = {
    success: false;
    payload: { error: string; code?: string | number };
};

export type Success<T> = {
    id: number;
    success: true;
    payload: T;
};

export type Message<T> = Promise<Success<T> | Unsuccessful>;
export type BundledMessage<T> = Promise<Success<T[]> | Unsuccessful>;

export type DefaultMessage = {
    message: string;
};

export type Manifest = {
    appUrl: string;
    email: string;
};

export type Settings = {
    debug: boolean;
    hostLabel?: string;
    hostIcon?: string;
    priority?: number;
    trustedHost?: boolean;
    connectSrc?: string;
    iframeSrc?: string;
    popup?: boolean;
    popupSrc?: string;
    webusbSrc?: string;
    transportReconnect?: boolean;
    webusb?: boolean;
    pendingTransportEvent?: boolean;
    supportedBrowser?: boolean;
    extension?: string;
    lazyLoad?: boolean;
    manifest: Manifest;
    env?: string;
};

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
