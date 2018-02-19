// TODO: tests (especially coin selection)
// TODO: migrate to bitcoin.* structures throughout the app
// TODO: compose tx as a full bitcoin.Transaction, then convert to device type,
//       after signing remove sigs and verify
// TODO: split to modules (blockchain, device, accounts, ui)


import {Promise} from 'es6-promise';
import 'babel-polyfill';

import bowser from 'bowser';
import * as bitcoin from 'bitcoinjs-lib-zcash';
import * as trezor from 'trezor.js';
import * as hd from 'hd-wallet';

import TrezorAccount from './account/Account';
import { discoverAccounts, discoverAllAccounts, stopAccountsDiscovery } from './account/discovery';
import BitcoreBackend, { create as createBitcoreBackend } from './backend/BitcoreBackend';
import { getCoinInfoByCurrency } from './backend/CoinInfo';
import ComposingTransaction, { transformResTxs, validateInputs, validateOutputs } from './backend/ComposingTransaction';
import { httpRequest, setCurrencyUnits, formatAmount, parseRequiredFirmware } from './utils/utils';
import { serializePath, isSegwitPath, validateAccountInfoDescription } from './utils/path';
import * as Constants from './utils/constants';
import { promptInfoPermission, promptXpubKeyPermission, showSelectionFees, promptNEMAddressPermission, CHANGE_ACCOUNT } from './view';

var bip44 = require('bip44-constants');
var semvercmp = require('semver-compare');

const NETWORK = bitcoin.networks.bitcoin;
const COIN_NAME = 'Bitcoin';
const SCRIPT_TYPES = {
    [NETWORK.pubKeyHash]: 'PAYTOADDRESS',
    [NETWORK.scriptHash]: 'PAYTOSCRIPTHASH'
};
const CONFIG_URL = './config_signed.bin';

var CHUNK_SIZE = 20;
var GAP_LENGTH = 20;
const ADDRESS_VERSION = 0x0;
var BITCORE_URLS = ['https://btc-bitcore3.trezor.io', 'https://btc-bitcore1.trezor.io'];
var CURRENCY;
var CURRENCY_UNITS;
var ACCOUNT_DISCOVERY_LIMIT = 10;
var BIP44_COIN_TYPE = 0;
var COIN_INFO_URL = 'coins.json';

const SOCKET_WORKER_PATH = './js/socket-worker-dist.js';
const CRYPTO_WORKER_PATH = './js/trezor-crypto-dist.js';

global.alert = '#alert_loading';
global.device = null;

