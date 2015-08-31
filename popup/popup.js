window.fetch = undefined;
require('whatwg-fetch');

var Promise = require('es6-promise').Promise;
var bowser = require('bowser');
var trezor = require('trezor.js');
var Session = trezor.Session;

global.alert = '#alert_loading';
global.device = null;

window.addEventListener('message', onMessage);
window.opener.postMessage('handshake', '*');

function onMessage(event) {
    var request = event.data;
    if (!request) {
        return;
    }

    if (bowser.msie) {
        showAlert('#alert_browser_unsupported');
        return;
    }

    request.identity = parseIdentity(event);
    document.querySelector('#origin').textContent = showIdentity(request.identity);

    switch (request.type) {

    case 'login':
        handleLogin(event);
        break;

    case 'xpubkey':
        handleXpubKey(event);
        break;

    case 'signtx':
        handleSignTx(event);
        break;

    default:
        console.warn('Unknown message', request);
    }
}

function respondToEvent(event, message) {
    var origin = event.origin !== 'null' ? event.origin : '*';
    event.source.postMessage(message, origin);
}

function parseIdentity(event) {
    var identity = {};
    var origin = event.origin.split(':');
    identity.proto = origin[0];
    identity.host = origin[1].substring(2);
    if (origin[2]) {
        identity.port = origin[2];
    }
    identity.index = 0;
    return identity;
}

function showIdentity(identity) {
    var host = identity.host;
    var proto = (identity.proto !== 'https') ? (identity.proto + '://') : '';
    var port = (identity.port) ? (':' + identity.port) : '';
    return proto + host + port;
}

/*
 * login
 */

function handleLogin(event) {
    var request = event.data;

    showSelector('#operation_login');
    if (request.icon) {
        document.querySelector('#header_icon').src = request.icon;
        showSelector('#header_icon');
    }

    initDevice({ emptyPassphrase: true })

        .then(function signIdentity(device) { // send SignIdentity
            return device.session.signIdentity(
                request.identity,
                request.challenge_hidden,
                request.challenge_visual
            ).catch(commonErrorsHandler(function () {
                return signIdentity(device);
            }));
        })

        .then(function (result) { // success
            respondToEvent(event, {
                success: true,
                challenge_hidden: request.challenge_hidden,
                challenge_visual: request.challenge_visual,
                address: result.message.address,
                public_key: result.message.public_key,
                signature: result.message.signature
            });
        })

        .catch(function (error) { // failure
            console.error(error);
            respondToEvent(event, {
                success: false,
                error: error.message
            });
        });
}

/*
 * xpubkey
 */

function handleXpubKey(event) {
    var path = fixAddressValues(event.data.path);

    showSelector('#operation_xpubkey');

    initDevice()

        .then(function (device) {
            var getPublicKey = function getPublicKey() {
                return device.session.getPublicKey(path).catch(
                    commonErrorsHandler(getPublicKey)
                );
            };
            return alertExportXpubKey(path).then(getPublicKey);
        })

        .then(function (result) { // success
            var message = result.message;
            var xpub = message.xpub;
            respondToEvent(event, {
                success: true,
                xpubkey: xpub
            });
        })

        .catch(function (error) { // failure
            console.error(error);
            respondToEvent(event, {
                success: false,
                error: error.message
            });
        });
}

function alertExportXpubKey(path) {
    return new Promise(function (resolve, reject) {
        var e = document.getElementById('xpubkey_id');
        e.textContent = xpubKeyLabel(path);
        e.callback = function (exportXpub) {
            if (exportXpub) {
                resolve(path);
            } else {
                reject(new Error('Cancelled'));
            }
        };
        showAlert('#alert_xpubkey');
    });
}

function exportXpubKey() {
    document.querySelector('#xpubkey_id').callback(true);
}

window.exportXpubKey = exportXpubKey;

function cancelXpubKey() {
    document.querySelector('#xpubkey_id').callback(false);
}

