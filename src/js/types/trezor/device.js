/* @flow */
import { DEVICE } from '../../constants';
import type { Features } from './protobuf';

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

export type { Features } from './protobuf';
