// TODO: tests (especially coin selection)
// TODO: migrate to bitcoin.* structures throughout the app
// TODO: compose tx as a full bitcoin.Transaction, then convert to device type,
//       after signing remove sigs and verify
// TODO: split to modules (blockchain, device, accounts, ui)

import 'whatwg-fetch';
import 'babel-polyfill';
import {Promise} from 'es6-promise';

import bowser from 'bowser';
import * as bitcoin from 'bitcoinjs-lib-zcash';
import * as trezor from 'trezor.js';
import * as hd from 'hd-wallet';

var bip44 = require('bip44-constants')
var semvercmp = require('semver-compare');

const NETWORK = bitcoin.networks.bitcoin;
const COIN_NAME = 'Bitcoin';
const SCRIPT_TYPES = {
    [NETWORK.pubKeyHash]: 'PAYTOADDRESS',
    [NETWORK.scriptHash]: 'PAYTOSCRIPTHASH'
};
const CONFIG_URL = './config_signed.bin';
const HD_HARDENED = 0x80000000;

const CHUNK_SIZE = 20;
const GAP_LENGTH = 20;
const ADDRESS_VERSION = 0x0;
const BITCORE_URLS = ['https://btc1.trezor.io', 'https://btc2.trezor.io', 'https://btc3.trezor.io', 'https://btc4.trezor.io', 'https://btc5.trezor.io'];

const SOCKET_WORKER_PATH = './socket-worker-dist.js';
const CRYPTO_WORKER_PATH = './trezor-crypto-dist.js';

global.alert = '#alert_loading';
global.device = null;

if (window.opener) {
    // try to initiate the handshake, but only if we can reach the opener
    window.opener.postMessage('handshake', '*');
}
window.addEventListener('message', onMessage);

function httpRequest(url, json) {
    return fetch(url).then((response) => {
        if (response.status === 200) {
            return response.text().then(result => (json ? JSON.parse(result) : result));
        } else {
            throw new Error(response.statusText);
        }
    })
}

function onMessage(event) {
    let request = event.data;
    if (!request) {
        return;
    }

    if (request === 'handshake') {
        respondToEvent(event, 'handshake');
        return;
    }

    if (bowser.msie) {
        showAlert('#alert_browser_old');
        return;
    }

    if (bowser.mobile || bowser.tablet) {
        showAlert('#alert_browser_mobile');
        return;
    }

    request.identity = parseIdentity(event);
    document.querySelector('#origin').textContent = showIdentity(request.identity);

    parseRequiredFirmware(request.requiredFirmware);

    switch (request.type) {

    case 'login':
        handleLogin(event);
        break;

    case 'xpubkey':
        handleXpubKey(event);
        break;

    case 'accountinfo':
        handleAccountInfo(event);
        break;

    case 'signtx':
        handleSignTx(event);
        break;

    case 'signethtx':
        handleSignEthTx(event);
        break;

    case 'composetx':
        handleComposeTx(event);
        break;

    case 'signmsg':
        handleSignMsg(event);
        break;

    case 'verifymsg':
        handleVerifyMsg(event);
        break;

    case 'cipherkeyvalue':
        handleCipherKeyValue(event);
        break;

    case 'getaddress':
        handleGetAddress(event);
        break;

    case 'ethgetaddress':
        handleEthereumGetAddress(event);
        break;

    default:
        console.warn('Unknown message', request);
    }
}

function respondToEvent(event, message) {
    let origin = (event.origin !== 'null') ? event.origin : '*';
    event.source.postMessage(message, origin);
}

const CHROME_EXTENSION_NAMES = {
    'cnidaodnidkbaplmghlelgikaiejfhja': 'Copay Bitcoin Wallet'
};

function parseIdentity(event) {
    let identity = {};
    let origin = event.origin.split(':');

    identity.proto = origin[0];
    identity.host = origin[1].substring(2);
    if (origin[2]) {
        identity.port = origin[2];
    }
    identity.index = 0;

    return identity;
}

function showIdentity(identity) {
    if (identity.proto === 'chrome-extension') {
        let name = CHROME_EXTENSION_NAMES[identity.host];
        return (name) ? name : 'Unknown Chrome Extension';
    } else {
        let host = identity.host;
        let proto = (identity.proto !== 'https') ? (identity.proto + '://') : '';
        let port = (identity.port) ? (':' + identity.port) : '';
        return proto + host + port;
    }
}

/*
 * login
 */

