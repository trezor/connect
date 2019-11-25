import Controller from './python/websocket-client';
import TrezorConnect, { UI } from '../src/js/index';

// TrezorConnect and Controller should be imported and initialized in one file
// otherwise karma will put "TrezorConnect" instance into every *.test file

const MNEMONICS = {
    'mnemonic_all': 'all all all all all all all all all all all all',
    'mnemonic_12': 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
};

// let _popup;
// window.addEventListener("message", m => {
//     console.log("Catch message", m, POPUP)
// });
// window.open = function (open) {
//     return function (url, name, features) {
//         console.log("WINDOW OPEN", url, name, features)
//         // set name if missing here
//         name = name || "default_window_name";
//         _popup = open.call(window, url, name, features)
//         _popup.onload = () => {
//             console.log("POPUP ON LOAD!")
//         }
//         _popup.addEventListener("message", m => {
//             console.log("POPUP ON LOAD!")
//         });
//         console.log("CATCH HIS MESS", _popup.locati, _popup.document.body)
//         return _popup;
//     };
// }(window.open);

const setup = async (controller, options) => {
    const mnemonic = typeof options.mnemonic === 'string' && options.mnemonic.indexOf(' ') > 0 ? options.mnemonic : MNEMONICS[options.mnemonic];
    controller.on('connect', () => {

    });
    await controller.connect();
    await controller.send({ type: 'bridge-start', version: '2' }); // TODO: add optional path param
    // await controller.send({ type: 'emulator-stop' });
    await controller.send({ type: 'emulator-start', model: 'T' }); // TODO: add model T1/TT
    await controller.send({
        type: 'emulator-setup',
        firmware: '2.1.8',
        mnemonic,
        pin: options.pin || '',
        passphrase_protection: false,
        label: options.label || 'TrezorT',
        backup: false,
        options,
    }); // TODO: add more options (backup, initialized etc.), add optional fw/model param
};

const initTrezorConnect = async (controller, options) => {
    await TrezorConnect.init({
        connectSrc: 'http://localhost:8099/_karma_webpack_/',
        manifest: {
            appUrl: 'a',
            email: 'b',
        },
        webusb: false,
        debug: false,
        // lazyLoad: true,
        popup: false,
        // pendingTransportEvent: false,
        ...options,
    });

    TrezorConnect.on(UI.REQUEST_CONFIRMATION, () => {
        TrezorConnect.uiResponse({
            type: UI.RECEIVE_CONFIRMATION,
            payload: true,
        });
    });

    TrezorConnect.on(UI.REQUEST_BUTTON, async (event) => {
        await controller.send({ type: 'emulator-decision', method: controller.options.name });
    });
};

global.Trezor = {
    setup,
    initTrezorConnect,
    TrezorConnect,
    Controller,
};