if (window.opener) {
    // try to initiate the handshake, but only if we can reach the opener
    window.opener.postMessage('handshake', '*');
}
window.addEventListener('message', onMessage);

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

    // optional values set by parent window
    if (request.bitcoreURLS) {
        BITCORE_URLS = request.bitcoreURLS;
    }
    if (request.coinInfoURL) {
        COIN_INFO_URL = request.coinInfoURL;
    }
    if (request.currency) {
        CURRENCY = request.currency;
    }
    if (request.currencyUnits) {
        CURRENCY_UNITS = request.currencyUnits.toLowerCase();
        setCurrencyUnits(CURRENCY_UNITS);
    }
    if (request.accountDiscoveryLimit) {
        ACCOUNT_DISCOVERY_LIMIT = request.accountDiscoveryLimit;
    }
    if (request.accountDiscoveryBip44CoinType) {
        BIP44_COIN_TYPE = request.accountDiscoveryBip44CoinType;
    }
    if (request.accountDiscoveryGapLength) {
        GAP_LENGTH = CHUNK_SIZE = request.accountDiscoveryGapLength;
    }
    request.identity = parseIdentity(event);
    document.querySelector('#origin').textContent = showIdentity(request.identity);

    let requestedFirmware = parseRequiredFirmware(request.requiredFirmware, requiredFirmware);
    if (requestedFirmware) 
        requiredFirmware = requestedFirmware;

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
    case 'allaccountsinfo':
        handleAllAccountsInfo(event);
        break;

    case 'signtx':
        handleSignTx(event);
        break;

    case 'signethtx':
        handleEthereumSignTx(event);
        break;

    case 'pushtx':
        handlePushTx(event);
        break;

    case 'composetx':
        handleComposeTx(event);
        break;

    case 'signmsg':
        handleSignMsg(event);
        break;

    case 'signethmsg':
        handleEthereumSignMsg(event);
        break;

    case 'verifymsg':
        handleVerifyMsg(event);
        break;

    case 'verifyethmsg':
        handleEthereumVerifyMsg(event);
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

    case 'nemGetAddress':
        handleNEMGetAddress(event);
        break;

    case 'nemSignTx':
        handleNEMSignTx(event);
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
    // file:// URLs
    if (event.origin === 'null') {
        return null;
    }

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
    if (identity === null) {
        return 'Unknown Local Application';
    } else if (identity.proto === 'chrome-extension') {
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
            return device.session.signMessage(
                requestedPath,
                message,
                coin,
                isSegwitPath(requestedPath)
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

/*
 * sign ethereum message
 */

function handleEthereumSignMsg(event) {
    let message = new Buffer(event.data.message, 'utf8').toString('hex');
    let requestedPath = event.data.path;

    // make sure bip32 indices are unsigned
    requestedPath = requestedPath.map((i) => i >>> 0);

    show('#operation_signethmsg');

    initDevice()

        .then(function signEthMessage(device) { // send EthereumSignMessage
            return device.session.signEthMessage(
                requestedPath,
                message
            ).catch( errorHandler(() => signEthMessage(device)) );
        })

        .then((result) => { // success
            let {message} = result;
            let {address, signature} = message;

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    address: address,
                    signature: signature
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
            return device.session.verifyMessage(
                address,
                signature,
                message,
                coin
            ).catch(errorHandler(() => verifyMessage(device)));
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

function handleEthereumVerifyMsg(event) {

    let address = event.data.address;
    let signature = event.data.signature;
    let message = new Buffer(event.data.message, 'utf8').toString('hex');

    show('#operation_verifyethmsg');

    initDevice()

        .then(function verifyEthereumMessage(device) { // send EthereumVerifyMessage
            return device.session.verifyEthMessage(
                address,
                signature,
                message,
            ).catch( errorHandler(() => verifyEthereumMessage(device)) );
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

function handleNEMGetAddress(event) {
    const address_n = event.data.address_n.map((i) => i >>> 0);
    const network = event.data.network & 0xFF;

    const getAddress = () => {
        const handler = errorHandler(getAddress);
        return global.device.session.nemGetAddress(address_n, network, true)
            .catch(handler);
    }

    const getPermission = () => {
        return promptNEMAddressPermission(address_n, network).catch(errorHandler(getPermission));
    };

    show('#operation_nemaddress');

    initDevice()
        .then(getPermission)
        .then(getAddress)
        .then((result) => { // success
            const {message} = result;
            const {address} = message;

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    address: address
                });
            });
        })
        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
}

function handleNEMSignTx(event) {
    const address_n = event.data.address_n.map((i) => i >>> 0);

    const NEM_MOSAIC_LEVY_TYPES = {
        1: "MosaicLevy_Absolute",
        2: "MosaicLevy_Percentile"
    };
    
    const NEM_SUPPLY_CHANGE_TYPES = {
        1: "SupplyChange_Increase",
        2: "SupplyChange_Decrease"
    };
    
    const NEM_AGGREGATE_MODIFICATION_TYPES = {
        1: "CosignatoryModification_Add",
        2: "CosignatoryModification_Delete"
    };
    
    const NEM_IMPORTANCE_TRANSFER_MODES = {
        1: "ImportanceTransfer_Activate",
        2: "ImportanceTransfer_Deactivate"
    };

    const commonProto = (common, address_n) => ({
        address_n: address_n,
        network: (common.version >> 24) & 0xFF,
        timestamp: common.timeStamp,
        fee: common.fee,
        deadline: common.deadline,
        signer: address_n ? undefined : common.signer
    });

    const transferProto = (transfer) => {
        const mosaics = transfer.mosaics ? transfer.mosaics.map((mosaic) => ({
            namespace: mosaic.mosaicId.namespaceId,
            mosaic: mosaic.mosaicId.name,
            quantity: mosaic.quantity
        })) : undefined;

        return {
            recipient: transfer.recipient,
            amount: transfer.amount,
            payload: transfer.message.payload || undefined,
            public_key: transfer.message.type == 0x02 ? transfer.message.publicKey : undefined,
            mosaics: mosaics
        };
    };

    const importanceTransferProto = (importanceTransfer) => ({
        mode: NEM_IMPORTANCE_TRANSFER_MODES[importanceTransfer.mode],
        public_key: importanceTransfer.remoteAccount
    });

    const provisionNamespaceProto = (provisionNamespace) => ({
        namespace: provisionNamespace.newPart,
        parent: provisionNamespace.parent || undefined,
        sink: provisionNamespace.rentalFeeSink,
        fee: provisionNamespace.rentalFee
    });

    const aggregateModificationProto = (aggregateModification) => ({
        modifications: aggregateModification.modifications.map((modification) => ({
            type: NEM_AGGREGATE_MODIFICATION_TYPES[modification.modificationType],
            public_key: modification.cosignatoryAccount
        })),
        relative_change: aggregateModification.minCosignatories.relativeChange
    });

    const mosaicCreationProto = (mosaicCreation) => {
        const levy = mosaicCreation.mosaicDefinition.levy || undefined;

        const definition = {
            namespace: mosaicCreation.mosaicDefinition.id.namespaceId,
            mosaic: mosaicCreation.mosaicDefinition.id.name,
            levy: levy && NEM_MOSAIC_LEVY_TYPES[levy.type],
            fee: levy && levy.fee,
            levy_address: levy && levy.recipient,
            levy_namespace: levy && levy.mosaicId.namespaceId,
            levy_mosaic: levy && levy.mosaicId.name,
            description: mosaicCreation.mosaicDefinition.description
        };

        mosaicCreation.mosaicDefinition.properties.forEach((property) => {
            const { name, value } = property;

            switch (property.name) {
                case "divisibility":
                    definition.divisibility = parseInt(value);
                    break;

                case "initialSupply":
                    definition.supply = parseInt(value);
                    break;

                case "supplyMutable":
                    definition.mutable_supply = (value == "true");
                    break;

                case "transferable":
                    definition.transferable = (value == "true");
                    break;
            }
        });

        return {
            definition: definition,
            sink: mosaicCreation.creationFeeSink,
            fee: mosaicCreation.creationFee
        };
    };

    const mosaicSupplyChangeProto = (mosaicSupplyChange) => ({
        namespace: mosaicSupplyChange.mosaicId.namespaceId,
        mosaic: mosaicSupplyChange.mosaicId.name,
        type: NEM_SUPPLY_CHANGE_TYPES[mosaicSupplyChange.supplyType],
        delta: mosaicSupplyChange.delta
    });

    const createTx = () => {
        let transaction = event.data.transaction;

        const message = {
            transaction: commonProto(transaction, address_n)
        };

        message.cosigning = (transaction.type == 0x1002);
        if (message.cosigning || transaction.type == 0x1004) {
            transaction = transaction.otherTrans;
            message.multisig = commonProto(transaction);
        }

        switch (transaction.type) {
            case 0x0101:
                message.transfer = transferProto(transaction);
                break;

            case 0x0801:
                message.importance_transfer = importanceTransferProto(transaction);
                break;

            case 0x1001:
                message.aggregate_modification = aggregateModificationProto(transaction);
                break;

            case 0x2001:
                message.provision_namespace = provisionNamespaceProto(transaction);
                break;

            case 0x4001:
                message.mosaic_creation = mosaicCreationProto(transaction);
                break;

            case 0x4002:
                message.supply_change = mosaicSupplyChangeProto(transaction);
                break;

            default:
                throw new Error('Unknown transaction type');
                break;
        }

        return message;
    };

    const signTx = (message) => {
        const handler = errorHandler(() => signTx(message));
        return global.device.session.nemSignTx(message)
            .catch(handler);
    };

    show('#operation_signtx');

    initDevice()
        .then(createTx)
        .then(signTx)
        .then((result) => { // success
            const {message} = result;

            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    message: message
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

function getPublicKey(path, coinName) {
    let handler = errorHandler(() => getPublicKey(path, coinName));
    return global.device.session.getPublicKey(path, coinName)
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
                    .then(path => {
                        return getCoinInfoByCurrency(COIN_INFO_URL, CURRENCY ? CURRENCY : 'Bitcoin')
                            .then(coinInfo => {
                                return getPublicKey(path, coinInfo.name);
                            });
                    })
            } else {
                return waitForAccount()
                    .then(account => {
                        return getPublicKey(account.getPath(), backend.coinInfo.name);
                    });
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



/*
 * Fresh address 
 */

function getAccountByDescription(description) {
    if (description == null) {
        return waitForAccount();
    }
    if(description === 'all'){
        return waitForAllAccounts();
    }
    if (Array.isArray(description)) {
        return getAccountByHDPath(description);
    }
    // if (typeof description === 'object') {
    //     return getAccountByXpub(description.xpub);
    // }
    if (typeof description === 'string') {
        return getAccountByXpub(description);
    }
    throw new Error('Wrongly formatted description.');
}

function getAccountByXpub(xpub) {
    let index = 0;
    const inside = (i) => {
        return TrezorAccount.fromIndex(global.device, backend, i).then(account => {
            if (account.getXpub() === xpub) {
                return account;
            } else {
                if (i + 1 > ACCOUNT_DISCOVERY_LIMIT) {
                    if (backend.coinInfo.segwit) {
                        backend.coinInfo.segwit = false;
                        return inside(0);
                    } else {
                        return null;
                    }
                } else {
                    return inside(i + 1);
                }
            }
        });
    }

    return getBitcoreBackend().then(b => {
        return inside(0).then(account => {
            if (account == null) {
                return Promise.reject(new Error('No account with the given xpub'));
            } else {
                return promptInfoPermission(account.getPath()).then(() => {
                    return account.discover().then(() => account);
                });
            }
        });
    }).catch(error => { throw error; });
}


function getAccountByHDPath(path) {
    return getBitcoreBackend().then(b => {
        return TrezorAccount.fromPath(global.device, backend, path).then(account => {
            return promptInfoPermission(path).then(() => {
                return account.discover().then(() => account);
            });
        });
    });
}



function handleAllAccountsInfo(event) {
    show('#operation_accountinfo');
    let description = event.data.description;
    initDevice()
        .then((device) => {
            return getAccountByDescription(description)
                .then(accounts => {
                    let list = [];
                    for(let a of accounts){
                        list.push({
                            path: a.getPath(),
                            address: a.getNextAddress(),
                            addressPath: a.getAddressPath(a.getNextAddress()),
                            addressId: a.getNextAddressId(),
                            xpub: a.getXpub(),
                            balance: a.getBalance(),
                            confirmed: a.getConfirmedBalance(),
                            id: a.id,
                            segwit: a.segwit
                        });
                    }
                    return list;
                });
        })
        .then(response => { // success
            return global.device.session.release().then(() => {
                respondToEvent(event, { 
                    success: true, 
                    accounts: response
                });
            });
        })
        .catch(error => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });

}

function handleAccountInfo(event) {
    show('#operation_accountinfo');

    return getBitcoreBackend()
    .then(() => {
        return validateAccountInfoDescription(event.data.description, backend);
    })
    .then(description => {
        return initDevice()
        .then(device => {
            return getAccountByDescription(description)
                .then((account) => {
                    return {
                        path: account.getPath(),
                        address: account.getNextAddress(),
                        addressId: account.getNextAddressId(),
                        addressPath: account.getAddressPath( account.getNextAddress()),
                        xpub: account.getXpub(),
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
    })
    .catch((error) => { // failure
        console.error(error);
        respondToEvent(event, {success: false, error: error.message});
    });
}

function handleEthereumSignTx(event) {
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

    show('#operation_signtx');

    initDevice()

        .then((device) => {
            return getBitcoreBackend().then(() => {
                const { trezorInputs, bitcoreInputs } = validateInputs(event.data.inputs, backend.coinInfo.network);
                const outputs = validateOutputs(event.data.outputs, backend.coinInfo.network);
                let total = outputs.reduce((t, r) => t + r.amount, 0);
                if (total <= backend.coinInfo.dustLimit) {
                    throw AMOUNT_TOO_LOW;
                }

                const tx = new ComposingTransaction(backend, bitcoreInputs, outputs);
                return tx.getReferencedTx().then(refTxs => {
                    const ref = refTxs.map(r => transformResTxs(r));
                    return device.session.signTx(
                        trezorInputs,
                        outputs,
                        ref,
                        backend.coinInfo.name
                    );
                });

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

function handlePushTx(event) {
    const { rawTx } = event.data;
    getBitcoreBackend().then(() => {
        backend.sendTransactionHex(rawTx)
        .then(txid => {
            respondToEvent(event, {
                success: true,
                type: 'pushtx',
                txid: txid
            });
        })
        .catch((error) => { // failure
            console.error(error);
            respondToEvent(event, {success: false, error: error.message});
        });
    });
    
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

function handleComposeTx(event) {
    let recipients = event.data.recipients;

    initDevice()
        .then((device) => {

            const composeTx = () => {

                show('#operation_composetx');
                let total = recipients.reduce((t, r) => t + r.amount, 0);
                document.querySelector('#composetx_amount').textContent = formatAmount(total, backend.coinInfo);

                return waitForAccount()
                    .then((account) => {

                        if (total <= backend.coinInfo.dustLimit) {
                            throw AMOUNT_TOO_LOW;
                        }

                        return backend.loadFees().then(fees => {
                            return Promise.all(fees.map(feeLevel => {
                                // compose tx for every fee level
                                return account.composeTx(recipients, feeLevel.fee, true)
                                    .then(tx => {
                                        return {
                                            ...feeLevel,
                                            tx
                                        };
                                    }).catch(error => {
                                        if (error.message === 'Insufficient input') {
                                            throw INSUFFICIENT_FUNDS;
                                        }
                                        return {
                                            ...feeLevel
                                        };
                                    });
                            }));
                        });
                    })
                    .then(composeCustomTx)
                    .then(chooseTxFee)
                    .catch(errorHandler(composeTx));
            };

            const composeCustomTx = (transactions) => {
                const minFee: number = backend.coinInfo.minFeeSatoshiKb / 1000;
                const lowFee: number = transactions[ transactions.length - 1].fee;

                // check if afford to spend with predefined fee
                const affordLow = transactions.reduce((prev, out) => { return out.tx ? prev + 1 : prev }, 0);
                
                if (affordLow < 1) {
                    const quarter: number = lowFee / 4;
                    let customFee: number = minFee;
                    const feesToTry: Array<number> = [];
                    while (customFee < lowFee) {
                        feesToTry.push(customFee);
                        customFee = Math.floor(customFee + quarter);
                    }

                    return new Promise((resolve, reject) => {
                        Promise.all(feesToTry.map(fee => {
                            return account.composeTx(recipients, fee, true)
                            .then(tx => {
                                return fee;
                            }).catch(error => {
                                return 0;
                            }); 
                        })).then(customFees => {
                            const maxCustomFee = customFees.reduce((prev, out) => { return out > 0 ? out : prev }, 0);
                            if (maxCustomFee > 0) {
                                resolve({ transactions, defaultCustomFee: maxCustomFee })
                            } else {
                                reject(INSUFFICIENT_FUNDS);
                            }
                        });
                    });

                } else {
                    return Promise.resolve({ transactions, defaultCustomFee: lowFee });
                }
            }

            const chooseTxFee = ({transactions, defaultCustomFee}) => {
                return showSelectionFees(transactions, defaultCustomFee, backend.coinInfo, (fee: number) => {
                    // function called from UI when fee is changed
                    return account.composeTx(recipients, fee, true)
                        .catch(error => {
                            console.log("composeTx Error", error);
                            return null;
                        });
                });
            }

            return getBitcoreBackend() 
                .then(composeTx)
                .then(({inputs, outputs, account}) => {
                    backend.coinInfo.segwit = account.segwit;
                    const coinInfo = backend.coinInfo;
                    const tx = new ComposingTransaction(backend, inputs, outputs);
                    return tx.getReferencedTx().then(refTxs => {
                        const node = bitcoin.HDNode.fromBase58(account.getXpub(), coinInfo.network);
                        return device.session.signBjsTx(tx.getTx(), refTxs, [node.derive(0), node.derive(1)], coinInfo.name, coinInfo.network);
                    });
                })
        })
        .then((result) => { // success
            //const signatures = result.getHash();
            const serialized_tx = result.toHex();
            return global.device.session.release().then(() => {
                respondToEvent(event, {
                    success: true,
                    type: 'signtx',
                    signatures: [], // TODO
                    serialized_tx: serialized_tx
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

    // TODO: not used anywhere, remove
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
const AMOUNT_TOO_LOW = new Error('Amount is to low');

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
        // case AMOUNT_TOO_LOW:
        //     showAlert('#alert_amount_too_low');
        //     return resolveAfter(2500).then(retry);
        case CHANGE_ACCOUNT: // import from view
            return resolveAfter(500).then(retry);
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
let backend = null;
function getBitcoreBackend() {
    return new Promise((resolve, reject) => {
        if (!backend) {
            return createBitcoreBackend(CURRENCY ? CURRENCY : BITCORE_URLS, COIN_INFO_URL)
            .then(bitcoreBackend => {
                backend = bitcoreBackend;
                resolve(backend);
            }).catch(error => {
                reject(error);
            })
        } else{ 
            resolve(backend);
        }
    });
}

function showSelectionAccounts(device) {
    const discoveredAccounts = [];

    const onUpdate = (a) => {
        discoveredAccounts.push(a);
    }
    getBitcoreBackend().then(() => {
        discoverAccounts(device, backend, onUpdate, ACCOUNT_DISCOVERY_LIMIT);
       window.selectAccountError = null;
    }).catch(error => {
       window.selectAccountError(error);
       window.selectAccountError = null;
    })
    return selectAccount(discoveredAccounts);
}

function selectAccount(accounts) {
    return new Promise((resolve, reject) => {
        window.selectAccountError = reject;
        window.selectAccount = (index) => {

            stopAccountsDiscovery();

            window.selectAccount = null;
            showAlert('#alert_loading');
            document.querySelector('#alert_accounts .accounts_tab').classList.remove('visible');
            resolve(accounts[index]);
        };
    });
}

function waitForAccount() {
    return showSelectionAccounts(global.device)
      .then((account) => {
            global.account = account;
            return account;
        })
      .catch(errorHandler(waitForAccount));
}

function waitForAllAccounts() {
    showAlert('#alert_accounts');
    global.alert = '#alert_accounts';
    let heading = document.querySelector('#alert_accounts .alert_heading');
    heading.textContent = 'Loading accounts...';

    return getBitcoreBackend().then(b => {
        return discoverAllAccounts(global.device, backend, ACCOUNT_DISCOVERY_LIMIT);
    }).catch(error => { throw error; });
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

    document.querySelector('#passphrase').oninput = passphraseValidation;
    document.querySelector('#passphrase2').oninput = passphraseValidation;
    // e.onpropertychange for ie8

    showAlert('#passphrase_dialog');
}

function passphraseValidation() {
    var p1 = document.querySelector('#passphrase').value;
    var p2 = document.querySelector('#passphrase2').value;
    var dialog = document.querySelector('#passphrase_dialog');
    var button = document.querySelector('#passphrase_enter button');

    if (p1 !== p2) {
        button.disabled = true;
        dialog.classList.add('not-valid');
    } else {
        button.disabled = false;
        dialog.classList.remove('not-valid');
    }
}

function passphraseKeydownHandler(ev) {
    clickMatchingElement(ev, {
        13: '#passphrase_enter button'
    });
}

function passphraseToggle() {
    var p1 = document.querySelector('#passphrase');
    var p2 = document.querySelector('#passphrase2');
    var type = (p1.type === 'text') ? 'password' : 'text'
    p1.type = type;
    p2.type = type;
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

window.closeWindow = closeWindow;
