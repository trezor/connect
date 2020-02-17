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
    IFRAME,
    POPUP,
    TRANSPORT,
    UI,
    // Exported types
    Device,
    DeviceStatus,
    FirmwareRelease,
    DeviceFirmwareStatus,
    DeviceMode,
    Features,
} from '../index';
/* eslint-disable no-unused-vars */

export const init = async () => {
    const manifest = { appUrl: '', email: '' };
    TrezorConnect.init({ manifest });
    // @ts-ignore
    TrezorConnect.init();
    // @ts-ignore
    TrezorConnect.init({});
    // @ts-ignore
    TrezorConnect.manifest({});
    // @ts-ignore
    TrezorConnect.manifest({ appUrl: 1 });
    // @ts-ignore
    TrezorConnect.manifest({ email: 1 });

    const settings = await TrezorConnect.getSettings();
    if (settings.success) {
        const { payload } = settings;
        payload.manifest;
        payload.connectSrc;
        payload.debug;
        payload.popup;
        payload.lazyLoad;
        payload.webusb;
        payload.pendingTransportEvent;
        payload.pendingTransportEvent;
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
        event.type;
        payload.path;
        payload.type;
        if (payload.type === 'acquired') {
            payload.mode;
            payload.firmware;
            payload.status;
        }
    });
    TrezorConnect.off(DEVICE_EVENT, () => {});
    // @ts-ignore
    TrezorConnect.on('DEVICE-EVENT', () => {});

    TrezorConnect.on(TRANSPORT_EVENT, event => {
        if (event.type === TRANSPORT.START) {
            event.payload.type;
            event.payload.version;
            event.payload.outdated;
        }
    });
    TrezorConnect.off(TRANSPORT_EVENT, () => {});

    TrezorConnect.on(UI_EVENT, event => {
        if (event.type === UI.BUNDLE_PROGRESS) {
            event.payload.progress;
        }
    });
    TrezorConnect.off(UI_EVENT, () => {});

    TrezorConnect.on(BLOCKCHAIN_EVENT, event => {
        if (event.type === BLOCKCHAIN.CONNECT) {
            event.payload.blockHash;
            event.payload.shortcut;
            event.payload.testnet;
        }
        if (event.type === BLOCKCHAIN.BLOCK) {
            event.payload.blockHash;
            event.payload.blockHeight;
        }
    });
    TrezorConnect.off(BLOCKCHAIN_EVENT, () => {});
};
