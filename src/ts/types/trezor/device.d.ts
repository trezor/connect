import { getInfo } from '@trezor/rollout';
import { DEVICE } from '../constants';

export interface DeviceStateResponse {
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

export interface FirmwareRange {
    '1': {
        min: string;
        max: string;
    };
    '2': {
        min: string;
        max: string;
    };
}

export type FirmwareRelease = ReturnType<typeof getInfo>;

export interface Features {
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

export type KnownDevice = {
    type: 'acquired';
    id: string | null;
    path: string;
    label: string;
    firmware: DeviceFirmwareStatus;
    firmwareRelease?: FirmwareRelease;
    status: DeviceStatus;
    mode: DeviceMode;
    state?: string;
    features: Features;
    unavailableCapabilities: { [key: string]: UnavailableCapability };
};

export type UnknownDevice = {
    type: 'unacquired' | 'unreadable';
    id?: null;
    path: string;
    label: string;
    features?: typeof undefined;
    firmware?: typeof undefined;
    firmwareRelease?: typeof undefined;
    status?: typeof undefined;
    mode?: typeof undefined;
    state?: typeof undefined;
    unavailableCapabilities?: typeof undefined;
};

export type Device = KnownDevice | UnknownDevice;

export interface DeviceEvent {
    type: typeof DEVICE.CONNECT | typeof DEVICE.CONNECT_UNACQUIRED | typeof DEVICE.CHANGED | typeof DEVICE.DISCONNECT;
    payload: Device;
}
