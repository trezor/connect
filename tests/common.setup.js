import { Controller } from './websocket-client';
import TrezorConnect, { UI } from '../src/js/index';
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
        await controller.send({ type: 'bridge-start' });
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

    const onUiRequestButton = _event => {
        controller.send({ type: 'emulator-press-yes' });
    };

    TrezorConnect.removeAllListeners();

    await TrezorConnect.init({
        manifest: {
            appUrl: 'a',
            email: 'b',
        },
        webusb: false,
        debug: true,
        popup: false,
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
