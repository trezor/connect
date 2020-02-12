/* @flow */

import {
    DEVICE,
    DEVICE_EVENT,
    TRANSPORT,
    TRANSPORT_EVENT,
} from './_const';

import { Device } from './trezor';

export type DeviceEvent = {
    event: typeof DEVICE_EVENT;
    type: | typeof DEVICE.CONNECT
        | typeof DEVICE.CONNECT_UNACQUIRED
        | typeof DEVICE.CHANGED
        | typeof DEVICE.DISCONNECT;
    payload: Device;
};

export type TransportEvent =
    | {
            event: typeof TRANSPORT_EVENT;
            type: typeof TRANSPORT.START;
            payload: any;
        }
    | {
            event: typeof TRANSPORT_EVENT;
            type: typeof TRANSPORT.ERROR;
            payload: string;
        };

export interface Emitter {
    (type: typeof DEVICE_EVENT, cb: (event: DeviceEvent) => void): void;
    (type: typeof TRANSPORT_EVENT, cb: (event: TransportEvent) => void): void;
    // on(type: typeof DEVICE_EVENT, event: DeviceEvent): void;
}
