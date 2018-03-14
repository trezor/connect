declare type ResponseMessage = {
    event: string;
    type: string;
    id: number;
    success: boolean;
    payload: Object;
}

declare type UiMessage = {
    event: string;
    type: string;
    payload: Object;
}

declare type DeviceMessage = {
    event: string;
    type: string;
    payload: Object;
}

declare type TransportMessage = {
    event: string;
    type: string;
    payload: Object;
}

declare type Device = {
    path: string,
    label: string,
    isUsedElsewhere: boolean,
    featuresNeedsReload: boolean,
    unacquired?: boolean,
    features: Features,
}

declare type Features = {
    vendor: string,
    major_version: number,
    minor_version: number,
    patch_version: number,
    bootloader_mode: boolean,
    device_id: string,
    pin_protection: boolean,
    passphrase_protection: boolean,
    language: string,
    label: string,
    coins: CoinType[],
    initialized: boolean,
    revision: string,
    bootloader_hash: string,
    imported: boolean,
    pin_cached: boolean,
    passphrase_cached: boolean,
    state?: string;
    needs_backup?: boolean,
    firmware_present?: boolean,
};


