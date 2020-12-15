import { getInfo } from '@trezor/rollout';
import { DEVICE } from '../constants';
import { Features } from './protobuf';

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

export type { Features } from './protobuf';