function handleLogin(event) {
    let request = event.data;

    if (request.icon) {
        document.querySelector('#header_icon').src = request.icon;
        show('#header_icon');
    }
    show('#operation_login');

    initDevice({ emptyPassphrase: true })

        .then(function signIdentity(device) { // send SignIdentity
            let handler = errorHandler(() => signIdentity(device));
            return device.session.signIdentity(
                request.identity,
                request.challenge_hidden,
                request.challenge_visual
            ).catch(handler);
        })

        .then((result) => { // success
            let {message} = result;
            let {public_key, signature} = message;

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    public_key: public_key.toLowerCase(),
                    signature: signature.toLowerCase(),
                    version: 2      // since firmware 1.3.4
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

/*
 * sign message
 */

function handleSignMsg(event) {
    let txtmessage = event.data.message;
    let msgBuff = new Buffer(txtmessage, 'utf8');
    let message = msgBuff.toString('hex');
    let requestedPath = event.data.path;
    let coin = event.data.coin;

    // make sure bip32 indices are unsigned
    requestedPath = requestedPath.map((i) => i >>> 0);

    show('#operation_signmsg');

    initDevice()

        .then(function signMessage(device) { // send SignMessage
            let handler = errorHandler(() => signMessage(device));
            device.session.on('button', (code) => {
                buttonCallback(code);
            });

            return device.session.signMessage(
                requestedPath,
                message,
                coin
            ).catch(handler);
        })

        .then((result) => { // success
            let {message} = result;
            let {address, signature} = message;

            let signBuff = new Buffer(signature, 'hex');
            let baseSign = signBuff.toString('base64');

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    address: address,
                    signature: baseSign
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

function handleVerifyMsg(event) {
    let txtmessage = event.data.message;
    let msgBuff = new Buffer(txtmessage, 'utf8');
    let message = msgBuff.toString('hex');

    let signBase = event.data.signature;
    let signature = new Buffer(signBase, 'base64').toString('hex');

    let address = event.data.address;
    let coin = event.data.coin;

    show('#operation_verifymsg');

    initDevice()

        .then(function verifyMessage(device) { // send VerifyMessage
            let handler = errorHandler(() => verifyMessage(device));
            device.session.on('button', (code) => {
                buttonCallback(code);
            });

            return device.session.verifyMessage(
                address,
                signature,
                message,
                coin
            ).catch(handler);
        })

        .then((result) => { // success
            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

function handleCipherKeyValue(event) {
    let path = event.data.path;
    let key = event.data.key;
    let value = event.data.value;
    let encrypt = event.data.encrypt;
    let ask_on_encrypt = event.data.ask_on_encrypt;
    let ask_on_decrypt = event.data.ask_on_decrypt;

    if (encrypt) {
        show('#operation_cipherkeyvalue_encrypt');
    } else {
        show('#operation_cipherkeyvalue_decrypt');
    }

    initDevice()

        .then(function cipherKeyValue(device) { // send CipherKeyValue
            let handler = errorHandler(() => cipherKeyValue(device));
            device.session.on('button', (code) => {
                buttonCallback(code);
            });

            return device.session.cipherKeyValue(
                path,
                key,
                value,
                encrypt,
                ask_on_encrypt,
                ask_on_decrypt
            ).catch(handler);
        })

        .then((result) => { // success
            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    value: result.message.value // in hexadecimal
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

/*
 * xpubkey
 */

function getPublicKey(path) {
    let handler = errorHandler(() => getPublicKey(path));
    return global.device.session.getPublicKey(path)
        .then((result) => ({result, path}))
        .catch(handler);
}

function handleXpubKey(event) {
    let requestedPath = event.data.path;
    if (requestedPath) {
        // make sure bip32 indices are unsigned
        requestedPath = requestedPath.map((i) => i >>> 0);
    }

    show('#operation_xpubkey');

    initDevice()

        .then((device) => {
            let getPermission = (path) => {
                let handler = errorHandler(() => getPermission(path));
                return promptXpubKeyPermission(path).catch(handler);
            };

            if (requestedPath) {
                return getPermission(requestedPath)
                    .then(getPublicKey);
            } else {
                return waitForAccount()
                    .then((account) => account.getPath())
                    .then(getPublicKey);
            }
        })

        .then(({result, path}) => { // success
            let {message} = result;
            let {xpub, node} = message;
            let serializedPath = serializePath(path);

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    xpubkey: xpub,
                    chainCode: node.chain_code,
                    publicKey: node.public_key,
                    path,
                    serializedPath
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

function promptXpubKeyPermission(path) {
    return new Promise((resolve, reject) => {
        let e = document.getElementById('xpubkey_id');
        e.textContent = xpubKeyLabel(path);
        e.callback = (exportXpub) => {
            showAlert(global.alert);
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

function getCoinName(n) {
    for (let name of Object.keys(bip44)) {
        let number = parseInt(bip44[name]);
        if (number === n) {
            return name;
        }
    };
    return 'Unknown coin';
}

function xpubKeyLabel(path) {
    let hardened = (i) => path[i] & ~HD_HARDENED;
    if (hardened(0) === 44) {
        let coinName = getCoinName(path[1]);
        return `${coinName} account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 48) {
        return `multisig account #${hardened(2) + 1}`;
    }
    if (path[0] === 45342) {
        if (hardened(1) === 44) {
            return `Copay ID of account #${hardened(2) + 1}`;
        }
        if (hardened(1) === 48) {
            return `Copay ID of multisig account #${hardened(2) + 1}`;
        }
    }
    return 'm/' + serializePath(path);
}

function serializePath(path) {
    return path.map((i) => {
        let s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
}

/*
 * Fresh address 
 */

function getAccountByDescription(description) {
    if (description == null) {
        return waitForAccount();
    }
    if (typeof description === 'string' && description.substring(0,4) === 'xpub') {
        return getAccountByXpub(description);
    }
    if (!isNaN(description)) {
        return getAccountById(parseInt(description));
    }
    throw new Error('Wrongly formatted description.');
}


function getAccountByXpub(xpub) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((prev, current) => {
        return prev.then(account => {
            if (account != null) {
                return account;
            }
            const accountP = Account.fromDevice(global.device, current, createCryptoChannel(), getBlockchain());
            return accountP.then(account => {
                if (account.node.toBase58() === xpub) {
                    return account;
                } else {
                    return null;
                }
            });
        });
    }, Promise.resolve(null)).then(account => {
        if (account == null) {
            return Promise.reject(new Error('No account with the given xpub'));
        } else {
            let onEnd = function() {};
            return promptInfoPermission(account.id)
                .then(() => account.discover(onEnd))
                .then(() => account);
        }
    });
}

function getAccountById(id) {
    let onEnd = function() {};

    const accountP = Account.fromDevice(global.device, id, createCryptoChannel(), createBlockchain());
    return accountP.then(account => {
        return promptInfoPermission(id).then(() => {
            return account.discover(onEnd).then(() => account);
        });
    });
}

function promptInfoPermission(id) {
    return new Promise((resolve, reject) => {
        let e = document.getElementById('accountinfo_id');
        e.textContent = id + 1;
        e.callback = (exportInfo) => {
            showAlert(global.alert);
            if (exportInfo) {
                resolve();
            } else {
                reject(new Error('Cancelled'));
            }
        };
        showAlert('#alert_accountinfo');
    });
}

function exportInfo() {
    document.querySelector('#accountinfo_id').callback(true);
}

window.exportInfo = exportInfo;

function cancelInfo() {
    document.querySelector('#accountinfo_id').callback(false);
}

window.cancelInfo = cancelInfo;

function handleAccountInfo(event) {
    show('#operation_accountinfo');

    let description = event.data.description;
    initDevice()
        .then((device) => {
            return getAccountByDescription(description)
                .then((account) => {
                    return {
                        path: account.getPath(),
                        address: account.nextAddress,
                        addressPath: account.getAddressPath(account.nextAddress),
                        addressId: account.nextAddressId,
                        xpub: account.node.toBase58(),
                        balance: account.getBalance(),
                        confirmed: account.getConfirmedBalance(),
                        id: account.id
                    }
                })
        })

        .then(({id, address, path, addressPath, addressId, xpub, balance, confirmed}) => { // success
            let serializedPath = serializePath(path);

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    freshAddress: address,
                    serializedPath,
                    path,
                    freshAddressPath: addressPath,
                    freshAddressId: addressId,
                    serializedFreshAddressPath: serializePath(addressPath),
                    balance,
                    confirmed,
                    xpub,
                    id
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

function handleSignEthTx(event) {
    let fixPath = (address_n) => {
            // make sure bip32 indices are unsigned
        return address_n.map((i) => i >>> 0);
    };

    let address_n = fixPath(event.data.address_n);
    let nonce = event.data.nonce;
    let gas_price = event.data.gas_price;
    let gas_limit = event.data.gas_limit;
    let to = event.data.to;
    let value = event.data.value;
    let data = event.data.data;
    let chain_id = event.data.chain_id;

    show('#operation_signtx');

    initDevice()

        .then(function signEthTx(device) {
            let handler = errorHandler(() => signEthTx(device));
            device.session.on('button', (code) => {
                buttonCallback(code);
            });

            let chain_id_sent;
            if (device.atLeast('1.4.2')) {
                chain_id_sent = chain_id;
            }

            return device.session.signEthTx(
                address_n,
                nonce,
                gas_price,
                gas_limit,
                to,
                value,
                data,
                chain_id_sent
            ).catch(handler);
        })

        .then((result) => { // success
            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    r: result.r,
                    v: result.v,
                    s: result.s
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}


/*
 * signtx
 */

function handleSignTx(event) {
    let fixPath = (o) => {
        if (o.address_n) {
            // make sure bip32 indices are unsigned
            o.address_n = o.address_n.map((i) => i >>> 0);
        }
        return o;
    };
    let convertXpub = (o) => {
        if (o.multisig && o.multisig.pubkeys) {
            // convert xpubs to HDNodeTypes
            o.multisig.pubkeys.forEach((pk) => {
                if (typeof pk.node === 'string') {
                    pk.node = xpubToHDNodeType(pk.node);
                }
            });
        }
        return o;
    };
    let inputs = event.data.inputs.map(fixPath).map(convertXpub);
    let outputs = event.data.outputs.map(fixPath).map(convertXpub);

    show('#operation_signtx');

    initDevice()

        .then((device) => {
            let signTx = (refTxs) => {
                let handler = errorHandler(() => signTx(refTxs));
                return device.session.signTx(
                    inputs,
                    outputs,
                    refTxs,
                    device.getCoin(COIN_NAME)
                ).catch(handler);
            };
            return lookupReferencedTxs(inputs, createBlockchain()).then(signTx);
        })

        .then((result) => { // success
            let {message} = result;
            let {serialized} = message;

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    type: 'signtx',
                    signatures: serialized.signatures,
                    serialized_tx: serialized.serialized_tx
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

function xpubToHDNodeType(xpub) {
    let hd = bitcoin.HDNode.fromBase58(xpub);
    return {
        depth: hd.depth,
        child_num: hd.index,
        fingerprint: hd.parentFingerprint,
        public_key: hd.keyPair.getPublicKeyBuffer().toString('hex'),
        chain_code: hd.chainCode.toString('hex')
    };
}

function lookupReferencedTxs(inputs, blockchain) {
    return Promise.all(inputs.map((input) => lookupTx(input.prev_hash, blockchain)));
}

/*
 * getaddress
 */

function handleGetAddress(event) {
    let address = event.data.address_n;
    let coin = event.data.coin;
    let segwit = event.data.segwit;

    initDevice()
        .then((device) => {
            device.session.getAddress(address, coin, true, segwit)
            .then(response => {
                respondToEvent(event, {
                    success: true,
                    type: 'getaddress',
                    address: response.message.address,
                    path: response.message.path
                });
            });
        });
}

/*
 * getethaddress
 */

function handleEthereumGetAddress(event) {
    let address = event.data.address_n;

    initDevice()
        .then((device) => {
            device.session.ethereumGetAddress(address, true)
            .then(response => {
                respondToEvent(event, {
                    success: true,
                    type: 'ethgetaddress',
                    address: response.message.address,
                    path: response.message.path
                });
            });
        });
}

/*
 * composetx
 */

const FEE_LEVELS = [
    {
        name: 'High',
        noDelay: true,
        minutes: 35,
    }, {
        name: 'Normal',
        noDelay: false,
        minutes: 60,
    }, {
        name: 'Economy',
        noDelay: false,
        minutes: 6 * 60,
    }, {
        name: 'Low',
        noDelay: false,
        minutes: 24 * 60,
    },
];

function recommendFee(level, feeList, previous) {
    const minutes = level.minutes;
    let noDelay = level.noDelay;
    if (noDelay) {
        if (feeList.fees.filter(interval => interval.maxDelay === 0).length === 0) {
            noDelay = false;
        }
    }

    if (minutes < 35) {
        return recommendFee({...level, minutes: 35}, feeList, previous);
    }
    const correct = feeList.fees.filter(interval => {
        const correctMinutes = interval.maxMinutes <= minutes;
        if (noDelay) {
            return correctMinutes && interval.maxDelay === 0;
        }
        return correctMinutes;
    }).filter(interval => {
        return previous.filter(p => p.maxFee <= interval.maxFee).length === 0;
    });

    correct.sort((a, b) => a.maxFee - b.maxFee);
    if (correct.length === 0) {
        return recommendFee({...level, minutes: minutes + 5}, feeList, previous);
    }

    return {
        ...correct[0],
        name: level.name
    };
}

function download21coFees() {
    return httpRequest('https://bitcoinfees.21.co/api/v1/fees/list', true)
        .catch((err) => {
            console.error(err);
            return null;
        });
}

function findAllRecommendedFeeLevels() {
    return download21coFees().then(downloaded => {
        if (downloaded == null) {
            return null;
        } else {
            const res = [];
            FEE_LEVELS.forEach(level => {
                const fee = recommendFee(level, downloaded, res);
                res.push(fee);
            });
            return res;
        }
    });
}

const HARDCODED_FEE_PER_BYTE = 60;

function handleComposeTx(event) {
    let recipients = event.data.recipients;

    show('#operation_composetx');

    let total = recipients.reduce((t, r) => t + r.amount, 0);
    document.querySelector('#composetx_amount').textContent = formatAmount(total);

    initDevice()

        .then((device) => {
            const feesP = findAllRecommendedFeeLevels();

            let composeTx = () => {
                let handler = errorHandler(composeTx);
                return waitForAccount()
                    .then((account) => {
                        return feesP.then(fees => {
                            if (fees == null) {
                                // special case - if fees not loaded, just one tx
                                return account.composeTx(recipients, HARDCODED_FEE_PER_BYTE);
                            } else {
                                // make one transaction for every fee level
                                // so we can later show user all
                                // and he picks one
                                return Promise.all(fees.map(fee => {
                                    const tx = account.composeTx(recipients, fee.maxFee)
                                    return {
                                        ...fee,
                                        tx
                                    };
                                }));
                            }
                        })
                    }).catch(handler);
            };

            let signTx = (inputs, outputs, refTxs) => {
                let handler = errorHandler(() => signTx(inputs, outputs, refTxs));
                return device.session.signTx(
                    inputs,
                    outputs,
                    refTxs,
                    device.getCoin(COIN_NAME)
                ).catch(handler);
            };

            let chooseTxFee = (transactions) => {
                return feesP.then(fees => {
                    if (fees == null) {
                        // special case - if fees not loaded, just one tx
                        return transactions.converted;
                    } else {
                        return waitForFee(transactions);
                    }
                });
            }

            return composeTx()
                .then(chooseTxFee)
                .then(({inputs, outputs}) => {
                    return lookupReferencedTxs(inputs, getBlockchain())
                        .then((refTxs) => signTx(inputs, outputs, refTxs));
                });
        })

        .then((result) => { // success
            let {message} = result;
            let {serialized} = message;

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    type: 'signtx',
                    signatures: serialized.signatures,
                    serialized_tx: serialized.serialized_tx
                });
            });
        })

        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

/*
 * device
 */

class Device {

    constructor(session, device) {
        this.session = session;
        this.features = device.features;
    }

    isBootloader() {
        return this.features.bootloader_mode;
    }

    isInitialized() {
        return this.features.initialized;
    }

    getVersion() {
        return [
            this.features.major_version,
            this.features.minor_version,
            this.features.patch_version
        ].join('.');
    }

    atLeast(version) {
        return semvercmp(this.getVersion(), version) >= 0;
    }

    getCoin(name) {
        let coins = this.features.coins;
        for (let i = 0; i < coins.length; i++) {
            if (coins[i].coin_name === name) {
                return coins[i];
            }
        }
        throw new Error('Device does not support given coin type');
    }

    getNode(path) {
        return this.session.getPublicKey(path)
            .then(({message}) => bitcoin.HDNode.fromBase58(message.xpub));
    }
}

const NO_TRANSPORT = new Error('No trezor.js transport is available');
const NO_CONNECTED_DEVICES = new Error('No connected devices');
const DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode');
const DEVICE_IS_EMPTY = new Error('Connected device is not initialized');
const FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old');

const INSUFFICIENT_FUNDS = new Error('Insufficient funds');

function errorHandler(retry) {
    return (error) => {
        let never = new Promise(() => {});

        switch (error) { // application errors

        case NO_TRANSPORT:
            showAlert('#alert_transport_missing');
            return never;

        case DEVICE_IS_EMPTY:
            showAlert('#alert_device_empty');
            return never;

        case FIRMWARE_IS_OLD:
            showAlert('#alert_firmware_old');
            return never;

        case NO_CONNECTED_DEVICES:
            showAlert('#alert_connect');
            return resolveAfter(500).then(retry);

        case DEVICE_IS_BOOTLOADER:
            showAlert('#alert_reconnect');
            return resolveAfter(500).then(retry);

        case INSUFFICIENT_FUNDS:
            showAlert('#alert_insufficient_funds');
            return resolveAfter(2500).then(retry);
        }

        switch (error.code) { // 'Failure' messages

        case 'Failure_PinInvalid':
            document.querySelector('#pin').value = '';
            showAlert('#alert_pin_invalid');
            return resolveAfter(2500).then(retry);
        }

        throw error;
    };
}

function initDevice({emptyPassphrase} = {}) {
    return initTransport()
        .then((t) => resolveAfter(500, t))
        .then((t) => waitForFirstDevice(t))
        .then((device) => {
            let passphraseHandler = (emptyPassphrase)
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


    let timestamp = new Date().getTime();
    let configUrl = CONFIG_URL + '?' + timestamp;

    let result = new Promise((resolve, reject) => {
        let list = new trezor.DeviceList({configUrl});
        let onError;
        let onTransport = () => {
            list.removeListener('error', onError);
            resolve(list);
        };
        onError = () => {
            list.removeListener('transport', onTransport);
            reject(NO_TRANSPORT);
        };
        list.on('error', onError);
        list.on('transport', onTransport);
    });

    return result.catch(errorHandler());
}

// note - this can be changed in onMessage
// caller can specify his own version
// but only bigger than 1.3.4
let requiredFirmware = '1.3.4';

function parseRequiredFirmware(firmware) {
  if (firmware == null) {
    return;
  }
  try {
    let firmwareString = '';
    if (typeof firmware === 'string') {
      firmwareString = firmware;
    } else {
      // this can cause an exception, but we run this in try anyway
      firmwareString = firmware.map((n) => n.toString()).join('.');
    }

    const split = firmwareString.split('.');
    if (split.length !== 3) {
      throw new Error('Too long version');
    }
    if (!(split[0].match(/^\d+$/)) || !(split[1].match(/^\d+$/)) || !(split[2].match(/^\d+$/))) {
      throw new Error('Version not valid');
    }

    if (semvercmp(firmwareString, requiredFirmware) >= 0) {
      requiredFirmware = firmwareString;
    }
  } catch (e) {
    // print error, but otherwise ignore
    console.error(e);
  }
}

function waitForFirstDevice(list) {
    let res;
    if (!(list.hasDeviceOrUnacquiredDevice())) {
        res = Promise.reject(NO_CONNECTED_DEVICES);
    } else {
        res = list.acquireFirstDevice(true)
            .then(({device, session}) => new Device(session, device))
            .then((device) => {
                if (device.isBootloader()) {
                    throw DEVICE_IS_BOOTLOADER;
                }
                if (!device.isInitialized()) {
                    throw DEVICE_IS_EMPTY;
                }
                if (!device.atLeast(requiredFirmware)) {
                    // 1.3.0 introduced HDNodeType.xpub field
                    // 1.3.4 has version2 of SignIdentity algorithm
                    throw FIRMWARE_IS_OLD;
                }
                return device;
            })
    }

    return res.catch(errorHandler(() => waitForFirstDevice(list)));
}

/*
 * accounts, discovery
 */

function createBlockchain() {
    return new hd.BitcoreBlockchain(BITCORE_URLS, () => createSocketWorker());
}

let blockchain = null;
function getBlockchain() {
    if (blockchain == null) {
        blockchain = createBlockchain();
    }
    return blockchain;
}

function createSocketWorker() {
    let socketWorker = new Worker(SOCKET_WORKER_PATH);
    return socketWorker;
}

function createCryptoChannel() {
    let worker = new Worker(CRYPTO_WORKER_PATH);
    let channel = new hd.WorkerChannel(worker);
    return channel;
}

class Account {

    static fromDevice(device, i, cryptoChannel, blockchain) {
        return Account.fromPath(device, Account.getPathForIndex(i), cryptoChannel, blockchain);
    }

    static fromPath(device, path, cryptoChannel, blockchain) {
        const i = (path[path.length - 1] & ~HD_HARDENED) >>> 0;
        return device.getNode(path)
            .then((node) => new Account(node, i, cryptoChannel, blockchain));
    }

    static getPathForIndex(i) {
        return [
            (44 | HD_HARDENED) >>> 0,
            (0 | HD_HARDENED) >>> 0,
            (i | HD_HARDENED) >>> 0
        ];
    }

    constructor(node, id, cryptoChannel, blockchain) {
        this.id = id;
        this.node = node;
        this.unspents = [];
        this.channel = cryptoChannel;
        this.addressSources = this._getSources();
        this.used = false;
        this.nextChange = '';
        this.nextAddress = '';
        this.nextAddressId = null;
        this.addressPaths = {};
        this.blockchain = blockchain;
    }

    _createAddressSource(node) {
        let source;
        source = new hd.WorkerAddressSource(this.channel, node, ADDRESS_VERSION);
        source = new hd.PrefatchingSource(source);
        source = new hd.CachingSource(source);
        return source;
    }

    _getSources() {
        let external = this.node.derive(0);
        let internal = this.node.derive(1);
        let sources = [
            this._createAddressSource(external),
            this._createAddressSource(internal)
        ];
        return sources;
    }

    discover(onUsed) {
        return this._initAccountDiscovery().then(initialState => {
            let process = this._createAccountsDiscoveryProcess(initialState);
            return this._finishAccountDiscovery(process, onUsed);
        }).then(state => {
            this.nextChange = this._nextChangeAddress(state);
            this.nextAddress = this._nextAddress(state);
            this.nextAddressId = this._nextAddressId(state);
            this.used = this._isUsed(state);
            this.addressPaths = this._getAddressPaths(state);
            return this._loadBlockheight().then(blockheight => {
                this.unspents = this._deriveUnspents(state, blockheight);
            });
        });
    }

    _initAccountDiscovery() {
        return this._loadBlocks().then((blocks) => hd.newAccountDiscovery(blocks));
    }

    _createAccountsDiscoveryProcess(initialState) {
        let sources = this.addressSources;
        return hd.discoverAccount(
            initialState,
            sources,
            CHUNK_SIZE,
            this.blockchain,
            GAP_LENGTH
        );
    }

    _getAddressPaths(state) {
        let base = this.getPath();
        let res = {};
        for (let i = 0; i < 2; i++) {
            state[i].chain.indexes.forEach((index, address) => {
                let path = base.concat([i, index]);
                res[address] = path;
            });
        }
        return res;
    }

    _getTransactionCount(state) {
        let size = 0;
        state.forEach(({transactions}) => {
            size = size + transactions.size;
        });
        return size;
    }

    _isUsed(state) {
        let u0 = state[0].history.nextIndex > 0;
        let u1 = state[1].history.nextIndex > 0;
        return u1 || u0;
    }

    _nextChangeAddress(state) {
        let nextIndex = state[1].history.nextIndex;
        let address = state[1].chain.addresses.get(nextIndex);
        return address;
    }

    _nextAddress(state) {
        let nextIndex = state[0].history.nextIndex;
        let address = state[0].chain.addresses.get(nextIndex);
        return address;
    }

    _nextAddressId(state) {
        return state[0].history.nextIndex;
    }

    _finishAccountDiscovery(discovery, onUsed) {
        discovery.values.attach((state) => {
            if (this._isUsed(state)) {
                onUsed();
            }
        });
        return discovery.awaitLast();
    }

    _loadBlockheight() {
        return this.blockchain.lookupSyncStatus().then(({height}) => height);
    }

    _deriveUnspents(state, blockheight) {
        let t0 = state[0].transactions;
        let t1 = state[1].transactions;
        let map = t0.merge(t1);
        let unspents = hd.collectUnspents(
            map,
            state[0].chain,
            state[1].chain
        );
        return unspents.map(unspent => {
            let txId = unspent.id;
            let confirmations = unspent.height ? (blockheight - unspent.height + 1) : undefined;
            let address = bitcoin.address.fromOutputScript(unspent.script);
            let value = unspent.value;
            let vout = unspent.index;
            return {
                txId,
                confirmations,
                address,
                value,
                vout
            };
        });
    }

    _loadBlocks() {
        return hd.lookupBlockRange(this.blockchain, null);
    }

    getPath() {
        return Account.getPathForIndex(this.node.index);
    }

    // usable if the discovery is finished:

    getBalance() {
        return this.unspents
            .reduce((b, u) => b + u.value, 0);
    }

    getConfirmedBalance() {
        return this.unspents
            .filter((u) => u.confirmations > 0)
            .reduce((b, u) => b + u.value, 0);
    }

    getChangeAddress() {
        return this.nextChange;
    }

    getAddressPath(address) {
        return this.addressPaths[address];
    }

    composeTx(outputs, feePerByte) {
        const txDust = 5460;

        let {inputs, change, fee} = selectUnspents(this.unspents, outputs, feePerByte);

        outputs = outputs.slice();

        if (change > txDust) {
            let address = this.getChangeAddress();
            let output = {
                address: address,
                amount: change
            };
            outputs.push(output);
        } else {
            fee = fee + change;
        }

        outputs.sort((a, b) => a.amount - b.amount);

        return {converted: this.convertTxForDevice(inputs, outputs), fee};
    }

    convertTxForDevice(inputs, outputs) {
        return {

            inputs: inputs.map((input) => {
                let address_n = this.getAddressPath(input.address);

                if (!address_n) {
                    throw new Error(`Path not found for input address "${input.address}"`);
                }

                return {
                    script_type: 'SPENDADDRESS',
                    prev_hash: input.txId,
                    prev_index: input.vout,
                    address_n
                };
            }),

            outputs: outputs.map((output) => {
                let decoded = bitcoin.address.fromBase58Check(output.address);
                let scriptType = SCRIPT_TYPES[decoded.version];

                if (!scriptType) {
                    throw new Error(`Address "${output.address}" has no known script type`);
                }

                let address_n = this.getAddressPath(output.address);

                // only change output is specified with address_n
                if (address_n && address_n[address_n.length - 2] === 1) {
                    return {
                        script_type: scriptType,
                        address_n: address_n,
                        amount: output.amount
                    };
                } else {
                    return {
                        script_type: scriptType,
                        address: output.address,
                        amount: output.amount
                    };
                }
            })
        };
    }
}

const TX_EMPTY_SIZE = 8;
const TX_PUBKEYHASH_INPUT = 40 + 2 + 106;
const TX_PUBKEYHASH_OUTPUT = 8 + 2 + 25;

function selectUnspents(unspents, outputs, feePerByte) {
    // based on https://github.com/dcousens/coinselect

    let candidates = [];
    let outgoing = 0;
    let incoming = 0;

    let byteLength = TX_EMPTY_SIZE;

    unspents = unspents.slice().sort((a, b) => {
        let ac = (a.confirmations || 0);
        let bc = (b.confirmations || 0);
        return (bc - ac) ||         // descending confirmations
               (a.value - b.value); // ascending value
    });

    for (let i = 0; i < outputs.length; i++) {
        outgoing += outputs[i].amount;
        byteLength += TX_PUBKEYHASH_OUTPUT;
    }

    for (let i = 0; i < unspents.length; i++) {
        incoming += unspents[i].value;
        byteLength += TX_PUBKEYHASH_INPUT;

        candidates.push(unspents[i]);

        if (incoming < outgoing) {
            // don't bother with fees until we cover all outputs
            continue;
        }

        let baseFee = estimateFee(byteLength, feePerByte);
        let total = outgoing + baseFee;

        if (incoming < total) {
            // continue until we can afford the base fee
            continue;
        }

        let feeWithChange = estimateFee(byteLength + TX_PUBKEYHASH_OUTPUT, feePerByte);
        let totalWithChange = outgoing + feeWithChange;

        // can we afford a change output?
        if (incoming >= totalWithChange) {
            let change = incoming - totalWithChange;
            return {
                inputs: candidates,
                change: change,
                fee: feeWithChange
            };
        } else {
            let fee = incoming - total;
            return {
                inputs: candidates,
                change: 0,
                fee: fee
            };
        }
    }

    throw INSUFFICIENT_FUNDS;
}

function estimateFee(byteLength, feePerByte) {
    return byteLength * feePerByte;
}

function discoverAccounts(device, onStart, onUsed, onEnd) {
    let accounts = [];

    let channel = createCryptoChannel();

    let discover = (i) => {
        return Account.fromDevice(device, i, channel, getBlockchain()).then((account) => {
            onStart(account);
            return account.discover(onUsed).then(() => {
                accounts.push(account);
                onEnd();
                if (account.used) {
                    if (i + 1 >= 10) {
                        return accounts; // stop at Account #10
                    }
                    return discover(i + 1);
                } else {
                    return accounts;
                }
            });
        });
    };

    return discover(0);
}

function renderAccountDiscovery(discovered, discovering) {
    let accounts = (discovering)
            ? discovered.concat(discovering)
            : discovered;

    let components = accounts.map((account, i) => {
        let content;
        let used = account.used;
        let balance = account.getBalance();
        if (!used) {
            content = 'Fresh account';
        } else {
            content = formatAmount(balance);
        }

        if (account !== discovering) {
            if (discovering) {
                return `
                    <div class="account">
                    <button disabled>
                    <span class="account-title">Account #${i + 1}</span>
                    <span class="account-status">${content}</span>
                    </button>
                    </div>`;
            } else {
                return `
                    <div class="account">
                    <button onclick="selectAccount(${i})">
                    <span class="account-title">Account #${i + 1}</span>
                    <span class="account-status">${content}</span>
                    </button>
                    </div>`;
            }
        } else {
            return `
                <div class="account">
                 <button disabled>
                 <span class="account-title">Account #${i + 1}</span>
                 <span class="account-status">Loading...</span>
                 </button>
                </div>`;
        }
    });

    document.querySelector('#accounts').innerHTML = components.join('');
}

function showSelectionAccounts(device) {
    let discovered = [];
    let discovering = null;

    let onStart = (account) => {
        discovering = account;
    };

    let onUsed = () => {
        renderAccountDiscovery(discovered, discovering);
    };

    let onEnd = () => {
        discovered.push(discovering);
        discovering = null;
        renderAccountDiscovery(discovered, discovering);
    };

    let heading = document.querySelector('#alert_accounts .alert_heading');

    showAlert('#alert_accounts');
    global.alert = '#alert_accounts';

    heading.textContent = 'Loading accounts...';
    discoverAccounts(device, onStart, onUsed, onEnd).then((accounts) => {
        global.alert = '#alert_loading';
        heading.textContent = 'Select an account:';
        renderAccountDiscovery(accounts, discovering);
    });
    return selectAccount(discovered);
}

function waitForAccount() {
    return showSelectionAccounts(global.device)
      .then((account) => {
            global.account = account;
            return account;
        })
      .catch(errorHandler(waitForAccount));
}

function selectAccount(accounts) {
    return new Promise((resolve) => {
        window.selectAccount = (i) => {
            window.selectAccount = null;
            document.querySelector('#accounts').innerHTML = '';
            resolve(accounts[i]);
        };
    });
}


function showSelectionFees(device, transactions) {
    let heading = document.querySelector('#alert_fees .alert_heading');

    showAlert('#alert_fees');
    global.alert = '#alert_fees';

    heading.textContent = 'Select fee:';

    let components = transactions.map((transactionFeeInfo, i) => {
        let feeNameObj = '';
        if (transactionFeeInfo.name === 'Normal') {
            feeNameObj = 
                `
                <span class="fee-name-normal">${transactionFeeInfo.name}</span>
                <span class="fee-name-subtitle">recommended</span>
                `;
        } else {
            feeNameObj = `<span class="fee-name">${transactionFeeInfo.name}</span>`;
        }
        return `
            <div class="fee">
              <button onclick="selectFee(${i})">
              ${feeNameObj}
              <span class="fee-size">${formatAmount(transactionFeeInfo.tx.fee)}</span>
              <span class="fee-minutes">${formatTime(transactionFeeInfo.maxMinutes)}</span>
              </button>
            </div>
        `;
    });

    document.querySelector('#fees').innerHTML = components.join('');

    return selectFee(transactions);
}

function waitForFee(transactions) {
    return showSelectionFees(global.device, transactions)
        .catch(errorHandler(waitForFee));
}

function selectFee(transactions) {
    return new Promise((resolve) => {
        window.selectFee = (i) => {
            window.selectFee = null;
            document.querySelector('#fees').innerHTML = '';
            document.querySelector('#alert_fees .alert_heading').innerHTML = '';
            resolve(transactions[i].tx.converted);
        };
    });
}

/*
 * buttons
 */

function buttonCallback(code) {
    let receive = () => {
        global.device.session.removeListener('receive', receive);
        global.device.session.removeListener('error', receive);
        showAlert(global.alert);
    };

    global.device.session.on('receive', receive);
    global.device.session.on('error', receive);

    switch (code) {
    case 'ButtonRequest_ConfirmOutput':
    case 'ButtonRequest_SignTx':
        showAlert('#alert_confirm_tx');
        break;
    default:
        showAlert('#alert_confirm');
        break;
    }
}

/*
 * pin
 */

function pinCallback(type, callback) {
    document.querySelector('#pin_dialog').callback = callback;
    document.querySelector('#pin').value = '';
    window.addEventListener('keydown', pinKeydownHandler);
    showAlert('#pin_dialog');
}

function pinKeydownHandler(ev) {
    ev.preventDefault();
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
    let e = document.querySelector('#pin');
    if (e.value.length < 9) {
        e.value += el.getAttribute('key');
    }
}

window.pinAdd = pinAdd;

function pinBackspace() {
    let e = document.querySelector('#pin');
    e.value = e.value.slice(0, -1);
}

window.pinBackspace = pinBackspace;

function pinEnter() {
    window.removeEventListener('keydown', pinKeydownHandler);
    let pin = document.querySelector('#pin').value;
    document.querySelector('#pin').value = '';
    document.querySelector('#pin_dialog').callback(null, pin);
    showAlert(global.alert);
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
    let e = document.querySelector('#passphrase');
    e.type = (e.type === 'text') ? 'password' : 'text';
}

window.passphraseToggle = passphraseToggle;

function passphraseEnter() {
    let passphrase = document.querySelector('#passphrase').value;
    window.removeEventListener('keydown', passphraseKeydownHandler);
    document.querySelector('#passphrase_dialog').callback(null, passphrase);
    showAlert(global.alert);
}

window.passphraseEnter = passphraseEnter;

/*
 * utils
 */

function lookupTx(hash, blockchain) {
    return blockchain.lookupTransaction(hash)
        .then((txinfo) => {
            let tx = txinfo.tx;

            return {
                hash: hash,
                version: tx.version,
                lock_time: tx.locktime,
                inputs: tx.ins.map((input) => {
                    let hash = input.hash.slice();

                    Array.prototype.reverse.call(hash);

                    return {
                        prev_hash: hash.toString('hex'),
                        prev_index: input.index >>> 0,
                        sequence: input.sequence >>> 0,
                        script_sig: input.script.toString('hex')
                    };
                }),
                bin_outputs: tx.outs.map((output) => {
                    return {
                        amount: output.value,
                        script_pubkey: output.script.toString('hex')
                    };
                })
            };
        });
}

function clickMatchingElement(ev, keys, active = 'active') {
    let s = keys[ev.keyCode.toString()];
    if (s) {
        let e = document.querySelector(s);
        if (e) {
            e.click();
            e.classList.add(active);
            setTimeout(() => {
                e.classList.remove(active);
            }, 25);
        }
    }
}

function show(selector) {
    let els = document.querySelectorAll(selector);
    for (let i = 0; i < els.length; i++) {
        els[i].style.display = '';
    }
    return els;
}

function showAlert(element) {
    fadeOut('.alert');
    fadeIn(element);
}

function fadeIn(selector) {
    let els = document.querySelectorAll(selector);
    for (let i = 0; i < els.length; i++) {
        els[i].classList.remove('fadeout');
    }
    return els;
}

function fadeOut(selector) {
    let els = document.querySelectorAll(selector);
    for (let i = 0; i < els.length; i++) {
        els[i].classList.add('fadeout');
    }
    return els;
}

function resolveAfter(msec, value) {
    return new Promise((resolve) => {
        setTimeout(resolve, msec, value);
    });
}

function closeWindow() {
    setTimeout(() => { window.close(); }, 50);
}

function formatAmount(n) {
    if ((n / 1e8) < 0.1 && n != 0) {
        let s = (n / 1e5).toString();
        return `${s} mBTC`;
    }
    let s = (n / 1e8).toString();
    return `${s} BTC`;
}

function formatTime(n) {
    let hours = Math.floor(n / 60);
    let minutes = n % 60;
    
    let res = '';
    if (hours != 0) {
        res += hours + ' hour';
        if (hours > 1) {
            res += 's';
        }
        res += ' ';
    }
    if (minutes != 0) {
        res += minutes + ' minutes';
    }
    return res;
}

window.closeWindow = closeWindow;
