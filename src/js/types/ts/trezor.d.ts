/* @flow */

export type DeviceStateResponse = {
    state: string;
};

export type DeviceStatus = 'available' | 'occupied' | 'used';

export type DeviceMode = 'normal' | 'bootloader' | 'initialize' | 'seedless';

export type DeviceFirmwareStatus = 'valid' | 'outdated' | 'required' | 'unknown' | 'none';

export type UnavailableCapability =
    | 'no-capability'
    | 'no-support'
    | 'update-required'
    | 'trezor-connect-outdated'
    | string[];

export interface FirmwareRelease {
    required: boolean;
    version: number[];
    min_bridge_version: number[];
    min_firmware_version: number[];
    bootloader_version: number[];
    min_bootloader_version: number[];
    url: string;
    channel: string;
    fingerprint: string;
    changelog: string;
}

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
    pin_protection: boolean;
    revision: string;
    unfinished_backup: boolean;
    vendor: string;
    recovery_mode?: boolean;
    session_id?: string;
    passphrase_always_on_device?: boolean;
    capabilities?: string[];
}

export type Device =
        | {
              type: 'acquired';
              path: string;
              label: string;
              firmware: DeviceFirmwareStatus;
              firmwareRelease?: FirmwareRelease;
              status: DeviceStatus;
              mode: DeviceMode;
              state?: string;
              features: Features;
              unavailableCapabilities: { [key: string]: UnavailableCapability };
          }
        | {
              type: 'unacquired' | 'unreadable';
              path: string;
              label: string;
              features?: typeof undefined;
          };
