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
    AccountInfo,
    EthereumAddress,
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
    TrezorConnect.removeAllListeners();

    // @ts-ignore
    TrezorConnect.on('DEVICE-EVENT', () => {});

    TrezorConnect.on(TRANSPORT_EVENT, event => {
        if (event.type === TRANSPORT.START) {
            event.payload.type;
            event.payload.version;
            event.payload.outdated;
        }
        if (event.type === TRANSPORT.ERROR) {
            event.payload.bridge;
        }
    });
    TrezorConnect.off(TRANSPORT_EVENT, () => {});

    TrezorConnect.on(UI_EVENT, event => {
        if (event.type === UI.BUNDLE_PROGRESS) {
            event.payload.progress;
            event.payload.error;
            event.payload.response;
        }
        if (event.type === UI.REQUEST_BUTTON) {
            event.payload.code;
            event.payload.data;
            event.payload.device;
        }
    });
    TrezorConnect.off(UI_EVENT, () => {});

    TrezorConnect.on<AccountInfo>(UI.BUNDLE_PROGRESS, event => {
        event.progress;
        event.error;
        event.response.empty;
        event.response.availableBalance;
    });

    TrezorConnect.on<EthereumAddress>(UI.BUNDLE_PROGRESS, event => {
        event.progress;
        event.error;
        event.response.serializedPath;
        event.response.address;
    });

    TrezorConnect.on(UI.REQUEST_BUTTON, event => {
        event.code;
        event.data;
        event.device;
    });

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
        if (event.type === BLOCKCHAIN.NOTIFICATION) {
            event.payload.notification.descriptor;
            event.payload.notification.tx;
        }
    });
    TrezorConnect.off(BLOCKCHAIN_EVENT, () => {});
};
