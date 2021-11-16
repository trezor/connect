import { Controller } from './websocket-client';
import TrezorConnect from '../src/js/index';
import * as UI from '../src/js/constants/ui';
import { versionCompare } from '../src/js/utils/versionUtils';

const MNEMONICS = {
    mnemonic_all: 'all all all all all all all all all all all all',
    mnemonic_12: 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
    mnemonic_abandon:
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
};

const firmware = process.env.TESTS_FIRMWARE;

const wait = ms =>
    new Promise(resolve => {
        setTimeout(resolve, ms);
    });

const setup = async (controller, options) => {
    try {
        await controller.connect();
        // after bridge is stopped, trezor-user-env automatically resolves to use udp transport.
        // this is actually good as we avoid possible race conditions when setting up emulator for
        // the test using the same transport
        await controller.send({ type: 'bridge-stop' });

        const emulatorStartOpts = { type: 'emulator-start', wipe: true };
        if (firmware) {
            Object.assign(emulatorStartOpts, { version: firmware });
        }
        if (options.firmware) {
            Object.assign(emulatorStartOpts, { version: options.firmware });
        }

        await controller.send(emulatorStartOpts);

        const mnemonic =
            typeof options.mnemonic === 'string' && options.mnemonic.indexOf(' ') > 0
                ? options.mnemonic
                : MNEMONICS[options.mnemonic];
        await controller.send({
            type: 'emulator-setup',
            mnemonic,
            pin: options.pin || '',
            passphrase_protection: false,
            label: options.label || 'TrezorT',
            needs_backup: false,
            options,
        });
        // todo: temporary from 2.3.2 until sync fixtures with trezor-firmware
        await controller.send({ type: 'emulator-allow-unsafe-paths' });

        // after all is done, start bridge again
        await controller.send({
            type: 'bridge-start',
            // todo: this works, but when this version is not provided,
            // there is a super weird error "device disconnected during action"
            // version: '2.0.27',
        });
        // Wait to prevent Transport is missing error from TrezorConnect
        await wait(1000);
    } catch (err) {
        // this means that something in trezor-user-env got wrong.
        console.log(err);
        // process.exit(1)
    }
};

const initTrezorConnect = async (controller, options) => {
    const onUiRequestConfirmation = () => {
        TrezorConnect.uiResponse({
            type: UI.RECEIVE_CONFIRMATION,
            payload: true,
        });
    };

    const onUiRequestButton = () => {
        setTimeout(() => controller.send({ type: 'emulator-press-yes' }), 1);
    };

    TrezorConnect.removeAllListeners();

    await TrezorConnect.init({
        manifest: {
            appUrl: 'tests.connect.trezor.io',
            email: 'tests@connect.trezor.io',
        },
        webusb: false,
        debug: false,
        popup: false,
        connectSrc: process.env.TREZOR_CONNECT_SRC, // custom source for karma tests
        ...options,
    });

    TrezorConnect.on(UI.REQUEST_CONFIRMATION, onUiRequestConfirmation);

    TrezorConnect.on(UI.REQUEST_BUTTON, onUiRequestButton);
};

// skipping tests rules:
// "1" | "2" - global skip for model
// ">1.9.3" - skip for FW greater than 1.9.3
// "<1.9.3" - skip for FW lower than 1.9.3
// "1.9.3" - skip for FW exact with 1.9.3
const skipTest = rules => {
    if (!rules || !Array.isArray(rules)) return;
    const fwModel = firmware.substr(0, 1);
    const fwMaster = firmware.search('-') > 0;
    const rule = rules
        .filter(skip => skip.substr(0, 1) === fwModel || skip.substr(1, 1) === fwModel) // filter rules only for current model
        .find(skip => {
            if (!skip.search('.') && skip === fwModel) {
                // global model
                return true;
            }
            if (!fwMaster && skip.startsWith('<') && versionCompare(firmware, skip.substr(1)) < 0) {
                // lower
                return true;
            }
            if (!fwMaster && skip.startsWith('>') && versionCompare(firmware, skip.substr(1)) > 0) {
                // greater
                return true;
            }
            if (!fwMaster && versionCompare(firmware, skip) === 0) {
                // exact
                return true;
            }
            return false;
        });
    return rule;
};

global.Trezor = {
    setup,
    skipTest,
    initTrezorConnect,
    TrezorConnect,
    Controller,
};

// picked from utils/pathUtils
const HD_HARDENED = 0x80000000;
const toHardened = n => (n | HD_HARDENED) >>> 0;

const ADDRESS_N = path => {
    const parts = path.toLowerCase().split('/');
    if (parts[0] !== 'm') throw new Error(`PATH_NOT_VALID: ${path}`);
    return parts
        .filter(p => p !== 'm' && p !== '')
        .map(p => {
            let hardened = false;
            if (p.endsWith("'")) {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            let n = parseInt(p, 10);
            if (Number.isNaN(n)) {
                throw new Error(`PATH_NOT_VALID: ${path}`);
            } else if (n < 0) {
                throw new Error(`PATH_NEGATIVE_VALUES: ${path}`);
            }
            if (hardened) {
                // hardened index
                n = toHardened(n);
            }
            return n;
        });
};

global.TestUtils = {
    ...global.TestUtils,
    ADDRESS_N,
};
