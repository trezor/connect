import { Controller } from './websocket-client';
import TrezorConnect, { UI } from '../src/js/index';

const MNEMONICS = {
    'mnemonic_all': 'all all all all all all all all all all all all',
    'mnemonic_12': 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
    'mnemonic_abandon': 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
};

const setup = async (controller, options) => {
    try {
        await controller.connect();
        await controller.send({ type: 'bridge-start' });
        await controller.send({ type: 'emulator-start', version: '2.2.0' });

        if (options.wipe) {
            await controller.send({ type: 'emulator-wipe' });
        } else {
            const mnemonic = typeof options.mnemonic === 'string' && options.mnemonic.indexOf(' ') > 0 ? options.mnemonic : MNEMONICS[options.mnemonic];
            await controller.send({
                type: 'emulator-setup',
                mnemonic,
                pin: options.pin || '',
                passphrase_protection: false,
                label: options.label || 'TrezorT',
                backup: false,
                options,
            });
        }
    } catch (err) {
        // this means that something in trezor-user-env got wrong.
        console.log(err);
        process.exit(1)
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
