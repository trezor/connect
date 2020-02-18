/* @flow */

// $FlowIssue: 'react-native' is not a dependency
import { NativeModules } from 'react-native';

type TrezorDeviceInfoDebug = {
    path: string;
    debug: boolean;
};

interface RNBridge {
    enumerate(): Promise<TrezorDeviceInfoDebug[]>;
    acquire(path: string, debugLink: boolean): Promise<void>;
    release(path: string, debugLink: boolean, closePort: boolean): Promise<void>;
    write(path: string, debugLink: boolean, data: string): Promise<void>;
    read(path: string, debugLink: boolean): Promise<{ data: string }>;
}

const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
};

const toArrayBuffer = (buffer: Buffer) => {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    const len = buffer.length;
    for (let i = 0; i < len; ++i) {
        view[i] = buffer[i];
    }
    return ab;
};

export default class ReactNativePlugin {
    name = 'ReactNativePlugin';

    version = '1.0.0';
    debug = false;
    allowsWriteAndEnumerate = true;
    requestDevice: () => any;
    requestNeeded = false;

    usb: RNBridge;

    constructor() {
        this.usb = NativeModules.RNBridge;
    }

    async init(debug: ?boolean) {
        this.debug = !!debug;
        if (!this.usb) {
            throw new Error('ReactNative plugin is not available');
        }
    }

    async enumerate(): Promise<TrezorDeviceInfoDebug[]> {
        return this.usb.enumerate();
    }

    async send(path: string, data: ArrayBuffer, debugLink: boolean) {
        const dataHex = bufferToHex(data);
        return this.usb.write(path, debugLink, dataHex);
    }

    async receive(path: string, debugLink: boolean) {
        const { data } = await this.usb.read(path, debugLink);
        return toArrayBuffer(Buffer.from(data, 'hex'));
    }

    async connect(path: string, debugLink: boolean) {
        for (let i = 0; i < 5; i++) {
            if (i > 0) {
                await new Promise((resolve) => setTimeout(() => resolve(), i * 200));
            }
            try {
                await this.usb.acquire(path, debugLink);
                return;
            } catch (e) {
                if (i === 4) {
                    throw e;
                }
            }
        }
    }

    async disconnect(path: string, debugLink: boolean, last: boolean) {
        return this.usb.release(path, debugLink, last);
    }
}
