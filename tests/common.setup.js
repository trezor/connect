import { Controller } from './websocket-client';
import TrezorConnect, { UI } from '../src/js/index';

// todo: maybe we should test build..
// import TrezorConnect, { UI } from '../npm-extended';

const MNEMONICS = {
    'mnemonic_all': 'all all all all all all all all all all all all',
    'mnemonic_12': 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
    'mnemonic_abandon': 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
};

const firmware = process.env.TESTS_FIRMWARE;

const wait = (ms) => {
    return new Promise((res) => {
        setTimeout(() => {res(), ms});
    })
}

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
        await controller.send(emulatorStartOpts);

        const mnemonic = typeof options.mnemonic === 'string' && options.mnemonic.indexOf(' ') > 0 ? options.mnemonic : MNEMONICS[options.mnemonic];
        await controller.send({
            type: 'emulator-setup',
            mnemonic,
            pin: options.pin || '',
            passphrase_protection: false,
            label: options.label || 'TrezorT',
            needs_backup: false,
            options,
        });
        // after all is done, start bridge again (connect can't use udp transport)
        await controller.send({ type: 'bridge-start' });
        await wait(500);
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
    }

    const onUiRequestButton = async (event) => {
        controller.send({ type: 'emulator-decision' });
    }

    TrezorConnect.removeAllListeners();

    await TrezorConnect.init({
        manifest: {
            appUrl: 'a',
            email: 'b',
        },
        webusb: false,
        debug: false,
        popup: false,
        ...options,
    });

    TrezorConnect.on(UI.REQUEST_CONFIRMATION, onUiRequestConfirmation);

    TrezorConnect.on(UI.REQUEST_BUTTON, onUiRequestButton);
};

global.Trezor = {
    setup,
    initTrezorConnect,
    TrezorConnect,
    Controller,
};
