import Controller from './python/websocket-client';
import TrezorConnect, { UI } from '../src/js/index';

// TrezorConnect and Controller should be imported and initialized in one file
// otherwise karma will put "TrezorConnect" instance into every *.test file

const controller = new Controller({ url: 'ws://localhost:9001/' });
// TODO: handle controller error and stop tests

const MNEMONICS = {
    'mnemonic_all': 'all all all all all all all all all all all all',
    'mnemonic_12': 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
};

const initJest = () => {
    if (typeof jest === 'undefined') return;
    jest.setTimeout(20000);
};

const initJasmine = () => {
    if (typeof jasmine === 'undefined') return;

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    jasmine.addMatchers({
        toMatchObject: obj => {
            return {
                compare: (actual, expected) => {
                    const success = { pass: true, message: 'passed' };
                    if (actual === expected) return success;
                    if (expected === null || typeof expected !== 'object') {
                        return { pass: false, message: 'toMatchObject: "expected" is not a object' };
                    }
                    const nested = Object.keys(expected).reduce((match, key) => {
                        if (typeof expected[key] === 'object') {
                            match[key] = jasmine.objectContaining(expected[key]);
                        } else {
                            match[key] = expected[key];
                        }
                        return match;
                    }, {});
                    expect(actual).toEqual(jasmine.objectContaining(nested));
                    return success;
                },
            };
        },
    });
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

const setup = async (options) => {
    initJest();
    initJasmine();
    try {
        await controller.connect();
        await controller.send({ type: 'bridge-start', version: '2' }); // TODO: add optional path param
        // await controller.send({ type: 'emulator-stop' });
        await controller.send({ type: 'emulator-start', model: 'T' }); // TODO: add model T1/TT
        await controller.send({
            type: 'emulator-setup',
            firmware: '2.1.8',
            mnemonic: MNEMONICS[options.mnemonic] || 'mnemonic_all',
            pin: options.pin || '',
            passphrase_protection: false,
            label: options.label || 'TrezorT',
            backup: false,
        }); // TODO: add more options (backup, initialized etc.), add optional fw/model param
    } catch (error) {
        console.log("setup error - TODO KILL TESTS HERE", error);
    }
};

const initTrezorConnect = async (_TrezorConnect, options) => {
    await TrezorConnect.init({
        connectSrc: 'http://localhost:8099/_karma_webpack_/',
        manifest: {
            appUrl: 'a',
            email: 'b',
        },
        webusb: false,
        debug: false,
        lazyLoad: false,
        popup: false,
        pendingTransportEvent: false,
        ...options,
    });

    TrezorConnect.on(UI.REQUEST_CONFIRMATION, () => {
        TrezorConnect.uiResponse({
            type: UI.RECEIVE_CONFIRMATION,
            payload: true,
        });
    });

    TrezorConnect.on(UI.REQUEST_BUTTON, async () => {
        await controller.send({ type: 'emulator-decision' });
    });
};

global.Trezor = {
    controller,
    setup,
    initTrezorConnect,
    TrezorConnect,
    teardown: () => {
        controller.disconnect();
    },
};
