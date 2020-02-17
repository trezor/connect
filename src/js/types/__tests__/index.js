/* @flow */
// TrezorConnect API types tests

// Exported constants
/* eslint-disable no-unused-vars */
import TrezorConnect, {
    UI_EVENT,
    DEVICE_EVENT,
    RESPONSE_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
    BLOCKCHAIN,
    DEVICE,
    ERRORS,
    IFRAME,
    POPUP,
    TRANSPORT,
    UI,
} from '../../index';
/* eslint-disable no-unused-vars */

// Exported types
import type {
    API,
    Device,
    DeviceStatus,
    FirmwareRelease,
    DeviceFirmwareStatus,
    DeviceMode,
    Features,
} from '../../index';

export const init = async () => {
    const manifest = { appUrl: '', email: '' };
    TrezorConnect.init({ manifest });
    // $FlowIssue: invalid params
    TrezorConnect.init();
    // $FlowIssue: invalid params
    TrezorConnect.init({});
    // $FlowIssue: invalid params
    TrezorConnect.init({ manifest: { appUrl: '', email: '' }, connectSrc: undefined });

    TrezorConnect.manifest(manifest);
    // $FlowIssue: invalid params
    TrezorConnect.manifest({});
    // $FlowIssue: invalid params
    TrezorConnect.manifest({ appUrl: 1 });
    // $FlowIssue: invalid params
    TrezorConnect.manifest({ email: 1 });

    const settings = await TrezorConnect.getSettings();
    if (settings.success) {
        const { payload } = settings;
        (payload.manifest: typeof manifest | null | void);
        (payload.connectSrc: string | void);
        (payload.debug: boolean | void);
        (payload.popup: boolean | void);
        (payload.lazyLoad: boolean | void);
        (payload.webusb: boolean | void);
        (payload.pendingTransportEvent: boolean | void);
        (payload.pendingTransportEvent: boolean | void);
    }

    TrezorConnect.dispose();
    TrezorConnect.cancel();
    TrezorConnect.cancel('Interruption error');
    TrezorConnect.renderWebUSBButton();
    TrezorConnect.disableWebUSB();
};

export const events = async () => {
    TrezorConnect.on(DEVICE_EVENT, event => {
        const { payload } = event;
        (event.type: 'device-connect' | 'device-connect_unacquired' | 'device-changed' | 'device-disconnect');
        (payload.path: string);
        (payload.type: 'acquired' | 'unacquired' | 'unreadable');
        if (payload.type === 'acquired') {
            (payload.mode: 'normal' | 'bootloader' | 'initialize' | 'seedless');
            (payload.firmware: 'valid' | 'outdated' | 'required' | 'unknown' | 'none');
            (payload.status: 'available' | 'occupied' | 'used');
        }
    });
    TrezorConnect.off(DEVICE_EVENT, () => {});
    // $FlowIssue: invalid event type
    TrezorConnect.off('DEVICE---EVENT', () => {});

    TrezorConnect.on(TRANSPORT_EVENT, event => {
        if (event.type === TRANSPORT.START) {
            (event.payload.type: string);
            (event.payload.version: string);
            (event.payload.outdated: boolean);
        }
    });
    TrezorConnect.off(TRANSPORT_EVENT, () => {});

    TrezorConnect.on(UI_EVENT, event => {
        if (event.type === UI.BUNDLE_PROGRESS) {
            (event.payload.progress: number);
        }
    });
    TrezorConnect.off(UI_EVENT, () => {});

    TrezorConnect.on(BLOCKCHAIN_EVENT, event => {
        if (event.type === BLOCKCHAIN.CONNECT) {
            (event.payload.blockHash: string);
            (event.payload.shortcut: string);
            (event.payload.testnet: boolean);
        }
        if (event.type === BLOCKCHAIN.BLOCK) {
            (event.payload.blockHash: string);
            (event.payload.blockHeight: number);
        }
    });
    TrezorConnect.off(BLOCKCHAIN_EVENT, () => {});
};
