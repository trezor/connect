/* @flow */
import { DEVICE } from '../../constants';

export type DeviceStateResponse = {
    state: string;
}

export type DeviceStatus = 'available' | 'occupied' | 'used';

export type DeviceMode = 'normal' | 'bootloader' | 'initialize' | 'seedless';

export type DeviceFirmwareStatus = 'valid' | 'outdated' | 'required' | 'unknown' | 'none';

export type UnavailableCapability =
    | 'no-capability'
    | 'no-support'
    | 'update-required'
    | 'trezor-connect-outdated'
    | string[];

export type FirmwareRange = {
    '1': {
        min: string;
        max: string;
    };
    '2': {
        min: string;
        max: string;
    };
}

type Release = {
    required: true;
    version: Array<number>;
    min_bridge_version: Array<number>;
    min_firmware_version: Array<number>;
    bootloader_version: Array<number>;
    min_bootloader_version: Array<number>;
    url: string;
    channel: string;
    fingerprint: string;
    changelog: string;
    channel?: string;
}

export type FirmwareRelease = {
    changelog: Release[] | null;
    release: Release;
    isLatest: boolean | null;
    isRequired: boolean | null;
    isNewer: boolean | null;
}

export type Features = {
    bootloader_hash?: string | null;
    bootloader_mode?: boolean | null;
    device_id: string | null;
    firmware_present?: boolean | null;
    flags: number;
    fw_major?: number | null;
    fw_minor?: number | null;
    fw_patch?: number | null;
    fw_vendor?: string | null;
    fw_vendor_keys?: string | null;
    imported?: boolean | null;
    initialized: boolean;
    label: string | null;
    language?: string | null;
    major_version: number;
    minor_version: number;
    model: string;
    needs_backup: boolean;
    no_backup: boolean;
    passphrase_cached: boolean;
    passphrase_protection: boolean;
    patch_version: number;
    pin_cached: boolean;
    unlocked?: boolean; // replacement for "pin_cached" since 2.3.2
    pin_protection: boolean;
    revision: string;
    unfinished_backup: boolean;
    vendor: string;
    recovery_mode?: boolean;
    session_id?: string;
    passphrase_always_on_device?: boolean;
    capabilities?: string[];
}

export type KnownDevice = {|
    type: 'acquired';
    id: string | null;
    path: string;
    label: string;
    firmware: DeviceFirmwareStatus;
    firmwareRelease: ?FirmwareRelease;
    status: DeviceStatus;
    mode: DeviceMode;
    state: ?string;
    features: Features;
    unavailableCapabilities: { [key: string]: UnavailableCapability };
|};

export type UnknownDevice = {|
    type: 'unacquired' | 'unreadable';
    id?: null;
    path: string;
    label: string;
    features?: typeof undefined | null;
    firmware?: typeof undefined | null;
    firmwareRelease?: typeof undefined | null;
    status?: typeof undefined | null;
    mode?: typeof undefined | null;
    state?: typeof undefined | null;
    unavailableCapabilities?: typeof undefined | null;
|};

export type Device = KnownDevice | UnknownDevice;

export type DeviceEvent = {
    type: | typeof DEVICE.CONNECT
        | typeof DEVICE.CONNECT_UNACQUIRED
        | typeof DEVICE.CHANGED
        | typeof DEVICE.DISCONNECT;
    payload: Device;
};
