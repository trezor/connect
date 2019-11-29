/* @flow */

// $FlowIssue: 'react-native' is not a dependency
import { NativeModules } from 'react-native';

type TrezorDeviceInfoDebug = {
    path: string,
    debug: boolean,
};

interface RNBridge {
    enumerate(): Promise<TrezorDeviceInfoDebug[]>,
    acquire(path: string, debugLink: boolean): Promise<void>,
    release(serialNumber: string, debugLink: boolean, closePort: boolean): Promise<void>,
    // write(serialNumber: string, debugLink: boolean, data: Uint8Array): Promise<void>,
    write(serialNumber: any): Promise<void>,
    read(serialNumber: any): Promise<{ data: string }>,
}

const bufferToHex = (buffer: ArrayBuffer) => {
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

    async send(path: string, data: ArrayBuffer, _debugLink: boolean) {
        return this.usb.write({ path, data, dataHex: bufferToHex(data), debug: false });
    }

    async receive(path: string, debug: boolean): Promise<ArrayBuffer> {
        const { data } = await this.usb.read({ path, debug });
        const buffer = toArrayBuffer(Buffer.from(data, 'hex'));
        return buffer;
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