window.cancelXpubKey = cancelXpubKey;

var HD_HARDENED = 0x80000000;

function xpubKeyLabel(path) {
    var hardened = function (i) {
        return path[i] & ~HD_HARDENED;
    };
    switch (hardened(0)) {
    case 44: return 'Account #' + (hardened(2) + 1);
    case 45: return 'Multisig wallet';
    default: return serializePath(path);
    }
}

function serializePath(path) {
    return path.map(function (i) {
        var s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
}

/*
 * signtx
 */

function handleSignTx(event) {
    var fix = function (o) {
        if (o.address_n) {
            o.address_n = fixAddressValues(o.address_n);
        }
        return o;
    };
    var inputs = event.data.inputs.map(fix);
    var outputs = event.data.outputs.map(fix);
    var coinName = 'Bitcoin';

    showSelector('#operation_signtx');

    initDevice()

        .then(function (device) {
            var signTx = function signTx(refTxs) {
                return device.session.signTx(
                    inputs,
                    outputs,
                    refTxs,
                    device.getCoin(coinName)
                ).catch(commonErrorsHandler(function () {
                    return signTx(refTxs);
                }));
            };

            return lookupReferencedTxs(inputs).then(signTx);
        })

        .then(function (result) { // success
            var message = result.message;
            respondToEvent(event, {
                success: true,
                type: 'signtx',
                signatures: message.serialized.signatures,
                serialized_tx: message.serialized.serialized_tx
            });
        })

        .catch(function (error) { // failure
            console.error(error);
            respondToEvent(event, {
                success: false,
                error: error.message
            });
        });
}

function fixAddressValues(path) {
    // make sure bip32 indices are unsigned
    return path.map(function (i) { return i >>> 0; });
}

function lookupReferencedTxs(inputs) {
    return Promise.all(inputs.map(function (input) {
        return lookupTx(input.prev_hash);
    }));
}

var INSIGHT_URL = 'https://insight.bitpay.com';

function lookupTx(hash) {
    return fetch(INSIGHT_URL + '/api/tx/' + hash)
        .then(function (response) {
            if (response.status === 200) {
                return response;
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(function (response) { return response.json(); })
        .then(function (result) {
            return {
                hash: result.txid,
                version: result.version,
                lock_time: result.locktime,

                inputs_cnt: result.vin.length,
                inputs: result.vin.map(function (input) {
                    return {
                        prev_hash: input.txid,
                        prev_index: input.vin >>> 0,    // can be -1 in coinbase
                        sequence: input.sequence >>> 0, // usually -1, 0 in coinbase
                        script_sig: input.scriptSig.hex
                    };
                }),

                outputs_cnt: result.vout.length,
                bin_outputs: result.vout.map(function (output) {
                    var amount = (output.value * 1e8) | 0;
                    return {
                        amount: amount,
                        script_pubkey: output.scriptPubKey.hex
                    };
                })
            };
        });
}

/*
 * device
 */

var NO_TRANSPORT = new Error('No trezor.js transport is available');
var NO_CONNECTED_DEVICES = new Error('No connected devices');
var DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode');
var DEVICE_IS_EMPTY = new Error('Connected device is not initialized');
var FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old');

function commonErrorsHandler(retry) {
    return function (error) {

        // application errors

        switch (error) {

        case NO_TRANSPORT:
            showAlert('#alert_transport_missing');
            return neverResolve();

        case NO_CONNECTED_DEVICES:
            showAlert('#alert_connect');
            return retry();

        case DEVICE_IS_BOOTLOADER:
            showAlert('#alert_reconnect');
            return retry();

        case DEVICE_IS_EMPTY:
            showAlert('#alert_device_empty');
            return neverResolve();

        case FIRMWARE_IS_OLD:
            showAlert('#alert_firmware_old');
            return neverResolve();
        }

        // 'Failure' messages

        switch (error.code) {

        case 'Failure_PinInvalid':
            showAlert('#alert_pin_invalid');
            return resolveAfter(2500).then(retry);
        }

        throw error;
    };
}

function initDevice(options) {
    options = options || {};

    return initTransport().then(waitForFirstDevice).then(function (device) {
        var passphraseHandler = (options.emptyPassphrase)
            ? emptyPassphraseCallback
            : passphraseCallback;
        device.session.on('passphrase', passphraseHandler);
        device.session.on('button', buttonCallback);
        device.session.on('pin', pinCallback);

        global.device = device;

        return device;
    });
}

function initTransport() {
    var CONFIG_URL = './../config_signed.bin';

    return trezor.loadTransport().then(function (transport) {
        return trezor.http(CONFIG_URL)
            .then(function (config) { return transport.configure(config); })
            .then(function () { return transport; });
    }).catch(function () {
        throw NO_TRANSPORT;
    }).catch(commonErrorsHandler());
}

function waitForFirstDevice(transport) {
    var WAIT_BEFORE_RETRY = 500;

    var retryWait = function () {
        return resolveAfter(WAIT_BEFORE_RETRY).then(function () {
            return waitForFirstDevice(transport);
        });
    };

    return transport.enumerate().then(function (descriptors) {
        if (descriptors.length === 0) {
            throw NO_CONNECTED_DEVICES;
        }
        return Device.fromDescriptor(transport, descriptors[0]).then(function (device) {
            if (device.isBootloader()) {
                throw DEVICE_IS_BOOTLOADER;
            }
            if (!device.isInitialized()) {
                throw DEVICE_IS_EMPTY;
            }
            if (!device.atLeast('1.3.0')) {
                throw FIRMWARE_IS_OLD;
            }
            return device;
        });
    }).catch(commonErrorsHandler(retryWait));
}

function Device(session, features) {
    this.session = session;
    this.features = features;
}

Device.fromDescriptor = function (transport, descriptor) {
    return Device.acquire(transport, descriptor).then(Device.fromSession);
};

Device.fromSession = function (session) {
    return session.initialize().then(function (result) {
        return new Device(session, result.message);
    });
};

Device.acquire = function (transport, descriptor) {
    return transport.acquire(descriptor).then(function (result) {
        return new Session(transport, result.session);
    });
};

Device.prototype.isBootloader = function () { return this.features.bootloader_mode; };
Device.prototype.isInitialized = function () { return this.features.initialized; };

Device.prototype.getVersion = function () {
    return [
        this.features.major_version,
        this.features.minor_version,
        this.features.patch_version
    ].join('.');
};

Device.prototype.atLeast = function (version) {
    return semvercmp(this.getVersion(), version) >= 0;
};

Device.prototype.getCoin = function (name) {
    var coins = this.features.coins;

    for (var i = 0; i < coins.length; i++) {
        if (coins[i].coin_name === name) {
            return coins[i];
        }
    }
    throw new Error('Device does not support given coin type');
};

/*
 * buttons
 */

function buttonCallback(code) {
    var received = false;

    var receive = function () {
        if (!received) {        // we have two handlers
            received = true;
            showAlert(global.alert);
        }
    };

    showAlert('#alert_confirm');
    global.device.session.once('receive', receive);
    global.device.session.once('error', receive);
}

/*
 * pin
 */

function pinCallback(type, callback) {
    document.querySelector('#pin_dialog').callback = callback;
    window.addEventListener('keydown', pinKeydownHandler);
    showAlert('#pin_dialog');
}

function pinKeydownHandler(ev) {
    clickMatchingElement(ev, {
        8: '#pin_backspace',
        13: '#pin_enter button',
        // numeric
        49: '#pin_table button[key="1"]',
        50: '#pin_table button[key="2"]',
        51: '#pin_table button[key="3"]',
        52: '#pin_table button[key="4"]',
        53: '#pin_table button[key="5"]',
        54: '#pin_table button[key="6"]',
        55: '#pin_table button[key="7"]',
        56: '#pin_table button[key="8"]',
        57: '#pin_table button[key="9"]',
        // numpad
        97: '#pin_table button[key="1"]',
        98: '#pin_table button[key="2"]',
        99: '#pin_table button[key="3"]',
        100: '#pin_table button[key="4"]',
        101: '#pin_table button[key="5"]',
        102: '#pin_table button[key="6"]',
        103: '#pin_table button[key="7"]',
        104: '#pin_table button[key="8"]',
        105: '#pin_table button[key="9"]'
    });
}

function pinAdd(el) {
    var e = document.querySelector('#pin');
    e.value += el.getAttribute('key');
}

window.pinAdd = pinAdd;

function pinBackspace() {
    var e = document.querySelector('#pin');
    e.value = e.value.slice(0, -1);
}

window.pinBackspace = pinBackspace;

function pinEnter() {
    var pin = document.querySelector('#pin').value;
    document.querySelector('#pin').value = '';
    document.querySelector('#pin_dialog').callback(null, pin);
    showAlert(global.alert);

    window.removeEventListener('keydown', pinKeydownHandler);
}

window.pinEnter = pinEnter;

/*
 * passphrase
 */

function emptyPassphraseCallback(callback) {
    callback(null, '');
}

function passphraseCallback(callback) {
    document.querySelector('#passphrase_dialog').callback = callback;
    document.querySelector('#passphrase').focus();
    window.addEventListener('keydown', passphraseKeydownHandler);
    showAlert('#passphrase_dialog');
}

function passphraseKeydownHandler(ev) {
    clickMatchingElement(ev, {
        13: '#passphrase_enter button'
    });
}

function passphraseToggle() {
    var e = document.querySelector('#passphrase');
    e.type = (e.type === 'text') ? 'password' : 'text';
}

window.passphraseToggle = passphraseToggle;

function passphraseEnter() {
    var passphrase = document.querySelector('#passphrase').value;
    window.removeEventListener('keydown', passphraseKeydownHandler);
    document.querySelector('#passphrase_dialog').callback(null, passphrase);
    showAlert(global.alert);
}

window.passphraseEnter = passphraseEnter;

/*
 * utils
 */

// taken from https://github.com/substack/semver-compare/blob/master/index.js
function semvercmp(a, b) {
    var pa = a.split('.');
    var pb = b.split('.');
    for (var i = 0; i < 3; i++) {
        var na = Number(pa[i]);
        var nb = Number(pb[i]);
        if (na > nb) return 1;
        if (nb > na) return -1;
        if (!isNaN(na) && isNaN(nb)) return 1;
        if (isNaN(na) && !isNaN(nb)) return -1;
    }
    return 0;
}

function clickMatchingElement(ev, keys) {
    var s = keys[ev.keyCode.toString()];
    if (s) {
        var e = document.querySelector(s);
        if (e) {
            e.click();
            e.classList.add('active');
            setTimeout(function () {
                e.classList.remove('active');
            }, 25);
        }
    }
}

function showSelector(selector) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
        els[i].style.display = '';
    }
    return els;
}

function showAlert(element) {
    fadeOutSelector('.alert');
    fadeInSelector(element);
}

function fadeInSelector(selector) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
        els[i].classList.remove('fadeout');
    }
    return els;
}

function fadeOutSelector(selector) {
    var els = document.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) {
        els[i].classList.add('fadeout');
    }
    return els;
}

function resolveAfter(msec, value) {
    return new Promise(function (resolve) {
        setTimeout(function () { resolve(value); }, msec);
    });
}

function neverResolve() {
    return new Promise(function () { });
}

function closeWindow() {
    setTimeout(function () { window.close(); }, 50);
}

window.closeWindow = closeWindow;
