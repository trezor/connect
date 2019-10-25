/* eslint-disable no-console */
const TrezorConnect = require('trezor-connect').default;
const { TRANSPORT_EVENT, UI, UI_EVENT, DEVICE_EVENT } = require('trezor-connect');

// SETUP trezor-connect

// Listen to TRANSPORT_EVENT
// This event will be emitted only in "popup: false" mode
TrezorConnect.on(TRANSPORT_EVENT, event => {
    // console.log("TRANSPORT_EVENT", event)
    // printLog(event);
});

// Listen to DEVICE_EVENT
// When "popup: true" is set this event will be emitted only after user grants permission to communicate wit this app
// When "popup: false" it will be emitted without user permissions (user will never be be asked for them)
TrezorConnect.on(DEVICE_EVENT, event => {
    // console.log("DEVICE_EVENT", event)
    // printLog(event);
});

// When "popup: true" this event will be emitted occasionally
// When "popup: false" this event will be emitted for every interaction
TrezorConnect.on(UI_EVENT, event => {
    printLog(event);

    if (event.type === UI.REQUEST_PIN) {
        // this is an example how to respond to pin request
        showUiResponse({ type: UI.RECEIVE_PIN, payload: '1234' });
    }

    if (event.type === UI.REQUEST_PASSPHRASE) {
        // this is an example how to respond to passphrase request
        showUiResponse({ type: UI.RECEIVE_PASSPHRASE, payload: { value: 'type your passphrase here' } });
    }
});

// Initialize TrezorConnect
TrezorConnect.init({
    // connectSrc: 'file://' + __dirname + '/trezor-connect/', // for trezor-connect hosted locally set endpoint to application files (ignore this field for connect hosted online, connect.trezor.io will be used by default)
    // connectSrc: 'https://sisyfos.trezor.io/connect-electron/',
    popup: true, // use trezor-connect UI, set it to "false" to get "trusted" mode and get more UI_EVENTs to render your own UI
    webusb: false, // webusb is not supported in electron
    debug: false, // see whats going on inside iframe
    lazyLoad: true, // set to "false" if you want to start communication with bridge on application start (and detect connected device right away)
    // or set it to true, then trezor-connect not will be initialized unless you call some TrezorConnect.method() (this is useful when you dont know if you are dealing with Trezor user)
    manifest: {
        email: 'email@developer.com',
        appUrl: 'electron-app-boilerplate',
    },
}).then(() => {
    console.log('TrezorConnect is ready!');
}).catch(error => {
    console.error('TrezorConnect init error', error);
});

// click to get public key
const btn = document.getElementById('get-xpub');
btn.onclick = () => {
    TrezorConnect.getPublicKey({
        path: "m/49'/0'/0'",
        coin: 'btc',
    }).then(response => {
        printLog(response);
    });
};

// print log helper
function printLog(data) {
    const log = document.getElementById('log');
    const current = log.value;
    if (current.length > 0) {
        log.value = JSON.stringify(data) + '\n\n' + current;
    } else {
        log.value = JSON.stringify(data);
    }
}

// UI.RESPONSE helper (used with "popup: false")
function showUiResponse(data) {
    const response = document.getElementById('response');
    response.style.display = 'block';
    const respInput = document.getElementById('ui-response');
    const respButton = document.getElementById('ui-response-button');
    respInput.value = JSON.stringify(data, null, 2);
    respButton.onclick = () => {
        TrezorConnect.uiResponse(JSON.parse(respInput.value));
        response.style.display = 'none';
    };
}
