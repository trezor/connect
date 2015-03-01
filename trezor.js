!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.trezor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Promise = _dereq_('promise'),
    request = _dereq_('superagent'),
    legacyIESupport = _dereq_('./superagent-legacyIESupport');

function contentType(body) {
    if (typeof body === 'object') {
        return 'application/json';
    } else {
        // by default, superagent puts application/x-www-form-urlencoded for strings
        return 'application/octet-stream';
    }
}

function promiseRequest(options) {
    if (typeof options === 'string') {
        options = {
            method: 'GET',
            url: options
        }
    };
    return new Promise(function (resolve, reject) {
        request(options.method, options.url)
            .use(legacyIESupport)
            .type(contentType(options.body || ''))
            .send(options.body || '')
            .end(function (err, res) {
                if (!err && !res.ok) {
                    if (res.body && res.body.error) {
                        err = new Error(res.body.error);
                    } else {
                        err = new Error('Request failed');
                    }
                }
                if (err) {
                    reject(err);
                } else {
                    resolve(res.body || res.text);
                }
            });
    });
}

module.exports = promiseRequest;

},{"./superagent-legacyIESupport":6,"promise":27,"superagent":29}],2:[function(_dereq_,module,exports){
'use strict';

// interface Transport {
//
//     static function create() -> Promise(Self)
//
//     function configure(String config) -> Promise()
//
//     function enumerate(Boolean wait) -> Promise([{
//         String path
//         String vendor
//         String product
//         String serialNumber
//         String session
//     }] devices)
//
//     function acquire(String path) -> Promise(String session)
//
//     function release(String session) -> Promise()
//
//     function call(String session, String name, Object data) -> Promise({
//         String name,
//         Object data,
//     })
//
// }

var HttpTransport = _dereq_('./transport/http');
var PluginTransport = _dereq_('./transport/plugin');

// Attempts to load any available HW transport layer
function loadTransport() {
    return HttpTransport.create().catch(function () {
        return PluginTransport.create();
    });
}

module.exports = {
    loadTransport: loadTransport,
    HttpTransport: HttpTransport,
    PluginTransport: PluginTransport,
    Session: _dereq_('./session'),
    installers: _dereq_('./installers'),
    plugin: _dereq_('./plugin'),
    http: _dereq_('./http')
};

},{"./http":1,"./installers":3,"./plugin":4,"./session":5,"./transport/http":7,"./transport/plugin":8}],3:[function(_dereq_,module,exports){
// var BRIDGE_VERSION_URL = '/data/bridge/latest.txt',
//     BRIDGE_INSTALLERS = [{
//         url: '/data/bridge/%version%/trezor-bridge-%version%-win64.msi',
//         label: 'Windows 64-bit',
//         platform: 'win64'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%-win32.msi',
//         label: 'Windows 32-bit',
//         platform: 'win32'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%.pkg',
//         label: 'Mac OS X',
//         platform: 'mac'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge_%version%_amd64.deb',
//         label: 'Linux 64-bit (deb)',
//         platform: 'deb64'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%-1.x86_64.rpm',
//         label: 'Linux 64-bit (rpm)',
//         platform: 'rpm64'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge_%version%_i386.deb',
//         label: 'Linux 32-bit (deb)',
//         platform: 'deb32'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%-1.i386.rpm',
//         label: 'Linux 32-bit (rpm)',
//         platform: 'rpm32'
//     }];

var BRIDGE_VERSION_URL = '/data/plugin/latest.txt',
    BRIDGE_INSTALLERS = [{
        url: '/data/plugin/%version%/BitcoinTrezorPlugin-%version%.msi',
        label: 'Windows',
        platform: ['win32', 'win64']
    }, {
        url: '/data/plugin/%version%/trezor-plugin-%version%.dmg',
        label: 'Mac OS X',
        platform: 'mac'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor_%version%_amd64.deb',
        label: 'Linux x86_64 (deb)',
        platform: 'deb64'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor-%version%.x86_64.rpm',
        label: 'Linux x86_64 (rpm)',
        platform: 'rpm64'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor_%version%_i386.deb',
        label: 'Linux i386 (deb)',
        platform: 'deb32'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor-%version%.i386.rpm',
        label: 'Linux i386 (rpm)',
        platform: 'rpm32'
    }];

// Returns a list of bridge installers, with download URLs and a mark on
// bridge preferred for the user's platform.
function installers(options) {
    var o = options || {},
        bridgeUrl = o.bridgeUrl || BRIDGE_VERSION_URL,
        version = o.version || requestUri(bridgeUrl).trim(),
        platform = o.platform || preferredPlatform();

    return BRIDGE_INSTALLERS.map(function (bridge) {
        return {
            version: version,
            url: bridge.url.replace(/%version%/g, version),
            label: bridge.label,
            platform: bridge.platform,
            preferred: isPreferred(bridge.platform)
        };
    });

    function isPreferred(installer) {
        if (typeof installer === 'string') { // single platform
            return installer === platform;
        } else { // any of multiple platforms
            for (var i = 0; i < installer.length; i++) {
                if (installer[i] === platform) {
                    return true;
                }
            }
            return false;
        }
    }
};

function preferredPlatform() {
    var ver = navigator.userAgent;

    if (ver.match(/Win64|WOW64/)) return 'win64';
    if (ver.match(/Win/)) return 'win32';
    if (ver.match(/Mac/)) return 'mac';
    if (ver.match(/Linux i[3456]86/))
        return ver.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/)
            ? 'rpm32' : 'deb32';
    if (ver.match(/Linux/))
        return ver.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/)
            ? 'rpm64' : 'deb64';
}

function requestUri(url) {
    var req = new XMLHttpRequest();

    req.open('get', url, false);
    req.send();

    if (req.status !== 200)
        throw new Error('Failed to GET ' + url);

    return req.responseText;
}

module.exports = installers;

},{}],4:[function(_dereq_,module,exports){
'use strict';

var console = _dereq_('console'),
    extend = _dereq_('extend'),
    Promise = _dereq_('promise');

// Try to load a plugin with given options, returns promise. In case of
// rejection, err contains `installed` property.
module.exports.load = function (options) {
    var o = extend(options, {
        // mimetype of the plugin
        mimetype: 'application/x-bitcointrezorplugin',
        // name of the callback in the global namespace
        fname: '__trezorPluginLoaded',
        // id of the plugin element
        id: '__trezor-plugin',
        // time to wait until timeout, in msec
        timeout: 500
    });

    // if we know for sure that the plugin is installed, timeout after
    // 10 seconds
    var installed = isInstalled(o.mimetype),
        timeout = installed ? 10000 : o.timeout;

    // if the plugin is already loaded, use it
    var plugin = document.getElementById(o.id);
    if (plugin)
        return Promise.from(plugin);

    // inject or reject after timeout
    return Promise.race([
        injectPlugin(o.id, o.mimetype, o.fname),
        rejectAfter(timeout, new Error('Loading timed out'))
    ]).catch(function (err) {
        err.installed = installed;
        throw err;
    }).then(
        function (plugin) {
            console.log('[trezor] Loaded plugin ' + plugin.version);
            return plugin;
        },
        function (err) {
            console.error('[trezor] Failed to load plugin: ' + err.message);
            throw err;
        }
    );
};

// Injects the plugin object into the page and waits until it loads.
function injectPlugin(id, mimetype, fname) {
    return new Promise(function (resolve, reject) {
        var body = document.getElementsByTagName('body')[0],
            elem = document.createElement('div');

        // register load function
        window[fname] = function () {
            var plugin = document.getElementById(id);
            if (plugin)
                resolve(plugin);
            else
                reject(new Error('Plugin not found'));
        };

        // inject object elem
        body.appendChild(elem);
        elem.innerHTML =
            '<object width="1" height="1" id="'+id+'" type="'+mimetype+'">'+
            ' <param name="onload" value="'+fname+'" />'+
            '</object>';
    });
}

// If given timeout, gets rejected after n msec, otherwise never resolves.
function rejectAfter(msec, val) {
    return new Promise(function (resolve, reject) {
        if (msec > 0)
            setTimeout(function () { reject(val); }, msec);
    });
}

// Returns true if plugin with a given mimetype is installed.
function isInstalled(mimetype) {
    navigator.plugins.refresh(false);
    return !!navigator.mimeTypes[mimetype];
}

},{"console":13,"extend":25,"promise":27}],5:[function(_dereq_,module,exports){
'use strict';

var util = _dereq_('util'),
    extend = _dereq_('extend'),
    unorm = _dereq_('unorm'),
    crypto = _dereq_('crypto'),
    Promise = _dereq_('promise'),
    EventEmitter = _dereq_('events').EventEmitter;

//
// Trezor device session handle. Acts as a event emitter.
//
// Events:
//
//  send: type, message
//  receive: type, message
//  error: error
//
//  button: code
//  pin: type, callback(error, pin)
//  word: callback(error, word)
//  passphrase: callback(error, passphrase)
//
var Session = function (transport, sessionId) {
    this._transport = transport;
    this._sessionId = sessionId;
    this._emitter = this; // TODO: get emitter as a param
};

util.inherits(Session, EventEmitter);

Session.prototype.getId = function () {
    return this._sessionId;
};

Session.prototype.release = function () {
    console.log('[trezor] Releasing session');
    return this._transport.release(this._sessionId);
};

Session.prototype.initialize = function () {
    return this._typedCommonCall('Initialize', 'Features');
};

Session.prototype.getEntropy = function (size) {
    return this._typedCommonCall('GetEntropy', 'Entropy', {
        size: size
    });
};

Session.prototype.getAddress = function (address_n, coin, show_display) {
    return this._typedCommonCall('GetAddress', 'Address', {
        address_n: address_n,
        coin_name: coin.coin_name,
        show_display: !!show_display
    }).then(function (res) {
        res.message.path = address_n || [];
        return res;
    });
};

Session.prototype.getPublicKey = function (address_n) {
    return this._typedCommonCall('GetPublicKey', 'PublicKey', {
        address_n: address_n
    }).then(function (res) {
        res.message.node.path = address_n || [];
        return res;
    });
};

Session.prototype.wipeDevice = function () {
    return this._commonCall('WipeDevice');
};

Session.prototype.resetDevice = function (settings) {
    return this._commonCall('ResetDevice', settings);
};

Session.prototype.loadDevice = function (settings) {
    return this._commonCall('LoadDevice', settings);
};

Session.prototype.recoverDevice = function (settings) {
    return this._commonCall('RecoveryDevice', settings);
};

Session.prototype.applySettings = function (settings) {
    return this._commonCall('ApplySettings', settings);
};

Session.prototype.changePin = function (remove) {
    return this._commonCall('ChangePin', {
        remove: remove || false
    });
};

Session.prototype.eraseFirmware = function () {
    return this._commonCall('FirmwareErase');
};

Session.prototype.uploadFirmware = function (payload) {
    return this._commonCall('FirmwareUpload', {
        payload: payload
    });
};

Session.prototype.verifyMessage = function (address, signature, message) {
    return this._commonCall('VerifyMessage', {
        address: address,
        signature: signature,
        message: message
    });
};

Session.prototype.signMessage = function (address_n, message, coin) {
    return this._typedCommonCall('SignMessage', 'MessageSignature', {
        address_n: address_n,
        message: message,
        coin_name: coin.coin_name
    });
};

Session.prototype.signIdentity = function (identity, challenge_hidden, challenge_visual) {
    return this._typedCommonCall('SignIdentity', 'SignedIdentity', {
        identity: identity,
        challenge_hidden: challenge_hidden,
        challenge_visual: challenge_visual
    });
};

Session.prototype.measureTx = function (inputs, outputs, coin) {
    return this._typedCommonCall('EstimateTxSize', 'TxSize', {
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coin.coin_name
    });
};

Session.prototype.simpleSignTx = function (inputs, outputs, txs, coin) {
    return this._typedCommonCall('SimpleSignTx', 'TxRequest', {
        inputs: inputs,
        outputs: outputs,
        coin_name: coin.coin_name,
        transactions: txs
    });
};

Session.prototype._indexTxsForSign = function (inputs, outputs, txs) {
    var index = {};

    // Tx being signed
    index[''] = {
        inputs: inputs,
        outputs: outputs
    };

    // Referenced txs
    txs.forEach(function (tx) {
        index[tx.hash.toLowerCase()] = tx;
    });

    return index;
};

Session.prototype.signTx = function (inputs, outputs, txs, coin) {
    var self = this,
        index = this._indexTxsForSign(inputs, outputs, txs),
        signatures = [],
        serializedTx = '';

    return this._typedCommonCall('SignTx', 'TxRequest', {
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coin.coin_name
    }).then(process);

    function process(res) {
        var m = res.message,
            ms = m.serialized,
            md = m.details,
            reqTx, resTx;

        if (ms && ms.serialized_tx != null)
            serializedTx += ms.serialized_tx;
        if (ms && ms.signature_index != null)
            signatures[ms.signature_index] = ms.signature;

        if (m.request_type === 'TXFINISHED')
            return { // same format as SimpleSignTx
                message: {
                    serialized: {
                        signatures: signatures,
                        serialized_tx: serializedTx
                    }
                }
            };

        resTx = {};
        reqTx = index[(md.tx_hash || '').toLowerCase()];

        if (!reqTx)
            throw new Error(md.tx_hash
                            ? ('Requested unknown tx: ' + md.tx_hash)
                            : ('Requested tx for signing not indexed')
                           );

        switch (m.request_type) {

        case 'TXINPUT':
            resTx.inputs = [reqTx.inputs[+md.request_index]];
            break;

        case 'TXOUTPUT':
            if (md.tx_hash)
                resTx.bin_outputs = [reqTx.bin_outputs[+md.request_index]];
            else
                resTx.outputs = [reqTx.outputs[+md.request_index]];
            break;

        case 'TXMETA':
            resTx.version = reqTx.version;
            resTx.lock_time = reqTx.lock_time;
            resTx.inputs_cnt = reqTx.inputs.length;
            if (md.tx_hash)
                resTx.outputs_cnt = reqTx.bin_outputs.length;
            else
                resTx.outputs_cnt = reqTx.outputs.length;
            break;

        default:
            throw new Error('Unknown request type: ' + m.request_type);
        }

        return self._typedCommonCall('TxAck', 'TxRequest', {
            tx: resTx
        }).then(process);
    }
};

Session.prototype._typedCommonCall = function (type, resType, msg) {
    var self = this;

    return this._commonCall(type, msg).then(function (res) {
        return self._assertType(res, resType);
    });
};

Session.prototype._assertType = function (res, resType) {
    if (res.type !== resType)
        throw new TypeError('Response of unexpected type: ' + res.type);
    return res;
};

Session.prototype._commonCall = function (type, msg) {
    var self = this,
        callpr = this._call(type, msg);

    return callpr.then(function (res) {
        return self._filterCommonTypes(res);
    });
};

Session.prototype._filterCommonTypes = function (res) {
    var self = this;

    if (res.type === 'Failure')
        throw res.message;

    if (res.type === 'ButtonRequest') {
        this._emitter.emit('button', res.message.code);
        return this._commonCall('ButtonAck');
    }

    if (res.type === 'EntropyRequest')
        return this._commonCall('EntropyAck', {
            entropy: stringToHex(this._generateEntropy(32))
        });

    if (res.type === 'PinMatrixRequest')
        return this._promptPin(res.message.type).then(
            function (pin) {
                return self._commonCall('PinMatrixAck', { pin: pin });
            },
            function () {
                return self._commonCall('Cancel');
            }
        );

    if (res.type === 'PassphraseRequest')
        return this._promptPassphrase().then(
            function (passphrase) {
                return self._commonCall('PassphraseAck', { passphrase: passphrase });
            },
            function (err) {
                return self._commonCall('Cancel').then(null, function (e) {
                    throw err || e;
                });
            }
        );

    if (res.type === 'WordRequest')
        return this._promptWord().then(
            function (word) {
                return self._commonCall('WordAck', { word: word });
            },
            function () {
                return self._commonCall('Cancel');
            }
        );

    return res;
};

Session.prototype._promptPin = function (type) {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (!self._emitter.emit('pin', type, function (err, pin) {
            if (err || pin == null)
                reject(err);
            else
                resolve(pin);
        })) {
            console.warn('[trezor] PIN callback not configured, cancelling request');
            reject();
        }
    });
};

Session.prototype._promptPassphrase = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (!self._emitter.emit('passphrase', function (err, passphrase) {
            if (err || passphrase == null)
                reject(err);
            else
                resolve(passphrase.normalize('NFKD'));
        })) {
            console.warn('[trezor] Passphrase callback not configured, cancelling request');
            reject();
        }
    });
};

Session.prototype._promptWord = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (!self._emitter.emit('word', function (err, word) {
            if (err || word == null)
                reject(err);
            else
                resolve(word.toLocaleLowerCase());
        })) {
            console.warn('[trezor] Word callback not configured, cancelling request');
            reject();
        }
    });
};

Session.prototype._generateEntropy = function (len) {
    return crypto.randomBytes(len).toString('binary');
};

Session.prototype._call = function (type, msg) {
    var self = this,
        logMessage;

    msg = msg || {};
    logMessage = this._filterForLog(type, msg);

    console.log('[trezor] Sending', type, logMessage);
    this._emitter.emit('send', type, msg);

    return this._transport.call(this._sessionId, type, msg).then(
        function (res) {
            var logMessage = self._filterForLog(res.type, res.message);

            console.log('[trezor] Received', res.type, logMessage);
            self._emitter.emit('receive', res.type, res.message);
            return res;
        },
        function (err) {
            console.log('[trezord] Received error', err);
            self._emitter.emit('error', err);
            throw err;
        }
    );
};

Session.prototype._filterForLog = function (type, msg) {
    var redacted = {},
        blacklist = {
            PassphraseAck: {
                passphrase: '(redacted...)'
            }
        };

    return extend(redacted, msg, blacklist[type] || {});
};

module.exports = Session;

//
// Hex codec
//

// Encode binary string to hex string
function stringToHex(bin) {
    var i, chr, hex = '';

    for (i = 0; i < bin.length; i++) {
        chr = (bin.charCodeAt(i) & 0xFF).toString(16);
        hex += chr.length < 2 ? '0' + chr : chr;
    }

    return hex;
}

// Decode hex string to binary string
function hexToString(hex) {
    var i, bytes = [];

    for (i = 0; i < hex.length - 1; i += 2)
        bytes.push(parseInt(hex.substr(i, 2), 16));

    return String.fromCharCode.apply(String, bytes);
}

},{"crypto":15,"events":20,"extend":25,"promise":27,"unorm":33,"util":24}],6:[function(_dereq_,module,exports){
var superagentLegacyIESupportPlugin = function (superagent) {

    // a litle cheat to parse the url, to find the hostname.
    function parseUrl(url) {
        var anchor = document.createElement('a');
        anchor.href = url;

        return {
            hostname: anchor.hostname,
            protocol: anchor.protocol,
            pathname: anchor.pathname,
            queryString: anchor.search
        };
    };

    // needed to copy this from Superagent library unfortunately
    function serializeObject(obj) {
        if (obj !== Object(obj)) return obj;
        var pairs = [];
        for (var key in obj) {
            if (null != obj[key]) {
                pairs.push(encodeURIComponent(key)
                  + '=' + encodeURIComponent(obj[key]));
            }
        }
        return pairs.join('&');
    }

    // the overridden end function to use for IE 8 & 9
    var xDomainRequestEnd = function (fn) {
        var self = this;
        var xhr = this.xhr = new XDomainRequest(); // IE 8 & 9 bespoke implementation
        
        // XDomainRequest doesn't support these, so we stub them out
        xhr.getAllResponseHeaders = function () { return ''; }; 
        xhr.getResponseHeader = function (name) {
            if (name == 'content-type') {
                return 'application/json'; // careful! you might not be able to make this cheating assumption.
            }
        };

        var query = this._query.join('&');
        var data = this._formData || this._data;

        // store callback
        this._callback = fn || noop;

        // state change
        xhr.onload = function () {
            xhr.status = 200;
            self.emit('end'); // assuming its always a 'readyState' of 4.
        };

        xhr.onerror = function () {
            xhr.status = 400;
            if (self.aborted) return self.timeoutError();
            return self.crossDomainError();
        };

        // progress
        xhr.onprogress = function () {
            self.emit('progress', 50);
        };

        // timeout
        xhr.ontimeout = function () {
            xhr.status = 408;
            return self.timeoutError();
        };

        // querystring
        if (query) {
            query = serializeObject(query);
            this.url += ~this.url.indexOf('?')
                ? '&' + query
                : '?' + query;
        }

        if (this.method != 'GET' && this.method != 'POST') {
            throw 'Only Get and Post methods are supported by XDomainRequest object.';
        }

        // initiate request
        xhr.open(this.method, this.url, true);

        // CORS - withCredentials not supported by XDomainRequest

        // body - remember only POST and GETs are supported
        if ('POST' == this.method && 'string' != typeof data) {
            data = serializeObject(data);
        }

        // custom headers are not support by XDomainRequest

        // send stuff
        this.emit('request', this);
        xhr.send(data);
        return this;
    };

    /**
     * Overrides .end() to use XDomainRequest object when necessary (making a cross domain request on IE 8 & 9.
     */

    // if request to other domain, and we're on a relevant browser
    var parsedUrl = parseUrl(superagent.url);
    if (parsedUrl.hostname != window.location.hostname &&
        typeof XDomainRequest !== "undefined") { // IE 8 & 9
        // (note another XDomainRequest restriction - calls must always be to the same protocol as the current page.)
        superagent.end = xDomainRequestEnd;
    }

};

module.exports = superagentLegacyIESupportPlugin;

},{}],7:[function(_dereq_,module,exports){
'use strict';

var extend = _dereq_('extend'),
    http = _dereq_('../http');

var DEFAULT_URL = 'https://localback.net:21324';

//
// HTTP transport.
//
var HttpTransport = function (url) {
    url = url || DEFAULT_URL;
    this._url = url;
};

HttpTransport.create = function (url) {
    url = url || DEFAULT_URL;
    console.log('[trezor] Attempting to load HTTP transport at', url);
    return HttpTransport.status(url).then(
        function (info) {
            console.log('[trezor] Loaded HTTP transport', info);
            return new HttpTransport(url);
        },
        function (error) {
            console.warn('[trezor] Failed to load HTTP transport', error);
            throw error;
        }
    );
};

HttpTransport.status = function (url) {
    url = url || DEFAULT_URL;
    return http({
        method: 'GET',
        url: url
    });
};

// @deprecated
HttpTransport.connect = HttpTransport.status;

HttpTransport.prototype._request = function (options) {
    return http(extend(options, {
        url: this._url + options.url
    }));
};

HttpTransport.prototype.configure = function (config) {
    return this._request({
        method: 'POST',
        url: '/configure',
        body: config
    });
};

HttpTransport.prototype.enumerate = function (wait) {
    return this._request({
        method: 'GET',
        url: wait ? '/listen' : '/enumerate'
    });
};

HttpTransport.prototype.acquire = function (device) {
    return this._request({
        method: 'POST',
        url: '/acquire/' + device.path
    });
};

HttpTransport.prototype.release = function (sessionId) {
    return this._request({
        method: 'POST',
        url: '/release/' + sessionId
    });
};

HttpTransport.prototype.call = function (sessionId, type, message) {
    return this._request({
        method: 'POST',
        url: '/call/' + sessionId,
        body: {
            type: type,
            message: message
        }
    });
};

module.exports = HttpTransport;

},{"../http":1,"extend":25}],8:[function(_dereq_,module,exports){
'use strict';

var Promise = _dereq_('promise'),
    plugin_ = _dereq_('../plugin'),
    traverse = _dereq_('traverse');

//
// Plugin transport.
//
var PluginTransport = function (plugin) {
    this._plugin = plugin;
};

// Injects the plugin and returns a PluginTransport.
PluginTransport.create = function () {
    console.log('[trezor] Attempting to load plugin transport');
    return PluginTransport.loadPlugin().then(
        function (plugin) {
            console.log('[trezor] Loaded plugin transport');
            return new PluginTransport(plugin);
        },
        function (error) {
            console.warn('[trezor] Failed to load plugin transport', error);
            throw error;
        }
    );
}

// Injects the plugin object into the document.
PluginTransport.loadPlugin = function () {
    return plugin_.load();
};

// BIP32 CKD derivation of the given index
PluginTransport.prototype.deriveChildNode = function (node, index) {
    var child = this._plugin.deriveChildNode(node, index);

    if (node.path) {
        child.path = node.path.concat([index]);
    }

    return child;
};

// Configures the plugin.
PluginTransport.prototype.configure = function (config) {
    var plugin = this._plugin;

    return new Promise(function (resolve, reject) {
        try {
            plugin.configure(config);
            resolve();
        } catch (e) {
            // In most browsers, exceptions from plugin methods are not properly
            // propagated
            reject(new Error(
                'Plugin configuration found, but could not be used. ' +
                    'Make sure it has proper format and a valid signature.'
            ));
        }
    });
};

// Enumerates connected devices.
// Requires configured plugin.
PluginTransport.prototype.enumerate = function () {
    var plugin = this._plugin;

    return new Promise(function (resolve) {
        resolve(plugin.devices());
    });
};

// Opens a device and returns a session object.
PluginTransport.prototype.acquire = function (device) {
    return Promise.resolve({
        session: device
    });
};

// Releases the device handle.
PluginTransport.prototype.release = function (device) {
    var plugin = this._plugin;

    return new Promise(function (resolve, reject) {
        plugin.close(device, {
            success: resolve,
            error: reject
        });
    });
};

// Does a request-response call to the device.
PluginTransport.prototype.call = function (device, type, message) {
    var plugin = this._plugin,
        timeout = false;

    // BitcoinTrezorPlugin has a bug, causing different treatment of
    // undefined fields in messages. We need to find all undefined fields
    // and remove them from the message object. `traverse` will delete
    // object fields and splice out array items properly.
    traverse(message).forEach(function (value) {
        if (value === undefined) {
            this.remove();
        }
    });

    return new Promise(function (resolve, reject) {
        plugin.call(device, timeout, type, message, {
            success: function (t, m) {
                resolve({
                    type: t,
                    message: m
                });
            },
            error: function (err) {
                reject(new Error(err));
            }
        });
    });
};

module.exports = PluginTransport;

},{"../plugin":4,"promise":27,"traverse":32}],9:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":24}],10:[function(_dereq_,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":11,"ieee754":12}],11:[function(_dereq_,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],12:[function(_dereq_,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],13:[function(_dereq_,module,exports){
(function (global){
/*global window, global*/
var util = _dereq_("util")
var assert = _dereq_("assert")

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = {}
}

var functions = [
    [log, "log"]
    , [info, "info"]
    , [warn, "warn"]
    , [error, "error"]
    , [time, "time"]
    , [timeEnd, "timeEnd"]
    , [trace, "trace"]
    , [dir, "dir"]
    , [assert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = Date.now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    var duration = Date.now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function assert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":9,"util":24}],14:[function(_dereq_,module,exports){
var Buffer = _dereq_('buffer').Buffer;
var intSize = 4;
var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
var chrsz = 8;

function toArray(buf, bigEndian) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize));
    buf = Buffer.concat([buf, zeroBuffer], len);
  }

  var arr = [];
  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
  for (var i = 0; i < buf.length; i += intSize) {
    arr.push(fn.call(buf, i));
  }
  return arr;
}

function toBuffer(arr, size, bigEndian) {
  var buf = new Buffer(size);
  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
  for (var i = 0; i < arr.length; i++) {
    fn.call(buf, arr[i], i * 4, true);
  }
  return buf;
}

function hash(buf, fn, hashSize, bigEndian) {
  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
  return toBuffer(arr, hashSize, bigEndian);
}

module.exports = { hash: hash };

},{"buffer":10}],15:[function(_dereq_,module,exports){
var Buffer = _dereq_('buffer').Buffer
var sha = _dereq_('./sha')
var sha256 = _dereq_('./sha256')
var rng = _dereq_('./rng')
var md5 = _dereq_('./md5')

var algorithms = {
  sha1: sha,
  sha256: sha256,
  md5: md5
}

var blocksize = 64
var zeroBuffer = new Buffer(blocksize); zeroBuffer.fill(0)
function hmac(fn, key, data) {
  if(!Buffer.isBuffer(key)) key = new Buffer(key)
  if(!Buffer.isBuffer(data)) data = new Buffer(data)

  if(key.length > blocksize) {
    key = fn(key)
  } else if(key.length < blocksize) {
    key = Buffer.concat([key, zeroBuffer], blocksize)
  }

  var ipad = new Buffer(blocksize), opad = new Buffer(blocksize)
  for(var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  var hash = fn(Buffer.concat([ipad, data]))
  return fn(Buffer.concat([opad, hash]))
}

function hash(alg, key) {
  alg = alg || 'sha1'
  var fn = algorithms[alg]
  var bufs = []
  var length = 0
  if(!fn) error('algorithm:', alg, 'is not yet supported')
  return {
    update: function (data) {
      if(!Buffer.isBuffer(data)) data = new Buffer(data)
        
      bufs.push(data)
      length += data.length
      return this
    },
    digest: function (enc) {
      var buf = Buffer.concat(bufs)
      var r = key ? hmac(fn, key, buf) : fn(buf)
      bufs = null
      return enc ? r.toString(enc) : r
    }
  }
}

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = function (alg) { return hash(alg) }
exports.createHmac = function (alg, key) { return hash(alg, key) }
exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)))
    } catch (err) { callback(err) }
  } else {
    return new Buffer(rng(size))
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createCipher'
, 'createCipheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDiffieHellman'
, 'pbkdf2'], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

},{"./md5":16,"./rng":17,"./sha":18,"./sha256":19,"buffer":10}],16:[function(_dereq_,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var helpers = _dereq_('./helpers');

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function md5(buf) {
  return helpers.hash(buf, core_md5, 16);
};

},{"./helpers":14}],17:[function(_dereq_,module,exports){
// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
(function() {
  var _global = this;

  var mathRNG, whatwgRNG;

  // NOTE: Math.random() does not guarantee "cryptographic quality"
  mathRNG = function(size) {
    var bytes = new Array(size);
    var r;

    for (var i = 0, r; i < size; i++) {
      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }

  if (_global.crypto && crypto.getRandomValues) {
    whatwgRNG = function(size) {
      var bytes = new Uint8Array(size);
      crypto.getRandomValues(bytes);
      return bytes;
    }
  }

  module.exports = whatwgRNG || mathRNG;

}())

},{}],18:[function(_dereq_,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var helpers = _dereq_('./helpers');

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function sha1(buf) {
  return helpers.hash(buf, core_sha1, 20, true);
};

},{"./helpers":14}],19:[function(_dereq_,module,exports){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var helpers = _dereq_('./helpers');

var safe_add = function(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
};

var S = function(X, n) {
  return (X >>> n) | (X << (32 - n));
};

var R = function(X, n) {
  return (X >>> n);
};

var Ch = function(x, y, z) {
  return ((x & y) ^ ((~x) & z));
};

var Maj = function(x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z));
};

var Sigma0256 = function(x) {
  return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
};

var Sigma1256 = function(x) {
  return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
};

var Gamma0256 = function(x) {
  return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
};

var Gamma1256 = function(x) {
  return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
};

var core_sha256 = function(m, l) {
  var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
  var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
    var W = new Array(64);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;
  /* append padding */
  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;
  for (var i = 0; i < m.length; i += 16) {
    a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
    for (var j = 0; j < 64; j++) {
      if (j < 16) {
        W[j] = m[j + i];
      } else {
        W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
      }
      T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
      T2 = safe_add(Sigma0256(a), Maj(a, b, c));
      h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
    }
    HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]);
    HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
  }
  return HASH;
};

module.exports = function sha256(buf) {
  return helpers.hash(buf, core_sha256, 32, true);
};

},{"./helpers":14}],20:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],21:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],22:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],23:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],24:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("/home/stick/work/trezor/trezor.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":23,"/home/stick/work/trezor/trezor.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":22,"inherits":21}],25:[function(_dereq_,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	"use strict";
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval) {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	"use strict";
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if (typeof target !== "object" && typeof target !== "function" || target == undefined) {
			target = {};
	}

	for (; i < length; ++i) {
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],26:[function(_dereq_,module,exports){
'use strict';

var asap = _dereq_('asap')

module.exports = Promise
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":28}],27:[function(_dereq_,module,exports){
'use strict';

//This file contains then/promise specific extensions to the core promise API

var Promise = _dereq_('./core.js')
var asap = _dereq_('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Object.create(Promise.prototype)

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.from = Promise.cast = function (value) {
  var err = new Error('Promise.from and Promise.cast are deprecated, use Promise.resolve instead')
  err.name = 'Warning'
  console.warn(err.stack)
  return Promise.resolve(value)
}

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    try {
      return fn.apply(this, arguments).nodeify(callback)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback(ex)
        })
      }
    }
  }
}

Promise.all = function () {
  var calledWithArray = arguments.length === 1 && Array.isArray(arguments[0])
  var args = Array.prototype.slice.call(calledWithArray ? arguments[0] : arguments)

  if (!calledWithArray) {
    var err = new Error('Promise.all should be called with a single array, calling it with multiple arguments is deprecated')
    err.name = 'Warning'
    console.warn(err.stack)
  }

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}

Promise.prototype.nodeify = function (callback) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback(null, value)
    })
  }, function (err) {
    asap(function () {
      callback(err)
    })
  })
}

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":26,"asap":28}],28:[function(_dereq_,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,_dereq_("/home/stick/work/trezor/trezor.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/home/stick/work/trezor/trezor.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":22}],29:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Emitter = _dereq_('emitter');
var reduce = _dereq_('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.req.method !='HEAD' 
     ? this.xhr.responseText 
     : null;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self); 
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
    }

    self.callback(err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":30,"reduce":31}],30:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],31:[function(_dereq_,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],32:[function(_dereq_,module,exports){
var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false },
            block : function () { keepGoing = false }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node)
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {}
            ;
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};

},{}],33:[function(_dereq_,module,exports){
(function (root) {
   "use strict";

/***** unorm.js *****/

/*
 * UnicodeNormalizer 1.0.0
 * Copyright (c) 2008 Matsuza
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 * $Date: 2008-06-05 16:44:17 +0200 (Thu, 05 Jun 2008) $
 * $Rev: 13309 $
 */

   var DEFAULT_FEATURE = [null, 0, {}];
   var CACHE_THRESHOLD = 10;
   var SBase = 0xAC00, LBase = 0x1100, VBase = 0x1161, TBase = 0x11A7, LCount = 19, VCount = 21, TCount = 28;
   var NCount = VCount * TCount; // 588
   var SCount = LCount * NCount; // 11172

   var UChar = function(cp, feature){
      this.codepoint = cp;
      this.feature = feature;
   };

   // Strategies
   var cache = {};
   var cacheCounter = [];
   for (var i = 0; i <= 0xFF; ++i){
      cacheCounter[i] = 0;
   }

   function fromCache(next, cp, needFeature){
      var ret = cache[cp];
      if(!ret){
         ret = next(cp, needFeature);
         if(!!ret.feature && ++cacheCounter[(cp >> 8) & 0xFF] > CACHE_THRESHOLD){
            cache[cp] = ret;
         }
      }
      return ret;
   }

   function fromData(next, cp, needFeature){
      var hash = cp & 0xFF00;
      var dunit = UChar.udata[hash] || {};
      var f = dunit[cp];
      return f ? new UChar(cp, f) : new UChar(cp, DEFAULT_FEATURE);
   }
   function fromCpOnly(next, cp, needFeature){
      return !!needFeature ? next(cp, needFeature) : new UChar(cp, null);
   }
   function fromRuleBasedJamo(next, cp, needFeature){
      var j;
      if(cp < LBase || (LBase + LCount <= cp && cp < SBase) || (SBase + SCount < cp)){
         return next(cp, needFeature);
      }
      if(LBase <= cp && cp < LBase + LCount){
         var c = {};
         var base = (cp - LBase) * VCount;
         for (j = 0; j < VCount; ++j){
            c[VBase + j] = SBase + TCount * (j + base);
         }
         return new UChar(cp, [,,c]);
      }

      var SIndex = cp - SBase;
      var TIndex = SIndex % TCount;
      var feature = [];
      if(TIndex !== 0){
         feature[0] = [SBase + SIndex - TIndex, TBase + TIndex];
      } else {
         feature[0] = [LBase + Math.floor(SIndex / NCount), VBase + Math.floor((SIndex % NCount) / TCount)];
         feature[2] = {};
         for (j = 1; j < TCount; ++j){
            feature[2][TBase + j] = cp + j;
         }
      }
      return new UChar(cp, feature);
   }
   function fromCpFilter(next, cp, needFeature){
      return cp < 60 || 13311 < cp && cp < 42607 ? new UChar(cp, DEFAULT_FEATURE) : next(cp, needFeature);
   }

   var strategies = [fromCpFilter, fromCache, fromCpOnly, fromRuleBasedJamo, fromData];

   UChar.fromCharCode = strategies.reduceRight(function (next, strategy) {
      return function (cp, needFeature) {
         return strategy(next, cp, needFeature);
      };
   }, null);

   UChar.isHighSurrogate = function(cp){
      return cp >= 0xD800 && cp <= 0xDBFF;
   };
   UChar.isLowSurrogate = function(cp){
      return cp >= 0xDC00 && cp <= 0xDFFF;
   };

   UChar.prototype.prepFeature = function(){
      if(!this.feature){
         this.feature = UChar.fromCharCode(this.codepoint, true).feature;
      }
   };

   UChar.prototype.toString = function(){
      if(this.codepoint < 0x10000){
         return String.fromCharCode(this.codepoint);
      } else {
         var x = this.codepoint - 0x10000;
         return String.fromCharCode(Math.floor(x / 0x400) + 0xD800, x % 0x400 + 0xDC00);
      }
   };

   UChar.prototype.getDecomp = function(){
      this.prepFeature();
      return this.feature[0] || null;
   };

   UChar.prototype.isCompatibility = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 8));
   };
   UChar.prototype.isExclude = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 9));
   };
   UChar.prototype.getCanonicalClass = function(){
      this.prepFeature();
      return !!this.feature[1] ? (this.feature[1] & 0xff) : 0;
   };
   UChar.prototype.getComposite = function(following){
      this.prepFeature();
      if(!this.feature[2]){
         return null;
      }
      var cp = this.feature[2][following.codepoint];
      return cp ? UChar.fromCharCode(cp) : null;
   };

   var UCharIterator = function(str){
      this.str = str;
      this.cursor = 0;
   };
   UCharIterator.prototype.next = function(){
      if(!!this.str && this.cursor < this.str.length){
         var cp = this.str.charCodeAt(this.cursor++);
         var d;
         if(UChar.isHighSurrogate(cp) && this.cursor < this.str.length && UChar.isLowSurrogate((d = this.str.charCodeAt(this.cursor)))){
            cp = (cp - 0xD800) * 0x400 + (d -0xDC00) + 0x10000;
            ++this.cursor;
         }
         return UChar.fromCharCode(cp);
      } else {
         this.str = null;
         return null;
      }
   };

   var RecursDecompIterator = function(it, cano){
      this.it = it;
      this.canonical = cano;
      this.resBuf = [];
   };

   RecursDecompIterator.prototype.next = function(){
      function recursiveDecomp(cano, uchar){
         var decomp = uchar.getDecomp();
         if(!!decomp && !(cano && uchar.isCompatibility())){
            var ret = [];
            for(var i = 0; i < decomp.length; ++i){
               var a = recursiveDecomp(cano, UChar.fromCharCode(decomp[i]));
               //ret.concat(a); //<-why does not this work?
               //following block is a workaround.
               for(var j = 0; j < a.length; ++j){
                  ret.push(a[j]);
               }
            }
            return ret;
         } else {
            return [uchar];
         }
      }
      if(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            return null;
         }
         this.resBuf = recursiveDecomp(this.canonical, uchar);
      }
      return this.resBuf.shift();
   };

   var DecompIterator = function(it){
      this.it = it;
      this.resBuf = [];
   };

   DecompIterator.prototype.next = function(){
      var cc;
      if(this.resBuf.length === 0){
         do{
            var uchar = this.it.next();
            if(!uchar){
               break;
            }
            cc = uchar.getCanonicalClass();
            var inspt = this.resBuf.length;
            if(cc !== 0){
               for(; inspt > 0; --inspt){
                  var uchar2 = this.resBuf[inspt - 1];
                  var cc2 = uchar2.getCanonicalClass();
                  if(cc2 <= cc){
                     break;
                  }
               }
            }
            this.resBuf.splice(inspt, 0, uchar);
         } while(cc !== 0);
      }
      return this.resBuf.shift();
   };

   var CompIterator = function(it){
      this.it = it;
      this.procBuf = [];
      this.resBuf = [];
      this.lastClass = null;
   };

   CompIterator.prototype.next = function(){
      while(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            this.resBuf = this.procBuf;
            this.procBuf = [];
            break;
         }
         if(this.procBuf.length === 0){
            this.lastClass = uchar.getCanonicalClass();
            this.procBuf.push(uchar);
         } else {
            var starter = this.procBuf[0];
            var composite = starter.getComposite(uchar);
            var cc = uchar.getCanonicalClass();
            if(!!composite && (this.lastClass < cc || this.lastClass === 0)){
               this.procBuf[0] = composite;
            } else {
               if(cc === 0){
                  this.resBuf = this.procBuf;
                  this.procBuf = [];
               }
               this.lastClass = cc;
               this.procBuf.push(uchar);
            }
         }
      }
      return this.resBuf.shift();
   };

   var createIterator = function(mode, str){
      switch(mode){
         case "NFD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true));
         case "NFKD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false));
         case "NFC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true)));
         case "NFKC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false)));
      }
      throw mode + " is invalid";
   };
   var normalize = function(mode, str){
      var it = createIterator(mode, str);
      var ret = "";
      var uchar;
      while(!!(uchar = it.next())){
         ret += uchar.toString();
      }
      return ret;
   };

   /* API functions */
   function nfd(str){
      return normalize("NFD", str);
   }

   function nfkd(str){
      return normalize("NFKD", str);
   }

   function nfc(str){
      return normalize("NFC", str);
   }

   function nfkc(str){
      return normalize("NFKC", str);
   }

/* Unicode data */
UChar.udata={
0:{60:[,,{824:8814}],61:[,,{824:8800}],62:[,,{824:8815}],65:[,,{768:192,769:193,770:194,771:195,772:256,774:258,775:550,776:196,777:7842,778:197,780:461,783:512,785:514,803:7840,805:7680,808:260}],66:[,,{775:7682,803:7684,817:7686}],67:[,,{769:262,770:264,775:266,780:268,807:199}],68:[,,{775:7690,780:270,803:7692,807:7696,813:7698,817:7694}],69:[,,{768:200,769:201,770:202,771:7868,772:274,774:276,775:278,776:203,777:7866,780:282,783:516,785:518,803:7864,807:552,808:280,813:7704,816:7706}],70:[,,{775:7710}],71:[,,{769:500,770:284,772:7712,774:286,775:288,780:486,807:290}],72:[,,{770:292,775:7714,776:7718,780:542,803:7716,807:7720,814:7722}],73:[,,{768:204,769:205,770:206,771:296,772:298,774:300,775:304,776:207,777:7880,780:463,783:520,785:522,803:7882,808:302,816:7724}],74:[,,{770:308}],75:[,,{769:7728,780:488,803:7730,807:310,817:7732}],76:[,,{769:313,780:317,803:7734,807:315,813:7740,817:7738}],77:[,,{769:7742,775:7744,803:7746}],78:[,,{768:504,769:323,771:209,775:7748,780:327,803:7750,807:325,813:7754,817:7752}],79:[,,{768:210,769:211,770:212,771:213,772:332,774:334,775:558,776:214,777:7886,779:336,780:465,783:524,785:526,795:416,803:7884,808:490}],80:[,,{769:7764,775:7766}],82:[,,{769:340,775:7768,780:344,783:528,785:530,803:7770,807:342,817:7774}],83:[,,{769:346,770:348,775:7776,780:352,803:7778,806:536,807:350}],84:[,,{775:7786,780:356,803:7788,806:538,807:354,813:7792,817:7790}],85:[,,{768:217,769:218,770:219,771:360,772:362,774:364,776:220,777:7910,778:366,779:368,780:467,783:532,785:534,795:431,803:7908,804:7794,808:370,813:7798,816:7796}],86:[,,{771:7804,803:7806}],87:[,,{768:7808,769:7810,770:372,775:7814,776:7812,803:7816}],88:[,,{775:7818,776:7820}],89:[,,{768:7922,769:221,770:374,771:7928,772:562,775:7822,776:376,777:7926,803:7924}],90:[,,{769:377,770:7824,775:379,780:381,803:7826,817:7828}],97:[,,{768:224,769:225,770:226,771:227,772:257,774:259,775:551,776:228,777:7843,778:229,780:462,783:513,785:515,803:7841,805:7681,808:261}],98:[,,{775:7683,803:7685,817:7687}],99:[,,{769:263,770:265,775:267,780:269,807:231}],100:[,,{775:7691,780:271,803:7693,807:7697,813:7699,817:7695}],101:[,,{768:232,769:233,770:234,771:7869,772:275,774:277,775:279,776:235,777:7867,780:283,783:517,785:519,803:7865,807:553,808:281,813:7705,816:7707}],102:[,,{775:7711}],103:[,,{769:501,770:285,772:7713,774:287,775:289,780:487,807:291}],104:[,,{770:293,775:7715,776:7719,780:543,803:7717,807:7721,814:7723,817:7830}],105:[,,{768:236,769:237,770:238,771:297,772:299,774:301,776:239,777:7881,780:464,783:521,785:523,803:7883,808:303,816:7725}],106:[,,{770:309,780:496}],107:[,,{769:7729,780:489,803:7731,807:311,817:7733}],108:[,,{769:314,780:318,803:7735,807:316,813:7741,817:7739}],109:[,,{769:7743,775:7745,803:7747}],110:[,,{768:505,769:324,771:241,775:7749,780:328,803:7751,807:326,813:7755,817:7753}],111:[,,{768:242,769:243,770:244,771:245,772:333,774:335,775:559,776:246,777:7887,779:337,780:466,783:525,785:527,795:417,803:7885,808:491}],112:[,,{769:7765,775:7767}],114:[,,{769:341,775:7769,780:345,783:529,785:531,803:7771,807:343,817:7775}],115:[,,{769:347,770:349,775:7777,780:353,803:7779,806:537,807:351}],116:[,,{775:7787,776:7831,780:357,803:7789,806:539,807:355,813:7793,817:7791}],117:[,,{768:249,769:250,770:251,771:361,772:363,774:365,776:252,777:7911,778:367,779:369,780:468,783:533,785:535,795:432,803:7909,804:7795,808:371,813:7799,816:7797}],118:[,,{771:7805,803:7807}],119:[,,{768:7809,769:7811,770:373,775:7815,776:7813,778:7832,803:7817}],120:[,,{775:7819,776:7821}],121:[,,{768:7923,769:253,770:375,771:7929,772:563,775:7823,776:255,777:7927,778:7833,803:7925}],122:[,,{769:378,770:7825,775:380,780:382,803:7827,817:7829}],160:[[32],256],168:[[32,776],256,{768:8173,769:901,834:8129}],170:[[97],256],175:[[32,772],256],178:[[50],256],179:[[51],256],180:[[32,769],256],181:[[956],256],184:[[32,807],256],185:[[49],256],186:[[111],256],188:[[49,8260,52],256],189:[[49,8260,50],256],190:[[51,8260,52],256],192:[[65,768]],193:[[65,769]],194:[[65,770],,{768:7846,769:7844,771:7850,777:7848}],195:[[65,771]],196:[[65,776],,{772:478}],197:[[65,778],,{769:506}],198:[,,{769:508,772:482}],199:[[67,807],,{769:7688}],200:[[69,768]],201:[[69,769]],202:[[69,770],,{768:7872,769:7870,771:7876,777:7874}],203:[[69,776]],204:[[73,768]],205:[[73,769]],206:[[73,770]],207:[[73,776],,{769:7726}],209:[[78,771]],210:[[79,768]],211:[[79,769]],212:[[79,770],,{768:7890,769:7888,771:7894,777:7892}],213:[[79,771],,{769:7756,772:556,776:7758}],214:[[79,776],,{772:554}],216:[,,{769:510}],217:[[85,768]],218:[[85,769]],219:[[85,770]],220:[[85,776],,{768:475,769:471,772:469,780:473}],221:[[89,769]],224:[[97,768]],225:[[97,769]],226:[[97,770],,{768:7847,769:7845,771:7851,777:7849}],227:[[97,771]],228:[[97,776],,{772:479}],229:[[97,778],,{769:507}],230:[,,{769:509,772:483}],231:[[99,807],,{769:7689}],232:[[101,768]],233:[[101,769]],234:[[101,770],,{768:7873,769:7871,771:7877,777:7875}],235:[[101,776]],236:[[105,768]],237:[[105,769]],238:[[105,770]],239:[[105,776],,{769:7727}],241:[[110,771]],242:[[111,768]],243:[[111,769]],244:[[111,770],,{768:7891,769:7889,771:7895,777:7893}],245:[[111,771],,{769:7757,772:557,776:7759}],246:[[111,776],,{772:555}],248:[,,{769:511}],249:[[117,768]],250:[[117,769]],251:[[117,770]],252:[[117,776],,{768:476,769:472,772:470,780:474}],253:[[121,769]],255:[[121,776]]},
256:{256:[[65,772]],257:[[97,772]],258:[[65,774],,{768:7856,769:7854,771:7860,777:7858}],259:[[97,774],,{768:7857,769:7855,771:7861,777:7859}],260:[[65,808]],261:[[97,808]],262:[[67,769]],263:[[99,769]],264:[[67,770]],265:[[99,770]],266:[[67,775]],267:[[99,775]],268:[[67,780]],269:[[99,780]],270:[[68,780]],271:[[100,780]],274:[[69,772],,{768:7700,769:7702}],275:[[101,772],,{768:7701,769:7703}],276:[[69,774]],277:[[101,774]],278:[[69,775]],279:[[101,775]],280:[[69,808]],281:[[101,808]],282:[[69,780]],283:[[101,780]],284:[[71,770]],285:[[103,770]],286:[[71,774]],287:[[103,774]],288:[[71,775]],289:[[103,775]],290:[[71,807]],291:[[103,807]],292:[[72,770]],293:[[104,770]],296:[[73,771]],297:[[105,771]],298:[[73,772]],299:[[105,772]],300:[[73,774]],301:[[105,774]],302:[[73,808]],303:[[105,808]],304:[[73,775]],306:[[73,74],256],307:[[105,106],256],308:[[74,770]],309:[[106,770]],310:[[75,807]],311:[[107,807]],313:[[76,769]],314:[[108,769]],315:[[76,807]],316:[[108,807]],317:[[76,780]],318:[[108,780]],319:[[76,183],256],320:[[108,183],256],323:[[78,769]],324:[[110,769]],325:[[78,807]],326:[[110,807]],327:[[78,780]],328:[[110,780]],329:[[700,110],256],332:[[79,772],,{768:7760,769:7762}],333:[[111,772],,{768:7761,769:7763}],334:[[79,774]],335:[[111,774]],336:[[79,779]],337:[[111,779]],340:[[82,769]],341:[[114,769]],342:[[82,807]],343:[[114,807]],344:[[82,780]],345:[[114,780]],346:[[83,769],,{775:7780}],347:[[115,769],,{775:7781}],348:[[83,770]],349:[[115,770]],350:[[83,807]],351:[[115,807]],352:[[83,780],,{775:7782}],353:[[115,780],,{775:7783}],354:[[84,807]],355:[[116,807]],356:[[84,780]],357:[[116,780]],360:[[85,771],,{769:7800}],361:[[117,771],,{769:7801}],362:[[85,772],,{776:7802}],363:[[117,772],,{776:7803}],364:[[85,774]],365:[[117,774]],366:[[85,778]],367:[[117,778]],368:[[85,779]],369:[[117,779]],370:[[85,808]],371:[[117,808]],372:[[87,770]],373:[[119,770]],374:[[89,770]],375:[[121,770]],376:[[89,776]],377:[[90,769]],378:[[122,769]],379:[[90,775]],380:[[122,775]],381:[[90,780]],382:[[122,780]],383:[[115],256,{775:7835}],416:[[79,795],,{768:7900,769:7898,771:7904,777:7902,803:7906}],417:[[111,795],,{768:7901,769:7899,771:7905,777:7903,803:7907}],431:[[85,795],,{768:7914,769:7912,771:7918,777:7916,803:7920}],432:[[117,795],,{768:7915,769:7913,771:7919,777:7917,803:7921}],439:[,,{780:494}],452:[[68,381],256],453:[[68,382],256],454:[[100,382],256],455:[[76,74],256],456:[[76,106],256],457:[[108,106],256],458:[[78,74],256],459:[[78,106],256],460:[[110,106],256],461:[[65,780]],462:[[97,780]],463:[[73,780]],464:[[105,780]],465:[[79,780]],466:[[111,780]],467:[[85,780]],468:[[117,780]],469:[[220,772]],470:[[252,772]],471:[[220,769]],472:[[252,769]],473:[[220,780]],474:[[252,780]],475:[[220,768]],476:[[252,768]],478:[[196,772]],479:[[228,772]],480:[[550,772]],481:[[551,772]],482:[[198,772]],483:[[230,772]],486:[[71,780]],487:[[103,780]],488:[[75,780]],489:[[107,780]],490:[[79,808],,{772:492}],491:[[111,808],,{772:493}],492:[[490,772]],493:[[491,772]],494:[[439,780]],495:[[658,780]],496:[[106,780]],497:[[68,90],256],498:[[68,122],256],499:[[100,122],256],500:[[71,769]],501:[[103,769]],504:[[78,768]],505:[[110,768]],506:[[197,769]],507:[[229,769]],508:[[198,769]],509:[[230,769]],510:[[216,769]],511:[[248,769]],66045:[,220]},
512:{512:[[65,783]],513:[[97,783]],514:[[65,785]],515:[[97,785]],516:[[69,783]],517:[[101,783]],518:[[69,785]],519:[[101,785]],520:[[73,783]],521:[[105,783]],522:[[73,785]],523:[[105,785]],524:[[79,783]],525:[[111,783]],526:[[79,785]],527:[[111,785]],528:[[82,783]],529:[[114,783]],530:[[82,785]],531:[[114,785]],532:[[85,783]],533:[[117,783]],534:[[85,785]],535:[[117,785]],536:[[83,806]],537:[[115,806]],538:[[84,806]],539:[[116,806]],542:[[72,780]],543:[[104,780]],550:[[65,775],,{772:480}],551:[[97,775],,{772:481}],552:[[69,807],,{774:7708}],553:[[101,807],,{774:7709}],554:[[214,772]],555:[[246,772]],556:[[213,772]],557:[[245,772]],558:[[79,775],,{772:560}],559:[[111,775],,{772:561}],560:[[558,772]],561:[[559,772]],562:[[89,772]],563:[[121,772]],658:[,,{780:495}],688:[[104],256],689:[[614],256],690:[[106],256],691:[[114],256],692:[[633],256],693:[[635],256],694:[[641],256],695:[[119],256],696:[[121],256],728:[[32,774],256],729:[[32,775],256],730:[[32,778],256],731:[[32,808],256],732:[[32,771],256],733:[[32,779],256],736:[[611],256],737:[[108],256],738:[[115],256],739:[[120],256],740:[[661],256]},
768:{768:[,230],769:[,230],770:[,230],771:[,230],772:[,230],773:[,230],774:[,230],775:[,230],776:[,230,{769:836}],777:[,230],778:[,230],779:[,230],780:[,230],781:[,230],782:[,230],783:[,230],784:[,230],785:[,230],786:[,230],787:[,230],788:[,230],789:[,232],790:[,220],791:[,220],792:[,220],793:[,220],794:[,232],795:[,216],796:[,220],797:[,220],798:[,220],799:[,220],800:[,220],801:[,202],802:[,202],803:[,220],804:[,220],805:[,220],806:[,220],807:[,202],808:[,202],809:[,220],810:[,220],811:[,220],812:[,220],813:[,220],814:[,220],815:[,220],816:[,220],817:[,220],818:[,220],819:[,220],820:[,1],821:[,1],822:[,1],823:[,1],824:[,1],825:[,220],826:[,220],827:[,220],828:[,220],829:[,230],830:[,230],831:[,230],832:[[768],230],833:[[769],230],834:[,230],835:[[787],230],836:[[776,769],230],837:[,240],838:[,230],839:[,220],840:[,220],841:[,220],842:[,230],843:[,230],844:[,230],845:[,220],846:[,220],848:[,230],849:[,230],850:[,230],851:[,220],852:[,220],853:[,220],854:[,220],855:[,230],856:[,232],857:[,220],858:[,220],859:[,230],860:[,233],861:[,234],862:[,234],863:[,233],864:[,234],865:[,234],866:[,233],867:[,230],868:[,230],869:[,230],870:[,230],871:[,230],872:[,230],873:[,230],874:[,230],875:[,230],876:[,230],877:[,230],878:[,230],879:[,230],884:[[697]],890:[[32,837],256],894:[[59]],900:[[32,769],256],901:[[168,769]],902:[[913,769]],903:[[183]],904:[[917,769]],905:[[919,769]],906:[[921,769]],908:[[927,769]],910:[[933,769]],911:[[937,769]],912:[[970,769]],913:[,,{768:8122,769:902,772:8121,774:8120,787:7944,788:7945,837:8124}],917:[,,{768:8136,769:904,787:7960,788:7961}],919:[,,{768:8138,769:905,787:7976,788:7977,837:8140}],921:[,,{768:8154,769:906,772:8153,774:8152,776:938,787:7992,788:7993}],927:[,,{768:8184,769:908,787:8008,788:8009}],929:[,,{788:8172}],933:[,,{768:8170,769:910,772:8169,774:8168,776:939,788:8025}],937:[,,{768:8186,769:911,787:8040,788:8041,837:8188}],938:[[921,776]],939:[[933,776]],940:[[945,769],,{837:8116}],941:[[949,769]],942:[[951,769],,{837:8132}],943:[[953,769]],944:[[971,769]],945:[,,{768:8048,769:940,772:8113,774:8112,787:7936,788:7937,834:8118,837:8115}],949:[,,{768:8050,769:941,787:7952,788:7953}],951:[,,{768:8052,769:942,787:7968,788:7969,834:8134,837:8131}],953:[,,{768:8054,769:943,772:8145,774:8144,776:970,787:7984,788:7985,834:8150}],959:[,,{768:8056,769:972,787:8000,788:8001}],961:[,,{787:8164,788:8165}],965:[,,{768:8058,769:973,772:8161,774:8160,776:971,787:8016,788:8017,834:8166}],969:[,,{768:8060,769:974,787:8032,788:8033,834:8182,837:8179}],970:[[953,776],,{768:8146,769:912,834:8151}],971:[[965,776],,{768:8162,769:944,834:8167}],972:[[959,769]],973:[[965,769]],974:[[969,769],,{837:8180}],976:[[946],256],977:[[952],256],978:[[933],256,{769:979,776:980}],979:[[978,769]],980:[[978,776]],981:[[966],256],982:[[960],256],1008:[[954],256],1009:[[961],256],1010:[[962],256],1012:[[920],256],1013:[[949],256],1017:[[931],256]},
1024:{1024:[[1045,768]],1025:[[1045,776]],1027:[[1043,769]],1030:[,,{776:1031}],1031:[[1030,776]],1036:[[1050,769]],1037:[[1048,768]],1038:[[1059,774]],1040:[,,{774:1232,776:1234}],1043:[,,{769:1027}],1045:[,,{768:1024,774:1238,776:1025}],1046:[,,{774:1217,776:1244}],1047:[,,{776:1246}],1048:[,,{768:1037,772:1250,774:1049,776:1252}],1049:[[1048,774]],1050:[,,{769:1036}],1054:[,,{776:1254}],1059:[,,{772:1262,774:1038,776:1264,779:1266}],1063:[,,{776:1268}],1067:[,,{776:1272}],1069:[,,{776:1260}],1072:[,,{774:1233,776:1235}],1075:[,,{769:1107}],1077:[,,{768:1104,774:1239,776:1105}],1078:[,,{774:1218,776:1245}],1079:[,,{776:1247}],1080:[,,{768:1117,772:1251,774:1081,776:1253}],1081:[[1080,774]],1082:[,,{769:1116}],1086:[,,{776:1255}],1091:[,,{772:1263,774:1118,776:1265,779:1267}],1095:[,,{776:1269}],1099:[,,{776:1273}],1101:[,,{776:1261}],1104:[[1077,768]],1105:[[1077,776]],1107:[[1075,769]],1110:[,,{776:1111}],1111:[[1110,776]],1116:[[1082,769]],1117:[[1080,768]],1118:[[1091,774]],1140:[,,{783:1142}],1141:[,,{783:1143}],1142:[[1140,783]],1143:[[1141,783]],1155:[,230],1156:[,230],1157:[,230],1158:[,230],1159:[,230],1217:[[1046,774]],1218:[[1078,774]],1232:[[1040,774]],1233:[[1072,774]],1234:[[1040,776]],1235:[[1072,776]],1238:[[1045,774]],1239:[[1077,774]],1240:[,,{776:1242}],1241:[,,{776:1243}],1242:[[1240,776]],1243:[[1241,776]],1244:[[1046,776]],1245:[[1078,776]],1246:[[1047,776]],1247:[[1079,776]],1250:[[1048,772]],1251:[[1080,772]],1252:[[1048,776]],1253:[[1080,776]],1254:[[1054,776]],1255:[[1086,776]],1256:[,,{776:1258}],1257:[,,{776:1259}],1258:[[1256,776]],1259:[[1257,776]],1260:[[1069,776]],1261:[[1101,776]],1262:[[1059,772]],1263:[[1091,772]],1264:[[1059,776]],1265:[[1091,776]],1266:[[1059,779]],1267:[[1091,779]],1268:[[1063,776]],1269:[[1095,776]],1272:[[1067,776]],1273:[[1099,776]]},
1280:{1415:[[1381,1410],256],1425:[,220],1426:[,230],1427:[,230],1428:[,230],1429:[,230],1430:[,220],1431:[,230],1432:[,230],1433:[,230],1434:[,222],1435:[,220],1436:[,230],1437:[,230],1438:[,230],1439:[,230],1440:[,230],1441:[,230],1442:[,220],1443:[,220],1444:[,220],1445:[,220],1446:[,220],1447:[,220],1448:[,230],1449:[,230],1450:[,220],1451:[,230],1452:[,230],1453:[,222],1454:[,228],1455:[,230],1456:[,10],1457:[,11],1458:[,12],1459:[,13],1460:[,14],1461:[,15],1462:[,16],1463:[,17],1464:[,18],1465:[,19],1466:[,19],1467:[,20],1468:[,21],1469:[,22],1471:[,23],1473:[,24],1474:[,25],1476:[,230],1477:[,220],1479:[,18]},
1536:{1552:[,230],1553:[,230],1554:[,230],1555:[,230],1556:[,230],1557:[,230],1558:[,230],1559:[,230],1560:[,30],1561:[,31],1562:[,32],1570:[[1575,1619]],1571:[[1575,1620]],1572:[[1608,1620]],1573:[[1575,1621]],1574:[[1610,1620]],1575:[,,{1619:1570,1620:1571,1621:1573}],1608:[,,{1620:1572}],1610:[,,{1620:1574}],1611:[,27],1612:[,28],1613:[,29],1614:[,30],1615:[,31],1616:[,32],1617:[,33],1618:[,34],1619:[,230],1620:[,230],1621:[,220],1622:[,220],1623:[,230],1624:[,230],1625:[,230],1626:[,230],1627:[,230],1628:[,220],1629:[,230],1630:[,230],1631:[,220],1648:[,35],1653:[[1575,1652],256],1654:[[1608,1652],256],1655:[[1735,1652],256],1656:[[1610,1652],256],1728:[[1749,1620]],1729:[,,{1620:1730}],1730:[[1729,1620]],1746:[,,{1620:1747}],1747:[[1746,1620]],1749:[,,{1620:1728}],1750:[,230],1751:[,230],1752:[,230],1753:[,230],1754:[,230],1755:[,230],1756:[,230],1759:[,230],1760:[,230],1761:[,230],1762:[,230],1763:[,220],1764:[,230],1767:[,230],1768:[,230],1770:[,220],1771:[,230],1772:[,230],1773:[,220]},
1792:{1809:[,36],1840:[,230],1841:[,220],1842:[,230],1843:[,230],1844:[,220],1845:[,230],1846:[,230],1847:[,220],1848:[,220],1849:[,220],1850:[,230],1851:[,220],1852:[,220],1853:[,230],1854:[,220],1855:[,230],1856:[,230],1857:[,230],1858:[,220],1859:[,230],1860:[,220],1861:[,230],1862:[,220],1863:[,230],1864:[,220],1865:[,230],1866:[,230],2027:[,230],2028:[,230],2029:[,230],2030:[,230],2031:[,230],2032:[,230],2033:[,230],2034:[,220],2035:[,230]},
2048:{2070:[,230],2071:[,230],2072:[,230],2073:[,230],2075:[,230],2076:[,230],2077:[,230],2078:[,230],2079:[,230],2080:[,230],2081:[,230],2082:[,230],2083:[,230],2085:[,230],2086:[,230],2087:[,230],2089:[,230],2090:[,230],2091:[,230],2092:[,230],2093:[,230],2137:[,220],2138:[,220],2139:[,220],2276:[,230],2277:[,230],2278:[,220],2279:[,230],2280:[,230],2281:[,220],2282:[,230],2283:[,230],2284:[,230],2285:[,220],2286:[,220],2287:[,220],2288:[,27],2289:[,28],2290:[,29],2291:[,230],2292:[,230],2293:[,230],2294:[,220],2295:[,230],2296:[,230],2297:[,220],2298:[,220],2299:[,230],2300:[,230],2301:[,230],2302:[,230]},
2304:{2344:[,,{2364:2345}],2345:[[2344,2364]],2352:[,,{2364:2353}],2353:[[2352,2364]],2355:[,,{2364:2356}],2356:[[2355,2364]],2364:[,7],2381:[,9],2385:[,230],2386:[,220],2387:[,230],2388:[,230],2392:[[2325,2364],512],2393:[[2326,2364],512],2394:[[2327,2364],512],2395:[[2332,2364],512],2396:[[2337,2364],512],2397:[[2338,2364],512],2398:[[2347,2364],512],2399:[[2351,2364],512],2492:[,7],2503:[,,{2494:2507,2519:2508}],2507:[[2503,2494]],2508:[[2503,2519]],2509:[,9],2524:[[2465,2492],512],2525:[[2466,2492],512],2527:[[2479,2492],512]},
2560:{2611:[[2610,2620],512],2614:[[2616,2620],512],2620:[,7],2637:[,9],2649:[[2582,2620],512],2650:[[2583,2620],512],2651:[[2588,2620],512],2654:[[2603,2620],512],2748:[,7],2765:[,9],68109:[,220],68111:[,230],68152:[,230],68153:[,1],68154:[,220],68159:[,9]},
2816:{2876:[,7],2887:[,,{2878:2891,2902:2888,2903:2892}],2888:[[2887,2902]],2891:[[2887,2878]],2892:[[2887,2903]],2893:[,9],2908:[[2849,2876],512],2909:[[2850,2876],512],2962:[,,{3031:2964}],2964:[[2962,3031]],3014:[,,{3006:3018,3031:3020}],3015:[,,{3006:3019}],3018:[[3014,3006]],3019:[[3015,3006]],3020:[[3014,3031]],3021:[,9]},
3072:{3142:[,,{3158:3144}],3144:[[3142,3158]],3149:[,9],3157:[,84],3158:[,91],3260:[,7],3263:[,,{3285:3264}],3264:[[3263,3285]],3270:[,,{3266:3274,3285:3271,3286:3272}],3271:[[3270,3285]],3272:[[3270,3286]],3274:[[3270,3266],,{3285:3275}],3275:[[3274,3285]],3277:[,9]},
3328:{3398:[,,{3390:3402,3415:3404}],3399:[,,{3390:3403}],3402:[[3398,3390]],3403:[[3399,3390]],3404:[[3398,3415]],3405:[,9],3530:[,9],3545:[,,{3530:3546,3535:3548,3551:3550}],3546:[[3545,3530]],3548:[[3545,3535],,{3530:3549}],3549:[[3548,3530]],3550:[[3545,3551]]},
3584:{3635:[[3661,3634],256],3640:[,103],3641:[,103],3642:[,9],3656:[,107],3657:[,107],3658:[,107],3659:[,107],3763:[[3789,3762],256],3768:[,118],3769:[,118],3784:[,122],3785:[,122],3786:[,122],3787:[,122],3804:[[3755,3737],256],3805:[[3755,3745],256]},
3840:{3852:[[3851],256],3864:[,220],3865:[,220],3893:[,220],3895:[,220],3897:[,216],3907:[[3906,4023],512],3917:[[3916,4023],512],3922:[[3921,4023],512],3927:[[3926,4023],512],3932:[[3931,4023],512],3945:[[3904,4021],512],3953:[,129],3954:[,130],3955:[[3953,3954],512],3956:[,132],3957:[[3953,3956],512],3958:[[4018,3968],512],3959:[[4018,3969],256],3960:[[4019,3968],512],3961:[[4019,3969],256],3962:[,130],3963:[,130],3964:[,130],3965:[,130],3968:[,130],3969:[[3953,3968],512],3970:[,230],3971:[,230],3972:[,9],3974:[,230],3975:[,230],3987:[[3986,4023],512],3997:[[3996,4023],512],4002:[[4001,4023],512],4007:[[4006,4023],512],4012:[[4011,4023],512],4025:[[3984,4021],512],4038:[,220]},
4096:{4133:[,,{4142:4134}],4134:[[4133,4142]],4151:[,7],4153:[,9],4154:[,9],4237:[,220],4348:[[4316],256],69702:[,9],69785:[,,{69818:69786}],69786:[[69785,69818]],69787:[,,{69818:69788}],69788:[[69787,69818]],69797:[,,{69818:69803}],69803:[[69797,69818]],69817:[,9],69818:[,7]},
4352:{69888:[,230],69889:[,230],69890:[,230],69934:[[69937,69927]],69935:[[69938,69927]],69937:[,,{69927:69934}],69938:[,,{69927:69935}],69939:[,9],69940:[,9],70080:[,9]},
4864:{4957:[,230],4958:[,230],4959:[,230]},
5632:{71350:[,9],71351:[,7]},
5888:{5908:[,9],5940:[,9],6098:[,9],6109:[,230]},
6144:{6313:[,228]},
6400:{6457:[,222],6458:[,230],6459:[,220]},
6656:{6679:[,230],6680:[,220],6752:[,9],6773:[,230],6774:[,230],6775:[,230],6776:[,230],6777:[,230],6778:[,230],6779:[,230],6780:[,230],6783:[,220]},
6912:{6917:[,,{6965:6918}],6918:[[6917,6965]],6919:[,,{6965:6920}],6920:[[6919,6965]],6921:[,,{6965:6922}],6922:[[6921,6965]],6923:[,,{6965:6924}],6924:[[6923,6965]],6925:[,,{6965:6926}],6926:[[6925,6965]],6929:[,,{6965:6930}],6930:[[6929,6965]],6964:[,7],6970:[,,{6965:6971}],6971:[[6970,6965]],6972:[,,{6965:6973}],6973:[[6972,6965]],6974:[,,{6965:6976}],6975:[,,{6965:6977}],6976:[[6974,6965]],6977:[[6975,6965]],6978:[,,{6965:6979}],6979:[[6978,6965]],6980:[,9],7019:[,230],7020:[,220],7021:[,230],7022:[,230],7023:[,230],7024:[,230],7025:[,230],7026:[,230],7027:[,230],7082:[,9],7083:[,9],7142:[,7],7154:[,9],7155:[,9]},
7168:{7223:[,7],7376:[,230],7377:[,230],7378:[,230],7380:[,1],7381:[,220],7382:[,220],7383:[,220],7384:[,220],7385:[,220],7386:[,230],7387:[,230],7388:[,220],7389:[,220],7390:[,220],7391:[,220],7392:[,230],7394:[,1],7395:[,1],7396:[,1],7397:[,1],7398:[,1],7399:[,1],7400:[,1],7405:[,220],7412:[,230]},
7424:{7468:[[65],256],7469:[[198],256],7470:[[66],256],7472:[[68],256],7473:[[69],256],7474:[[398],256],7475:[[71],256],7476:[[72],256],7477:[[73],256],7478:[[74],256],7479:[[75],256],7480:[[76],256],7481:[[77],256],7482:[[78],256],7484:[[79],256],7485:[[546],256],7486:[[80],256],7487:[[82],256],7488:[[84],256],7489:[[85],256],7490:[[87],256],7491:[[97],256],7492:[[592],256],7493:[[593],256],7494:[[7426],256],7495:[[98],256],7496:[[100],256],7497:[[101],256],7498:[[601],256],7499:[[603],256],7500:[[604],256],7501:[[103],256],7503:[[107],256],7504:[[109],256],7505:[[331],256],7506:[[111],256],7507:[[596],256],7508:[[7446],256],7509:[[7447],256],7510:[[112],256],7511:[[116],256],7512:[[117],256],7513:[[7453],256],7514:[[623],256],7515:[[118],256],7516:[[7461],256],7517:[[946],256],7518:[[947],256],7519:[[948],256],7520:[[966],256],7521:[[967],256],7522:[[105],256],7523:[[114],256],7524:[[117],256],7525:[[118],256],7526:[[946],256],7527:[[947],256],7528:[[961],256],7529:[[966],256],7530:[[967],256],7544:[[1085],256],7579:[[594],256],7580:[[99],256],7581:[[597],256],7582:[[240],256],7583:[[604],256],7584:[[102],256],7585:[[607],256],7586:[[609],256],7587:[[613],256],7588:[[616],256],7589:[[617],256],7590:[[618],256],7591:[[7547],256],7592:[[669],256],7593:[[621],256],7594:[[7557],256],7595:[[671],256],7596:[[625],256],7597:[[624],256],7598:[[626],256],7599:[[627],256],7600:[[628],256],7601:[[629],256],7602:[[632],256],7603:[[642],256],7604:[[643],256],7605:[[427],256],7606:[[649],256],7607:[[650],256],7608:[[7452],256],7609:[[651],256],7610:[[652],256],7611:[[122],256],7612:[[656],256],7613:[[657],256],7614:[[658],256],7615:[[952],256],7616:[,230],7617:[,230],7618:[,220],7619:[,230],7620:[,230],7621:[,230],7622:[,230],7623:[,230],7624:[,230],7625:[,230],7626:[,220],7627:[,230],7628:[,230],7629:[,234],7630:[,214],7631:[,220],7632:[,202],7633:[,230],7634:[,230],7635:[,230],7636:[,230],7637:[,230],7638:[,230],7639:[,230],7640:[,230],7641:[,230],7642:[,230],7643:[,230],7644:[,230],7645:[,230],7646:[,230],7647:[,230],7648:[,230],7649:[,230],7650:[,230],7651:[,230],7652:[,230],7653:[,230],7654:[,230],7676:[,233],7677:[,220],7678:[,230],7679:[,220]},
7680:{7680:[[65,805]],7681:[[97,805]],7682:[[66,775]],7683:[[98,775]],7684:[[66,803]],7685:[[98,803]],7686:[[66,817]],7687:[[98,817]],7688:[[199,769]],7689:[[231,769]],7690:[[68,775]],7691:[[100,775]],7692:[[68,803]],7693:[[100,803]],7694:[[68,817]],7695:[[100,817]],7696:[[68,807]],7697:[[100,807]],7698:[[68,813]],7699:[[100,813]],7700:[[274,768]],7701:[[275,768]],7702:[[274,769]],7703:[[275,769]],7704:[[69,813]],7705:[[101,813]],7706:[[69,816]],7707:[[101,816]],7708:[[552,774]],7709:[[553,774]],7710:[[70,775]],7711:[[102,775]],7712:[[71,772]],7713:[[103,772]],7714:[[72,775]],7715:[[104,775]],7716:[[72,803]],7717:[[104,803]],7718:[[72,776]],7719:[[104,776]],7720:[[72,807]],7721:[[104,807]],7722:[[72,814]],7723:[[104,814]],7724:[[73,816]],7725:[[105,816]],7726:[[207,769]],7727:[[239,769]],7728:[[75,769]],7729:[[107,769]],7730:[[75,803]],7731:[[107,803]],7732:[[75,817]],7733:[[107,817]],7734:[[76,803],,{772:7736}],7735:[[108,803],,{772:7737}],7736:[[7734,772]],7737:[[7735,772]],7738:[[76,817]],7739:[[108,817]],7740:[[76,813]],7741:[[108,813]],7742:[[77,769]],7743:[[109,769]],7744:[[77,775]],7745:[[109,775]],7746:[[77,803]],7747:[[109,803]],7748:[[78,775]],7749:[[110,775]],7750:[[78,803]],7751:[[110,803]],7752:[[78,817]],7753:[[110,817]],7754:[[78,813]],7755:[[110,813]],7756:[[213,769]],7757:[[245,769]],7758:[[213,776]],7759:[[245,776]],7760:[[332,768]],7761:[[333,768]],7762:[[332,769]],7763:[[333,769]],7764:[[80,769]],7765:[[112,769]],7766:[[80,775]],7767:[[112,775]],7768:[[82,775]],7769:[[114,775]],7770:[[82,803],,{772:7772}],7771:[[114,803],,{772:7773}],7772:[[7770,772]],7773:[[7771,772]],7774:[[82,817]],7775:[[114,817]],7776:[[83,775]],7777:[[115,775]],7778:[[83,803],,{775:7784}],7779:[[115,803],,{775:7785}],7780:[[346,775]],7781:[[347,775]],7782:[[352,775]],7783:[[353,775]],7784:[[7778,775]],7785:[[7779,775]],7786:[[84,775]],7787:[[116,775]],7788:[[84,803]],7789:[[116,803]],7790:[[84,817]],7791:[[116,817]],7792:[[84,813]],7793:[[116,813]],7794:[[85,804]],7795:[[117,804]],7796:[[85,816]],7797:[[117,816]],7798:[[85,813]],7799:[[117,813]],7800:[[360,769]],7801:[[361,769]],7802:[[362,776]],7803:[[363,776]],7804:[[86,771]],7805:[[118,771]],7806:[[86,803]],7807:[[118,803]],7808:[[87,768]],7809:[[119,768]],7810:[[87,769]],7811:[[119,769]],7812:[[87,776]],7813:[[119,776]],7814:[[87,775]],7815:[[119,775]],7816:[[87,803]],7817:[[119,803]],7818:[[88,775]],7819:[[120,775]],7820:[[88,776]],7821:[[120,776]],7822:[[89,775]],7823:[[121,775]],7824:[[90,770]],7825:[[122,770]],7826:[[90,803]],7827:[[122,803]],7828:[[90,817]],7829:[[122,817]],7830:[[104,817]],7831:[[116,776]],7832:[[119,778]],7833:[[121,778]],7834:[[97,702],256],7835:[[383,775]],7840:[[65,803],,{770:7852,774:7862}],7841:[[97,803],,{770:7853,774:7863}],7842:[[65,777]],7843:[[97,777]],7844:[[194,769]],7845:[[226,769]],7846:[[194,768]],7847:[[226,768]],7848:[[194,777]],7849:[[226,777]],7850:[[194,771]],7851:[[226,771]],7852:[[7840,770]],7853:[[7841,770]],7854:[[258,769]],7855:[[259,769]],7856:[[258,768]],7857:[[259,768]],7858:[[258,777]],7859:[[259,777]],7860:[[258,771]],7861:[[259,771]],7862:[[7840,774]],7863:[[7841,774]],7864:[[69,803],,{770:7878}],7865:[[101,803],,{770:7879}],7866:[[69,777]],7867:[[101,777]],7868:[[69,771]],7869:[[101,771]],7870:[[202,769]],7871:[[234,769]],7872:[[202,768]],7873:[[234,768]],7874:[[202,777]],7875:[[234,777]],7876:[[202,771]],7877:[[234,771]],7878:[[7864,770]],7879:[[7865,770]],7880:[[73,777]],7881:[[105,777]],7882:[[73,803]],7883:[[105,803]],7884:[[79,803],,{770:7896}],7885:[[111,803],,{770:7897}],7886:[[79,777]],7887:[[111,777]],7888:[[212,769]],7889:[[244,769]],7890:[[212,768]],7891:[[244,768]],7892:[[212,777]],7893:[[244,777]],7894:[[212,771]],7895:[[244,771]],7896:[[7884,770]],7897:[[7885,770]],7898:[[416,769]],7899:[[417,769]],7900:[[416,768]],7901:[[417,768]],7902:[[416,777]],7903:[[417,777]],7904:[[416,771]],7905:[[417,771]],7906:[[416,803]],7907:[[417,803]],7908:[[85,803]],7909:[[117,803]],7910:[[85,777]],7911:[[117,777]],7912:[[431,769]],7913:[[432,769]],7914:[[431,768]],7915:[[432,768]],7916:[[431,777]],7917:[[432,777]],7918:[[431,771]],7919:[[432,771]],7920:[[431,803]],7921:[[432,803]],7922:[[89,768]],7923:[[121,768]],7924:[[89,803]],7925:[[121,803]],7926:[[89,777]],7927:[[121,777]],7928:[[89,771]],7929:[[121,771]]},
7936:{7936:[[945,787],,{768:7938,769:7940,834:7942,837:8064}],7937:[[945,788],,{768:7939,769:7941,834:7943,837:8065}],7938:[[7936,768],,{837:8066}],7939:[[7937,768],,{837:8067}],7940:[[7936,769],,{837:8068}],7941:[[7937,769],,{837:8069}],7942:[[7936,834],,{837:8070}],7943:[[7937,834],,{837:8071}],7944:[[913,787],,{768:7946,769:7948,834:7950,837:8072}],7945:[[913,788],,{768:7947,769:7949,834:7951,837:8073}],7946:[[7944,768],,{837:8074}],7947:[[7945,768],,{837:8075}],7948:[[7944,769],,{837:8076}],7949:[[7945,769],,{837:8077}],7950:[[7944,834],,{837:8078}],7951:[[7945,834],,{837:8079}],7952:[[949,787],,{768:7954,769:7956}],7953:[[949,788],,{768:7955,769:7957}],7954:[[7952,768]],7955:[[7953,768]],7956:[[7952,769]],7957:[[7953,769]],7960:[[917,787],,{768:7962,769:7964}],7961:[[917,788],,{768:7963,769:7965}],7962:[[7960,768]],7963:[[7961,768]],7964:[[7960,769]],7965:[[7961,769]],7968:[[951,787],,{768:7970,769:7972,834:7974,837:8080}],7969:[[951,788],,{768:7971,769:7973,834:7975,837:8081}],7970:[[7968,768],,{837:8082}],7971:[[7969,768],,{837:8083}],7972:[[7968,769],,{837:8084}],7973:[[7969,769],,{837:8085}],7974:[[7968,834],,{837:8086}],7975:[[7969,834],,{837:8087}],7976:[[919,787],,{768:7978,769:7980,834:7982,837:8088}],7977:[[919,788],,{768:7979,769:7981,834:7983,837:8089}],7978:[[7976,768],,{837:8090}],7979:[[7977,768],,{837:8091}],7980:[[7976,769],,{837:8092}],7981:[[7977,769],,{837:8093}],7982:[[7976,834],,{837:8094}],7983:[[7977,834],,{837:8095}],7984:[[953,787],,{768:7986,769:7988,834:7990}],7985:[[953,788],,{768:7987,769:7989,834:7991}],7986:[[7984,768]],7987:[[7985,768]],7988:[[7984,769]],7989:[[7985,769]],7990:[[7984,834]],7991:[[7985,834]],7992:[[921,787],,{768:7994,769:7996,834:7998}],7993:[[921,788],,{768:7995,769:7997,834:7999}],7994:[[7992,768]],7995:[[7993,768]],7996:[[7992,769]],7997:[[7993,769]],7998:[[7992,834]],7999:[[7993,834]],8000:[[959,787],,{768:8002,769:8004}],8001:[[959,788],,{768:8003,769:8005}],8002:[[8000,768]],8003:[[8001,768]],8004:[[8000,769]],8005:[[8001,769]],8008:[[927,787],,{768:8010,769:8012}],8009:[[927,788],,{768:8011,769:8013}],8010:[[8008,768]],8011:[[8009,768]],8012:[[8008,769]],8013:[[8009,769]],8016:[[965,787],,{768:8018,769:8020,834:8022}],8017:[[965,788],,{768:8019,769:8021,834:8023}],8018:[[8016,768]],8019:[[8017,768]],8020:[[8016,769]],8021:[[8017,769]],8022:[[8016,834]],8023:[[8017,834]],8025:[[933,788],,{768:8027,769:8029,834:8031}],8027:[[8025,768]],8029:[[8025,769]],8031:[[8025,834]],8032:[[969,787],,{768:8034,769:8036,834:8038,837:8096}],8033:[[969,788],,{768:8035,769:8037,834:8039,837:8097}],8034:[[8032,768],,{837:8098}],8035:[[8033,768],,{837:8099}],8036:[[8032,769],,{837:8100}],8037:[[8033,769],,{837:8101}],8038:[[8032,834],,{837:8102}],8039:[[8033,834],,{837:8103}],8040:[[937,787],,{768:8042,769:8044,834:8046,837:8104}],8041:[[937,788],,{768:8043,769:8045,834:8047,837:8105}],8042:[[8040,768],,{837:8106}],8043:[[8041,768],,{837:8107}],8044:[[8040,769],,{837:8108}],8045:[[8041,769],,{837:8109}],8046:[[8040,834],,{837:8110}],8047:[[8041,834],,{837:8111}],8048:[[945,768],,{837:8114}],8049:[[940]],8050:[[949,768]],8051:[[941]],8052:[[951,768],,{837:8130}],8053:[[942]],8054:[[953,768]],8055:[[943]],8056:[[959,768]],8057:[[972]],8058:[[965,768]],8059:[[973]],8060:[[969,768],,{837:8178}],8061:[[974]],8064:[[7936,837]],8065:[[7937,837]],8066:[[7938,837]],8067:[[7939,837]],8068:[[7940,837]],8069:[[7941,837]],8070:[[7942,837]],8071:[[7943,837]],8072:[[7944,837]],8073:[[7945,837]],8074:[[7946,837]],8075:[[7947,837]],8076:[[7948,837]],8077:[[7949,837]],8078:[[7950,837]],8079:[[7951,837]],8080:[[7968,837]],8081:[[7969,837]],8082:[[7970,837]],8083:[[7971,837]],8084:[[7972,837]],8085:[[7973,837]],8086:[[7974,837]],8087:[[7975,837]],8088:[[7976,837]],8089:[[7977,837]],8090:[[7978,837]],8091:[[7979,837]],8092:[[7980,837]],8093:[[7981,837]],8094:[[7982,837]],8095:[[7983,837]],8096:[[8032,837]],8097:[[8033,837]],8098:[[8034,837]],8099:[[8035,837]],8100:[[8036,837]],8101:[[8037,837]],8102:[[8038,837]],8103:[[8039,837]],8104:[[8040,837]],8105:[[8041,837]],8106:[[8042,837]],8107:[[8043,837]],8108:[[8044,837]],8109:[[8045,837]],8110:[[8046,837]],8111:[[8047,837]],8112:[[945,774]],8113:[[945,772]],8114:[[8048,837]],8115:[[945,837]],8116:[[940,837]],8118:[[945,834],,{837:8119}],8119:[[8118,837]],8120:[[913,774]],8121:[[913,772]],8122:[[913,768]],8123:[[902]],8124:[[913,837]],8125:[[32,787],256],8126:[[953]],8127:[[32,787],256,{768:8141,769:8142,834:8143}],8128:[[32,834],256],8129:[[168,834]],8130:[[8052,837]],8131:[[951,837]],8132:[[942,837]],8134:[[951,834],,{837:8135}],8135:[[8134,837]],8136:[[917,768]],8137:[[904]],8138:[[919,768]],8139:[[905]],8140:[[919,837]],8141:[[8127,768]],8142:[[8127,769]],8143:[[8127,834]],8144:[[953,774]],8145:[[953,772]],8146:[[970,768]],8147:[[912]],8150:[[953,834]],8151:[[970,834]],8152:[[921,774]],8153:[[921,772]],8154:[[921,768]],8155:[[906]],8157:[[8190,768]],8158:[[8190,769]],8159:[[8190,834]],8160:[[965,774]],8161:[[965,772]],8162:[[971,768]],8163:[[944]],8164:[[961,787]],8165:[[961,788]],8166:[[965,834]],8167:[[971,834]],8168:[[933,774]],8169:[[933,772]],8170:[[933,768]],8171:[[910]],8172:[[929,788]],8173:[[168,768]],8174:[[901]],8175:[[96]],8178:[[8060,837]],8179:[[969,837]],8180:[[974,837]],8182:[[969,834],,{837:8183}],8183:[[8182,837]],8184:[[927,768]],8185:[[908]],8186:[[937,768]],8187:[[911]],8188:[[937,837]],8189:[[180]],8190:[[32,788],256,{768:8157,769:8158,834:8159}]},
8192:{8192:[[8194]],8193:[[8195]],8194:[[32],256],8195:[[32],256],8196:[[32],256],8197:[[32],256],8198:[[32],256],8199:[[32],256],8200:[[32],256],8201:[[32],256],8202:[[32],256],8209:[[8208],256],8215:[[32,819],256],8228:[[46],256],8229:[[46,46],256],8230:[[46,46,46],256],8239:[[32],256],8243:[[8242,8242],256],8244:[[8242,8242,8242],256],8246:[[8245,8245],256],8247:[[8245,8245,8245],256],8252:[[33,33],256],8254:[[32,773],256],8263:[[63,63],256],8264:[[63,33],256],8265:[[33,63],256],8279:[[8242,8242,8242,8242],256],8287:[[32],256],8304:[[48],256],8305:[[105],256],8308:[[52],256],8309:[[53],256],8310:[[54],256],8311:[[55],256],8312:[[56],256],8313:[[57],256],8314:[[43],256],8315:[[8722],256],8316:[[61],256],8317:[[40],256],8318:[[41],256],8319:[[110],256],8320:[[48],256],8321:[[49],256],8322:[[50],256],8323:[[51],256],8324:[[52],256],8325:[[53],256],8326:[[54],256],8327:[[55],256],8328:[[56],256],8329:[[57],256],8330:[[43],256],8331:[[8722],256],8332:[[61],256],8333:[[40],256],8334:[[41],256],8336:[[97],256],8337:[[101],256],8338:[[111],256],8339:[[120],256],8340:[[601],256],8341:[[104],256],8342:[[107],256],8343:[[108],256],8344:[[109],256],8345:[[110],256],8346:[[112],256],8347:[[115],256],8348:[[116],256],8360:[[82,115],256],8400:[,230],8401:[,230],8402:[,1],8403:[,1],8404:[,230],8405:[,230],8406:[,230],8407:[,230],8408:[,1],8409:[,1],8410:[,1],8411:[,230],8412:[,230],8417:[,230],8421:[,1],8422:[,1],8423:[,230],8424:[,220],8425:[,230],8426:[,1],8427:[,1],8428:[,220],8429:[,220],8430:[,220],8431:[,220],8432:[,230]},
8448:{8448:[[97,47,99],256],8449:[[97,47,115],256],8450:[[67],256],8451:[[176,67],256],8453:[[99,47,111],256],8454:[[99,47,117],256],8455:[[400],256],8457:[[176,70],256],8458:[[103],256],8459:[[72],256],8460:[[72],256],8461:[[72],256],8462:[[104],256],8463:[[295],256],8464:[[73],256],8465:[[73],256],8466:[[76],256],8467:[[108],256],8469:[[78],256],8470:[[78,111],256],8473:[[80],256],8474:[[81],256],8475:[[82],256],8476:[[82],256],8477:[[82],256],8480:[[83,77],256],8481:[[84,69,76],256],8482:[[84,77],256],8484:[[90],256],8486:[[937]],8488:[[90],256],8490:[[75]],8491:[[197]],8492:[[66],256],8493:[[67],256],8495:[[101],256],8496:[[69],256],8497:[[70],256],8499:[[77],256],8500:[[111],256],8501:[[1488],256],8502:[[1489],256],8503:[[1490],256],8504:[[1491],256],8505:[[105],256],8507:[[70,65,88],256],8508:[[960],256],8509:[[947],256],8510:[[915],256],8511:[[928],256],8512:[[8721],256],8517:[[68],256],8518:[[100],256],8519:[[101],256],8520:[[105],256],8521:[[106],256],8528:[[49,8260,55],256],8529:[[49,8260,57],256],8530:[[49,8260,49,48],256],8531:[[49,8260,51],256],8532:[[50,8260,51],256],8533:[[49,8260,53],256],8534:[[50,8260,53],256],8535:[[51,8260,53],256],8536:[[52,8260,53],256],8537:[[49,8260,54],256],8538:[[53,8260,54],256],8539:[[49,8260,56],256],8540:[[51,8260,56],256],8541:[[53,8260,56],256],8542:[[55,8260,56],256],8543:[[49,8260],256],8544:[[73],256],8545:[[73,73],256],8546:[[73,73,73],256],8547:[[73,86],256],8548:[[86],256],8549:[[86,73],256],8550:[[86,73,73],256],8551:[[86,73,73,73],256],8552:[[73,88],256],8553:[[88],256],8554:[[88,73],256],8555:[[88,73,73],256],8556:[[76],256],8557:[[67],256],8558:[[68],256],8559:[[77],256],8560:[[105],256],8561:[[105,105],256],8562:[[105,105,105],256],8563:[[105,118],256],8564:[[118],256],8565:[[118,105],256],8566:[[118,105,105],256],8567:[[118,105,105,105],256],8568:[[105,120],256],8569:[[120],256],8570:[[120,105],256],8571:[[120,105,105],256],8572:[[108],256],8573:[[99],256],8574:[[100],256],8575:[[109],256],8585:[[48,8260,51],256],8592:[,,{824:8602}],8594:[,,{824:8603}],8596:[,,{824:8622}],8602:[[8592,824]],8603:[[8594,824]],8622:[[8596,824]],8653:[[8656,824]],8654:[[8660,824]],8655:[[8658,824]],8656:[,,{824:8653}],8658:[,,{824:8655}],8660:[,,{824:8654}]},
8704:{8707:[,,{824:8708}],8708:[[8707,824]],8712:[,,{824:8713}],8713:[[8712,824]],8715:[,,{824:8716}],8716:[[8715,824]],8739:[,,{824:8740}],8740:[[8739,824]],8741:[,,{824:8742}],8742:[[8741,824]],8748:[[8747,8747],256],8749:[[8747,8747,8747],256],8751:[[8750,8750],256],8752:[[8750,8750,8750],256],8764:[,,{824:8769}],8769:[[8764,824]],8771:[,,{824:8772}],8772:[[8771,824]],8773:[,,{824:8775}],8775:[[8773,824]],8776:[,,{824:8777}],8777:[[8776,824]],8781:[,,{824:8813}],8800:[[61,824]],8801:[,,{824:8802}],8802:[[8801,824]],8804:[,,{824:8816}],8805:[,,{824:8817}],8813:[[8781,824]],8814:[[60,824]],8815:[[62,824]],8816:[[8804,824]],8817:[[8805,824]],8818:[,,{824:8820}],8819:[,,{824:8821}],8820:[[8818,824]],8821:[[8819,824]],8822:[,,{824:8824}],8823:[,,{824:8825}],8824:[[8822,824]],8825:[[8823,824]],8826:[,,{824:8832}],8827:[,,{824:8833}],8828:[,,{824:8928}],8829:[,,{824:8929}],8832:[[8826,824]],8833:[[8827,824]],8834:[,,{824:8836}],8835:[,,{824:8837}],8836:[[8834,824]],8837:[[8835,824]],8838:[,,{824:8840}],8839:[,,{824:8841}],8840:[[8838,824]],8841:[[8839,824]],8849:[,,{824:8930}],8850:[,,{824:8931}],8866:[,,{824:8876}],8872:[,,{824:8877}],8873:[,,{824:8878}],8875:[,,{824:8879}],8876:[[8866,824]],8877:[[8872,824]],8878:[[8873,824]],8879:[[8875,824]],8882:[,,{824:8938}],8883:[,,{824:8939}],8884:[,,{824:8940}],8885:[,,{824:8941}],8928:[[8828,824]],8929:[[8829,824]],8930:[[8849,824]],8931:[[8850,824]],8938:[[8882,824]],8939:[[8883,824]],8940:[[8884,824]],8941:[[8885,824]]},
8960:{9001:[[12296]],9002:[[12297]]},
9216:{9312:[[49],256],9313:[[50],256],9314:[[51],256],9315:[[52],256],9316:[[53],256],9317:[[54],256],9318:[[55],256],9319:[[56],256],9320:[[57],256],9321:[[49,48],256],9322:[[49,49],256],9323:[[49,50],256],9324:[[49,51],256],9325:[[49,52],256],9326:[[49,53],256],9327:[[49,54],256],9328:[[49,55],256],9329:[[49,56],256],9330:[[49,57],256],9331:[[50,48],256],9332:[[40,49,41],256],9333:[[40,50,41],256],9334:[[40,51,41],256],9335:[[40,52,41],256],9336:[[40,53,41],256],9337:[[40,54,41],256],9338:[[40,55,41],256],9339:[[40,56,41],256],9340:[[40,57,41],256],9341:[[40,49,48,41],256],9342:[[40,49,49,41],256],9343:[[40,49,50,41],256],9344:[[40,49,51,41],256],9345:[[40,49,52,41],256],9346:[[40,49,53,41],256],9347:[[40,49,54,41],256],9348:[[40,49,55,41],256],9349:[[40,49,56,41],256],9350:[[40,49,57,41],256],9351:[[40,50,48,41],256],9352:[[49,46],256],9353:[[50,46],256],9354:[[51,46],256],9355:[[52,46],256],9356:[[53,46],256],9357:[[54,46],256],9358:[[55,46],256],9359:[[56,46],256],9360:[[57,46],256],9361:[[49,48,46],256],9362:[[49,49,46],256],9363:[[49,50,46],256],9364:[[49,51,46],256],9365:[[49,52,46],256],9366:[[49,53,46],256],9367:[[49,54,46],256],9368:[[49,55,46],256],9369:[[49,56,46],256],9370:[[49,57,46],256],9371:[[50,48,46],256],9372:[[40,97,41],256],9373:[[40,98,41],256],9374:[[40,99,41],256],9375:[[40,100,41],256],9376:[[40,101,41],256],9377:[[40,102,41],256],9378:[[40,103,41],256],9379:[[40,104,41],256],9380:[[40,105,41],256],9381:[[40,106,41],256],9382:[[40,107,41],256],9383:[[40,108,41],256],9384:[[40,109,41],256],9385:[[40,110,41],256],9386:[[40,111,41],256],9387:[[40,112,41],256],9388:[[40,113,41],256],9389:[[40,114,41],256],9390:[[40,115,41],256],9391:[[40,116,41],256],9392:[[40,117,41],256],9393:[[40,118,41],256],9394:[[40,119,41],256],9395:[[40,120,41],256],9396:[[40,121,41],256],9397:[[40,122,41],256],9398:[[65],256],9399:[[66],256],9400:[[67],256],9401:[[68],256],9402:[[69],256],9403:[[70],256],9404:[[71],256],9405:[[72],256],9406:[[73],256],9407:[[74],256],9408:[[75],256],9409:[[76],256],9410:[[77],256],9411:[[78],256],9412:[[79],256],9413:[[80],256],9414:[[81],256],9415:[[82],256],9416:[[83],256],9417:[[84],256],9418:[[85],256],9419:[[86],256],9420:[[87],256],9421:[[88],256],9422:[[89],256],9423:[[90],256],9424:[[97],256],9425:[[98],256],9426:[[99],256],9427:[[100],256],9428:[[101],256],9429:[[102],256],9430:[[103],256],9431:[[104],256],9432:[[105],256],9433:[[106],256],9434:[[107],256],9435:[[108],256],9436:[[109],256],9437:[[110],256],9438:[[111],256],9439:[[112],256],9440:[[113],256],9441:[[114],256],9442:[[115],256],9443:[[116],256],9444:[[117],256],9445:[[118],256],9446:[[119],256],9447:[[120],256],9448:[[121],256],9449:[[122],256],9450:[[48],256]},
10752:{10764:[[8747,8747,8747,8747],256],10868:[[58,58,61],256],10869:[[61,61],256],10870:[[61,61,61],256],10972:[[10973,824],512]},
11264:{11388:[[106],256],11389:[[86],256],11503:[,230],11504:[,230],11505:[,230]},
11520:{11631:[[11617],256],11647:[,9],11744:[,230],11745:[,230],11746:[,230],11747:[,230],11748:[,230],11749:[,230],11750:[,230],11751:[,230],11752:[,230],11753:[,230],11754:[,230],11755:[,230],11756:[,230],11757:[,230],11758:[,230],11759:[,230],11760:[,230],11761:[,230],11762:[,230],11763:[,230],11764:[,230],11765:[,230],11766:[,230],11767:[,230],11768:[,230],11769:[,230],11770:[,230],11771:[,230],11772:[,230],11773:[,230],11774:[,230],11775:[,230]},
11776:{11935:[[27597],256],12019:[[40863],256]},
12032:{12032:[[19968],256],12033:[[20008],256],12034:[[20022],256],12035:[[20031],256],12036:[[20057],256],12037:[[20101],256],12038:[[20108],256],12039:[[20128],256],12040:[[20154],256],12041:[[20799],256],12042:[[20837],256],12043:[[20843],256],12044:[[20866],256],12045:[[20886],256],12046:[[20907],256],12047:[[20960],256],12048:[[20981],256],12049:[[20992],256],12050:[[21147],256],12051:[[21241],256],12052:[[21269],256],12053:[[21274],256],12054:[[21304],256],12055:[[21313],256],12056:[[21340],256],12057:[[21353],256],12058:[[21378],256],12059:[[21430],256],12060:[[21448],256],12061:[[21475],256],12062:[[22231],256],12063:[[22303],256],12064:[[22763],256],12065:[[22786],256],12066:[[22794],256],12067:[[22805],256],12068:[[22823],256],12069:[[22899],256],12070:[[23376],256],12071:[[23424],256],12072:[[23544],256],12073:[[23567],256],12074:[[23586],256],12075:[[23608],256],12076:[[23662],256],12077:[[23665],256],12078:[[24027],256],12079:[[24037],256],12080:[[24049],256],12081:[[24062],256],12082:[[24178],256],12083:[[24186],256],12084:[[24191],256],12085:[[24308],256],12086:[[24318],256],12087:[[24331],256],12088:[[24339],256],12089:[[24400],256],12090:[[24417],256],12091:[[24435],256],12092:[[24515],256],12093:[[25096],256],12094:[[25142],256],12095:[[25163],256],12096:[[25903],256],12097:[[25908],256],12098:[[25991],256],12099:[[26007],256],12100:[[26020],256],12101:[[26041],256],12102:[[26080],256],12103:[[26085],256],12104:[[26352],256],12105:[[26376],256],12106:[[26408],256],12107:[[27424],256],12108:[[27490],256],12109:[[27513],256],12110:[[27571],256],12111:[[27595],256],12112:[[27604],256],12113:[[27611],256],12114:[[27663],256],12115:[[27668],256],12116:[[27700],256],12117:[[28779],256],12118:[[29226],256],12119:[[29238],256],12120:[[29243],256],12121:[[29247],256],12122:[[29255],256],12123:[[29273],256],12124:[[29275],256],12125:[[29356],256],12126:[[29572],256],12127:[[29577],256],12128:[[29916],256],12129:[[29926],256],12130:[[29976],256],12131:[[29983],256],12132:[[29992],256],12133:[[30000],256],12134:[[30091],256],12135:[[30098],256],12136:[[30326],256],12137:[[30333],256],12138:[[30382],256],12139:[[30399],256],12140:[[30446],256],12141:[[30683],256],12142:[[30690],256],12143:[[30707],256],12144:[[31034],256],12145:[[31160],256],12146:[[31166],256],12147:[[31348],256],12148:[[31435],256],12149:[[31481],256],12150:[[31859],256],12151:[[31992],256],12152:[[32566],256],12153:[[32593],256],12154:[[32650],256],12155:[[32701],256],12156:[[32769],256],12157:[[32780],256],12158:[[32786],256],12159:[[32819],256],12160:[[32895],256],12161:[[32905],256],12162:[[33251],256],12163:[[33258],256],12164:[[33267],256],12165:[[33276],256],12166:[[33292],256],12167:[[33307],256],12168:[[33311],256],12169:[[33390],256],12170:[[33394],256],12171:[[33400],256],12172:[[34381],256],12173:[[34411],256],12174:[[34880],256],12175:[[34892],256],12176:[[34915],256],12177:[[35198],256],12178:[[35211],256],12179:[[35282],256],12180:[[35328],256],12181:[[35895],256],12182:[[35910],256],12183:[[35925],256],12184:[[35960],256],12185:[[35997],256],12186:[[36196],256],12187:[[36208],256],12188:[[36275],256],12189:[[36523],256],12190:[[36554],256],12191:[[36763],256],12192:[[36784],256],12193:[[36789],256],12194:[[37009],256],12195:[[37193],256],12196:[[37318],256],12197:[[37324],256],12198:[[37329],256],12199:[[38263],256],12200:[[38272],256],12201:[[38428],256],12202:[[38582],256],12203:[[38585],256],12204:[[38632],256],12205:[[38737],256],12206:[[38750],256],12207:[[38754],256],12208:[[38761],256],12209:[[38859],256],12210:[[38893],256],12211:[[38899],256],12212:[[38913],256],12213:[[39080],256],12214:[[39131],256],12215:[[39135],256],12216:[[39318],256],12217:[[39321],256],12218:[[39340],256],12219:[[39592],256],12220:[[39640],256],12221:[[39647],256],12222:[[39717],256],12223:[[39727],256],12224:[[39730],256],12225:[[39740],256],12226:[[39770],256],12227:[[40165],256],12228:[[40565],256],12229:[[40575],256],12230:[[40613],256],12231:[[40635],256],12232:[[40643],256],12233:[[40653],256],12234:[[40657],256],12235:[[40697],256],12236:[[40701],256],12237:[[40718],256],12238:[[40723],256],12239:[[40736],256],12240:[[40763],256],12241:[[40778],256],12242:[[40786],256],12243:[[40845],256],12244:[[40860],256],12245:[[40864],256]},
12288:{12288:[[32],256],12330:[,218],12331:[,228],12332:[,232],12333:[,222],12334:[,224],12335:[,224],12342:[[12306],256],12344:[[21313],256],12345:[[21316],256],12346:[[21317],256],12358:[,,{12441:12436}],12363:[,,{12441:12364}],12364:[[12363,12441]],12365:[,,{12441:12366}],12366:[[12365,12441]],12367:[,,{12441:12368}],12368:[[12367,12441]],12369:[,,{12441:12370}],12370:[[12369,12441]],12371:[,,{12441:12372}],12372:[[12371,12441]],12373:[,,{12441:12374}],12374:[[12373,12441]],12375:[,,{12441:12376}],12376:[[12375,12441]],12377:[,,{12441:12378}],12378:[[12377,12441]],12379:[,,{12441:12380}],12380:[[12379,12441]],12381:[,,{12441:12382}],12382:[[12381,12441]],12383:[,,{12441:12384}],12384:[[12383,12441]],12385:[,,{12441:12386}],12386:[[12385,12441]],12388:[,,{12441:12389}],12389:[[12388,12441]],12390:[,,{12441:12391}],12391:[[12390,12441]],12392:[,,{12441:12393}],12393:[[12392,12441]],12399:[,,{12441:12400,12442:12401}],12400:[[12399,12441]],12401:[[12399,12442]],12402:[,,{12441:12403,12442:12404}],12403:[[12402,12441]],12404:[[12402,12442]],12405:[,,{12441:12406,12442:12407}],12406:[[12405,12441]],12407:[[12405,12442]],12408:[,,{12441:12409,12442:12410}],12409:[[12408,12441]],12410:[[12408,12442]],12411:[,,{12441:12412,12442:12413}],12412:[[12411,12441]],12413:[[12411,12442]],12436:[[12358,12441]],12441:[,8],12442:[,8],12443:[[32,12441],256],12444:[[32,12442],256],12445:[,,{12441:12446}],12446:[[12445,12441]],12447:[[12424,12426],256],12454:[,,{12441:12532}],12459:[,,{12441:12460}],12460:[[12459,12441]],12461:[,,{12441:12462}],12462:[[12461,12441]],12463:[,,{12441:12464}],12464:[[12463,12441]],12465:[,,{12441:12466}],12466:[[12465,12441]],12467:[,,{12441:12468}],12468:[[12467,12441]],12469:[,,{12441:12470}],12470:[[12469,12441]],12471:[,,{12441:12472}],12472:[[12471,12441]],12473:[,,{12441:12474}],12474:[[12473,12441]],12475:[,,{12441:12476}],12476:[[12475,12441]],12477:[,,{12441:12478}],12478:[[12477,12441]],12479:[,,{12441:12480}],12480:[[12479,12441]],12481:[,,{12441:12482}],12482:[[12481,12441]],12484:[,,{12441:12485}],12485:[[12484,12441]],12486:[,,{12441:12487}],12487:[[12486,12441]],12488:[,,{12441:12489}],12489:[[12488,12441]],12495:[,,{12441:12496,12442:12497}],12496:[[12495,12441]],12497:[[12495,12442]],12498:[,,{12441:12499,12442:12500}],12499:[[12498,12441]],12500:[[12498,12442]],12501:[,,{12441:12502,12442:12503}],12502:[[12501,12441]],12503:[[12501,12442]],12504:[,,{12441:12505,12442:12506}],12505:[[12504,12441]],12506:[[12504,12442]],12507:[,,{12441:12508,12442:12509}],12508:[[12507,12441]],12509:[[12507,12442]],12527:[,,{12441:12535}],12528:[,,{12441:12536}],12529:[,,{12441:12537}],12530:[,,{12441:12538}],12532:[[12454,12441]],12535:[[12527,12441]],12536:[[12528,12441]],12537:[[12529,12441]],12538:[[12530,12441]],12541:[,,{12441:12542}],12542:[[12541,12441]],12543:[[12467,12488],256]},
12544:{12593:[[4352],256],12594:[[4353],256],12595:[[4522],256],12596:[[4354],256],12597:[[4524],256],12598:[[4525],256],12599:[[4355],256],12600:[[4356],256],12601:[[4357],256],12602:[[4528],256],12603:[[4529],256],12604:[[4530],256],12605:[[4531],256],12606:[[4532],256],12607:[[4533],256],12608:[[4378],256],12609:[[4358],256],12610:[[4359],256],12611:[[4360],256],12612:[[4385],256],12613:[[4361],256],12614:[[4362],256],12615:[[4363],256],12616:[[4364],256],12617:[[4365],256],12618:[[4366],256],12619:[[4367],256],12620:[[4368],256],12621:[[4369],256],12622:[[4370],256],12623:[[4449],256],12624:[[4450],256],12625:[[4451],256],12626:[[4452],256],12627:[[4453],256],12628:[[4454],256],12629:[[4455],256],12630:[[4456],256],12631:[[4457],256],12632:[[4458],256],12633:[[4459],256],12634:[[4460],256],12635:[[4461],256],12636:[[4462],256],12637:[[4463],256],12638:[[4464],256],12639:[[4465],256],12640:[[4466],256],12641:[[4467],256],12642:[[4468],256],12643:[[4469],256],12644:[[4448],256],12645:[[4372],256],12646:[[4373],256],12647:[[4551],256],12648:[[4552],256],12649:[[4556],256],12650:[[4558],256],12651:[[4563],256],12652:[[4567],256],12653:[[4569],256],12654:[[4380],256],12655:[[4573],256],12656:[[4575],256],12657:[[4381],256],12658:[[4382],256],12659:[[4384],256],12660:[[4386],256],12661:[[4387],256],12662:[[4391],256],12663:[[4393],256],12664:[[4395],256],12665:[[4396],256],12666:[[4397],256],12667:[[4398],256],12668:[[4399],256],12669:[[4402],256],12670:[[4406],256],12671:[[4416],256],12672:[[4423],256],12673:[[4428],256],12674:[[4593],256],12675:[[4594],256],12676:[[4439],256],12677:[[4440],256],12678:[[4441],256],12679:[[4484],256],12680:[[4485],256],12681:[[4488],256],12682:[[4497],256],12683:[[4498],256],12684:[[4500],256],12685:[[4510],256],12686:[[4513],256],12690:[[19968],256],12691:[[20108],256],12692:[[19977],256],12693:[[22235],256],12694:[[19978],256],12695:[[20013],256],12696:[[19979],256],12697:[[30002],256],12698:[[20057],256],12699:[[19993],256],12700:[[19969],256],12701:[[22825],256],12702:[[22320],256],12703:[[20154],256]},
12800:{12800:[[40,4352,41],256],12801:[[40,4354,41],256],12802:[[40,4355,41],256],12803:[[40,4357,41],256],12804:[[40,4358,41],256],12805:[[40,4359,41],256],12806:[[40,4361,41],256],12807:[[40,4363,41],256],12808:[[40,4364,41],256],12809:[[40,4366,41],256],12810:[[40,4367,41],256],12811:[[40,4368,41],256],12812:[[40,4369,41],256],12813:[[40,4370,41],256],12814:[[40,4352,4449,41],256],12815:[[40,4354,4449,41],256],12816:[[40,4355,4449,41],256],12817:[[40,4357,4449,41],256],12818:[[40,4358,4449,41],256],12819:[[40,4359,4449,41],256],12820:[[40,4361,4449,41],256],12821:[[40,4363,4449,41],256],12822:[[40,4364,4449,41],256],12823:[[40,4366,4449,41],256],12824:[[40,4367,4449,41],256],12825:[[40,4368,4449,41],256],12826:[[40,4369,4449,41],256],12827:[[40,4370,4449,41],256],12828:[[40,4364,4462,41],256],12829:[[40,4363,4457,4364,4453,4523,41],256],12830:[[40,4363,4457,4370,4462,41],256],12832:[[40,19968,41],256],12833:[[40,20108,41],256],12834:[[40,19977,41],256],12835:[[40,22235,41],256],12836:[[40,20116,41],256],12837:[[40,20845,41],256],12838:[[40,19971,41],256],12839:[[40,20843,41],256],12840:[[40,20061,41],256],12841:[[40,21313,41],256],12842:[[40,26376,41],256],12843:[[40,28779,41],256],12844:[[40,27700,41],256],12845:[[40,26408,41],256],12846:[[40,37329,41],256],12847:[[40,22303,41],256],12848:[[40,26085,41],256],12849:[[40,26666,41],256],12850:[[40,26377,41],256],12851:[[40,31038,41],256],12852:[[40,21517,41],256],12853:[[40,29305,41],256],12854:[[40,36001,41],256],12855:[[40,31069,41],256],12856:[[40,21172,41],256],12857:[[40,20195,41],256],12858:[[40,21628,41],256],12859:[[40,23398,41],256],12860:[[40,30435,41],256],12861:[[40,20225,41],256],12862:[[40,36039,41],256],12863:[[40,21332,41],256],12864:[[40,31085,41],256],12865:[[40,20241,41],256],12866:[[40,33258,41],256],12867:[[40,33267,41],256],12868:[[21839],256],12869:[[24188],256],12870:[[25991],256],12871:[[31631],256],12880:[[80,84,69],256],12881:[[50,49],256],12882:[[50,50],256],12883:[[50,51],256],12884:[[50,52],256],12885:[[50,53],256],12886:[[50,54],256],12887:[[50,55],256],12888:[[50,56],256],12889:[[50,57],256],12890:[[51,48],256],12891:[[51,49],256],12892:[[51,50],256],12893:[[51,51],256],12894:[[51,52],256],12895:[[51,53],256],12896:[[4352],256],12897:[[4354],256],12898:[[4355],256],12899:[[4357],256],12900:[[4358],256],12901:[[4359],256],12902:[[4361],256],12903:[[4363],256],12904:[[4364],256],12905:[[4366],256],12906:[[4367],256],12907:[[4368],256],12908:[[4369],256],12909:[[4370],256],12910:[[4352,4449],256],12911:[[4354,4449],256],12912:[[4355,4449],256],12913:[[4357,4449],256],12914:[[4358,4449],256],12915:[[4359,4449],256],12916:[[4361,4449],256],12917:[[4363,4449],256],12918:[[4364,4449],256],12919:[[4366,4449],256],12920:[[4367,4449],256],12921:[[4368,4449],256],12922:[[4369,4449],256],12923:[[4370,4449],256],12924:[[4366,4449,4535,4352,4457],256],12925:[[4364,4462,4363,4468],256],12926:[[4363,4462],256],12928:[[19968],256],12929:[[20108],256],12930:[[19977],256],12931:[[22235],256],12932:[[20116],256],12933:[[20845],256],12934:[[19971],256],12935:[[20843],256],12936:[[20061],256],12937:[[21313],256],12938:[[26376],256],12939:[[28779],256],12940:[[27700],256],12941:[[26408],256],12942:[[37329],256],12943:[[22303],256],12944:[[26085],256],12945:[[26666],256],12946:[[26377],256],12947:[[31038],256],12948:[[21517],256],12949:[[29305],256],12950:[[36001],256],12951:[[31069],256],12952:[[21172],256],12953:[[31192],256],12954:[[30007],256],12955:[[22899],256],12956:[[36969],256],12957:[[20778],256],12958:[[21360],256],12959:[[27880],256],12960:[[38917],256],12961:[[20241],256],12962:[[20889],256],12963:[[27491],256],12964:[[19978],256],12965:[[20013],256],12966:[[19979],256],12967:[[24038],256],12968:[[21491],256],12969:[[21307],256],12970:[[23447],256],12971:[[23398],256],12972:[[30435],256],12973:[[20225],256],12974:[[36039],256],12975:[[21332],256],12976:[[22812],256],12977:[[51,54],256],12978:[[51,55],256],12979:[[51,56],256],12980:[[51,57],256],12981:[[52,48],256],12982:[[52,49],256],12983:[[52,50],256],12984:[[52,51],256],12985:[[52,52],256],12986:[[52,53],256],12987:[[52,54],256],12988:[[52,55],256],12989:[[52,56],256],12990:[[52,57],256],12991:[[53,48],256],12992:[[49,26376],256],12993:[[50,26376],256],12994:[[51,26376],256],12995:[[52,26376],256],12996:[[53,26376],256],12997:[[54,26376],256],12998:[[55,26376],256],12999:[[56,26376],256],13000:[[57,26376],256],13001:[[49,48,26376],256],13002:[[49,49,26376],256],13003:[[49,50,26376],256],13004:[[72,103],256],13005:[[101,114,103],256],13006:[[101,86],256],13007:[[76,84,68],256],13008:[[12450],256],13009:[[12452],256],13010:[[12454],256],13011:[[12456],256],13012:[[12458],256],13013:[[12459],256],13014:[[12461],256],13015:[[12463],256],13016:[[12465],256],13017:[[12467],256],13018:[[12469],256],13019:[[12471],256],13020:[[12473],256],13021:[[12475],256],13022:[[12477],256],13023:[[12479],256],13024:[[12481],256],13025:[[12484],256],13026:[[12486],256],13027:[[12488],256],13028:[[12490],256],13029:[[12491],256],13030:[[12492],256],13031:[[12493],256],13032:[[12494],256],13033:[[12495],256],13034:[[12498],256],13035:[[12501],256],13036:[[12504],256],13037:[[12507],256],13038:[[12510],256],13039:[[12511],256],13040:[[12512],256],13041:[[12513],256],13042:[[12514],256],13043:[[12516],256],13044:[[12518],256],13045:[[12520],256],13046:[[12521],256],13047:[[12522],256],13048:[[12523],256],13049:[[12524],256],13050:[[12525],256],13051:[[12527],256],13052:[[12528],256],13053:[[12529],256],13054:[[12530],256]},
13056:{13056:[[12450,12497,12540,12488],256],13057:[[12450,12523,12501,12449],256],13058:[[12450,12531,12506,12450],256],13059:[[12450,12540,12523],256],13060:[[12452,12491,12531,12464],256],13061:[[12452,12531,12481],256],13062:[[12454,12457,12531],256],13063:[[12456,12473,12463,12540,12489],256],13064:[[12456,12540,12459,12540],256],13065:[[12458,12531,12473],256],13066:[[12458,12540,12512],256],13067:[[12459,12452,12522],256],13068:[[12459,12521,12483,12488],256],13069:[[12459,12525,12522,12540],256],13070:[[12460,12525,12531],256],13071:[[12460,12531,12510],256],13072:[[12462,12460],256],13073:[[12462,12491,12540],256],13074:[[12461,12517,12522,12540],256],13075:[[12462,12523,12480,12540],256],13076:[[12461,12525],256],13077:[[12461,12525,12464,12521,12512],256],13078:[[12461,12525,12513,12540,12488,12523],256],13079:[[12461,12525,12527,12483,12488],256],13080:[[12464,12521,12512],256],13081:[[12464,12521,12512,12488,12531],256],13082:[[12463,12523,12476,12452,12525],256],13083:[[12463,12525,12540,12493],256],13084:[[12465,12540,12473],256],13085:[[12467,12523,12490],256],13086:[[12467,12540,12509],256],13087:[[12469,12452,12463,12523],256],13088:[[12469,12531,12481,12540,12512],256],13089:[[12471,12522,12531,12464],256],13090:[[12475,12531,12481],256],13091:[[12475,12531,12488],256],13092:[[12480,12540,12473],256],13093:[[12487,12471],256],13094:[[12489,12523],256],13095:[[12488,12531],256],13096:[[12490,12494],256],13097:[[12494,12483,12488],256],13098:[[12495,12452,12484],256],13099:[[12497,12540,12475,12531,12488],256],13100:[[12497,12540,12484],256],13101:[[12496,12540,12524,12523],256],13102:[[12500,12450,12473,12488,12523],256],13103:[[12500,12463,12523],256],13104:[[12500,12467],256],13105:[[12499,12523],256],13106:[[12501,12449,12521,12483,12489],256],13107:[[12501,12451,12540,12488],256],13108:[[12502,12483,12471,12455,12523],256],13109:[[12501,12521,12531],256],13110:[[12504,12463,12479,12540,12523],256],13111:[[12506,12477],256],13112:[[12506,12491,12498],256],13113:[[12504,12523,12484],256],13114:[[12506,12531,12473],256],13115:[[12506,12540,12472],256],13116:[[12505,12540,12479],256],13117:[[12509,12452,12531,12488],256],13118:[[12508,12523,12488],256],13119:[[12507,12531],256],13120:[[12509,12531,12489],256],13121:[[12507,12540,12523],256],13122:[[12507,12540,12531],256],13123:[[12510,12452,12463,12525],256],13124:[[12510,12452,12523],256],13125:[[12510,12483,12495],256],13126:[[12510,12523,12463],256],13127:[[12510,12531,12471,12519,12531],256],13128:[[12511,12463,12525,12531],256],13129:[[12511,12522],256],13130:[[12511,12522,12496,12540,12523],256],13131:[[12513,12460],256],13132:[[12513,12460,12488,12531],256],13133:[[12513,12540,12488,12523],256],13134:[[12516,12540,12489],256],13135:[[12516,12540,12523],256],13136:[[12518,12450,12531],256],13137:[[12522,12483,12488,12523],256],13138:[[12522,12521],256],13139:[[12523,12500,12540],256],13140:[[12523,12540,12502,12523],256],13141:[[12524,12512],256],13142:[[12524,12531,12488,12466,12531],256],13143:[[12527,12483,12488],256],13144:[[48,28857],256],13145:[[49,28857],256],13146:[[50,28857],256],13147:[[51,28857],256],13148:[[52,28857],256],13149:[[53,28857],256],13150:[[54,28857],256],13151:[[55,28857],256],13152:[[56,28857],256],13153:[[57,28857],256],13154:[[49,48,28857],256],13155:[[49,49,28857],256],13156:[[49,50,28857],256],13157:[[49,51,28857],256],13158:[[49,52,28857],256],13159:[[49,53,28857],256],13160:[[49,54,28857],256],13161:[[49,55,28857],256],13162:[[49,56,28857],256],13163:[[49,57,28857],256],13164:[[50,48,28857],256],13165:[[50,49,28857],256],13166:[[50,50,28857],256],13167:[[50,51,28857],256],13168:[[50,52,28857],256],13169:[[104,80,97],256],13170:[[100,97],256],13171:[[65,85],256],13172:[[98,97,114],256],13173:[[111,86],256],13174:[[112,99],256],13175:[[100,109],256],13176:[[100,109,178],256],13177:[[100,109,179],256],13178:[[73,85],256],13179:[[24179,25104],256],13180:[[26157,21644],256],13181:[[22823,27491],256],13182:[[26126,27835],256],13183:[[26666,24335,20250,31038],256],13184:[[112,65],256],13185:[[110,65],256],13186:[[956,65],256],13187:[[109,65],256],13188:[[107,65],256],13189:[[75,66],256],13190:[[77,66],256],13191:[[71,66],256],13192:[[99,97,108],256],13193:[[107,99,97,108],256],13194:[[112,70],256],13195:[[110,70],256],13196:[[956,70],256],13197:[[956,103],256],13198:[[109,103],256],13199:[[107,103],256],13200:[[72,122],256],13201:[[107,72,122],256],13202:[[77,72,122],256],13203:[[71,72,122],256],13204:[[84,72,122],256],13205:[[956,8467],256],13206:[[109,8467],256],13207:[[100,8467],256],13208:[[107,8467],256],13209:[[102,109],256],13210:[[110,109],256],13211:[[956,109],256],13212:[[109,109],256],13213:[[99,109],256],13214:[[107,109],256],13215:[[109,109,178],256],13216:[[99,109,178],256],13217:[[109,178],256],13218:[[107,109,178],256],13219:[[109,109,179],256],13220:[[99,109,179],256],13221:[[109,179],256],13222:[[107,109,179],256],13223:[[109,8725,115],256],13224:[[109,8725,115,178],256],13225:[[80,97],256],13226:[[107,80,97],256],13227:[[77,80,97],256],13228:[[71,80,97],256],13229:[[114,97,100],256],13230:[[114,97,100,8725,115],256],13231:[[114,97,100,8725,115,178],256],13232:[[112,115],256],13233:[[110,115],256],13234:[[956,115],256],13235:[[109,115],256],13236:[[112,86],256],13237:[[110,86],256],13238:[[956,86],256],13239:[[109,86],256],13240:[[107,86],256],13241:[[77,86],256],13242:[[112,87],256],13243:[[110,87],256],13244:[[956,87],256],13245:[[109,87],256],13246:[[107,87],256],13247:[[77,87],256],13248:[[107,937],256],13249:[[77,937],256],13250:[[97,46,109,46],256],13251:[[66,113],256],13252:[[99,99],256],13253:[[99,100],256],13254:[[67,8725,107,103],256],13255:[[67,111,46],256],13256:[[100,66],256],13257:[[71,121],256],13258:[[104,97],256],13259:[[72,80],256],13260:[[105,110],256],13261:[[75,75],256],13262:[[75,77],256],13263:[[107,116],256],13264:[[108,109],256],13265:[[108,110],256],13266:[[108,111,103],256],13267:[[108,120],256],13268:[[109,98],256],13269:[[109,105,108],256],13270:[[109,111,108],256],13271:[[80,72],256],13272:[[112,46,109,46],256],13273:[[80,80,77],256],13274:[[80,82],256],13275:[[115,114],256],13276:[[83,118],256],13277:[[87,98],256],13278:[[86,8725,109],256],13279:[[65,8725,109],256],13280:[[49,26085],256],13281:[[50,26085],256],13282:[[51,26085],256],13283:[[52,26085],256],13284:[[53,26085],256],13285:[[54,26085],256],13286:[[55,26085],256],13287:[[56,26085],256],13288:[[57,26085],256],13289:[[49,48,26085],256],13290:[[49,49,26085],256],13291:[[49,50,26085],256],13292:[[49,51,26085],256],13293:[[49,52,26085],256],13294:[[49,53,26085],256],13295:[[49,54,26085],256],13296:[[49,55,26085],256],13297:[[49,56,26085],256],13298:[[49,57,26085],256],13299:[[50,48,26085],256],13300:[[50,49,26085],256],13301:[[50,50,26085],256],13302:[[50,51,26085],256],13303:[[50,52,26085],256],13304:[[50,53,26085],256],13305:[[50,54,26085],256],13306:[[50,55,26085],256],13307:[[50,56,26085],256],13308:[[50,57,26085],256],13309:[[51,48,26085],256],13310:[[51,49,26085],256],13311:[[103,97,108],256]},
42496:{42607:[,230],42612:[,230],42613:[,230],42614:[,230],42615:[,230],42616:[,230],42617:[,230],42618:[,230],42619:[,230],42620:[,230],42621:[,230],42655:[,230],42736:[,230],42737:[,230]},
42752:{42864:[[42863],256],43000:[[294],256],43001:[[339],256]},
43008:{43014:[,9],43204:[,9],43232:[,230],43233:[,230],43234:[,230],43235:[,230],43236:[,230],43237:[,230],43238:[,230],43239:[,230],43240:[,230],43241:[,230],43242:[,230],43243:[,230],43244:[,230],43245:[,230],43246:[,230],43247:[,230],43248:[,230],43249:[,230]},
43264:{43307:[,220],43308:[,220],43309:[,220],43347:[,9],43443:[,7],43456:[,9]},
43520:{43696:[,230],43698:[,230],43699:[,230],43700:[,220],43703:[,230],43704:[,230],43710:[,230],43711:[,230],43713:[,230],43766:[,9]},
43776:{44013:[,9]},
53504:{119134:[[119127,119141],512],119135:[[119128,119141],512],119136:[[119135,119150],512],119137:[[119135,119151],512],119138:[[119135,119152],512],119139:[[119135,119153],512],119140:[[119135,119154],512],119141:[,216],119142:[,216],119143:[,1],119144:[,1],119145:[,1],119149:[,226],119150:[,216],119151:[,216],119152:[,216],119153:[,216],119154:[,216],119163:[,220],119164:[,220],119165:[,220],119166:[,220],119167:[,220],119168:[,220],119169:[,220],119170:[,220],119173:[,230],119174:[,230],119175:[,230],119176:[,230],119177:[,230],119178:[,220],119179:[,220],119210:[,230],119211:[,230],119212:[,230],119213:[,230],119227:[[119225,119141],512],119228:[[119226,119141],512],119229:[[119227,119150],512],119230:[[119228,119150],512],119231:[[119227,119151],512],119232:[[119228,119151],512]},
53760:{119362:[,230],119363:[,230],119364:[,230]},
54272:{119808:[[65],256],119809:[[66],256],119810:[[67],256],119811:[[68],256],119812:[[69],256],119813:[[70],256],119814:[[71],256],119815:[[72],256],119816:[[73],256],119817:[[74],256],119818:[[75],256],119819:[[76],256],119820:[[77],256],119821:[[78],256],119822:[[79],256],119823:[[80],256],119824:[[81],256],119825:[[82],256],119826:[[83],256],119827:[[84],256],119828:[[85],256],119829:[[86],256],119830:[[87],256],119831:[[88],256],119832:[[89],256],119833:[[90],256],119834:[[97],256],119835:[[98],256],119836:[[99],256],119837:[[100],256],119838:[[101],256],119839:[[102],256],119840:[[103],256],119841:[[104],256],119842:[[105],256],119843:[[106],256],119844:[[107],256],119845:[[108],256],119846:[[109],256],119847:[[110],256],119848:[[111],256],119849:[[112],256],119850:[[113],256],119851:[[114],256],119852:[[115],256],119853:[[116],256],119854:[[117],256],119855:[[118],256],119856:[[119],256],119857:[[120],256],119858:[[121],256],119859:[[122],256],119860:[[65],256],119861:[[66],256],119862:[[67],256],119863:[[68],256],119864:[[69],256],119865:[[70],256],119866:[[71],256],119867:[[72],256],119868:[[73],256],119869:[[74],256],119870:[[75],256],119871:[[76],256],119872:[[77],256],119873:[[78],256],119874:[[79],256],119875:[[80],256],119876:[[81],256],119877:[[82],256],119878:[[83],256],119879:[[84],256],119880:[[85],256],119881:[[86],256],119882:[[87],256],119883:[[88],256],119884:[[89],256],119885:[[90],256],119886:[[97],256],119887:[[98],256],119888:[[99],256],119889:[[100],256],119890:[[101],256],119891:[[102],256],119892:[[103],256],119894:[[105],256],119895:[[106],256],119896:[[107],256],119897:[[108],256],119898:[[109],256],119899:[[110],256],119900:[[111],256],119901:[[112],256],119902:[[113],256],119903:[[114],256],119904:[[115],256],119905:[[116],256],119906:[[117],256],119907:[[118],256],119908:[[119],256],119909:[[120],256],119910:[[121],256],119911:[[122],256],119912:[[65],256],119913:[[66],256],119914:[[67],256],119915:[[68],256],119916:[[69],256],119917:[[70],256],119918:[[71],256],119919:[[72],256],119920:[[73],256],119921:[[74],256],119922:[[75],256],119923:[[76],256],119924:[[77],256],119925:[[78],256],119926:[[79],256],119927:[[80],256],119928:[[81],256],119929:[[82],256],119930:[[83],256],119931:[[84],256],119932:[[85],256],119933:[[86],256],119934:[[87],256],119935:[[88],256],119936:[[89],256],119937:[[90],256],119938:[[97],256],119939:[[98],256],119940:[[99],256],119941:[[100],256],119942:[[101],256],119943:[[102],256],119944:[[103],256],119945:[[104],256],119946:[[105],256],119947:[[106],256],119948:[[107],256],119949:[[108],256],119950:[[109],256],119951:[[110],256],119952:[[111],256],119953:[[112],256],119954:[[113],256],119955:[[114],256],119956:[[115],256],119957:[[116],256],119958:[[117],256],119959:[[118],256],119960:[[119],256],119961:[[120],256],119962:[[121],256],119963:[[122],256],119964:[[65],256],119966:[[67],256],119967:[[68],256],119970:[[71],256],119973:[[74],256],119974:[[75],256],119977:[[78],256],119978:[[79],256],119979:[[80],256],119980:[[81],256],119982:[[83],256],119983:[[84],256],119984:[[85],256],119985:[[86],256],119986:[[87],256],119987:[[88],256],119988:[[89],256],119989:[[90],256],119990:[[97],256],119991:[[98],256],119992:[[99],256],119993:[[100],256],119995:[[102],256],119997:[[104],256],119998:[[105],256],119999:[[106],256],120000:[[107],256],120001:[[108],256],120002:[[109],256],120003:[[110],256],120005:[[112],256],120006:[[113],256],120007:[[114],256],120008:[[115],256],120009:[[116],256],120010:[[117],256],120011:[[118],256],120012:[[119],256],120013:[[120],256],120014:[[121],256],120015:[[122],256],120016:[[65],256],120017:[[66],256],120018:[[67],256],120019:[[68],256],120020:[[69],256],120021:[[70],256],120022:[[71],256],120023:[[72],256],120024:[[73],256],120025:[[74],256],120026:[[75],256],120027:[[76],256],120028:[[77],256],120029:[[78],256],120030:[[79],256],120031:[[80],256],120032:[[81],256],120033:[[82],256],120034:[[83],256],120035:[[84],256],120036:[[85],256],120037:[[86],256],120038:[[87],256],120039:[[88],256],120040:[[89],256],120041:[[90],256],120042:[[97],256],120043:[[98],256],120044:[[99],256],120045:[[100],256],120046:[[101],256],120047:[[102],256],120048:[[103],256],120049:[[104],256],120050:[[105],256],120051:[[106],256],120052:[[107],256],120053:[[108],256],120054:[[109],256],120055:[[110],256],120056:[[111],256],120057:[[112],256],120058:[[113],256],120059:[[114],256],120060:[[115],256],120061:[[116],256],120062:[[117],256],120063:[[118],256]},
54528:{120064:[[119],256],120065:[[120],256],120066:[[121],256],120067:[[122],256],120068:[[65],256],120069:[[66],256],120071:[[68],256],120072:[[69],256],120073:[[70],256],120074:[[71],256],120077:[[74],256],120078:[[75],256],120079:[[76],256],120080:[[77],256],120081:[[78],256],120082:[[79],256],120083:[[80],256],120084:[[81],256],120086:[[83],256],120087:[[84],256],120088:[[85],256],120089:[[86],256],120090:[[87],256],120091:[[88],256],120092:[[89],256],120094:[[97],256],120095:[[98],256],120096:[[99],256],120097:[[100],256],120098:[[101],256],120099:[[102],256],120100:[[103],256],120101:[[104],256],120102:[[105],256],120103:[[106],256],120104:[[107],256],120105:[[108],256],120106:[[109],256],120107:[[110],256],120108:[[111],256],120109:[[112],256],120110:[[113],256],120111:[[114],256],120112:[[115],256],120113:[[116],256],120114:[[117],256],120115:[[118],256],120116:[[119],256],120117:[[120],256],120118:[[121],256],120119:[[122],256],120120:[[65],256],120121:[[66],256],120123:[[68],256],120124:[[69],256],120125:[[70],256],120126:[[71],256],120128:[[73],256],120129:[[74],256],120130:[[75],256],120131:[[76],256],120132:[[77],256],120134:[[79],256],120138:[[83],256],120139:[[84],256],120140:[[85],256],120141:[[86],256],120142:[[87],256],120143:[[88],256],120144:[[89],256],120146:[[97],256],120147:[[98],256],120148:[[99],256],120149:[[100],256],120150:[[101],256],120151:[[102],256],120152:[[103],256],120153:[[104],256],120154:[[105],256],120155:[[106],256],120156:[[107],256],120157:[[108],256],120158:[[109],256],120159:[[110],256],120160:[[111],256],120161:[[112],256],120162:[[113],256],120163:[[114],256],120164:[[115],256],120165:[[116],256],120166:[[117],256],120167:[[118],256],120168:[[119],256],120169:[[120],256],120170:[[121],256],120171:[[122],256],120172:[[65],256],120173:[[66],256],120174:[[67],256],120175:[[68],256],120176:[[69],256],120177:[[70],256],120178:[[71],256],120179:[[72],256],120180:[[73],256],120181:[[74],256],120182:[[75],256],120183:[[76],256],120184:[[77],256],120185:[[78],256],120186:[[79],256],120187:[[80],256],120188:[[81],256],120189:[[82],256],120190:[[83],256],120191:[[84],256],120192:[[85],256],120193:[[86],256],120194:[[87],256],120195:[[88],256],120196:[[89],256],120197:[[90],256],120198:[[97],256],120199:[[98],256],120200:[[99],256],120201:[[100],256],120202:[[101],256],120203:[[102],256],120204:[[103],256],120205:[[104],256],120206:[[105],256],120207:[[106],256],120208:[[107],256],120209:[[108],256],120210:[[109],256],120211:[[110],256],120212:[[111],256],120213:[[112],256],120214:[[113],256],120215:[[114],256],120216:[[115],256],120217:[[116],256],120218:[[117],256],120219:[[118],256],120220:[[119],256],120221:[[120],256],120222:[[121],256],120223:[[122],256],120224:[[65],256],120225:[[66],256],120226:[[67],256],120227:[[68],256],120228:[[69],256],120229:[[70],256],120230:[[71],256],120231:[[72],256],120232:[[73],256],120233:[[74],256],120234:[[75],256],120235:[[76],256],120236:[[77],256],120237:[[78],256],120238:[[79],256],120239:[[80],256],120240:[[81],256],120241:[[82],256],120242:[[83],256],120243:[[84],256],120244:[[85],256],120245:[[86],256],120246:[[87],256],120247:[[88],256],120248:[[89],256],120249:[[90],256],120250:[[97],256],120251:[[98],256],120252:[[99],256],120253:[[100],256],120254:[[101],256],120255:[[102],256],120256:[[103],256],120257:[[104],256],120258:[[105],256],120259:[[106],256],120260:[[107],256],120261:[[108],256],120262:[[109],256],120263:[[110],256],120264:[[111],256],120265:[[112],256],120266:[[113],256],120267:[[114],256],120268:[[115],256],120269:[[116],256],120270:[[117],256],120271:[[118],256],120272:[[119],256],120273:[[120],256],120274:[[121],256],120275:[[122],256],120276:[[65],256],120277:[[66],256],120278:[[67],256],120279:[[68],256],120280:[[69],256],120281:[[70],256],120282:[[71],256],120283:[[72],256],120284:[[73],256],120285:[[74],256],120286:[[75],256],120287:[[76],256],120288:[[77],256],120289:[[78],256],120290:[[79],256],120291:[[80],256],120292:[[81],256],120293:[[82],256],120294:[[83],256],120295:[[84],256],120296:[[85],256],120297:[[86],256],120298:[[87],256],120299:[[88],256],120300:[[89],256],120301:[[90],256],120302:[[97],256],120303:[[98],256],120304:[[99],256],120305:[[100],256],120306:[[101],256],120307:[[102],256],120308:[[103],256],120309:[[104],256],120310:[[105],256],120311:[[106],256],120312:[[107],256],120313:[[108],256],120314:[[109],256],120315:[[110],256],120316:[[111],256],120317:[[112],256],120318:[[113],256],120319:[[114],256]},
54784:{120320:[[115],256],120321:[[116],256],120322:[[117],256],120323:[[118],256],120324:[[119],256],120325:[[120],256],120326:[[121],256],120327:[[122],256],120328:[[65],256],120329:[[66],256],120330:[[67],256],120331:[[68],256],120332:[[69],256],120333:[[70],256],120334:[[71],256],120335:[[72],256],120336:[[73],256],120337:[[74],256],120338:[[75],256],120339:[[76],256],120340:[[77],256],120341:[[78],256],120342:[[79],256],120343:[[80],256],120344:[[81],256],120345:[[82],256],120346:[[83],256],120347:[[84],256],120348:[[85],256],120349:[[86],256],120350:[[87],256],120351:[[88],256],120352:[[89],256],120353:[[90],256],120354:[[97],256],120355:[[98],256],120356:[[99],256],120357:[[100],256],120358:[[101],256],120359:[[102],256],120360:[[103],256],120361:[[104],256],120362:[[105],256],120363:[[106],256],120364:[[107],256],120365:[[108],256],120366:[[109],256],120367:[[110],256],120368:[[111],256],120369:[[112],256],120370:[[113],256],120371:[[114],256],120372:[[115],256],120373:[[116],256],120374:[[117],256],120375:[[118],256],120376:[[119],256],120377:[[120],256],120378:[[121],256],120379:[[122],256],120380:[[65],256],120381:[[66],256],120382:[[67],256],120383:[[68],256],120384:[[69],256],120385:[[70],256],120386:[[71],256],120387:[[72],256],120388:[[73],256],120389:[[74],256],120390:[[75],256],120391:[[76],256],120392:[[77],256],120393:[[78],256],120394:[[79],256],120395:[[80],256],120396:[[81],256],120397:[[82],256],120398:[[83],256],120399:[[84],256],120400:[[85],256],120401:[[86],256],120402:[[87],256],120403:[[88],256],120404:[[89],256],120405:[[90],256],120406:[[97],256],120407:[[98],256],120408:[[99],256],120409:[[100],256],120410:[[101],256],120411:[[102],256],120412:[[103],256],120413:[[104],256],120414:[[105],256],120415:[[106],256],120416:[[107],256],120417:[[108],256],120418:[[109],256],120419:[[110],256],120420:[[111],256],120421:[[112],256],120422:[[113],256],120423:[[114],256],120424:[[115],256],120425:[[116],256],120426:[[117],256],120427:[[118],256],120428:[[119],256],120429:[[120],256],120430:[[121],256],120431:[[122],256],120432:[[65],256],120433:[[66],256],120434:[[67],256],120435:[[68],256],120436:[[69],256],120437:[[70],256],120438:[[71],256],120439:[[72],256],120440:[[73],256],120441:[[74],256],120442:[[75],256],120443:[[76],256],120444:[[77],256],120445:[[78],256],120446:[[79],256],120447:[[80],256],120448:[[81],256],120449:[[82],256],120450:[[83],256],120451:[[84],256],120452:[[85],256],120453:[[86],256],120454:[[87],256],120455:[[88],256],120456:[[89],256],120457:[[90],256],120458:[[97],256],120459:[[98],256],120460:[[99],256],120461:[[100],256],120462:[[101],256],120463:[[102],256],120464:[[103],256],120465:[[104],256],120466:[[105],256],120467:[[106],256],120468:[[107],256],120469:[[108],256],120470:[[109],256],120471:[[110],256],120472:[[111],256],120473:[[112],256],120474:[[113],256],120475:[[114],256],120476:[[115],256],120477:[[116],256],120478:[[117],256],120479:[[118],256],120480:[[119],256],120481:[[120],256],120482:[[121],256],120483:[[122],256],120484:[[305],256],120485:[[567],256],120488:[[913],256],120489:[[914],256],120490:[[915],256],120491:[[916],256],120492:[[917],256],120493:[[918],256],120494:[[919],256],120495:[[920],256],120496:[[921],256],120497:[[922],256],120498:[[923],256],120499:[[924],256],120500:[[925],256],120501:[[926],256],120502:[[927],256],120503:[[928],256],120504:[[929],256],120505:[[1012],256],120506:[[931],256],120507:[[932],256],120508:[[933],256],120509:[[934],256],120510:[[935],256],120511:[[936],256],120512:[[937],256],120513:[[8711],256],120514:[[945],256],120515:[[946],256],120516:[[947],256],120517:[[948],256],120518:[[949],256],120519:[[950],256],120520:[[951],256],120521:[[952],256],120522:[[953],256],120523:[[954],256],120524:[[955],256],120525:[[956],256],120526:[[957],256],120527:[[958],256],120528:[[959],256],120529:[[960],256],120530:[[961],256],120531:[[962],256],120532:[[963],256],120533:[[964],256],120534:[[965],256],120535:[[966],256],120536:[[967],256],120537:[[968],256],120538:[[969],256],120539:[[8706],256],120540:[[1013],256],120541:[[977],256],120542:[[1008],256],120543:[[981],256],120544:[[1009],256],120545:[[982],256],120546:[[913],256],120547:[[914],256],120548:[[915],256],120549:[[916],256],120550:[[917],256],120551:[[918],256],120552:[[919],256],120553:[[920],256],120554:[[921],256],120555:[[922],256],120556:[[923],256],120557:[[924],256],120558:[[925],256],120559:[[926],256],120560:[[927],256],120561:[[928],256],120562:[[929],256],120563:[[1012],256],120564:[[931],256],120565:[[932],256],120566:[[933],256],120567:[[934],256],120568:[[935],256],120569:[[936],256],120570:[[937],256],120571:[[8711],256],120572:[[945],256],120573:[[946],256],120574:[[947],256],120575:[[948],256]},
55040:{120576:[[949],256],120577:[[950],256],120578:[[951],256],120579:[[952],256],120580:[[953],256],120581:[[954],256],120582:[[955],256],120583:[[956],256],120584:[[957],256],120585:[[958],256],120586:[[959],256],120587:[[960],256],120588:[[961],256],120589:[[962],256],120590:[[963],256],120591:[[964],256],120592:[[965],256],120593:[[966],256],120594:[[967],256],120595:[[968],256],120596:[[969],256],120597:[[8706],256],120598:[[1013],256],120599:[[977],256],120600:[[1008],256],120601:[[981],256],120602:[[1009],256],120603:[[982],256],120604:[[913],256],120605:[[914],256],120606:[[915],256],120607:[[916],256],120608:[[917],256],120609:[[918],256],120610:[[919],256],120611:[[920],256],120612:[[921],256],120613:[[922],256],120614:[[923],256],120615:[[924],256],120616:[[925],256],120617:[[926],256],120618:[[927],256],120619:[[928],256],120620:[[929],256],120621:[[1012],256],120622:[[931],256],120623:[[932],256],120624:[[933],256],120625:[[934],256],120626:[[935],256],120627:[[936],256],120628:[[937],256],120629:[[8711],256],120630:[[945],256],120631:[[946],256],120632:[[947],256],120633:[[948],256],120634:[[949],256],120635:[[950],256],120636:[[951],256],120637:[[952],256],120638:[[953],256],120639:[[954],256],120640:[[955],256],120641:[[956],256],120642:[[957],256],120643:[[958],256],120644:[[959],256],120645:[[960],256],120646:[[961],256],120647:[[962],256],120648:[[963],256],120649:[[964],256],120650:[[965],256],120651:[[966],256],120652:[[967],256],120653:[[968],256],120654:[[969],256],120655:[[8706],256],120656:[[1013],256],120657:[[977],256],120658:[[1008],256],120659:[[981],256],120660:[[1009],256],120661:[[982],256],120662:[[913],256],120663:[[914],256],120664:[[915],256],120665:[[916],256],120666:[[917],256],120667:[[918],256],120668:[[919],256],120669:[[920],256],120670:[[921],256],120671:[[922],256],120672:[[923],256],120673:[[924],256],120674:[[925],256],120675:[[926],256],120676:[[927],256],120677:[[928],256],120678:[[929],256],120679:[[1012],256],120680:[[931],256],120681:[[932],256],120682:[[933],256],120683:[[934],256],120684:[[935],256],120685:[[936],256],120686:[[937],256],120687:[[8711],256],120688:[[945],256],120689:[[946],256],120690:[[947],256],120691:[[948],256],120692:[[949],256],120693:[[950],256],120694:[[951],256],120695:[[952],256],120696:[[953],256],120697:[[954],256],120698:[[955],256],120699:[[956],256],120700:[[957],256],120701:[[958],256],120702:[[959],256],120703:[[960],256],120704:[[961],256],120705:[[962],256],120706:[[963],256],120707:[[964],256],120708:[[965],256],120709:[[966],256],120710:[[967],256],120711:[[968],256],120712:[[969],256],120713:[[8706],256],120714:[[1013],256],120715:[[977],256],120716:[[1008],256],120717:[[981],256],120718:[[1009],256],120719:[[982],256],120720:[[913],256],120721:[[914],256],120722:[[915],256],120723:[[916],256],120724:[[917],256],120725:[[918],256],120726:[[919],256],120727:[[920],256],120728:[[921],256],120729:[[922],256],120730:[[923],256],120731:[[924],256],120732:[[925],256],120733:[[926],256],120734:[[927],256],120735:[[928],256],120736:[[929],256],120737:[[1012],256],120738:[[931],256],120739:[[932],256],120740:[[933],256],120741:[[934],256],120742:[[935],256],120743:[[936],256],120744:[[937],256],120745:[[8711],256],120746:[[945],256],120747:[[946],256],120748:[[947],256],120749:[[948],256],120750:[[949],256],120751:[[950],256],120752:[[951],256],120753:[[952],256],120754:[[953],256],120755:[[954],256],120756:[[955],256],120757:[[956],256],120758:[[957],256],120759:[[958],256],120760:[[959],256],120761:[[960],256],120762:[[961],256],120763:[[962],256],120764:[[963],256],120765:[[964],256],120766:[[965],256],120767:[[966],256],120768:[[967],256],120769:[[968],256],120770:[[969],256],120771:[[8706],256],120772:[[1013],256],120773:[[977],256],120774:[[1008],256],120775:[[981],256],120776:[[1009],256],120777:[[982],256],120778:[[988],256],120779:[[989],256],120782:[[48],256],120783:[[49],256],120784:[[50],256],120785:[[51],256],120786:[[52],256],120787:[[53],256],120788:[[54],256],120789:[[55],256],120790:[[56],256],120791:[[57],256],120792:[[48],256],120793:[[49],256],120794:[[50],256],120795:[[51],256],120796:[[52],256],120797:[[53],256],120798:[[54],256],120799:[[55],256],120800:[[56],256],120801:[[57],256],120802:[[48],256],120803:[[49],256],120804:[[50],256],120805:[[51],256],120806:[[52],256],120807:[[53],256],120808:[[54],256],120809:[[55],256],120810:[[56],256],120811:[[57],256],120812:[[48],256],120813:[[49],256],120814:[[50],256],120815:[[51],256],120816:[[52],256],120817:[[53],256],120818:[[54],256],120819:[[55],256],120820:[[56],256],120821:[[57],256],120822:[[48],256],120823:[[49],256],120824:[[50],256],120825:[[51],256],120826:[[52],256],120827:[[53],256],120828:[[54],256],120829:[[55],256],120830:[[56],256],120831:[[57],256]},
60928:{126464:[[1575],256],126465:[[1576],256],126466:[[1580],256],126467:[[1583],256],126469:[[1608],256],126470:[[1586],256],126471:[[1581],256],126472:[[1591],256],126473:[[1610],256],126474:[[1603],256],126475:[[1604],256],126476:[[1605],256],126477:[[1606],256],126478:[[1587],256],126479:[[1593],256],126480:[[1601],256],126481:[[1589],256],126482:[[1602],256],126483:[[1585],256],126484:[[1588],256],126485:[[1578],256],126486:[[1579],256],126487:[[1582],256],126488:[[1584],256],126489:[[1590],256],126490:[[1592],256],126491:[[1594],256],126492:[[1646],256],126493:[[1722],256],126494:[[1697],256],126495:[[1647],256],126497:[[1576],256],126498:[[1580],256],126500:[[1607],256],126503:[[1581],256],126505:[[1610],256],126506:[[1603],256],126507:[[1604],256],126508:[[1605],256],126509:[[1606],256],126510:[[1587],256],126511:[[1593],256],126512:[[1601],256],126513:[[1589],256],126514:[[1602],256],126516:[[1588],256],126517:[[1578],256],126518:[[1579],256],126519:[[1582],256],126521:[[1590],256],126523:[[1594],256],126530:[[1580],256],126535:[[1581],256],126537:[[1610],256],126539:[[1604],256],126541:[[1606],256],126542:[[1587],256],126543:[[1593],256],126545:[[1589],256],126546:[[1602],256],126548:[[1588],256],126551:[[1582],256],126553:[[1590],256],126555:[[1594],256],126557:[[1722],256],126559:[[1647],256],126561:[[1576],256],126562:[[1580],256],126564:[[1607],256],126567:[[1581],256],126568:[[1591],256],126569:[[1610],256],126570:[[1603],256],126572:[[1605],256],126573:[[1606],256],126574:[[1587],256],126575:[[1593],256],126576:[[1601],256],126577:[[1589],256],126578:[[1602],256],126580:[[1588],256],126581:[[1578],256],126582:[[1579],256],126583:[[1582],256],126585:[[1590],256],126586:[[1592],256],126587:[[1594],256],126588:[[1646],256],126590:[[1697],256],126592:[[1575],256],126593:[[1576],256],126594:[[1580],256],126595:[[1583],256],126596:[[1607],256],126597:[[1608],256],126598:[[1586],256],126599:[[1581],256],126600:[[1591],256],126601:[[1610],256],126603:[[1604],256],126604:[[1605],256],126605:[[1606],256],126606:[[1587],256],126607:[[1593],256],126608:[[1601],256],126609:[[1589],256],126610:[[1602],256],126611:[[1585],256],126612:[[1588],256],126613:[[1578],256],126614:[[1579],256],126615:[[1582],256],126616:[[1584],256],126617:[[1590],256],126618:[[1592],256],126619:[[1594],256],126625:[[1576],256],126626:[[1580],256],126627:[[1583],256],126629:[[1608],256],126630:[[1586],256],126631:[[1581],256],126632:[[1591],256],126633:[[1610],256],126635:[[1604],256],126636:[[1605],256],126637:[[1606],256],126638:[[1587],256],126639:[[1593],256],126640:[[1601],256],126641:[[1589],256],126642:[[1602],256],126643:[[1585],256],126644:[[1588],256],126645:[[1578],256],126646:[[1579],256],126647:[[1582],256],126648:[[1584],256],126649:[[1590],256],126650:[[1592],256],126651:[[1594],256]},
61696:{127232:[[48,46],256],127233:[[48,44],256],127234:[[49,44],256],127235:[[50,44],256],127236:[[51,44],256],127237:[[52,44],256],127238:[[53,44],256],127239:[[54,44],256],127240:[[55,44],256],127241:[[56,44],256],127242:[[57,44],256],127248:[[40,65,41],256],127249:[[40,66,41],256],127250:[[40,67,41],256],127251:[[40,68,41],256],127252:[[40,69,41],256],127253:[[40,70,41],256],127254:[[40,71,41],256],127255:[[40,72,41],256],127256:[[40,73,41],256],127257:[[40,74,41],256],127258:[[40,75,41],256],127259:[[40,76,41],256],127260:[[40,77,41],256],127261:[[40,78,41],256],127262:[[40,79,41],256],127263:[[40,80,41],256],127264:[[40,81,41],256],127265:[[40,82,41],256],127266:[[40,83,41],256],127267:[[40,84,41],256],127268:[[40,85,41],256],127269:[[40,86,41],256],127270:[[40,87,41],256],127271:[[40,88,41],256],127272:[[40,89,41],256],127273:[[40,90,41],256],127274:[[12308,83,12309],256],127275:[[67],256],127276:[[82],256],127277:[[67,68],256],127278:[[87,90],256],127280:[[65],256],127281:[[66],256],127282:[[67],256],127283:[[68],256],127284:[[69],256],127285:[[70],256],127286:[[71],256],127287:[[72],256],127288:[[73],256],127289:[[74],256],127290:[[75],256],127291:[[76],256],127292:[[77],256],127293:[[78],256],127294:[[79],256],127295:[[80],256],127296:[[81],256],127297:[[82],256],127298:[[83],256],127299:[[84],256],127300:[[85],256],127301:[[86],256],127302:[[87],256],127303:[[88],256],127304:[[89],256],127305:[[90],256],127306:[[72,86],256],127307:[[77,86],256],127308:[[83,68],256],127309:[[83,83],256],127310:[[80,80,86],256],127311:[[87,67],256],127338:[[77,67],256],127339:[[77,68],256],127376:[[68,74],256]},
61952:{127488:[[12411,12363],256],127489:[[12467,12467],256],127490:[[12469],256],127504:[[25163],256],127505:[[23383],256],127506:[[21452],256],127507:[[12487],256],127508:[[20108],256],127509:[[22810],256],127510:[[35299],256],127511:[[22825],256],127512:[[20132],256],127513:[[26144],256],127514:[[28961],256],127515:[[26009],256],127516:[[21069],256],127517:[[24460],256],127518:[[20877],256],127519:[[26032],256],127520:[[21021],256],127521:[[32066],256],127522:[[29983],256],127523:[[36009],256],127524:[[22768],256],127525:[[21561],256],127526:[[28436],256],127527:[[25237],256],127528:[[25429],256],127529:[[19968],256],127530:[[19977],256],127531:[[36938],256],127532:[[24038],256],127533:[[20013],256],127534:[[21491],256],127535:[[25351],256],127536:[[36208],256],127537:[[25171],256],127538:[[31105],256],127539:[[31354],256],127540:[[21512],256],127541:[[28288],256],127542:[[26377],256],127543:[[26376],256],127544:[[30003],256],127545:[[21106],256],127546:[[21942],256],127552:[[12308,26412,12309],256],127553:[[12308,19977,12309],256],127554:[[12308,20108,12309],256],127555:[[12308,23433,12309],256],127556:[[12308,28857,12309],256],127557:[[12308,25171,12309],256],127558:[[12308,30423,12309],256],127559:[[12308,21213,12309],256],127560:[[12308,25943,12309],256],127568:[[24471],256],127569:[[21487],256]},
63488:{194560:[[20029]],194561:[[20024]],194562:[[20033]],194563:[[131362]],194564:[[20320]],194565:[[20398]],194566:[[20411]],194567:[[20482]],194568:[[20602]],194569:[[20633]],194570:[[20711]],194571:[[20687]],194572:[[13470]],194573:[[132666]],194574:[[20813]],194575:[[20820]],194576:[[20836]],194577:[[20855]],194578:[[132380]],194579:[[13497]],194580:[[20839]],194581:[[20877]],194582:[[132427]],194583:[[20887]],194584:[[20900]],194585:[[20172]],194586:[[20908]],194587:[[20917]],194588:[[168415]],194589:[[20981]],194590:[[20995]],194591:[[13535]],194592:[[21051]],194593:[[21062]],194594:[[21106]],194595:[[21111]],194596:[[13589]],194597:[[21191]],194598:[[21193]],194599:[[21220]],194600:[[21242]],194601:[[21253]],194602:[[21254]],194603:[[21271]],194604:[[21321]],194605:[[21329]],194606:[[21338]],194607:[[21363]],194608:[[21373]],194609:[[21375]],194610:[[21375]],194611:[[21375]],194612:[[133676]],194613:[[28784]],194614:[[21450]],194615:[[21471]],194616:[[133987]],194617:[[21483]],194618:[[21489]],194619:[[21510]],194620:[[21662]],194621:[[21560]],194622:[[21576]],194623:[[21608]],194624:[[21666]],194625:[[21750]],194626:[[21776]],194627:[[21843]],194628:[[21859]],194629:[[21892]],194630:[[21892]],194631:[[21913]],194632:[[21931]],194633:[[21939]],194634:[[21954]],194635:[[22294]],194636:[[22022]],194637:[[22295]],194638:[[22097]],194639:[[22132]],194640:[[20999]],194641:[[22766]],194642:[[22478]],194643:[[22516]],194644:[[22541]],194645:[[22411]],194646:[[22578]],194647:[[22577]],194648:[[22700]],194649:[[136420]],194650:[[22770]],194651:[[22775]],194652:[[22790]],194653:[[22810]],194654:[[22818]],194655:[[22882]],194656:[[136872]],194657:[[136938]],194658:[[23020]],194659:[[23067]],194660:[[23079]],194661:[[23000]],194662:[[23142]],194663:[[14062]],194664:[[14076]],194665:[[23304]],194666:[[23358]],194667:[[23358]],194668:[[137672]],194669:[[23491]],194670:[[23512]],194671:[[23527]],194672:[[23539]],194673:[[138008]],194674:[[23551]],194675:[[23558]],194676:[[24403]],194677:[[23586]],194678:[[14209]],194679:[[23648]],194680:[[23662]],194681:[[23744]],194682:[[23693]],194683:[[138724]],194684:[[23875]],194685:[[138726]],194686:[[23918]],194687:[[23915]],194688:[[23932]],194689:[[24033]],194690:[[24034]],194691:[[14383]],194692:[[24061]],194693:[[24104]],194694:[[24125]],194695:[[24169]],194696:[[14434]],194697:[[139651]],194698:[[14460]],194699:[[24240]],194700:[[24243]],194701:[[24246]],194702:[[24266]],194703:[[172946]],194704:[[24318]],194705:[[140081]],194706:[[140081]],194707:[[33281]],194708:[[24354]],194709:[[24354]],194710:[[14535]],194711:[[144056]],194712:[[156122]],194713:[[24418]],194714:[[24427]],194715:[[14563]],194716:[[24474]],194717:[[24525]],194718:[[24535]],194719:[[24569]],194720:[[24705]],194721:[[14650]],194722:[[14620]],194723:[[24724]],194724:[[141012]],194725:[[24775]],194726:[[24904]],194727:[[24908]],194728:[[24910]],194729:[[24908]],194730:[[24954]],194731:[[24974]],194732:[[25010]],194733:[[24996]],194734:[[25007]],194735:[[25054]],194736:[[25074]],194737:[[25078]],194738:[[25104]],194739:[[25115]],194740:[[25181]],194741:[[25265]],194742:[[25300]],194743:[[25424]],194744:[[142092]],194745:[[25405]],194746:[[25340]],194747:[[25448]],194748:[[25475]],194749:[[25572]],194750:[[142321]],194751:[[25634]],194752:[[25541]],194753:[[25513]],194754:[[14894]],194755:[[25705]],194756:[[25726]],194757:[[25757]],194758:[[25719]],194759:[[14956]],194760:[[25935]],194761:[[25964]],194762:[[143370]],194763:[[26083]],194764:[[26360]],194765:[[26185]],194766:[[15129]],194767:[[26257]],194768:[[15112]],194769:[[15076]],194770:[[20882]],194771:[[20885]],194772:[[26368]],194773:[[26268]],194774:[[32941]],194775:[[17369]],194776:[[26391]],194777:[[26395]],194778:[[26401]],194779:[[26462]],194780:[[26451]],194781:[[144323]],194782:[[15177]],194783:[[26618]],194784:[[26501]],194785:[[26706]],194786:[[26757]],194787:[[144493]],194788:[[26766]],194789:[[26655]],194790:[[26900]],194791:[[15261]],194792:[[26946]],194793:[[27043]],194794:[[27114]],194795:[[27304]],194796:[[145059]],194797:[[27355]],194798:[[15384]],194799:[[27425]],194800:[[145575]],194801:[[27476]],194802:[[15438]],194803:[[27506]],194804:[[27551]],194805:[[27578]],194806:[[27579]],194807:[[146061]],194808:[[138507]],194809:[[146170]],194810:[[27726]],194811:[[146620]],194812:[[27839]],194813:[[27853]],194814:[[27751]],194815:[[27926]]},
63744:{63744:[[35912]],63745:[[26356]],63746:[[36554]],63747:[[36040]],63748:[[28369]],63749:[[20018]],63750:[[21477]],63751:[[40860]],63752:[[40860]],63753:[[22865]],63754:[[37329]],63755:[[21895]],63756:[[22856]],63757:[[25078]],63758:[[30313]],63759:[[32645]],63760:[[34367]],63761:[[34746]],63762:[[35064]],63763:[[37007]],63764:[[27138]],63765:[[27931]],63766:[[28889]],63767:[[29662]],63768:[[33853]],63769:[[37226]],63770:[[39409]],63771:[[20098]],63772:[[21365]],63773:[[27396]],63774:[[29211]],63775:[[34349]],63776:[[40478]],63777:[[23888]],63778:[[28651]],63779:[[34253]],63780:[[35172]],63781:[[25289]],63782:[[33240]],63783:[[34847]],63784:[[24266]],63785:[[26391]],63786:[[28010]],63787:[[29436]],63788:[[37070]],63789:[[20358]],63790:[[20919]],63791:[[21214]],63792:[[25796]],63793:[[27347]],63794:[[29200]],63795:[[30439]],63796:[[32769]],63797:[[34310]],63798:[[34396]],63799:[[36335]],63800:[[38706]],63801:[[39791]],63802:[[40442]],63803:[[30860]],63804:[[31103]],63805:[[32160]],63806:[[33737]],63807:[[37636]],63808:[[40575]],63809:[[35542]],63810:[[22751]],63811:[[24324]],63812:[[31840]],63813:[[32894]],63814:[[29282]],63815:[[30922]],63816:[[36034]],63817:[[38647]],63818:[[22744]],63819:[[23650]],63820:[[27155]],63821:[[28122]],63822:[[28431]],63823:[[32047]],63824:[[32311]],63825:[[38475]],63826:[[21202]],63827:[[32907]],63828:[[20956]],63829:[[20940]],63830:[[31260]],63831:[[32190]],63832:[[33777]],63833:[[38517]],63834:[[35712]],63835:[[25295]],63836:[[27138]],63837:[[35582]],63838:[[20025]],63839:[[23527]],63840:[[24594]],63841:[[29575]],63842:[[30064]],63843:[[21271]],63844:[[30971]],63845:[[20415]],63846:[[24489]],63847:[[19981]],63848:[[27852]],63849:[[25976]],63850:[[32034]],63851:[[21443]],63852:[[22622]],63853:[[30465]],63854:[[33865]],63855:[[35498]],63856:[[27578]],63857:[[36784]],63858:[[27784]],63859:[[25342]],63860:[[33509]],63861:[[25504]],63862:[[30053]],63863:[[20142]],63864:[[20841]],63865:[[20937]],63866:[[26753]],63867:[[31975]],63868:[[33391]],63869:[[35538]],63870:[[37327]],63871:[[21237]],63872:[[21570]],63873:[[22899]],63874:[[24300]],63875:[[26053]],63876:[[28670]],63877:[[31018]],63878:[[38317]],63879:[[39530]],63880:[[40599]],63881:[[40654]],63882:[[21147]],63883:[[26310]],63884:[[27511]],63885:[[36706]],63886:[[24180]],63887:[[24976]],63888:[[25088]],63889:[[25754]],63890:[[28451]],63891:[[29001]],63892:[[29833]],63893:[[31178]],63894:[[32244]],63895:[[32879]],63896:[[36646]],63897:[[34030]],63898:[[36899]],63899:[[37706]],63900:[[21015]],63901:[[21155]],63902:[[21693]],63903:[[28872]],63904:[[35010]],63905:[[35498]],63906:[[24265]],63907:[[24565]],63908:[[25467]],63909:[[27566]],63910:[[31806]],63911:[[29557]],63912:[[20196]],63913:[[22265]],63914:[[23527]],63915:[[23994]],63916:[[24604]],63917:[[29618]],63918:[[29801]],63919:[[32666]],63920:[[32838]],63921:[[37428]],63922:[[38646]],63923:[[38728]],63924:[[38936]],63925:[[20363]],63926:[[31150]],63927:[[37300]],63928:[[38584]],63929:[[24801]],63930:[[20102]],63931:[[20698]],63932:[[23534]],63933:[[23615]],63934:[[26009]],63935:[[27138]],63936:[[29134]],63937:[[30274]],63938:[[34044]],63939:[[36988]],63940:[[40845]],63941:[[26248]],63942:[[38446]],63943:[[21129]],63944:[[26491]],63945:[[26611]],63946:[[27969]],63947:[[28316]],63948:[[29705]],63949:[[30041]],63950:[[30827]],63951:[[32016]],63952:[[39006]],63953:[[20845]],63954:[[25134]],63955:[[38520]],63956:[[20523]],63957:[[23833]],63958:[[28138]],63959:[[36650]],63960:[[24459]],63961:[[24900]],63962:[[26647]],63963:[[29575]],63964:[[38534]],63965:[[21033]],63966:[[21519]],63967:[[23653]],63968:[[26131]],63969:[[26446]],63970:[[26792]],63971:[[27877]],63972:[[29702]],63973:[[30178]],63974:[[32633]],63975:[[35023]],63976:[[35041]],63977:[[37324]],63978:[[38626]],63979:[[21311]],63980:[[28346]],63981:[[21533]],63982:[[29136]],63983:[[29848]],63984:[[34298]],63985:[[38563]],63986:[[40023]],63987:[[40607]],63988:[[26519]],63989:[[28107]],63990:[[33256]],63991:[[31435]],63992:[[31520]],63993:[[31890]],63994:[[29376]],63995:[[28825]],63996:[[35672]],63997:[[20160]],63998:[[33590]],63999:[[21050]],194816:[[27966]],194817:[[28023]],194818:[[27969]],194819:[[28009]],194820:[[28024]],194821:[[28037]],194822:[[146718]],194823:[[27956]],194824:[[28207]],194825:[[28270]],194826:[[15667]],194827:[[28363]],194828:[[28359]],194829:[[147153]],194830:[[28153]],194831:[[28526]],194832:[[147294]],194833:[[147342]],194834:[[28614]],194835:[[28729]],194836:[[28702]],194837:[[28699]],194838:[[15766]],194839:[[28746]],194840:[[28797]],194841:[[28791]],194842:[[28845]],194843:[[132389]],194844:[[28997]],194845:[[148067]],194846:[[29084]],194847:[[148395]],194848:[[29224]],194849:[[29237]],194850:[[29264]],194851:[[149000]],194852:[[29312]],194853:[[29333]],194854:[[149301]],194855:[[149524]],194856:[[29562]],194857:[[29579]],194858:[[16044]],194859:[[29605]],194860:[[16056]],194861:[[16056]],194862:[[29767]],194863:[[29788]],194864:[[29809]],194865:[[29829]],194866:[[29898]],194867:[[16155]],194868:[[29988]],194869:[[150582]],194870:[[30014]],194871:[[150674]],194872:[[30064]],194873:[[139679]],194874:[[30224]],194875:[[151457]],194876:[[151480]],194877:[[151620]],194878:[[16380]],194879:[[16392]],194880:[[30452]],194881:[[151795]],194882:[[151794]],194883:[[151833]],194884:[[151859]],194885:[[30494]],194886:[[30495]],194887:[[30495]],194888:[[30538]],194889:[[16441]],194890:[[30603]],194891:[[16454]],194892:[[16534]],194893:[[152605]],194894:[[30798]],194895:[[30860]],194896:[[30924]],194897:[[16611]],194898:[[153126]],194899:[[31062]],194900:[[153242]],194901:[[153285]],194902:[[31119]],194903:[[31211]],194904:[[16687]],194905:[[31296]],194906:[[31306]],194907:[[31311]],194908:[[153980]],194909:[[154279]],194910:[[154279]],194911:[[31470]],194912:[[16898]],194913:[[154539]],194914:[[31686]],194915:[[31689]],194916:[[16935]],194917:[[154752]],194918:[[31954]],194919:[[17056]],194920:[[31976]],194921:[[31971]],194922:[[32000]],194923:[[155526]],194924:[[32099]],194925:[[17153]],194926:[[32199]],194927:[[32258]],194928:[[32325]],194929:[[17204]],194930:[[156200]],194931:[[156231]],194932:[[17241]],194933:[[156377]],194934:[[32634]],194935:[[156478]],194936:[[32661]],194937:[[32762]],194938:[[32773]],194939:[[156890]],194940:[[156963]],194941:[[32864]],194942:[[157096]],194943:[[32880]],194944:[[144223]],194945:[[17365]],194946:[[32946]],194947:[[33027]],194948:[[17419]],194949:[[33086]],194950:[[23221]],194951:[[157607]],194952:[[157621]],194953:[[144275]],194954:[[144284]],194955:[[33281]],194956:[[33284]],194957:[[36766]],194958:[[17515]],194959:[[33425]],194960:[[33419]],194961:[[33437]],194962:[[21171]],194963:[[33457]],194964:[[33459]],194965:[[33469]],194966:[[33510]],194967:[[158524]],194968:[[33509]],194969:[[33565]],194970:[[33635]],194971:[[33709]],194972:[[33571]],194973:[[33725]],194974:[[33767]],194975:[[33879]],194976:[[33619]],194977:[[33738]],194978:[[33740]],194979:[[33756]],194980:[[158774]],194981:[[159083]],194982:[[158933]],194983:[[17707]],194984:[[34033]],194985:[[34035]],194986:[[34070]],194987:[[160714]],194988:[[34148]],194989:[[159532]],194990:[[17757]],194991:[[17761]],194992:[[159665]],194993:[[159954]],194994:[[17771]],194995:[[34384]],194996:[[34396]],194997:[[34407]],194998:[[34409]],194999:[[34473]],195000:[[34440]],195001:[[34574]],195002:[[34530]],195003:[[34681]],195004:[[34600]],195005:[[34667]],195006:[[34694]],195007:[[17879]],195008:[[34785]],195009:[[34817]],195010:[[17913]],195011:[[34912]],195012:[[34915]],195013:[[161383]],195014:[[35031]],195015:[[35038]],195016:[[17973]],195017:[[35066]],195018:[[13499]],195019:[[161966]],195020:[[162150]],195021:[[18110]],195022:[[18119]],195023:[[35488]],195024:[[35565]],195025:[[35722]],195026:[[35925]],195027:[[162984]],195028:[[36011]],195029:[[36033]],195030:[[36123]],195031:[[36215]],195032:[[163631]],195033:[[133124]],195034:[[36299]],195035:[[36284]],195036:[[36336]],195037:[[133342]],195038:[[36564]],195039:[[36664]],195040:[[165330]],195041:[[165357]],195042:[[37012]],195043:[[37105]],195044:[[37137]],195045:[[165678]],195046:[[37147]],195047:[[37432]],195048:[[37591]],195049:[[37592]],195050:[[37500]],195051:[[37881]],195052:[[37909]],195053:[[166906]],195054:[[38283]],195055:[[18837]],195056:[[38327]],195057:[[167287]],195058:[[18918]],195059:[[38595]],195060:[[23986]],195061:[[38691]],195062:[[168261]],195063:[[168474]],195064:[[19054]],195065:[[19062]],195066:[[38880]],195067:[[168970]],195068:[[19122]],195069:[[169110]],195070:[[38923]],195071:[[38923]]},
64000:{64000:[[20999]],64001:[[24230]],64002:[[25299]],64003:[[31958]],64004:[[23429]],64005:[[27934]],64006:[[26292]],64007:[[36667]],64008:[[34892]],64009:[[38477]],64010:[[35211]],64011:[[24275]],64012:[[20800]],64013:[[21952]],64016:[[22618]],64018:[[26228]],64021:[[20958]],64022:[[29482]],64023:[[30410]],64024:[[31036]],64025:[[31070]],64026:[[31077]],64027:[[31119]],64028:[[38742]],64029:[[31934]],64030:[[32701]],64032:[[34322]],64034:[[35576]],64037:[[36920]],64038:[[37117]],64042:[[39151]],64043:[[39164]],64044:[[39208]],64045:[[40372]],64046:[[37086]],64047:[[38583]],64048:[[20398]],64049:[[20711]],64050:[[20813]],64051:[[21193]],64052:[[21220]],64053:[[21329]],64054:[[21917]],64055:[[22022]],64056:[[22120]],64057:[[22592]],64058:[[22696]],64059:[[23652]],64060:[[23662]],64061:[[24724]],64062:[[24936]],64063:[[24974]],64064:[[25074]],64065:[[25935]],64066:[[26082]],64067:[[26257]],64068:[[26757]],64069:[[28023]],64070:[[28186]],64071:[[28450]],64072:[[29038]],64073:[[29227]],64074:[[29730]],64075:[[30865]],64076:[[31038]],64077:[[31049]],64078:[[31048]],64079:[[31056]],64080:[[31062]],64081:[[31069]],64082:[[31117]],64083:[[31118]],64084:[[31296]],64085:[[31361]],64086:[[31680]],64087:[[32244]],64088:[[32265]],64089:[[32321]],64090:[[32626]],64091:[[32773]],64092:[[33261]],64093:[[33401]],64094:[[33401]],64095:[[33879]],64096:[[35088]],64097:[[35222]],64098:[[35585]],64099:[[35641]],64100:[[36051]],64101:[[36104]],64102:[[36790]],64103:[[36920]],64104:[[38627]],64105:[[38911]],64106:[[38971]],64107:[[24693]],64108:[[148206]],64109:[[33304]],64112:[[20006]],64113:[[20917]],64114:[[20840]],64115:[[20352]],64116:[[20805]],64117:[[20864]],64118:[[21191]],64119:[[21242]],64120:[[21917]],64121:[[21845]],64122:[[21913]],64123:[[21986]],64124:[[22618]],64125:[[22707]],64126:[[22852]],64127:[[22868]],64128:[[23138]],64129:[[23336]],64130:[[24274]],64131:[[24281]],64132:[[24425]],64133:[[24493]],64134:[[24792]],64135:[[24910]],64136:[[24840]],64137:[[24974]],64138:[[24928]],64139:[[25074]],64140:[[25140]],64141:[[25540]],64142:[[25628]],64143:[[25682]],64144:[[25942]],64145:[[26228]],64146:[[26391]],64147:[[26395]],64148:[[26454]],64149:[[27513]],64150:[[27578]],64151:[[27969]],64152:[[28379]],64153:[[28363]],64154:[[28450]],64155:[[28702]],64156:[[29038]],64157:[[30631]],64158:[[29237]],64159:[[29359]],64160:[[29482]],64161:[[29809]],64162:[[29958]],64163:[[30011]],64164:[[30237]],64165:[[30239]],64166:[[30410]],64167:[[30427]],64168:[[30452]],64169:[[30538]],64170:[[30528]],64171:[[30924]],64172:[[31409]],64173:[[31680]],64174:[[31867]],64175:[[32091]],64176:[[32244]],64177:[[32574]],64178:[[32773]],64179:[[33618]],64180:[[33775]],64181:[[34681]],64182:[[35137]],64183:[[35206]],64184:[[35222]],64185:[[35519]],64186:[[35576]],64187:[[35531]],64188:[[35585]],64189:[[35582]],64190:[[35565]],64191:[[35641]],64192:[[35722]],64193:[[36104]],64194:[[36664]],64195:[[36978]],64196:[[37273]],64197:[[37494]],64198:[[38524]],64199:[[38627]],64200:[[38742]],64201:[[38875]],64202:[[38911]],64203:[[38923]],64204:[[38971]],64205:[[39698]],64206:[[40860]],64207:[[141386]],64208:[[141380]],64209:[[144341]],64210:[[15261]],64211:[[16408]],64212:[[16441]],64213:[[152137]],64214:[[154832]],64215:[[163539]],64216:[[40771]],64217:[[40846]],195072:[[38953]],195073:[[169398]],195074:[[39138]],195075:[[19251]],195076:[[39209]],195077:[[39335]],195078:[[39362]],195079:[[39422]],195080:[[19406]],195081:[[170800]],195082:[[39698]],195083:[[40000]],195084:[[40189]],195085:[[19662]],195086:[[19693]],195087:[[40295]],195088:[[172238]],195089:[[19704]],195090:[[172293]],195091:[[172558]],195092:[[172689]],195093:[[40635]],195094:[[19798]],195095:[[40697]],195096:[[40702]],195097:[[40709]],195098:[[40719]],195099:[[40726]],195100:[[40763]],195101:[[173568]]},
64256:{64256:[[102,102],256],64257:[[102,105],256],64258:[[102,108],256],64259:[[102,102,105],256],64260:[[102,102,108],256],64261:[[383,116],256],64262:[[115,116],256],64275:[[1396,1398],256],64276:[[1396,1381],256],64277:[[1396,1387],256],64278:[[1406,1398],256],64279:[[1396,1389],256],64285:[[1497,1460],512],64286:[,26],64287:[[1522,1463],512],64288:[[1506],256],64289:[[1488],256],64290:[[1491],256],64291:[[1492],256],64292:[[1499],256],64293:[[1500],256],64294:[[1501],256],64295:[[1512],256],64296:[[1514],256],64297:[[43],256],64298:[[1513,1473],512],64299:[[1513,1474],512],64300:[[64329,1473],512],64301:[[64329,1474],512],64302:[[1488,1463],512],64303:[[1488,1464],512],64304:[[1488,1468],512],64305:[[1489,1468],512],64306:[[1490,1468],512],64307:[[1491,1468],512],64308:[[1492,1468],512],64309:[[1493,1468],512],64310:[[1494,1468],512],64312:[[1496,1468],512],64313:[[1497,1468],512],64314:[[1498,1468],512],64315:[[1499,1468],512],64316:[[1500,1468],512],64318:[[1502,1468],512],64320:[[1504,1468],512],64321:[[1505,1468],512],64323:[[1507,1468],512],64324:[[1508,1468],512],64326:[[1510,1468],512],64327:[[1511,1468],512],64328:[[1512,1468],512],64329:[[1513,1468],512],64330:[[1514,1468],512],64331:[[1493,1465],512],64332:[[1489,1471],512],64333:[[1499,1471],512],64334:[[1508,1471],512],64335:[[1488,1500],256],64336:[[1649],256],64337:[[1649],256],64338:[[1659],256],64339:[[1659],256],64340:[[1659],256],64341:[[1659],256],64342:[[1662],256],64343:[[1662],256],64344:[[1662],256],64345:[[1662],256],64346:[[1664],256],64347:[[1664],256],64348:[[1664],256],64349:[[1664],256],64350:[[1658],256],64351:[[1658],256],64352:[[1658],256],64353:[[1658],256],64354:[[1663],256],64355:[[1663],256],64356:[[1663],256],64357:[[1663],256],64358:[[1657],256],64359:[[1657],256],64360:[[1657],256],64361:[[1657],256],64362:[[1700],256],64363:[[1700],256],64364:[[1700],256],64365:[[1700],256],64366:[[1702],256],64367:[[1702],256],64368:[[1702],256],64369:[[1702],256],64370:[[1668],256],64371:[[1668],256],64372:[[1668],256],64373:[[1668],256],64374:[[1667],256],64375:[[1667],256],64376:[[1667],256],64377:[[1667],256],64378:[[1670],256],64379:[[1670],256],64380:[[1670],256],64381:[[1670],256],64382:[[1671],256],64383:[[1671],256],64384:[[1671],256],64385:[[1671],256],64386:[[1677],256],64387:[[1677],256],64388:[[1676],256],64389:[[1676],256],64390:[[1678],256],64391:[[1678],256],64392:[[1672],256],64393:[[1672],256],64394:[[1688],256],64395:[[1688],256],64396:[[1681],256],64397:[[1681],256],64398:[[1705],256],64399:[[1705],256],64400:[[1705],256],64401:[[1705],256],64402:[[1711],256],64403:[[1711],256],64404:[[1711],256],64405:[[1711],256],64406:[[1715],256],64407:[[1715],256],64408:[[1715],256],64409:[[1715],256],64410:[[1713],256],64411:[[1713],256],64412:[[1713],256],64413:[[1713],256],64414:[[1722],256],64415:[[1722],256],64416:[[1723],256],64417:[[1723],256],64418:[[1723],256],64419:[[1723],256],64420:[[1728],256],64421:[[1728],256],64422:[[1729],256],64423:[[1729],256],64424:[[1729],256],64425:[[1729],256],64426:[[1726],256],64427:[[1726],256],64428:[[1726],256],64429:[[1726],256],64430:[[1746],256],64431:[[1746],256],64432:[[1747],256],64433:[[1747],256],64467:[[1709],256],64468:[[1709],256],64469:[[1709],256],64470:[[1709],256],64471:[[1735],256],64472:[[1735],256],64473:[[1734],256],64474:[[1734],256],64475:[[1736],256],64476:[[1736],256],64477:[[1655],256],64478:[[1739],256],64479:[[1739],256],64480:[[1733],256],64481:[[1733],256],64482:[[1737],256],64483:[[1737],256],64484:[[1744],256],64485:[[1744],256],64486:[[1744],256],64487:[[1744],256],64488:[[1609],256],64489:[[1609],256],64490:[[1574,1575],256],64491:[[1574,1575],256],64492:[[1574,1749],256],64493:[[1574,1749],256],64494:[[1574,1608],256],64495:[[1574,1608],256],64496:[[1574,1735],256],64497:[[1574,1735],256],64498:[[1574,1734],256],64499:[[1574,1734],256],64500:[[1574,1736],256],64501:[[1574,1736],256],64502:[[1574,1744],256],64503:[[1574,1744],256],64504:[[1574,1744],256],64505:[[1574,1609],256],64506:[[1574,1609],256],64507:[[1574,1609],256],64508:[[1740],256],64509:[[1740],256],64510:[[1740],256],64511:[[1740],256]},
64512:{64512:[[1574,1580],256],64513:[[1574,1581],256],64514:[[1574,1605],256],64515:[[1574,1609],256],64516:[[1574,1610],256],64517:[[1576,1580],256],64518:[[1576,1581],256],64519:[[1576,1582],256],64520:[[1576,1605],256],64521:[[1576,1609],256],64522:[[1576,1610],256],64523:[[1578,1580],256],64524:[[1578,1581],256],64525:[[1578,1582],256],64526:[[1578,1605],256],64527:[[1578,1609],256],64528:[[1578,1610],256],64529:[[1579,1580],256],64530:[[1579,1605],256],64531:[[1579,1609],256],64532:[[1579,1610],256],64533:[[1580,1581],256],64534:[[1580,1605],256],64535:[[1581,1580],256],64536:[[1581,1605],256],64537:[[1582,1580],256],64538:[[1582,1581],256],64539:[[1582,1605],256],64540:[[1587,1580],256],64541:[[1587,1581],256],64542:[[1587,1582],256],64543:[[1587,1605],256],64544:[[1589,1581],256],64545:[[1589,1605],256],64546:[[1590,1580],256],64547:[[1590,1581],256],64548:[[1590,1582],256],64549:[[1590,1605],256],64550:[[1591,1581],256],64551:[[1591,1605],256],64552:[[1592,1605],256],64553:[[1593,1580],256],64554:[[1593,1605],256],64555:[[1594,1580],256],64556:[[1594,1605],256],64557:[[1601,1580],256],64558:[[1601,1581],256],64559:[[1601,1582],256],64560:[[1601,1605],256],64561:[[1601,1609],256],64562:[[1601,1610],256],64563:[[1602,1581],256],64564:[[1602,1605],256],64565:[[1602,1609],256],64566:[[1602,1610],256],64567:[[1603,1575],256],64568:[[1603,1580],256],64569:[[1603,1581],256],64570:[[1603,1582],256],64571:[[1603,1604],256],64572:[[1603,1605],256],64573:[[1603,1609],256],64574:[[1603,1610],256],64575:[[1604,1580],256],64576:[[1604,1581],256],64577:[[1604,1582],256],64578:[[1604,1605],256],64579:[[1604,1609],256],64580:[[1604,1610],256],64581:[[1605,1580],256],64582:[[1605,1581],256],64583:[[1605,1582],256],64584:[[1605,1605],256],64585:[[1605,1609],256],64586:[[1605,1610],256],64587:[[1606,1580],256],64588:[[1606,1581],256],64589:[[1606,1582],256],64590:[[1606,1605],256],64591:[[1606,1609],256],64592:[[1606,1610],256],64593:[[1607,1580],256],64594:[[1607,1605],256],64595:[[1607,1609],256],64596:[[1607,1610],256],64597:[[1610,1580],256],64598:[[1610,1581],256],64599:[[1610,1582],256],64600:[[1610,1605],256],64601:[[1610,1609],256],64602:[[1610,1610],256],64603:[[1584,1648],256],64604:[[1585,1648],256],64605:[[1609,1648],256],64606:[[32,1612,1617],256],64607:[[32,1613,1617],256],64608:[[32,1614,1617],256],64609:[[32,1615,1617],256],64610:[[32,1616,1617],256],64611:[[32,1617,1648],256],64612:[[1574,1585],256],64613:[[1574,1586],256],64614:[[1574,1605],256],64615:[[1574,1606],256],64616:[[1574,1609],256],64617:[[1574,1610],256],64618:[[1576,1585],256],64619:[[1576,1586],256],64620:[[1576,1605],256],64621:[[1576,1606],256],64622:[[1576,1609],256],64623:[[1576,1610],256],64624:[[1578,1585],256],64625:[[1578,1586],256],64626:[[1578,1605],256],64627:[[1578,1606],256],64628:[[1578,1609],256],64629:[[1578,1610],256],64630:[[1579,1585],256],64631:[[1579,1586],256],64632:[[1579,1605],256],64633:[[1579,1606],256],64634:[[1579,1609],256],64635:[[1579,1610],256],64636:[[1601,1609],256],64637:[[1601,1610],256],64638:[[1602,1609],256],64639:[[1602,1610],256],64640:[[1603,1575],256],64641:[[1603,1604],256],64642:[[1603,1605],256],64643:[[1603,1609],256],64644:[[1603,1610],256],64645:[[1604,1605],256],64646:[[1604,1609],256],64647:[[1604,1610],256],64648:[[1605,1575],256],64649:[[1605,1605],256],64650:[[1606,1585],256],64651:[[1606,1586],256],64652:[[1606,1605],256],64653:[[1606,1606],256],64654:[[1606,1609],256],64655:[[1606,1610],256],64656:[[1609,1648],256],64657:[[1610,1585],256],64658:[[1610,1586],256],64659:[[1610,1605],256],64660:[[1610,1606],256],64661:[[1610,1609],256],64662:[[1610,1610],256],64663:[[1574,1580],256],64664:[[1574,1581],256],64665:[[1574,1582],256],64666:[[1574,1605],256],64667:[[1574,1607],256],64668:[[1576,1580],256],64669:[[1576,1581],256],64670:[[1576,1582],256],64671:[[1576,1605],256],64672:[[1576,1607],256],64673:[[1578,1580],256],64674:[[1578,1581],256],64675:[[1578,1582],256],64676:[[1578,1605],256],64677:[[1578,1607],256],64678:[[1579,1605],256],64679:[[1580,1581],256],64680:[[1580,1605],256],64681:[[1581,1580],256],64682:[[1581,1605],256],64683:[[1582,1580],256],64684:[[1582,1605],256],64685:[[1587,1580],256],64686:[[1587,1581],256],64687:[[1587,1582],256],64688:[[1587,1605],256],64689:[[1589,1581],256],64690:[[1589,1582],256],64691:[[1589,1605],256],64692:[[1590,1580],256],64693:[[1590,1581],256],64694:[[1590,1582],256],64695:[[1590,1605],256],64696:[[1591,1581],256],64697:[[1592,1605],256],64698:[[1593,1580],256],64699:[[1593,1605],256],64700:[[1594,1580],256],64701:[[1594,1605],256],64702:[[1601,1580],256],64703:[[1601,1581],256],64704:[[1601,1582],256],64705:[[1601,1605],256],64706:[[1602,1581],256],64707:[[1602,1605],256],64708:[[1603,1580],256],64709:[[1603,1581],256],64710:[[1603,1582],256],64711:[[1603,1604],256],64712:[[1603,1605],256],64713:[[1604,1580],256],64714:[[1604,1581],256],64715:[[1604,1582],256],64716:[[1604,1605],256],64717:[[1604,1607],256],64718:[[1605,1580],256],64719:[[1605,1581],256],64720:[[1605,1582],256],64721:[[1605,1605],256],64722:[[1606,1580],256],64723:[[1606,1581],256],64724:[[1606,1582],256],64725:[[1606,1605],256],64726:[[1606,1607],256],64727:[[1607,1580],256],64728:[[1607,1605],256],64729:[[1607,1648],256],64730:[[1610,1580],256],64731:[[1610,1581],256],64732:[[1610,1582],256],64733:[[1610,1605],256],64734:[[1610,1607],256],64735:[[1574,1605],256],64736:[[1574,1607],256],64737:[[1576,1605],256],64738:[[1576,1607],256],64739:[[1578,1605],256],64740:[[1578,1607],256],64741:[[1579,1605],256],64742:[[1579,1607],256],64743:[[1587,1605],256],64744:[[1587,1607],256],64745:[[1588,1605],256],64746:[[1588,1607],256],64747:[[1603,1604],256],64748:[[1603,1605],256],64749:[[1604,1605],256],64750:[[1606,1605],256],64751:[[1606,1607],256],64752:[[1610,1605],256],64753:[[1610,1607],256],64754:[[1600,1614,1617],256],64755:[[1600,1615,1617],256],64756:[[1600,1616,1617],256],64757:[[1591,1609],256],64758:[[1591,1610],256],64759:[[1593,1609],256],64760:[[1593,1610],256],64761:[[1594,1609],256],64762:[[1594,1610],256],64763:[[1587,1609],256],64764:[[1587,1610],256],64765:[[1588,1609],256],64766:[[1588,1610],256],64767:[[1581,1609],256]},
64768:{64768:[[1581,1610],256],64769:[[1580,1609],256],64770:[[1580,1610],256],64771:[[1582,1609],256],64772:[[1582,1610],256],64773:[[1589,1609],256],64774:[[1589,1610],256],64775:[[1590,1609],256],64776:[[1590,1610],256],64777:[[1588,1580],256],64778:[[1588,1581],256],64779:[[1588,1582],256],64780:[[1588,1605],256],64781:[[1588,1585],256],64782:[[1587,1585],256],64783:[[1589,1585],256],64784:[[1590,1585],256],64785:[[1591,1609],256],64786:[[1591,1610],256],64787:[[1593,1609],256],64788:[[1593,1610],256],64789:[[1594,1609],256],64790:[[1594,1610],256],64791:[[1587,1609],256],64792:[[1587,1610],256],64793:[[1588,1609],256],64794:[[1588,1610],256],64795:[[1581,1609],256],64796:[[1581,1610],256],64797:[[1580,1609],256],64798:[[1580,1610],256],64799:[[1582,1609],256],64800:[[1582,1610],256],64801:[[1589,1609],256],64802:[[1589,1610],256],64803:[[1590,1609],256],64804:[[1590,1610],256],64805:[[1588,1580],256],64806:[[1588,1581],256],64807:[[1588,1582],256],64808:[[1588,1605],256],64809:[[1588,1585],256],64810:[[1587,1585],256],64811:[[1589,1585],256],64812:[[1590,1585],256],64813:[[1588,1580],256],64814:[[1588,1581],256],64815:[[1588,1582],256],64816:[[1588,1605],256],64817:[[1587,1607],256],64818:[[1588,1607],256],64819:[[1591,1605],256],64820:[[1587,1580],256],64821:[[1587,1581],256],64822:[[1587,1582],256],64823:[[1588,1580],256],64824:[[1588,1581],256],64825:[[1588,1582],256],64826:[[1591,1605],256],64827:[[1592,1605],256],64828:[[1575,1611],256],64829:[[1575,1611],256],64848:[[1578,1580,1605],256],64849:[[1578,1581,1580],256],64850:[[1578,1581,1580],256],64851:[[1578,1581,1605],256],64852:[[1578,1582,1605],256],64853:[[1578,1605,1580],256],64854:[[1578,1605,1581],256],64855:[[1578,1605,1582],256],64856:[[1580,1605,1581],256],64857:[[1580,1605,1581],256],64858:[[1581,1605,1610],256],64859:[[1581,1605,1609],256],64860:[[1587,1581,1580],256],64861:[[1587,1580,1581],256],64862:[[1587,1580,1609],256],64863:[[1587,1605,1581],256],64864:[[1587,1605,1581],256],64865:[[1587,1605,1580],256],64866:[[1587,1605,1605],256],64867:[[1587,1605,1605],256],64868:[[1589,1581,1581],256],64869:[[1589,1581,1581],256],64870:[[1589,1605,1605],256],64871:[[1588,1581,1605],256],64872:[[1588,1581,1605],256],64873:[[1588,1580,1610],256],64874:[[1588,1605,1582],256],64875:[[1588,1605,1582],256],64876:[[1588,1605,1605],256],64877:[[1588,1605,1605],256],64878:[[1590,1581,1609],256],64879:[[1590,1582,1605],256],64880:[[1590,1582,1605],256],64881:[[1591,1605,1581],256],64882:[[1591,1605,1581],256],64883:[[1591,1605,1605],256],64884:[[1591,1605,1610],256],64885:[[1593,1580,1605],256],64886:[[1593,1605,1605],256],64887:[[1593,1605,1605],256],64888:[[1593,1605,1609],256],64889:[[1594,1605,1605],256],64890:[[1594,1605,1610],256],64891:[[1594,1605,1609],256],64892:[[1601,1582,1605],256],64893:[[1601,1582,1605],256],64894:[[1602,1605,1581],256],64895:[[1602,1605,1605],256],64896:[[1604,1581,1605],256],64897:[[1604,1581,1610],256],64898:[[1604,1581,1609],256],64899:[[1604,1580,1580],256],64900:[[1604,1580,1580],256],64901:[[1604,1582,1605],256],64902:[[1604,1582,1605],256],64903:[[1604,1605,1581],256],64904:[[1604,1605,1581],256],64905:[[1605,1581,1580],256],64906:[[1605,1581,1605],256],64907:[[1605,1581,1610],256],64908:[[1605,1580,1581],256],64909:[[1605,1580,1605],256],64910:[[1605,1582,1580],256],64911:[[1605,1582,1605],256],64914:[[1605,1580,1582],256],64915:[[1607,1605,1580],256],64916:[[1607,1605,1605],256],64917:[[1606,1581,1605],256],64918:[[1606,1581,1609],256],64919:[[1606,1580,1605],256],64920:[[1606,1580,1605],256],64921:[[1606,1580,1609],256],64922:[[1606,1605,1610],256],64923:[[1606,1605,1609],256],64924:[[1610,1605,1605],256],64925:[[1610,1605,1605],256],64926:[[1576,1582,1610],256],64927:[[1578,1580,1610],256],64928:[[1578,1580,1609],256],64929:[[1578,1582,1610],256],64930:[[1578,1582,1609],256],64931:[[1578,1605,1610],256],64932:[[1578,1605,1609],256],64933:[[1580,1605,1610],256],64934:[[1580,1581,1609],256],64935:[[1580,1605,1609],256],64936:[[1587,1582,1609],256],64937:[[1589,1581,1610],256],64938:[[1588,1581,1610],256],64939:[[1590,1581,1610],256],64940:[[1604,1580,1610],256],64941:[[1604,1605,1610],256],64942:[[1610,1581,1610],256],64943:[[1610,1580,1610],256],64944:[[1610,1605,1610],256],64945:[[1605,1605,1610],256],64946:[[1602,1605,1610],256],64947:[[1606,1581,1610],256],64948:[[1602,1605,1581],256],64949:[[1604,1581,1605],256],64950:[[1593,1605,1610],256],64951:[[1603,1605,1610],256],64952:[[1606,1580,1581],256],64953:[[1605,1582,1610],256],64954:[[1604,1580,1605],256],64955:[[1603,1605,1605],256],64956:[[1604,1580,1605],256],64957:[[1606,1580,1581],256],64958:[[1580,1581,1610],256],64959:[[1581,1580,1610],256],64960:[[1605,1580,1610],256],64961:[[1601,1605,1610],256],64962:[[1576,1581,1610],256],64963:[[1603,1605,1605],256],64964:[[1593,1580,1605],256],64965:[[1589,1605,1605],256],64966:[[1587,1582,1610],256],64967:[[1606,1580,1610],256],65008:[[1589,1604,1746],256],65009:[[1602,1604,1746],256],65010:[[1575,1604,1604,1607],256],65011:[[1575,1603,1576,1585],256],65012:[[1605,1581,1605,1583],256],65013:[[1589,1604,1593,1605],256],65014:[[1585,1587,1608,1604],256],65015:[[1593,1604,1610,1607],256],65016:[[1608,1587,1604,1605],256],65017:[[1589,1604,1609],256],65018:[[1589,1604,1609,32,1575,1604,1604,1607,32,1593,1604,1610,1607,32,1608,1587,1604,1605],256],65019:[[1580,1604,32,1580,1604,1575,1604,1607],256],65020:[[1585,1740,1575,1604],256]},
65024:{65040:[[44],256],65041:[[12289],256],65042:[[12290],256],65043:[[58],256],65044:[[59],256],65045:[[33],256],65046:[[63],256],65047:[[12310],256],65048:[[12311],256],65049:[[8230],256],65056:[,230],65057:[,230],65058:[,230],65059:[,230],65060:[,230],65061:[,230],65062:[,230],65072:[[8229],256],65073:[[8212],256],65074:[[8211],256],65075:[[95],256],65076:[[95],256],65077:[[40],256],65078:[[41],256],65079:[[123],256],65080:[[125],256],65081:[[12308],256],65082:[[12309],256],65083:[[12304],256],65084:[[12305],256],65085:[[12298],256],65086:[[12299],256],65087:[[12296],256],65088:[[12297],256],65089:[[12300],256],65090:[[12301],256],65091:[[12302],256],65092:[[12303],256],65095:[[91],256],65096:[[93],256],65097:[[8254],256],65098:[[8254],256],65099:[[8254],256],65100:[[8254],256],65101:[[95],256],65102:[[95],256],65103:[[95],256],65104:[[44],256],65105:[[12289],256],65106:[[46],256],65108:[[59],256],65109:[[58],256],65110:[[63],256],65111:[[33],256],65112:[[8212],256],65113:[[40],256],65114:[[41],256],65115:[[123],256],65116:[[125],256],65117:[[12308],256],65118:[[12309],256],65119:[[35],256],65120:[[38],256],65121:[[42],256],65122:[[43],256],65123:[[45],256],65124:[[60],256],65125:[[62],256],65126:[[61],256],65128:[[92],256],65129:[[36],256],65130:[[37],256],65131:[[64],256],65136:[[32,1611],256],65137:[[1600,1611],256],65138:[[32,1612],256],65140:[[32,1613],256],65142:[[32,1614],256],65143:[[1600,1614],256],65144:[[32,1615],256],65145:[[1600,1615],256],65146:[[32,1616],256],65147:[[1600,1616],256],65148:[[32,1617],256],65149:[[1600,1617],256],65150:[[32,1618],256],65151:[[1600,1618],256],65152:[[1569],256],65153:[[1570],256],65154:[[1570],256],65155:[[1571],256],65156:[[1571],256],65157:[[1572],256],65158:[[1572],256],65159:[[1573],256],65160:[[1573],256],65161:[[1574],256],65162:[[1574],256],65163:[[1574],256],65164:[[1574],256],65165:[[1575],256],65166:[[1575],256],65167:[[1576],256],65168:[[1576],256],65169:[[1576],256],65170:[[1576],256],65171:[[1577],256],65172:[[1577],256],65173:[[1578],256],65174:[[1578],256],65175:[[1578],256],65176:[[1578],256],65177:[[1579],256],65178:[[1579],256],65179:[[1579],256],65180:[[1579],256],65181:[[1580],256],65182:[[1580],256],65183:[[1580],256],65184:[[1580],256],65185:[[1581],256],65186:[[1581],256],65187:[[1581],256],65188:[[1581],256],65189:[[1582],256],65190:[[1582],256],65191:[[1582],256],65192:[[1582],256],65193:[[1583],256],65194:[[1583],256],65195:[[1584],256],65196:[[1584],256],65197:[[1585],256],65198:[[1585],256],65199:[[1586],256],65200:[[1586],256],65201:[[1587],256],65202:[[1587],256],65203:[[1587],256],65204:[[1587],256],65205:[[1588],256],65206:[[1588],256],65207:[[1588],256],65208:[[1588],256],65209:[[1589],256],65210:[[1589],256],65211:[[1589],256],65212:[[1589],256],65213:[[1590],256],65214:[[1590],256],65215:[[1590],256],65216:[[1590],256],65217:[[1591],256],65218:[[1591],256],65219:[[1591],256],65220:[[1591],256],65221:[[1592],256],65222:[[1592],256],65223:[[1592],256],65224:[[1592],256],65225:[[1593],256],65226:[[1593],256],65227:[[1593],256],65228:[[1593],256],65229:[[1594],256],65230:[[1594],256],65231:[[1594],256],65232:[[1594],256],65233:[[1601],256],65234:[[1601],256],65235:[[1601],256],65236:[[1601],256],65237:[[1602],256],65238:[[1602],256],65239:[[1602],256],65240:[[1602],256],65241:[[1603],256],65242:[[1603],256],65243:[[1603],256],65244:[[1603],256],65245:[[1604],256],65246:[[1604],256],65247:[[1604],256],65248:[[1604],256],65249:[[1605],256],65250:[[1605],256],65251:[[1605],256],65252:[[1605],256],65253:[[1606],256],65254:[[1606],256],65255:[[1606],256],65256:[[1606],256],65257:[[1607],256],65258:[[1607],256],65259:[[1607],256],65260:[[1607],256],65261:[[1608],256],65262:[[1608],256],65263:[[1609],256],65264:[[1609],256],65265:[[1610],256],65266:[[1610],256],65267:[[1610],256],65268:[[1610],256],65269:[[1604,1570],256],65270:[[1604,1570],256],65271:[[1604,1571],256],65272:[[1604,1571],256],65273:[[1604,1573],256],65274:[[1604,1573],256],65275:[[1604,1575],256],65276:[[1604,1575],256]},
65280:{65281:[[33],256],65282:[[34],256],65283:[[35],256],65284:[[36],256],65285:[[37],256],65286:[[38],256],65287:[[39],256],65288:[[40],256],65289:[[41],256],65290:[[42],256],65291:[[43],256],65292:[[44],256],65293:[[45],256],65294:[[46],256],65295:[[47],256],65296:[[48],256],65297:[[49],256],65298:[[50],256],65299:[[51],256],65300:[[52],256],65301:[[53],256],65302:[[54],256],65303:[[55],256],65304:[[56],256],65305:[[57],256],65306:[[58],256],65307:[[59],256],65308:[[60],256],65309:[[61],256],65310:[[62],256],65311:[[63],256],65312:[[64],256],65313:[[65],256],65314:[[66],256],65315:[[67],256],65316:[[68],256],65317:[[69],256],65318:[[70],256],65319:[[71],256],65320:[[72],256],65321:[[73],256],65322:[[74],256],65323:[[75],256],65324:[[76],256],65325:[[77],256],65326:[[78],256],65327:[[79],256],65328:[[80],256],65329:[[81],256],65330:[[82],256],65331:[[83],256],65332:[[84],256],65333:[[85],256],65334:[[86],256],65335:[[87],256],65336:[[88],256],65337:[[89],256],65338:[[90],256],65339:[[91],256],65340:[[92],256],65341:[[93],256],65342:[[94],256],65343:[[95],256],65344:[[96],256],65345:[[97],256],65346:[[98],256],65347:[[99],256],65348:[[100],256],65349:[[101],256],65350:[[102],256],65351:[[103],256],65352:[[104],256],65353:[[105],256],65354:[[106],256],65355:[[107],256],65356:[[108],256],65357:[[109],256],65358:[[110],256],65359:[[111],256],65360:[[112],256],65361:[[113],256],65362:[[114],256],65363:[[115],256],65364:[[116],256],65365:[[117],256],65366:[[118],256],65367:[[119],256],65368:[[120],256],65369:[[121],256],65370:[[122],256],65371:[[123],256],65372:[[124],256],65373:[[125],256],65374:[[126],256],65375:[[10629],256],65376:[[10630],256],65377:[[12290],256],65378:[[12300],256],65379:[[12301],256],65380:[[12289],256],65381:[[12539],256],65382:[[12530],256],65383:[[12449],256],65384:[[12451],256],65385:[[12453],256],65386:[[12455],256],65387:[[12457],256],65388:[[12515],256],65389:[[12517],256],65390:[[12519],256],65391:[[12483],256],65392:[[12540],256],65393:[[12450],256],65394:[[12452],256],65395:[[12454],256],65396:[[12456],256],65397:[[12458],256],65398:[[12459],256],65399:[[12461],256],65400:[[12463],256],65401:[[12465],256],65402:[[12467],256],65403:[[12469],256],65404:[[12471],256],65405:[[12473],256],65406:[[12475],256],65407:[[12477],256],65408:[[12479],256],65409:[[12481],256],65410:[[12484],256],65411:[[12486],256],65412:[[12488],256],65413:[[12490],256],65414:[[12491],256],65415:[[12492],256],65416:[[12493],256],65417:[[12494],256],65418:[[12495],256],65419:[[12498],256],65420:[[12501],256],65421:[[12504],256],65422:[[12507],256],65423:[[12510],256],65424:[[12511],256],65425:[[12512],256],65426:[[12513],256],65427:[[12514],256],65428:[[12516],256],65429:[[12518],256],65430:[[12520],256],65431:[[12521],256],65432:[[12522],256],65433:[[12523],256],65434:[[12524],256],65435:[[12525],256],65436:[[12527],256],65437:[[12531],256],65438:[[12441],256],65439:[[12442],256],65440:[[12644],256],65441:[[12593],256],65442:[[12594],256],65443:[[12595],256],65444:[[12596],256],65445:[[12597],256],65446:[[12598],256],65447:[[12599],256],65448:[[12600],256],65449:[[12601],256],65450:[[12602],256],65451:[[12603],256],65452:[[12604],256],65453:[[12605],256],65454:[[12606],256],65455:[[12607],256],65456:[[12608],256],65457:[[12609],256],65458:[[12610],256],65459:[[12611],256],65460:[[12612],256],65461:[[12613],256],65462:[[12614],256],65463:[[12615],256],65464:[[12616],256],65465:[[12617],256],65466:[[12618],256],65467:[[12619],256],65468:[[12620],256],65469:[[12621],256],65470:[[12622],256],65474:[[12623],256],65475:[[12624],256],65476:[[12625],256],65477:[[12626],256],65478:[[12627],256],65479:[[12628],256],65482:[[12629],256],65483:[[12630],256],65484:[[12631],256],65485:[[12632],256],65486:[[12633],256],65487:[[12634],256],65490:[[12635],256],65491:[[12636],256],65492:[[12637],256],65493:[[12638],256],65494:[[12639],256],65495:[[12640],256],65498:[[12641],256],65499:[[12642],256],65500:[[12643],256],65504:[[162],256],65505:[[163],256],65506:[[172],256],65507:[[175],256],65508:[[166],256],65509:[[165],256],65510:[[8361],256],65512:[[9474],256],65513:[[8592],256],65514:[[8593],256],65515:[[8594],256],65516:[[8595],256],65517:[[9632],256],65518:[[9675],256]}

};

   /***** Module to export */
   var unorm = {
      nfc: nfc,
      nfd: nfd,
      nfkc: nfkc,
      nfkd: nfkd,
   };

   /*globals module:true,define:true*/

   // CommonJS
   if (typeof module === "object") {
      module.exports = unorm;

   // AMD
   } else if (typeof define === "function" && define.amd) {
      define("unorm", function () {
         return unorm;
      });

   // Global
   } else {
      root.unorm = unorm;
   }

   /***** Export as shim for String::normalize method *****/
   /*
      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#november_8_2013_draft_rev_21

      21.1.3.12 String.prototype.normalize(form="NFC")
      When the normalize method is called with one argument form, the following steps are taken:

      1. Let O be CheckObjectCoercible(this value).
      2. Let S be ToString(O).
      3. ReturnIfAbrupt(S).
      4. If form is not provided or undefined let form be "NFC".
      5. Let f be ToString(form).
      6. ReturnIfAbrupt(f).
      7. If f is not one of "NFC", "NFD", "NFKC", or "NFKD", then throw a RangeError Exception.
      8. Let ns be the String value is the result of normalizing S into the normalization form named by f as specified in Unicode Standard Annex #15, UnicodeNormalizatoin Forms.
      9. Return ns.

      The length property of the normalize method is 0.

      *NOTE* The normalize function is intentionally generic; it does not require that its this value be a String object. Therefore it can be transferred to other kinds of objects for use as a method.
   */
   if (!String.prototype.normalize) {
      String.prototype.normalize = function(form) {
         var str = "" + this;
         form =  form === undefined ? "NFC" : form;

         if (form === "NFC") {
            return unorm.nfc(str);
         } else if (form === "NFD") {
            return unorm.nfd(str);
         } else if (form === "NFKC") {
            return unorm.nfkc(str);
         } else if (form === "NFKD") {
            return unorm.nfkd(str);
         } else {
            throw new RangeError("Invalid normalization form: " + form);
         }
      };
   }
}(this));

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL2xpYi9odHRwLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL2xpYi9pbmRleC5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9saWIvaW5zdGFsbGVycy5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9saWIvcGx1Z2luLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL2xpYi9zZXNzaW9uLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL2xpYi9zdXBlcmFnZW50LWxlZ2FjeUlFU3VwcG9ydC5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9saWIvdHJhbnNwb3J0L2h0dHAuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbGliL3RyYW5zcG9ydC9wbHVnaW4uanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9hc3NlcnQuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jb25zb2xlLWJyb3dzZXJpZnkvaW5kZXguanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L2hlbHBlcnMuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L2luZGV4LmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jcnlwdG8tYnJvd3NlcmlmeS9tZDUuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L3JuZy5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvY3J5cHRvLWJyb3dzZXJpZnkvc2hhLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jcnlwdG8tYnJvd3NlcmlmeS9zaGEyNTYuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9ub2RlX21vZHVsZXMvcHJvbWlzZS9jb3JlLmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9wcm9taXNlL2luZGV4LmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9wcm9taXNlL25vZGVfbW9kdWxlcy9hc2FwL2FzYXAuanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9ub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCIvaG9tZS9zdGljay93b3JrL3RyZXpvci90cmV6b3IuanMvbm9kZV9tb2R1bGVzL3RyYXZlcnNlL2luZGV4LmpzIiwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy91bm9ybS9saWIvdW5vcm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDempDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UnKSxcbiAgICByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpLFxuICAgIGxlZ2FjeUlFU3VwcG9ydCA9IHJlcXVpcmUoJy4vc3VwZXJhZ2VudC1sZWdhY3lJRVN1cHBvcnQnKTtcblxuZnVuY3Rpb24gY29udGVudFR5cGUoYm9keSkge1xuICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBieSBkZWZhdWx0LCBzdXBlcmFnZW50IHB1dHMgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIGZvciBzdHJpbmdzXG4gICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHByb21pc2VSZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgdXJsOiBvcHRpb25zXG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHJlcXVlc3Qob3B0aW9ucy5tZXRob2QsIG9wdGlvbnMudXJsKVxuICAgICAgICAgICAgLnVzZShsZWdhY3lJRVN1cHBvcnQpXG4gICAgICAgICAgICAudHlwZShjb250ZW50VHlwZShvcHRpb25zLmJvZHkgfHwgJycpKVxuICAgICAgICAgICAgLnNlbmQob3B0aW9ucy5ib2R5IHx8ICcnKVxuICAgICAgICAgICAgLmVuZChmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiAhcmVzLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMuYm9keSAmJiByZXMuYm9keS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKHJlcy5ib2R5LmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciA9IG5ldyBFcnJvcignUmVxdWVzdCBmYWlsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLmJvZHkgfHwgcmVzLnRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb21pc2VSZXF1ZXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBpbnRlcmZhY2UgVHJhbnNwb3J0IHtcbi8vXG4vLyAgICAgc3RhdGljIGZ1bmN0aW9uIGNyZWF0ZSgpIC0+IFByb21pc2UoU2VsZilcbi8vXG4vLyAgICAgZnVuY3Rpb24gY29uZmlndXJlKFN0cmluZyBjb25maWcpIC0+IFByb21pc2UoKVxuLy9cbi8vICAgICBmdW5jdGlvbiBlbnVtZXJhdGUoQm9vbGVhbiB3YWl0KSAtPiBQcm9taXNlKFt7XG4vLyAgICAgICAgIFN0cmluZyBwYXRoXG4vLyAgICAgICAgIFN0cmluZyB2ZW5kb3Jcbi8vICAgICAgICAgU3RyaW5nIHByb2R1Y3Rcbi8vICAgICAgICAgU3RyaW5nIHNlcmlhbE51bWJlclxuLy8gICAgICAgICBTdHJpbmcgc2Vzc2lvblxuLy8gICAgIH1dIGRldmljZXMpXG4vL1xuLy8gICAgIGZ1bmN0aW9uIGFjcXVpcmUoU3RyaW5nIHBhdGgpIC0+IFByb21pc2UoU3RyaW5nIHNlc3Npb24pXG4vL1xuLy8gICAgIGZ1bmN0aW9uIHJlbGVhc2UoU3RyaW5nIHNlc3Npb24pIC0+IFByb21pc2UoKVxuLy9cbi8vICAgICBmdW5jdGlvbiBjYWxsKFN0cmluZyBzZXNzaW9uLCBTdHJpbmcgbmFtZSwgT2JqZWN0IGRhdGEpIC0+IFByb21pc2Uoe1xuLy8gICAgICAgICBTdHJpbmcgbmFtZSxcbi8vICAgICAgICAgT2JqZWN0IGRhdGEsXG4vLyAgICAgfSlcbi8vXG4vLyB9XG5cbnZhciBIdHRwVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi90cmFuc3BvcnQvaHR0cCcpO1xudmFyIFBsdWdpblRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vdHJhbnNwb3J0L3BsdWdpbicpO1xuXG4vLyBBdHRlbXB0cyB0byBsb2FkIGFueSBhdmFpbGFibGUgSFcgdHJhbnNwb3J0IGxheWVyXG5mdW5jdGlvbiBsb2FkVHJhbnNwb3J0KCkge1xuICAgIHJldHVybiBIdHRwVHJhbnNwb3J0LmNyZWF0ZSgpLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFBsdWdpblRyYW5zcG9ydC5jcmVhdGUoKTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbG9hZFRyYW5zcG9ydDogbG9hZFRyYW5zcG9ydCxcbiAgICBIdHRwVHJhbnNwb3J0OiBIdHRwVHJhbnNwb3J0LFxuICAgIFBsdWdpblRyYW5zcG9ydDogUGx1Z2luVHJhbnNwb3J0LFxuICAgIFNlc3Npb246IHJlcXVpcmUoJy4vc2Vzc2lvbicpLFxuICAgIGluc3RhbGxlcnM6IHJlcXVpcmUoJy4vaW5zdGFsbGVycycpLFxuICAgIHBsdWdpbjogcmVxdWlyZSgnLi9wbHVnaW4nKSxcbiAgICBodHRwOiByZXF1aXJlKCcuL2h0dHAnKVxufTtcbiIsIi8vIHZhciBCUklER0VfVkVSU0lPTl9VUkwgPSAnL2RhdGEvYnJpZGdlL2xhdGVzdC50eHQnLFxuLy8gICAgIEJSSURHRV9JTlNUQUxMRVJTID0gW3tcbi8vICAgICAgICAgdXJsOiAnL2RhdGEvYnJpZGdlLyV2ZXJzaW9uJS90cmV6b3ItYnJpZGdlLSV2ZXJzaW9uJS13aW42NC5tc2knLFxuLy8gICAgICAgICBsYWJlbDogJ1dpbmRvd3MgNjQtYml0Jyxcbi8vICAgICAgICAgcGxhdGZvcm06ICd3aW42NCdcbi8vICAgICB9LCB7XG4vLyAgICAgICAgIHVybDogJy9kYXRhL2JyaWRnZS8ldmVyc2lvbiUvdHJlem9yLWJyaWRnZS0ldmVyc2lvbiUtd2luMzIubXNpJyxcbi8vICAgICAgICAgbGFiZWw6ICdXaW5kb3dzIDMyLWJpdCcsXG4vLyAgICAgICAgIHBsYXRmb3JtOiAnd2luMzInXG4vLyAgICAgfSwge1xuLy8gICAgICAgICB1cmw6ICcvZGF0YS9icmlkZ2UvJXZlcnNpb24lL3RyZXpvci1icmlkZ2UtJXZlcnNpb24lLnBrZycsXG4vLyAgICAgICAgIGxhYmVsOiAnTWFjIE9TIFgnLFxuLy8gICAgICAgICBwbGF0Zm9ybTogJ21hYydcbi8vICAgICB9LCB7XG4vLyAgICAgICAgIHVybDogJy9kYXRhL2JyaWRnZS8ldmVyc2lvbiUvdHJlem9yLWJyaWRnZV8ldmVyc2lvbiVfYW1kNjQuZGViJyxcbi8vICAgICAgICAgbGFiZWw6ICdMaW51eCA2NC1iaXQgKGRlYiknLFxuLy8gICAgICAgICBwbGF0Zm9ybTogJ2RlYjY0J1xuLy8gICAgIH0sIHtcbi8vICAgICAgICAgdXJsOiAnL2RhdGEvYnJpZGdlLyV2ZXJzaW9uJS90cmV6b3ItYnJpZGdlLSV2ZXJzaW9uJS0xLng4Nl82NC5ycG0nLFxuLy8gICAgICAgICBsYWJlbDogJ0xpbnV4IDY0LWJpdCAocnBtKScsXG4vLyAgICAgICAgIHBsYXRmb3JtOiAncnBtNjQnXG4vLyAgICAgfSwge1xuLy8gICAgICAgICB1cmw6ICcvZGF0YS9icmlkZ2UvJXZlcnNpb24lL3RyZXpvci1icmlkZ2VfJXZlcnNpb24lX2kzODYuZGViJyxcbi8vICAgICAgICAgbGFiZWw6ICdMaW51eCAzMi1iaXQgKGRlYiknLFxuLy8gICAgICAgICBwbGF0Zm9ybTogJ2RlYjMyJ1xuLy8gICAgIH0sIHtcbi8vICAgICAgICAgdXJsOiAnL2RhdGEvYnJpZGdlLyV2ZXJzaW9uJS90cmV6b3ItYnJpZGdlLSV2ZXJzaW9uJS0xLmkzODYucnBtJyxcbi8vICAgICAgICAgbGFiZWw6ICdMaW51eCAzMi1iaXQgKHJwbSknLFxuLy8gICAgICAgICBwbGF0Zm9ybTogJ3JwbTMyJ1xuLy8gICAgIH1dO1xuXG52YXIgQlJJREdFX1ZFUlNJT05fVVJMID0gJy9kYXRhL3BsdWdpbi9sYXRlc3QudHh0JyxcbiAgICBCUklER0VfSU5TVEFMTEVSUyA9IFt7XG4gICAgICAgIHVybDogJy9kYXRhL3BsdWdpbi8ldmVyc2lvbiUvQml0Y29pblRyZXpvclBsdWdpbi0ldmVyc2lvbiUubXNpJyxcbiAgICAgICAgbGFiZWw6ICdXaW5kb3dzJyxcbiAgICAgICAgcGxhdGZvcm06IFsnd2luMzInLCAnd2luNjQnXVxuICAgIH0sIHtcbiAgICAgICAgdXJsOiAnL2RhdGEvcGx1Z2luLyV2ZXJzaW9uJS90cmV6b3ItcGx1Z2luLSV2ZXJzaW9uJS5kbWcnLFxuICAgICAgICBsYWJlbDogJ01hYyBPUyBYJyxcbiAgICAgICAgcGxhdGZvcm06ICdtYWMnXG4gICAgfSwge1xuICAgICAgICB1cmw6ICcvZGF0YS9wbHVnaW4vJXZlcnNpb24lL2Jyb3dzZXItcGx1Z2luLXRyZXpvcl8ldmVyc2lvbiVfYW1kNjQuZGViJyxcbiAgICAgICAgbGFiZWw6ICdMaW51eCB4ODZfNjQgKGRlYiknLFxuICAgICAgICBwbGF0Zm9ybTogJ2RlYjY0J1xuICAgIH0sIHtcbiAgICAgICAgdXJsOiAnL2RhdGEvcGx1Z2luLyV2ZXJzaW9uJS9icm93c2VyLXBsdWdpbi10cmV6b3ItJXZlcnNpb24lLng4Nl82NC5ycG0nLFxuICAgICAgICBsYWJlbDogJ0xpbnV4IHg4Nl82NCAocnBtKScsXG4gICAgICAgIHBsYXRmb3JtOiAncnBtNjQnXG4gICAgfSwge1xuICAgICAgICB1cmw6ICcvZGF0YS9wbHVnaW4vJXZlcnNpb24lL2Jyb3dzZXItcGx1Z2luLXRyZXpvcl8ldmVyc2lvbiVfaTM4Ni5kZWInLFxuICAgICAgICBsYWJlbDogJ0xpbnV4IGkzODYgKGRlYiknLFxuICAgICAgICBwbGF0Zm9ybTogJ2RlYjMyJ1xuICAgIH0sIHtcbiAgICAgICAgdXJsOiAnL2RhdGEvcGx1Z2luLyV2ZXJzaW9uJS9icm93c2VyLXBsdWdpbi10cmV6b3ItJXZlcnNpb24lLmkzODYucnBtJyxcbiAgICAgICAgbGFiZWw6ICdMaW51eCBpMzg2IChycG0pJyxcbiAgICAgICAgcGxhdGZvcm06ICdycG0zMidcbiAgICB9XTtcblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYnJpZGdlIGluc3RhbGxlcnMsIHdpdGggZG93bmxvYWQgVVJMcyBhbmQgYSBtYXJrIG9uXG4vLyBicmlkZ2UgcHJlZmVycmVkIGZvciB0aGUgdXNlcidzIHBsYXRmb3JtLlxuZnVuY3Rpb24gaW5zdGFsbGVycyhvcHRpb25zKSB7XG4gICAgdmFyIG8gPSBvcHRpb25zIHx8IHt9LFxuICAgICAgICBicmlkZ2VVcmwgPSBvLmJyaWRnZVVybCB8fCBCUklER0VfVkVSU0lPTl9VUkwsXG4gICAgICAgIHZlcnNpb24gPSBvLnZlcnNpb24gfHwgcmVxdWVzdFVyaShicmlkZ2VVcmwpLnRyaW0oKSxcbiAgICAgICAgcGxhdGZvcm0gPSBvLnBsYXRmb3JtIHx8IHByZWZlcnJlZFBsYXRmb3JtKCk7XG5cbiAgICByZXR1cm4gQlJJREdFX0lOU1RBTExFUlMubWFwKGZ1bmN0aW9uIChicmlkZ2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgICB1cmw6IGJyaWRnZS51cmwucmVwbGFjZSgvJXZlcnNpb24lL2csIHZlcnNpb24pLFxuICAgICAgICAgICAgbGFiZWw6IGJyaWRnZS5sYWJlbCxcbiAgICAgICAgICAgIHBsYXRmb3JtOiBicmlkZ2UucGxhdGZvcm0sXG4gICAgICAgICAgICBwcmVmZXJyZWQ6IGlzUHJlZmVycmVkKGJyaWRnZS5wbGF0Zm9ybSlcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGlzUHJlZmVycmVkKGluc3RhbGxlcikge1xuICAgICAgICBpZiAodHlwZW9mIGluc3RhbGxlciA9PT0gJ3N0cmluZycpIHsgLy8gc2luZ2xlIHBsYXRmb3JtXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFsbGVyID09PSBwbGF0Zm9ybTtcbiAgICAgICAgfSBlbHNlIHsgLy8gYW55IG9mIG11bHRpcGxlIHBsYXRmb3Jtc1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnN0YWxsZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFsbGVyW2ldID09PSBwbGF0Zm9ybSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBwcmVmZXJyZWRQbGF0Zm9ybSgpIHtcbiAgICB2YXIgdmVyID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcblxuICAgIGlmICh2ZXIubWF0Y2goL1dpbjY0fFdPVzY0LykpIHJldHVybiAnd2luNjQnO1xuICAgIGlmICh2ZXIubWF0Y2goL1dpbi8pKSByZXR1cm4gJ3dpbjMyJztcbiAgICBpZiAodmVyLm1hdGNoKC9NYWMvKSkgcmV0dXJuICdtYWMnO1xuICAgIGlmICh2ZXIubWF0Y2goL0xpbnV4IGlbMzQ1Nl04Ni8pKVxuICAgICAgICByZXR1cm4gdmVyLm1hdGNoKC9DZW50T1N8RmVkb3JhfE1hbmRyaXZhfE1hZ2VpYXxSZWQgSGF0fFNjaWVudGlmaWN8U1VTRS8pXG4gICAgICAgICAgICA/ICdycG0zMicgOiAnZGViMzInO1xuICAgIGlmICh2ZXIubWF0Y2goL0xpbnV4LykpXG4gICAgICAgIHJldHVybiB2ZXIubWF0Y2goL0NlbnRPU3xGZWRvcmF8TWFuZHJpdmF8TWFnZWlhfFJlZCBIYXR8U2NpZW50aWZpY3xTVVNFLylcbiAgICAgICAgICAgID8gJ3JwbTY0JyA6ICdkZWI2NCc7XG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RVcmkodXJsKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLm9wZW4oJ2dldCcsIHVybCwgZmFsc2UpO1xuICAgIHJlcS5zZW5kKCk7XG5cbiAgICBpZiAocmVxLnN0YXR1cyAhPT0gMjAwKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBHRVQgJyArIHVybCk7XG5cbiAgICByZXR1cm4gcmVxLnJlc3BvbnNlVGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnN0YWxsZXJzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29uc29sZSA9IHJlcXVpcmUoJ2NvbnNvbGUnKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKSxcbiAgICBQcm9taXNlID0gcmVxdWlyZSgncHJvbWlzZScpO1xuXG4vLyBUcnkgdG8gbG9hZCBhIHBsdWdpbiB3aXRoIGdpdmVuIG9wdGlvbnMsIHJldHVybnMgcHJvbWlzZS4gSW4gY2FzZSBvZlxuLy8gcmVqZWN0aW9uLCBlcnIgY29udGFpbnMgYGluc3RhbGxlZGAgcHJvcGVydHkuXG5tb2R1bGUuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgbyA9IGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIC8vIG1pbWV0eXBlIG9mIHRoZSBwbHVnaW5cbiAgICAgICAgbWltZXR5cGU6ICdhcHBsaWNhdGlvbi94LWJpdGNvaW50cmV6b3JwbHVnaW4nLFxuICAgICAgICAvLyBuYW1lIG9mIHRoZSBjYWxsYmFjayBpbiB0aGUgZ2xvYmFsIG5hbWVzcGFjZVxuICAgICAgICBmbmFtZTogJ19fdHJlem9yUGx1Z2luTG9hZGVkJyxcbiAgICAgICAgLy8gaWQgb2YgdGhlIHBsdWdpbiBlbGVtZW50XG4gICAgICAgIGlkOiAnX190cmV6b3ItcGx1Z2luJyxcbiAgICAgICAgLy8gdGltZSB0byB3YWl0IHVudGlsIHRpbWVvdXQsIGluIG1zZWNcbiAgICAgICAgdGltZW91dDogNTAwXG4gICAgfSk7XG5cbiAgICAvLyBpZiB3ZSBrbm93IGZvciBzdXJlIHRoYXQgdGhlIHBsdWdpbiBpcyBpbnN0YWxsZWQsIHRpbWVvdXQgYWZ0ZXJcbiAgICAvLyAxMCBzZWNvbmRzXG4gICAgdmFyIGluc3RhbGxlZCA9IGlzSW5zdGFsbGVkKG8ubWltZXR5cGUpLFxuICAgICAgICB0aW1lb3V0ID0gaW5zdGFsbGVkID8gMTAwMDAgOiBvLnRpbWVvdXQ7XG5cbiAgICAvLyBpZiB0aGUgcGx1Z2luIGlzIGFscmVhZHkgbG9hZGVkLCB1c2UgaXRcbiAgICB2YXIgcGx1Z2luID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoby5pZCk7XG4gICAgaWYgKHBsdWdpbilcbiAgICAgICAgcmV0dXJuIFByb21pc2UuZnJvbShwbHVnaW4pO1xuXG4gICAgLy8gaW5qZWN0IG9yIHJlamVjdCBhZnRlciB0aW1lb3V0XG4gICAgcmV0dXJuIFByb21pc2UucmFjZShbXG4gICAgICAgIGluamVjdFBsdWdpbihvLmlkLCBvLm1pbWV0eXBlLCBvLmZuYW1lKSxcbiAgICAgICAgcmVqZWN0QWZ0ZXIodGltZW91dCwgbmV3IEVycm9yKCdMb2FkaW5nIHRpbWVkIG91dCcpKVxuICAgIF0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgZXJyLmluc3RhbGxlZCA9IGluc3RhbGxlZDtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH0pLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdHJlem9yXSBMb2FkZWQgcGx1Z2luICcgKyBwbHVnaW4udmVyc2lvbik7XG4gICAgICAgICAgICByZXR1cm4gcGx1Z2luO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbdHJlem9yXSBGYWlsZWQgdG8gbG9hZCBwbHVnaW46ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICApO1xufTtcblxuLy8gSW5qZWN0cyB0aGUgcGx1Z2luIG9iamVjdCBpbnRvIHRoZSBwYWdlIGFuZCB3YWl0cyB1bnRpbCBpdCBsb2Fkcy5cbmZ1bmN0aW9uIGluamVjdFBsdWdpbihpZCwgbWltZXR5cGUsIGZuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLFxuICAgICAgICAgICAgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgIC8vIHJlZ2lzdGVyIGxvYWQgZnVuY3Rpb25cbiAgICAgICAgd2luZG93W2ZuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBwbHVnaW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgICAgICBpZiAocGx1Z2luKVxuICAgICAgICAgICAgICAgIHJlc29sdmUocGx1Z2luKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdQbHVnaW4gbm90IGZvdW5kJykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGluamVjdCBvYmplY3QgZWxlbVxuICAgICAgICBib2R5LmFwcGVuZENoaWxkKGVsZW0pO1xuICAgICAgICBlbGVtLmlubmVySFRNTCA9XG4gICAgICAgICAgICAnPG9iamVjdCB3aWR0aD1cIjFcIiBoZWlnaHQ9XCIxXCIgaWQ9XCInK2lkKydcIiB0eXBlPVwiJyttaW1ldHlwZSsnXCI+JytcbiAgICAgICAgICAgICcgPHBhcmFtIG5hbWU9XCJvbmxvYWRcIiB2YWx1ZT1cIicrZm5hbWUrJ1wiIC8+JytcbiAgICAgICAgICAgICc8L29iamVjdD4nO1xuICAgIH0pO1xufVxuXG4vLyBJZiBnaXZlbiB0aW1lb3V0LCBnZXRzIHJlamVjdGVkIGFmdGVyIG4gbXNlYywgb3RoZXJ3aXNlIG5ldmVyIHJlc29sdmVzLlxuZnVuY3Rpb24gcmVqZWN0QWZ0ZXIobXNlYywgdmFsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKG1zZWMgPiAwKVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJlamVjdCh2YWwpOyB9LCBtc2VjKTtcbiAgICB9KTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHBsdWdpbiB3aXRoIGEgZ2l2ZW4gbWltZXR5cGUgaXMgaW5zdGFsbGVkLlxuZnVuY3Rpb24gaXNJbnN0YWxsZWQobWltZXR5cGUpIHtcbiAgICBuYXZpZ2F0b3IucGx1Z2lucy5yZWZyZXNoKGZhbHNlKTtcbiAgICByZXR1cm4gISFuYXZpZ2F0b3IubWltZVR5cGVzW21pbWV0eXBlXTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyksXG4gICAgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyksXG4gICAgdW5vcm0gPSByZXF1aXJlKCd1bm9ybScpLFxuICAgIGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpLFxuICAgIFByb21pc2UgPSByZXF1aXJlKCdwcm9taXNlJyksXG4gICAgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gVHJlem9yIGRldmljZSBzZXNzaW9uIGhhbmRsZS4gQWN0cyBhcyBhIGV2ZW50IGVtaXR0ZXIuXG4vL1xuLy8gRXZlbnRzOlxuLy9cbi8vICBzZW5kOiB0eXBlLCBtZXNzYWdlXG4vLyAgcmVjZWl2ZTogdHlwZSwgbWVzc2FnZVxuLy8gIGVycm9yOiBlcnJvclxuLy9cbi8vICBidXR0b246IGNvZGVcbi8vICBwaW46IHR5cGUsIGNhbGxiYWNrKGVycm9yLCBwaW4pXG4vLyAgd29yZDogY2FsbGJhY2soZXJyb3IsIHdvcmQpXG4vLyAgcGFzc3BocmFzZTogY2FsbGJhY2soZXJyb3IsIHBhc3NwaHJhc2UpXG4vL1xudmFyIFNlc3Npb24gPSBmdW5jdGlvbiAodHJhbnNwb3J0LCBzZXNzaW9uSWQpIHtcbiAgICB0aGlzLl90cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG4gICAgdGhpcy5fc2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSB0aGlzOyAvLyBUT0RPOiBnZXQgZW1pdHRlciBhcyBhIHBhcmFtXG59O1xuXG51dGlsLmluaGVyaXRzKFNlc3Npb24sIEV2ZW50RW1pdHRlcik7XG5cblNlc3Npb24ucHJvdG90eXBlLmdldElkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXNzaW9uSWQ7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdbdHJlem9yXSBSZWxlYXNpbmcgc2Vzc2lvbicpO1xuICAgIHJldHVybiB0aGlzLl90cmFuc3BvcnQucmVsZWFzZSh0aGlzLl9zZXNzaW9uSWQpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdJbml0aWFsaXplJywgJ0ZlYXR1cmVzJyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5nZXRFbnRyb3B5ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdHZXRFbnRyb3B5JywgJ0VudHJvcHknLCB7XG4gICAgICAgIHNpemU6IHNpemVcbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLmdldEFkZHJlc3MgPSBmdW5jdGlvbiAoYWRkcmVzc19uLCBjb2luLCBzaG93X2Rpc3BsYXkpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdHZXRBZGRyZXNzJywgJ0FkZHJlc3MnLCB7XG4gICAgICAgIGFkZHJlc3NfbjogYWRkcmVzc19uLFxuICAgICAgICBjb2luX25hbWU6IGNvaW4uY29pbl9uYW1lLFxuICAgICAgICBzaG93X2Rpc3BsYXk6ICEhc2hvd19kaXNwbGF5XG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHJlcy5tZXNzYWdlLnBhdGggPSBhZGRyZXNzX24gfHwgW107XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5nZXRQdWJsaWNLZXkgPSBmdW5jdGlvbiAoYWRkcmVzc19uKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVkQ29tbW9uQ2FsbCgnR2V0UHVibGljS2V5JywgJ1B1YmxpY0tleScsIHtcbiAgICAgICAgYWRkcmVzc19uOiBhZGRyZXNzX25cbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgcmVzLm1lc3NhZ2Uubm9kZS5wYXRoID0gYWRkcmVzc19uIHx8IFtdO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUud2lwZURldmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbW9uQ2FsbCgnV2lwZURldmljZScpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUucmVzZXREZXZpY2UgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbW9uQ2FsbCgnUmVzZXREZXZpY2UnLCBzZXR0aW5ncyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5sb2FkRGV2aWNlID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ0xvYWREZXZpY2UnLCBzZXR0aW5ncyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5yZWNvdmVyRGV2aWNlID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ1JlY292ZXJ5RGV2aWNlJywgc2V0dGluZ3MpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuYXBwbHlTZXR0aW5ncyA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdBcHBseVNldHRpbmdzJywgc2V0dGluZ3MpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuY2hhbmdlUGluID0gZnVuY3Rpb24gKHJlbW92ZSkge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdDaGFuZ2VQaW4nLCB7XG4gICAgICAgIHJlbW92ZTogcmVtb3ZlIHx8IGZhbHNlXG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5lcmFzZUZpcm13YXJlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdGaXJtd2FyZUVyYXNlJyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS51cGxvYWRGaXJtd2FyZSA9IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ0Zpcm13YXJlVXBsb2FkJywge1xuICAgICAgICBwYXlsb2FkOiBwYXlsb2FkXG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS52ZXJpZnlNZXNzYWdlID0gZnVuY3Rpb24gKGFkZHJlc3MsIHNpZ25hdHVyZSwgbWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdWZXJpZnlNZXNzYWdlJywge1xuICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxuICAgICAgICBzaWduYXR1cmU6IHNpZ25hdHVyZSxcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuc2lnbk1lc3NhZ2UgPSBmdW5jdGlvbiAoYWRkcmVzc19uLCBtZXNzYWdlLCBjb2luKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVkQ29tbW9uQ2FsbCgnU2lnbk1lc3NhZ2UnLCAnTWVzc2FnZVNpZ25hdHVyZScsIHtcbiAgICAgICAgYWRkcmVzc19uOiBhZGRyZXNzX24sXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgIGNvaW5fbmFtZTogY29pbi5jb2luX25hbWVcbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLnNpZ25JZGVudGl0eSA9IGZ1bmN0aW9uIChpZGVudGl0eSwgY2hhbGxlbmdlX2hpZGRlbiwgY2hhbGxlbmdlX3Zpc3VhbCkge1xuICAgIHJldHVybiB0aGlzLl90eXBlZENvbW1vbkNhbGwoJ1NpZ25JZGVudGl0eScsICdTaWduZWRJZGVudGl0eScsIHtcbiAgICAgICAgaWRlbnRpdHk6IGlkZW50aXR5LFxuICAgICAgICBjaGFsbGVuZ2VfaGlkZGVuOiBjaGFsbGVuZ2VfaGlkZGVuLFxuICAgICAgICBjaGFsbGVuZ2VfdmlzdWFsOiBjaGFsbGVuZ2VfdmlzdWFsXG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5tZWFzdXJlVHggPSBmdW5jdGlvbiAoaW5wdXRzLCBvdXRwdXRzLCBjb2luKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVkQ29tbW9uQ2FsbCgnRXN0aW1hdGVUeFNpemUnLCAnVHhTaXplJywge1xuICAgICAgICBpbnB1dHNfY291bnQ6IGlucHV0cy5sZW5ndGgsXG4gICAgICAgIG91dHB1dHNfY291bnQ6IG91dHB1dHMubGVuZ3RoLFxuICAgICAgICBjb2luX25hbWU6IGNvaW4uY29pbl9uYW1lXG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5zaW1wbGVTaWduVHggPSBmdW5jdGlvbiAoaW5wdXRzLCBvdXRwdXRzLCB0eHMsIGNvaW4pIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdTaW1wbGVTaWduVHgnLCAnVHhSZXF1ZXN0Jywge1xuICAgICAgICBpbnB1dHM6IGlucHV0cyxcbiAgICAgICAgb3V0cHV0czogb3V0cHV0cyxcbiAgICAgICAgY29pbl9uYW1lOiBjb2luLmNvaW5fbmFtZSxcbiAgICAgICAgdHJhbnNhY3Rpb25zOiB0eHNcbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLl9pbmRleFR4c0ZvclNpZ24gPSBmdW5jdGlvbiAoaW5wdXRzLCBvdXRwdXRzLCB0eHMpIHtcbiAgICB2YXIgaW5kZXggPSB7fTtcblxuICAgIC8vIFR4IGJlaW5nIHNpZ25lZFxuICAgIGluZGV4WycnXSA9IHtcbiAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IG91dHB1dHNcbiAgICB9O1xuXG4gICAgLy8gUmVmZXJlbmNlZCB0eHNcbiAgICB0eHMuZm9yRWFjaChmdW5jdGlvbiAodHgpIHtcbiAgICAgICAgaW5kZXhbdHguaGFzaC50b0xvd2VyQ2FzZSgpXSA9IHR4O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGluZGV4O1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuc2lnblR4ID0gZnVuY3Rpb24gKGlucHV0cywgb3V0cHV0cywgdHhzLCBjb2luKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBpbmRleCA9IHRoaXMuX2luZGV4VHhzRm9yU2lnbihpbnB1dHMsIG91dHB1dHMsIHR4cyksXG4gICAgICAgIHNpZ25hdHVyZXMgPSBbXSxcbiAgICAgICAgc2VyaWFsaXplZFR4ID0gJyc7XG5cbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdTaWduVHgnLCAnVHhSZXF1ZXN0Jywge1xuICAgICAgICBpbnB1dHNfY291bnQ6IGlucHV0cy5sZW5ndGgsXG4gICAgICAgIG91dHB1dHNfY291bnQ6IG91dHB1dHMubGVuZ3RoLFxuICAgICAgICBjb2luX25hbWU6IGNvaW4uY29pbl9uYW1lXG4gICAgfSkudGhlbihwcm9jZXNzKTtcblxuICAgIGZ1bmN0aW9uIHByb2Nlc3MocmVzKSB7XG4gICAgICAgIHZhciBtID0gcmVzLm1lc3NhZ2UsXG4gICAgICAgICAgICBtcyA9IG0uc2VyaWFsaXplZCxcbiAgICAgICAgICAgIG1kID0gbS5kZXRhaWxzLFxuICAgICAgICAgICAgcmVxVHgsIHJlc1R4O1xuXG4gICAgICAgIGlmIChtcyAmJiBtcy5zZXJpYWxpemVkX3R4ICE9IG51bGwpXG4gICAgICAgICAgICBzZXJpYWxpemVkVHggKz0gbXMuc2VyaWFsaXplZF90eDtcbiAgICAgICAgaWYgKG1zICYmIG1zLnNpZ25hdHVyZV9pbmRleCAhPSBudWxsKVxuICAgICAgICAgICAgc2lnbmF0dXJlc1ttcy5zaWduYXR1cmVfaW5kZXhdID0gbXMuc2lnbmF0dXJlO1xuXG4gICAgICAgIGlmIChtLnJlcXVlc3RfdHlwZSA9PT0gJ1RYRklOSVNIRUQnKVxuICAgICAgICAgICAgcmV0dXJuIHsgLy8gc2FtZSBmb3JtYXQgYXMgU2ltcGxlU2lnblR4XG4gICAgICAgICAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduYXR1cmVzOiBzaWduYXR1cmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXplZF90eDogc2VyaWFsaXplZFR4XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHJlc1R4ID0ge307XG4gICAgICAgIHJlcVR4ID0gaW5kZXhbKG1kLnR4X2hhc2ggfHwgJycpLnRvTG93ZXJDYXNlKCldO1xuXG4gICAgICAgIGlmICghcmVxVHgpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWQudHhfaGFzaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKCdSZXF1ZXN0ZWQgdW5rbm93biB0eDogJyArIG1kLnR4X2hhc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAoJ1JlcXVlc3RlZCB0eCBmb3Igc2lnbmluZyBub3QgaW5kZXhlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgIHN3aXRjaCAobS5yZXF1ZXN0X3R5cGUpIHtcblxuICAgICAgICBjYXNlICdUWElOUFVUJzpcbiAgICAgICAgICAgIHJlc1R4LmlucHV0cyA9IFtyZXFUeC5pbnB1dHNbK21kLnJlcXVlc3RfaW5kZXhdXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ1RYT1VUUFVUJzpcbiAgICAgICAgICAgIGlmIChtZC50eF9oYXNoKVxuICAgICAgICAgICAgICAgIHJlc1R4LmJpbl9vdXRwdXRzID0gW3JlcVR4LmJpbl9vdXRwdXRzWyttZC5yZXF1ZXN0X2luZGV4XV07XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzVHgub3V0cHV0cyA9IFtyZXFUeC5vdXRwdXRzWyttZC5yZXF1ZXN0X2luZGV4XV07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdUWE1FVEEnOlxuICAgICAgICAgICAgcmVzVHgudmVyc2lvbiA9IHJlcVR4LnZlcnNpb247XG4gICAgICAgICAgICByZXNUeC5sb2NrX3RpbWUgPSByZXFUeC5sb2NrX3RpbWU7XG4gICAgICAgICAgICByZXNUeC5pbnB1dHNfY250ID0gcmVxVHguaW5wdXRzLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChtZC50eF9oYXNoKVxuICAgICAgICAgICAgICAgIHJlc1R4Lm91dHB1dHNfY250ID0gcmVxVHguYmluX291dHB1dHMubGVuZ3RoO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc1R4Lm91dHB1dHNfY250ID0gcmVxVHgub3V0cHV0cy5sZW5ndGg7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHJlcXVlc3QgdHlwZTogJyArIG0ucmVxdWVzdF90eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxmLl90eXBlZENvbW1vbkNhbGwoJ1R4QWNrJywgJ1R4UmVxdWVzdCcsIHtcbiAgICAgICAgICAgIHR4OiByZXNUeFxuICAgICAgICB9KS50aGVuKHByb2Nlc3MpO1xuICAgIH1cbn07XG5cblNlc3Npb24ucHJvdG90eXBlLl90eXBlZENvbW1vbkNhbGwgPSBmdW5jdGlvbiAodHlwZSwgcmVzVHlwZSwgbXNnKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwodHlwZSwgbXNnKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX2Fzc2VydFR5cGUocmVzLCByZXNUeXBlKTtcbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLl9hc3NlcnRUeXBlID0gZnVuY3Rpb24gKHJlcywgcmVzVHlwZSkge1xuICAgIGlmIChyZXMudHlwZSAhPT0gcmVzVHlwZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVzcG9uc2Ugb2YgdW5leHBlY3RlZCB0eXBlOiAnICsgcmVzLnR5cGUpO1xuICAgIHJldHVybiByZXM7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fY29tbW9uQ2FsbCA9IGZ1bmN0aW9uICh0eXBlLCBtc2cpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNhbGxwciA9IHRoaXMuX2NhbGwodHlwZSwgbXNnKTtcblxuICAgIHJldHVybiBjYWxscHIudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9maWx0ZXJDb21tb25UeXBlcyhyZXMpO1xuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX2ZpbHRlckNvbW1vblR5cGVzID0gZnVuY3Rpb24gKHJlcykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmIChyZXMudHlwZSA9PT0gJ0ZhaWx1cmUnKVxuICAgICAgICB0aHJvdyByZXMubWVzc2FnZTtcblxuICAgIGlmIChyZXMudHlwZSA9PT0gJ0J1dHRvblJlcXVlc3QnKSB7XG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnYnV0dG9uJywgcmVzLm1lc3NhZ2UuY29kZSk7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdCdXR0b25BY2snKTtcbiAgICB9XG5cbiAgICBpZiAocmVzLnR5cGUgPT09ICdFbnRyb3B5UmVxdWVzdCcpXG4gICAgICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdFbnRyb3B5QWNrJywge1xuICAgICAgICAgICAgZW50cm9weTogc3RyaW5nVG9IZXgodGhpcy5fZ2VuZXJhdGVFbnRyb3B5KDMyKSlcbiAgICAgICAgfSk7XG5cbiAgICBpZiAocmVzLnR5cGUgPT09ICdQaW5NYXRyaXhSZXF1ZXN0JylcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb21wdFBpbihyZXMubWVzc2FnZS50eXBlKS50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHBpbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9jb21tb25DYWxsKCdQaW5NYXRyaXhBY2snLCB7IHBpbjogcGluIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fY29tbW9uQ2FsbCgnQ2FuY2VsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICBpZiAocmVzLnR5cGUgPT09ICdQYXNzcGhyYXNlUmVxdWVzdCcpXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9tcHRQYXNzcGhyYXNlKCkudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChwYXNzcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2NvbW1vbkNhbGwoJ1Bhc3NwaHJhc2VBY2snLCB7IHBhc3NwaHJhc2U6IHBhc3NwaHJhc2UgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9jb21tb25DYWxsKCdDYW5jZWwnKS50aGVuKG51bGwsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVyciB8fCBlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgaWYgKHJlcy50eXBlID09PSAnV29yZFJlcXVlc3QnKVxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvbXB0V29yZCgpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAod29yZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9jb21tb25DYWxsKCdXb3JkQWNrJywgeyB3b3JkOiB3b3JkIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fY29tbW9uQ2FsbCgnQ2FuY2VsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX3Byb21wdFBpbiA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFzZWxmLl9lbWl0dGVyLmVtaXQoJ3BpbicsIHR5cGUsIGZ1bmN0aW9uIChlcnIsIHBpbikge1xuICAgICAgICAgICAgaWYgKGVyciB8fCBwaW4gPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBpbik7XG4gICAgICAgIH0pKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1t0cmV6b3JdIFBJTiBjYWxsYmFjayBub3QgY29uZmlndXJlZCwgY2FuY2VsbGluZyByZXF1ZXN0Jyk7XG4gICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX3Byb21wdFBhc3NwaHJhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFzZWxmLl9lbWl0dGVyLmVtaXQoJ3Bhc3NwaHJhc2UnLCBmdW5jdGlvbiAoZXJyLCBwYXNzcGhyYXNlKSB7XG4gICAgICAgICAgICBpZiAoZXJyIHx8IHBhc3NwaHJhc2UgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBhc3NwaHJhc2Uubm9ybWFsaXplKCdORktEJykpO1xuICAgICAgICB9KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdHJlem9yXSBQYXNzcGhyYXNlIGNhbGxiYWNrIG5vdCBjb25maWd1cmVkLCBjYW5jZWxsaW5nIHJlcXVlc3QnKTtcbiAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fcHJvbXB0V29yZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIXNlbGYuX2VtaXR0ZXIuZW1pdCgnd29yZCcsIGZ1bmN0aW9uIChlcnIsIHdvcmQpIHtcbiAgICAgICAgICAgIGlmIChlcnIgfHwgd29yZCA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc29sdmUod29yZC50b0xvY2FsZUxvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW3RyZXpvcl0gV29yZCBjYWxsYmFjayBub3QgY29uZmlndXJlZCwgY2FuY2VsbGluZyByZXF1ZXN0Jyk7XG4gICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX2dlbmVyYXRlRW50cm9weSA9IGZ1bmN0aW9uIChsZW4pIHtcbiAgICByZXR1cm4gY3J5cHRvLnJhbmRvbUJ5dGVzKGxlbikudG9TdHJpbmcoJ2JpbmFyeScpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX2NhbGwgPSBmdW5jdGlvbiAodHlwZSwgbXNnKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBsb2dNZXNzYWdlO1xuXG4gICAgbXNnID0gbXNnIHx8IHt9O1xuICAgIGxvZ01lc3NhZ2UgPSB0aGlzLl9maWx0ZXJGb3JMb2codHlwZSwgbXNnKTtcblxuICAgIGNvbnNvbGUubG9nKCdbdHJlem9yXSBTZW5kaW5nJywgdHlwZSwgbG9nTWVzc2FnZSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdzZW5kJywgdHlwZSwgbXNnKTtcblxuICAgIHJldHVybiB0aGlzLl90cmFuc3BvcnQuY2FsbCh0aGlzLl9zZXNzaW9uSWQsIHR5cGUsIG1zZykudGhlbihcbiAgICAgICAgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgdmFyIGxvZ01lc3NhZ2UgPSBzZWxmLl9maWx0ZXJGb3JMb2cocmVzLnR5cGUsIHJlcy5tZXNzYWdlKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1t0cmV6b3JdIFJlY2VpdmVkJywgcmVzLnR5cGUsIGxvZ01lc3NhZ2UpO1xuICAgICAgICAgICAgc2VsZi5fZW1pdHRlci5lbWl0KCdyZWNlaXZlJywgcmVzLnR5cGUsIHJlcy5tZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdHJlem9yZF0gUmVjZWl2ZWQgZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgc2VsZi5fZW1pdHRlci5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICApO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX2ZpbHRlckZvckxvZyA9IGZ1bmN0aW9uICh0eXBlLCBtc2cpIHtcbiAgICB2YXIgcmVkYWN0ZWQgPSB7fSxcbiAgICAgICAgYmxhY2tsaXN0ID0ge1xuICAgICAgICAgICAgUGFzc3BocmFzZUFjazoge1xuICAgICAgICAgICAgICAgIHBhc3NwaHJhc2U6ICcocmVkYWN0ZWQuLi4pJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgcmV0dXJuIGV4dGVuZChyZWRhY3RlZCwgbXNnLCBibGFja2xpc3RbdHlwZV0gfHwge30pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXNzaW9uO1xuXG4vL1xuLy8gSGV4IGNvZGVjXG4vL1xuXG4vLyBFbmNvZGUgYmluYXJ5IHN0cmluZyB0byBoZXggc3RyaW5nXG5mdW5jdGlvbiBzdHJpbmdUb0hleChiaW4pIHtcbiAgICB2YXIgaSwgY2hyLCBoZXggPSAnJztcblxuICAgIGZvciAoaSA9IDA7IGkgPCBiaW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hyID0gKGJpbi5jaGFyQ29kZUF0KGkpICYgMHhGRikudG9TdHJpbmcoMTYpO1xuICAgICAgICBoZXggKz0gY2hyLmxlbmd0aCA8IDIgPyAnMCcgKyBjaHIgOiBjaHI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhleDtcbn1cblxuLy8gRGVjb2RlIGhleCBzdHJpbmcgdG8gYmluYXJ5IHN0cmluZ1xuZnVuY3Rpb24gaGV4VG9TdHJpbmcoaGV4KSB7XG4gICAgdmFyIGksIGJ5dGVzID0gW107XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgaGV4Lmxlbmd0aCAtIDE7IGkgKz0gMilcbiAgICAgICAgYnl0ZXMucHVzaChwYXJzZUludChoZXguc3Vic3RyKGksIDIpLCAxNikpO1xuXG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBieXRlcyk7XG59XG4iLCJ2YXIgc3VwZXJhZ2VudExlZ2FjeUlFU3VwcG9ydFBsdWdpbiA9IGZ1bmN0aW9uIChzdXBlcmFnZW50KSB7XG5cbiAgICAvLyBhIGxpdGxlIGNoZWF0IHRvIHBhcnNlIHRoZSB1cmwsIHRvIGZpbmQgdGhlIGhvc3RuYW1lLlxuICAgIGZ1bmN0aW9uIHBhcnNlVXJsKHVybCkge1xuICAgICAgICB2YXIgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBhbmNob3IuaHJlZiA9IHVybDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaG9zdG5hbWU6IGFuY2hvci5ob3N0bmFtZSxcbiAgICAgICAgICAgIHByb3RvY29sOiBhbmNob3IucHJvdG9jb2wsXG4gICAgICAgICAgICBwYXRobmFtZTogYW5jaG9yLnBhdGhuYW1lLFxuICAgICAgICAgICAgcXVlcnlTdHJpbmc6IGFuY2hvci5zZWFyY2hcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLy8gbmVlZGVkIHRvIGNvcHkgdGhpcyBmcm9tIFN1cGVyYWdlbnQgbGlicmFyeSB1bmZvcnR1bmF0ZWx5XG4gICAgZnVuY3Rpb24gc2VyaWFsaXplT2JqZWN0KG9iaikge1xuICAgICAgICBpZiAob2JqICE9PSBPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICAgICAgdmFyIHBhaXJzID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICAgICAgICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICAgICAgICAgICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tleV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFpcnMuam9pbignJicpO1xuICAgIH1cblxuICAgIC8vIHRoZSBvdmVycmlkZGVuIGVuZCBmdW5jdGlvbiB0byB1c2UgZm9yIElFIDggJiA5XG4gICAgdmFyIHhEb21haW5SZXF1ZXN0RW5kID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHhociA9IHRoaXMueGhyID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7IC8vIElFIDggJiA5IGJlc3Bva2UgaW1wbGVtZW50YXRpb25cbiAgICAgICAgXG4gICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IGRvZXNuJ3Qgc3VwcG9ydCB0aGVzZSwgc28gd2Ugc3R1YiB0aGVtIG91dFxuICAgICAgICB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJyc7IH07IFxuICAgICAgICB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL2pzb24nOyAvLyBjYXJlZnVsISB5b3UgbWlnaHQgbm90IGJlIGFibGUgdG8gbWFrZSB0aGlzIGNoZWF0aW5nIGFzc3VtcHRpb24uXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgICAgICAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgICAgICAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gICAgICAgIC8vIHN0YXRlIGNoYW5nZVxuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgeGhyLnN0YXR1cyA9IDIwMDtcbiAgICAgICAgICAgIHNlbGYuZW1pdCgnZW5kJyk7IC8vIGFzc3VtaW5nIGl0cyBhbHdheXMgYSAncmVhZHlTdGF0ZScgb2YgNC5cbiAgICAgICAgfTtcblxuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHhoci5zdGF0dXMgPSA0MDA7XG4gICAgICAgICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBwcm9ncmVzc1xuICAgICAgICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCA1MCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gdGltZW91dFxuICAgICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgeGhyLnN0YXR1cyA9IDQwODtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHF1ZXJ5c3RyaW5nXG4gICAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICAgICAgcXVlcnkgPSBzZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgICAgICAgICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgICAgICAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgICAgICAgICAgICA6ICc/JyArIHF1ZXJ5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWV0aG9kICE9ICdHRVQnICYmIHRoaXMubWV0aG9kICE9ICdQT1NUJykge1xuICAgICAgICAgICAgdGhyb3cgJ09ubHkgR2V0IGFuZCBQb3N0IG1ldGhvZHMgYXJlIHN1cHBvcnRlZCBieSBYRG9tYWluUmVxdWVzdCBvYmplY3QuJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAgICAgICAvLyBDT1JTIC0gd2l0aENyZWRlbnRpYWxzIG5vdCBzdXBwb3J0ZWQgYnkgWERvbWFpblJlcXVlc3RcblxuICAgICAgICAvLyBib2R5IC0gcmVtZW1iZXIgb25seSBQT1NUIGFuZCBHRVRzIGFyZSBzdXBwb3J0ZWRcbiAgICAgICAgaWYgKCdQT1NUJyA9PSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSkge1xuICAgICAgICAgICAgZGF0YSA9IHNlcmlhbGl6ZU9iamVjdChkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGN1c3RvbSBoZWFkZXJzIGFyZSBub3Qgc3VwcG9ydCBieSBYRG9tYWluUmVxdWVzdFxuXG4gICAgICAgIC8vIHNlbmQgc3R1ZmZcbiAgICAgICAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG4gICAgICAgIHhoci5zZW5kKGRhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGVzIC5lbmQoKSB0byB1c2UgWERvbWFpblJlcXVlc3Qgb2JqZWN0IHdoZW4gbmVjZXNzYXJ5IChtYWtpbmcgYSBjcm9zcyBkb21haW4gcmVxdWVzdCBvbiBJRSA4ICYgOS5cbiAgICAgKi9cblxuICAgIC8vIGlmIHJlcXVlc3QgdG8gb3RoZXIgZG9tYWluLCBhbmQgd2UncmUgb24gYSByZWxldmFudCBicm93c2VyXG4gICAgdmFyIHBhcnNlZFVybCA9IHBhcnNlVXJsKHN1cGVyYWdlbnQudXJsKTtcbiAgICBpZiAocGFyc2VkVXJsLmhvc3RuYW1lICE9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSAmJlxuICAgICAgICB0eXBlb2YgWERvbWFpblJlcXVlc3QgIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gSUUgOCAmIDlcbiAgICAgICAgLy8gKG5vdGUgYW5vdGhlciBYRG9tYWluUmVxdWVzdCByZXN0cmljdGlvbiAtIGNhbGxzIG11c3QgYWx3YXlzIGJlIHRvIHRoZSBzYW1lIHByb3RvY29sIGFzIHRoZSBjdXJyZW50IHBhZ2UuKVxuICAgICAgICBzdXBlcmFnZW50LmVuZCA9IHhEb21haW5SZXF1ZXN0RW5kO1xuICAgIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdXBlcmFnZW50TGVnYWN5SUVTdXBwb3J0UGx1Z2luO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyksXG4gICAgaHR0cCA9IHJlcXVpcmUoJy4uL2h0dHAnKTtcblxudmFyIERFRkFVTFRfVVJMID0gJ2h0dHBzOi8vbG9jYWxiYWNrLm5ldDoyMTMyNCc7XG5cbi8vXG4vLyBIVFRQIHRyYW5zcG9ydC5cbi8vXG52YXIgSHR0cFRyYW5zcG9ydCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICB1cmwgPSB1cmwgfHwgREVGQVVMVF9VUkw7XG4gICAgdGhpcy5fdXJsID0gdXJsO1xufTtcblxuSHR0cFRyYW5zcG9ydC5jcmVhdGUgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgdXJsID0gdXJsIHx8IERFRkFVTFRfVVJMO1xuICAgIGNvbnNvbGUubG9nKCdbdHJlem9yXSBBdHRlbXB0aW5nIHRvIGxvYWQgSFRUUCB0cmFuc3BvcnQgYXQnLCB1cmwpO1xuICAgIHJldHVybiBIdHRwVHJhbnNwb3J0LnN0YXR1cyh1cmwpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3RyZXpvcl0gTG9hZGVkIEhUVFAgdHJhbnNwb3J0JywgaW5mbyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEh0dHBUcmFuc3BvcnQodXJsKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1t0cmV6b3JdIEZhaWxlZCB0byBsb2FkIEhUVFAgdHJhbnNwb3J0JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICApO1xufTtcblxuSHR0cFRyYW5zcG9ydC5zdGF0dXMgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgdXJsID0gdXJsIHx8IERFRkFVTFRfVVJMO1xuICAgIHJldHVybiBodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICB9KTtcbn07XG5cbi8vIEBkZXByZWNhdGVkXG5IdHRwVHJhbnNwb3J0LmNvbm5lY3QgPSBIdHRwVHJhbnNwb3J0LnN0YXR1cztcblxuSHR0cFRyYW5zcG9ydC5wcm90b3R5cGUuX3JlcXVlc3QgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBodHRwKGV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgIHVybDogdGhpcy5fdXJsICsgb3B0aW9ucy51cmxcbiAgICB9KSk7XG59O1xuXG5IdHRwVHJhbnNwb3J0LnByb3RvdHlwZS5jb25maWd1cmUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgdXJsOiAnL2NvbmZpZ3VyZScsXG4gICAgICAgIGJvZHk6IGNvbmZpZ1xuICAgIH0pO1xufTtcblxuSHR0cFRyYW5zcG9ydC5wcm90b3R5cGUuZW51bWVyYXRlID0gZnVuY3Rpb24gKHdhaXQpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogd2FpdCA/ICcvbGlzdGVuJyA6ICcvZW51bWVyYXRlJ1xuICAgIH0pO1xufTtcblxuSHR0cFRyYW5zcG9ydC5wcm90b3R5cGUuYWNxdWlyZSA9IGZ1bmN0aW9uIChkZXZpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB1cmw6ICcvYWNxdWlyZS8nICsgZGV2aWNlLnBhdGhcbiAgICB9KTtcbn07XG5cbkh0dHBUcmFuc3BvcnQucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAoc2Vzc2lvbklkKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgdXJsOiAnL3JlbGVhc2UvJyArIHNlc3Npb25JZFxuICAgIH0pO1xufTtcblxuSHR0cFRyYW5zcG9ydC5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHR5cGUsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB1cmw6ICcvY2FsbC8nICsgc2Vzc2lvbklkLFxuICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEh0dHBUcmFuc3BvcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBQcm9taXNlID0gcmVxdWlyZSgncHJvbWlzZScpLFxuICAgIHBsdWdpbl8gPSByZXF1aXJlKCcuLi9wbHVnaW4nKSxcbiAgICB0cmF2ZXJzZSA9IHJlcXVpcmUoJ3RyYXZlcnNlJyk7XG5cbi8vXG4vLyBQbHVnaW4gdHJhbnNwb3J0LlxuLy9cbnZhciBQbHVnaW5UcmFuc3BvcnQgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgdGhpcy5fcGx1Z2luID0gcGx1Z2luO1xufTtcblxuLy8gSW5qZWN0cyB0aGUgcGx1Z2luIGFuZCByZXR1cm5zIGEgUGx1Z2luVHJhbnNwb3J0LlxuUGx1Z2luVHJhbnNwb3J0LmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnW3RyZXpvcl0gQXR0ZW1wdGluZyB0byBsb2FkIHBsdWdpbiB0cmFuc3BvcnQnKTtcbiAgICByZXR1cm4gUGx1Z2luVHJhbnNwb3J0LmxvYWRQbHVnaW4oKS50aGVuKFxuICAgICAgICBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3RyZXpvcl0gTG9hZGVkIHBsdWdpbiB0cmFuc3BvcnQnKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGx1Z2luVHJhbnNwb3J0KHBsdWdpbik7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdHJlem9yXSBGYWlsZWQgdG8gbG9hZCBwbHVnaW4gdHJhbnNwb3J0JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICApO1xufVxuXG4vLyBJbmplY3RzIHRoZSBwbHVnaW4gb2JqZWN0IGludG8gdGhlIGRvY3VtZW50LlxuUGx1Z2luVHJhbnNwb3J0LmxvYWRQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHBsdWdpbl8ubG9hZCgpO1xufTtcblxuLy8gQklQMzIgQ0tEIGRlcml2YXRpb24gb2YgdGhlIGdpdmVuIGluZGV4XG5QbHVnaW5UcmFuc3BvcnQucHJvdG90eXBlLmRlcml2ZUNoaWxkTm9kZSA9IGZ1bmN0aW9uIChub2RlLCBpbmRleCkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMuX3BsdWdpbi5kZXJpdmVDaGlsZE5vZGUobm9kZSwgaW5kZXgpO1xuXG4gICAgaWYgKG5vZGUucGF0aCkge1xuICAgICAgICBjaGlsZC5wYXRoID0gbm9kZS5wYXRoLmNvbmNhdChbaW5kZXhdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGQ7XG59O1xuXG4vLyBDb25maWd1cmVzIHRoZSBwbHVnaW4uXG5QbHVnaW5UcmFuc3BvcnQucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fcGx1Z2luO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBsdWdpbi5jb25maWd1cmUoY29uZmlnKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gSW4gbW9zdCBicm93c2VycywgZXhjZXB0aW9ucyBmcm9tIHBsdWdpbiBtZXRob2RzIGFyZSBub3QgcHJvcGVybHlcbiAgICAgICAgICAgIC8vIHByb3BhZ2F0ZWRcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgJ1BsdWdpbiBjb25maWd1cmF0aW9uIGZvdW5kLCBidXQgY291bGQgbm90IGJlIHVzZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnTWFrZSBzdXJlIGl0IGhhcyBwcm9wZXIgZm9ybWF0IGFuZCBhIHZhbGlkIHNpZ25hdHVyZS4nXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gRW51bWVyYXRlcyBjb25uZWN0ZWQgZGV2aWNlcy5cbi8vIFJlcXVpcmVzIGNvbmZpZ3VyZWQgcGx1Z2luLlxuUGx1Z2luVHJhbnNwb3J0LnByb3RvdHlwZS5lbnVtZXJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX3BsdWdpbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICByZXNvbHZlKHBsdWdpbi5kZXZpY2VzKCkpO1xuICAgIH0pO1xufTtcblxuLy8gT3BlbnMgYSBkZXZpY2UgYW5kIHJldHVybnMgYSBzZXNzaW9uIG9iamVjdC5cblBsdWdpblRyYW5zcG9ydC5wcm90b3R5cGUuYWNxdWlyZSA9IGZ1bmN0aW9uIChkZXZpY2UpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgc2Vzc2lvbjogZGV2aWNlXG4gICAgfSk7XG59O1xuXG4vLyBSZWxlYXNlcyB0aGUgZGV2aWNlIGhhbmRsZS5cblBsdWdpblRyYW5zcG9ydC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIChkZXZpY2UpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fcGx1Z2luO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcGx1Z2luLmNsb3NlKGRldmljZSwge1xuICAgICAgICAgICAgc3VjY2VzczogcmVzb2x2ZSxcbiAgICAgICAgICAgIGVycm9yOiByZWplY3RcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vLyBEb2VzIGEgcmVxdWVzdC1yZXNwb25zZSBjYWxsIHRvIHRoZSBkZXZpY2UuXG5QbHVnaW5UcmFuc3BvcnQucHJvdG90eXBlLmNhbGwgPSBmdW5jdGlvbiAoZGV2aWNlLCB0eXBlLCBtZXNzYWdlKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX3BsdWdpbixcbiAgICAgICAgdGltZW91dCA9IGZhbHNlO1xuXG4gICAgLy8gQml0Y29pblRyZXpvclBsdWdpbiBoYXMgYSBidWcsIGNhdXNpbmcgZGlmZmVyZW50IHRyZWF0bWVudCBvZlxuICAgIC8vIHVuZGVmaW5lZCBmaWVsZHMgaW4gbWVzc2FnZXMuIFdlIG5lZWQgdG8gZmluZCBhbGwgdW5kZWZpbmVkIGZpZWxkc1xuICAgIC8vIGFuZCByZW1vdmUgdGhlbSBmcm9tIHRoZSBtZXNzYWdlIG9iamVjdC4gYHRyYXZlcnNlYCB3aWxsIGRlbGV0ZVxuICAgIC8vIG9iamVjdCBmaWVsZHMgYW5kIHNwbGljZSBvdXQgYXJyYXkgaXRlbXMgcHJvcGVybHkuXG4gICAgdHJhdmVyc2UobWVzc2FnZSkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHBsdWdpbi5jYWxsKGRldmljZSwgdGltZW91dCwgdHlwZSwgbWVzc2FnZSwge1xuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHQsIG0pIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpblRyYW5zcG9ydDtcbiIsIi8vIGh0dHA6Ly93aWtpLmNvbW1vbmpzLm9yZy93aWtpL1VuaXRfVGVzdGluZy8xLjBcbi8vXG4vLyBUSElTIElTIE5PVCBURVNURUQgTk9SIExJS0VMWSBUTyBXT1JLIE9VVFNJREUgVjghXG4vL1xuLy8gT3JpZ2luYWxseSBmcm9tIG5hcndoYWwuanMgKGh0dHA6Ly9uYXJ3aGFsanMub3JnKVxuLy8gQ29weXJpZ2h0IChjKSAyMDA5IFRob21hcyBSb2JpbnNvbiA8Mjgwbm9ydGguY29tPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0b1xuLy8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGVcbi8vIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxuLy8gc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU5cbi8vIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyB3aGVuIHVzZWQgaW4gbm9kZSwgdGhpcyB3aWxsIGFjdHVhbGx5IGxvYWQgdGhlIHV0aWwgbW9kdWxlIHdlIGRlcGVuZCBvblxuLy8gdmVyc3VzIGxvYWRpbmcgdGhlIGJ1aWx0aW4gdXRpbCBtb2R1bGUgYXMgaGFwcGVucyBvdGhlcndpc2Vcbi8vIHRoaXMgaXMgYSBidWcgaW4gbm9kZSBtb2R1bGUgbG9hZGluZyBhcyBmYXIgYXMgSSBhbSBjb25jZXJuZWRcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbC8nKTtcblxudmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyAxLiBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG5cbi8vIDIuIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGFzc2VydC5cbi8vIG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IoeyBtZXNzYWdlOiBtZXNzYWdlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCB9KVxuXG5hc3NlcnQuQXNzZXJ0aW9uRXJyb3IgPSBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvcic7XG4gIHRoaXMuYWN0dWFsID0gb3B0aW9ucy5hY3R1YWw7XG4gIHRoaXMuZXhwZWN0ZWQgPSBvcHRpb25zLmV4cGVjdGVkO1xuICB0aGlzLm9wZXJhdG9yID0gb3B0aW9ucy5vcGVyYXRvcjtcbiAgaWYgKG9wdGlvbnMubWVzc2FnZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBnZXRNZXNzYWdlKHRoaXMpO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IHRydWU7XG4gIH1cbiAgdmFyIHN0YWNrU3RhcnRGdW5jdGlvbiA9IG9wdGlvbnMuc3RhY2tTdGFydEZ1bmN0aW9uIHx8IGZhaWw7XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgc3RhY2tTdGFydEZ1bmN0aW9uKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBub24gdjggYnJvd3NlcnMgc28gd2UgY2FuIGhhdmUgYSBzdGFja3RyYWNlXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcigpO1xuICAgIGlmIChlcnIuc3RhY2spIHtcbiAgICAgIHZhciBvdXQgPSBlcnIuc3RhY2s7XG5cbiAgICAgIC8vIHRyeSB0byBzdHJpcCB1c2VsZXNzIGZyYW1lc1xuICAgICAgdmFyIGZuX25hbWUgPSBzdGFja1N0YXJ0RnVuY3Rpb24ubmFtZTtcbiAgICAgIHZhciBpZHggPSBvdXQuaW5kZXhPZignXFxuJyArIGZuX25hbWUpO1xuICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIC8vIG9uY2Ugd2UgaGF2ZSBsb2NhdGVkIHRoZSBmdW5jdGlvbiBmcmFtZVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIHN0cmlwIG91dCBldmVyeXRoaW5nIGJlZm9yZSBpdCAoYW5kIGl0cyBsaW5lKVxuICAgICAgICB2YXIgbmV4dF9saW5lID0gb3V0LmluZGV4T2YoJ1xcbicsIGlkeCArIDEpO1xuICAgICAgICBvdXQgPSBvdXQuc3Vic3RyaW5nKG5leHRfbGluZSArIDEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YWNrID0gb3V0O1xuICAgIH1cbiAgfVxufTtcblxuLy8gYXNzZXJ0LkFzc2VydGlvbkVycm9yIGluc3RhbmNlb2YgRXJyb3JcbnV0aWwuaW5oZXJpdHMoYXNzZXJ0LkFzc2VydGlvbkVycm9yLCBFcnJvcik7XG5cbmZ1bmN0aW9uIHJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgaWYgKHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuICcnICsgdmFsdWU7XG4gIH1cbiAgaWYgKHV0aWwuaXNOdW1iZXIodmFsdWUpICYmIChpc05hTih2YWx1ZSkgfHwgIWlzRmluaXRlKHZhbHVlKSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICBpZiAodXRpbC5pc0Z1bmN0aW9uKHZhbHVlKSB8fCB1dGlsLmlzUmVnRXhwKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdHJ1bmNhdGUocywgbikge1xuICBpZiAodXRpbC5pc1N0cmluZyhzKSkge1xuICAgIHJldHVybiBzLmxlbmd0aCA8IG4gPyBzIDogcy5zbGljZSgwLCBuKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlKHNlbGYpIHtcbiAgcmV0dXJuIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuYWN0dWFsLCByZXBsYWNlciksIDEyOCkgKyAnICcgK1xuICAgICAgICAgc2VsZi5vcGVyYXRvciArICcgJyArXG4gICAgICAgICB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmV4cGVjdGVkLCByZXBsYWNlciksIDEyOCk7XG59XG5cbi8vIEF0IHByZXNlbnQgb25seSB0aGUgdGhyZWUga2V5cyBtZW50aW9uZWQgYWJvdmUgYXJlIHVzZWQgYW5kXG4vLyB1bmRlcnN0b29kIGJ5IHRoZSBzcGVjLiBJbXBsZW1lbnRhdGlvbnMgb3Igc3ViIG1vZHVsZXMgY2FuIHBhc3Ncbi8vIG90aGVyIGtleXMgdG8gdGhlIEFzc2VydGlvbkVycm9yJ3MgY29uc3RydWN0b3IgLSB0aGV5IHdpbGwgYmVcbi8vIGlnbm9yZWQuXG5cbi8vIDMuIEFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IHRocm93IGFuIEFzc2VydGlvbkVycm9yXG4vLyB3aGVuIGEgY29ycmVzcG9uZGluZyBjb25kaXRpb24gaXMgbm90IG1ldCwgd2l0aCBhIG1lc3NhZ2UgdGhhdFxuLy8gbWF5IGJlIHVuZGVmaW5lZCBpZiBub3QgcHJvdmlkZWQuICBBbGwgYXNzZXJ0aW9uIG1ldGhvZHMgcHJvdmlkZVxuLy8gYm90aCB0aGUgYWN0dWFsIGFuZCBleHBlY3RlZCB2YWx1ZXMgdG8gdGhlIGFzc2VydGlvbiBlcnJvciBmb3Jcbi8vIGRpc3BsYXkgcHVycG9zZXMuXG5cbmZ1bmN0aW9uIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgb3BlcmF0b3IsIHN0YWNrU3RhcnRGdW5jdGlvbikge1xuICB0aHJvdyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHtcbiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgIGFjdHVhbDogYWN0dWFsLFxuICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICBvcGVyYXRvcjogb3BlcmF0b3IsXG4gICAgc3RhY2tTdGFydEZ1bmN0aW9uOiBzdGFja1N0YXJ0RnVuY3Rpb25cbiAgfSk7XG59XG5cbi8vIEVYVEVOU0lPTiEgYWxsb3dzIGZvciB3ZWxsIGJlaGF2ZWQgZXJyb3JzIGRlZmluZWQgZWxzZXdoZXJlLlxuYXNzZXJ0LmZhaWwgPSBmYWlsO1xuXG4vLyA0LiBQdXJlIGFzc2VydGlvbiB0ZXN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdHJ1dGh5LCBhcyBkZXRlcm1pbmVkXG4vLyBieSAhIWd1YXJkLlxuLy8gYXNzZXJ0Lm9rKGd1YXJkLCBtZXNzYWdlX29wdCk7XG4vLyBUaGlzIHN0YXRlbWVudCBpcyBlcXVpdmFsZW50IHRvIGFzc2VydC5lcXVhbCh0cnVlLCAhIWd1YXJkLFxuLy8gbWVzc2FnZV9vcHQpOy4gVG8gdGVzdCBzdHJpY3RseSBmb3IgdGhlIHZhbHVlIHRydWUsIHVzZVxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKHRydWUsIGd1YXJkLCBtZXNzYWdlX29wdCk7LlxuXG5mdW5jdGlvbiBvayh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQub2spO1xufVxuYXNzZXJ0Lm9rID0gb2s7XG5cbi8vIDUuIFRoZSBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc2hhbGxvdywgY29lcmNpdmUgZXF1YWxpdHkgd2l0aFxuLy8gPT0uXG4vLyBhc3NlcnQuZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZXF1YWwgPSBmdW5jdGlvbiBlcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09JywgYXNzZXJ0LmVxdWFsKTtcbn07XG5cbi8vIDYuIFRoZSBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciB3aGV0aGVyIHR3byBvYmplY3RzIGFyZSBub3QgZXF1YWxcbi8vIHdpdGggIT0gYXNzZXJ0Lm5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT0nLCBhc3NlcnQubm90RXF1YWwpO1xuICB9XG59O1xuXG4vLyA3LiBUaGUgZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGEgZGVlcCBlcXVhbGl0eSByZWxhdGlvbi5cbi8vIGFzc2VydC5kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZGVlcEVxdWFsID0gZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnZGVlcEVxdWFsJywgYXNzZXJ0LmRlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkge1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKHV0aWwuaXNCdWZmZXIoYWN0dWFsKSAmJiB1dGlsLmlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIGlmIChhY3R1YWwubGVuZ3RoICE9IGV4cGVjdGVkLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgLy8gNy4yLiBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBEYXRlIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBEYXRlIG9iamVjdCB0aGF0IHJlZmVycyB0byB0aGUgc2FtZSB0aW1lLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNEYXRlKGFjdHVhbCkgJiYgdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMgSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgUmVnRXhwIG9iamVjdCwgdGhlIGFjdHVhbCB2YWx1ZSBpc1xuICAvLyBlcXVpdmFsZW50IGlmIGl0IGlzIGFsc28gYSBSZWdFeHAgb2JqZWN0IHdpdGggdGhlIHNhbWUgc291cmNlIGFuZFxuICAvLyBwcm9wZXJ0aWVzIChgZ2xvYmFsYCwgYG11bHRpbGluZWAsIGBsYXN0SW5kZXhgLCBgaWdub3JlQ2FzZWApLlxuICB9IGVsc2UgaWYgKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSAmJiB1dGlsLmlzUmVnRXhwKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuc291cmNlID09PSBleHBlY3RlZC5zb3VyY2UgJiZcbiAgICAgICAgICAgYWN0dWFsLmdsb2JhbCA9PT0gZXhwZWN0ZWQuZ2xvYmFsICYmXG4gICAgICAgICAgIGFjdHVhbC5tdWx0aWxpbmUgPT09IGV4cGVjdGVkLm11bHRpbGluZSAmJlxuICAgICAgICAgICBhY3R1YWwubGFzdEluZGV4ID09PSBleHBlY3RlZC5sYXN0SW5kZXggJiZcbiAgICAgICAgICAgYWN0dWFsLmlnbm9yZUNhc2UgPT09IGV4cGVjdGVkLmlnbm9yZUNhc2U7XG5cbiAgLy8gNy40LiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCF1dGlsLmlzT2JqZWN0KGFjdHVhbCkgJiYgIXV0aWwuaXNPYmplY3QoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjUgRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiKSB7XG4gIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiKTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKSxcbiAgICAgICAga2V5LCBpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFfZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyA4LiBUaGUgbm9uLWVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBmb3IgYW55IGRlZXAgaW5lcXVhbGl0eS5cbi8vIGFzc2VydC5ub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gbm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdub3REZWVwRXF1YWwnLCBhc3NlcnQubm90RGVlcEVxdWFsKTtcbiAgfVxufTtcblxuLy8gOS4gVGhlIHN0cmljdCBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc3RyaWN0IGVxdWFsaXR5LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbi8vIGFzc2VydC5zdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5zdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIHN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PT0nLCBhc3NlcnQuc3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG4vLyAxMC4gVGhlIHN0cmljdCBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciBzdHJpY3QgaW5lcXVhbGl0eSwgYXNcbi8vIGRldGVybWluZWQgYnkgIT09LiAgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9PScsIGFzc2VydC5ub3RTdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleHBlY3RlZCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICByZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpO1xuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dzKHNob3VsZFRocm93LCBibG9jaywgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgdmFyIGFjdHVhbDtcblxuICBpZiAodXRpbC5pc1N0cmluZyhleHBlY3RlZCkpIHtcbiAgICBtZXNzYWdlID0gZXhwZWN0ZWQ7XG4gICAgZXhwZWN0ZWQgPSBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYWN0dWFsID0gZTtcbiAgfVxuXG4gIG1lc3NhZ2UgPSAoZXhwZWN0ZWQgJiYgZXhwZWN0ZWQubmFtZSA/ICcgKCcgKyBleHBlY3RlZC5uYW1lICsgJykuJyA6ICcuJykgK1xuICAgICAgICAgICAgKG1lc3NhZ2UgPyAnICcgKyBtZXNzYWdlIDogJy4nKTtcblxuICBpZiAoc2hvdWxkVGhyb3cgJiYgIWFjdHVhbCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ01pc3NpbmcgZXhwZWN0ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKCFzaG91bGRUaHJvdyAmJiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgJ0dvdCB1bndhbnRlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoKHNob3VsZFRocm93ICYmIGFjdHVhbCAmJiBleHBlY3RlZCAmJlxuICAgICAgIWV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fCAoIXNob3VsZFRocm93ICYmIGFjdHVhbCkpIHtcbiAgICB0aHJvdyBhY3R1YWw7XG4gIH1cbn1cblxuLy8gMTEuIEV4cGVjdGVkIHRvIHRocm93IGFuIGVycm9yOlxuLy8gYXNzZXJ0LnRocm93cyhibG9jaywgRXJyb3Jfb3B0LCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC50aHJvd3MgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbdHJ1ZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbi8vIEVYVEVOU0lPTiEgVGhpcyBpcyBhbm5veWluZyB0byB3cml0ZSBvdXRzaWRlIHRoaXMgbW9kdWxlLlxuYXNzZXJ0LmRvZXNOb3RUaHJvdyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW2ZhbHNlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuYXNzZXJ0LmlmRXJyb3IgPSBmdW5jdGlvbihlcnIpIHsgaWYgKGVycikge3Rocm93IGVycjt9fTtcblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn07XG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuIiwidmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbihidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDAsXG4gICAgICBkID0gaXNMRSA/IC0xIDogMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV07XG5cbiAgaSArPSBkO1xuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBzID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gZUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIGUgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBtTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXM7XG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KTtcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pO1xuICAgIGUgPSBlIC0gZUJpYXM7XG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbik7XG59O1xuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGMsXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApLFxuICAgICAgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpLFxuICAgICAgZCA9IGlzTEUgPyAxIDogLTEsXG4gICAgICBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwO1xuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpO1xuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwO1xuICAgIGUgPSBlTWF4O1xuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKTtcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS07XG4gICAgICBjICo9IDI7XG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrO1xuICAgICAgYyAvPSAyO1xuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDA7XG4gICAgICBlID0gZU1heDtcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gZSArIGVCaWFzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gMDtcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KTtcblxuICBlID0gKGUgPDwgbUxlbikgfCBtO1xuICBlTGVuICs9IG1MZW47XG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCk7XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4O1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qZ2xvYmFsIHdpbmRvdywgZ2xvYmFsKi9cbnZhciB1dGlsID0gcmVxdWlyZShcInV0aWxcIilcbnZhciBhc3NlcnQgPSByZXF1aXJlKFwiYXNzZXJ0XCIpXG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxudmFyIGNvbnNvbGVcbnZhciB0aW1lcyA9IHt9XG5cbmlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiICYmIGdsb2JhbC5jb25zb2xlKSB7XG4gICAgY29uc29sZSA9IGdsb2JhbC5jb25zb2xlXG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93LmNvbnNvbGUpIHtcbiAgICBjb25zb2xlID0gd2luZG93LmNvbnNvbGVcbn0gZWxzZSB7XG4gICAgY29uc29sZSA9IHt9XG59XG5cbnZhciBmdW5jdGlvbnMgPSBbXG4gICAgW2xvZywgXCJsb2dcIl1cbiAgICAsIFtpbmZvLCBcImluZm9cIl1cbiAgICAsIFt3YXJuLCBcIndhcm5cIl1cbiAgICAsIFtlcnJvciwgXCJlcnJvclwiXVxuICAgICwgW3RpbWUsIFwidGltZVwiXVxuICAgICwgW3RpbWVFbmQsIFwidGltZUVuZFwiXVxuICAgICwgW3RyYWNlLCBcInRyYWNlXCJdXG4gICAgLCBbZGlyLCBcImRpclwiXVxuICAgICwgW2Fzc2VydCwgXCJhc3NlcnRcIl1cbl1cblxuZm9yICh2YXIgaSA9IDA7IGkgPCBmdW5jdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdHVwbGUgPSBmdW5jdGlvbnNbaV1cbiAgICB2YXIgZiA9IHR1cGxlWzBdXG4gICAgdmFyIG5hbWUgPSB0dXBsZVsxXVxuXG4gICAgaWYgKCFjb25zb2xlW25hbWVdKSB7XG4gICAgICAgIGNvbnNvbGVbbmFtZV0gPSBmXG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnNvbGVcblxuZnVuY3Rpb24gbG9nKCkge31cblxuZnVuY3Rpb24gaW5mbygpIHtcbiAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpXG59XG5cbmZ1bmN0aW9uIHdhcm4oKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKVxufVxuXG5mdW5jdGlvbiBlcnJvcigpIHtcbiAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKVxufVxuXG5mdW5jdGlvbiB0aW1lKGxhYmVsKSB7XG4gICAgdGltZXNbbGFiZWxdID0gRGF0ZS5ub3coKVxufVxuXG5mdW5jdGlvbiB0aW1lRW5kKGxhYmVsKSB7XG4gICAgdmFyIHRpbWUgPSB0aW1lc1tsYWJlbF1cbiAgICBpZiAoIXRpbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gc3VjaCBsYWJlbDogXCIgKyBsYWJlbClcbiAgICB9XG5cbiAgICB2YXIgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gdGltZVxuICAgIGNvbnNvbGUubG9nKGxhYmVsICsgXCI6IFwiICsgZHVyYXRpb24gKyBcIm1zXCIpXG59XG5cbmZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoKVxuICAgIGVyci5uYW1lID0gXCJUcmFjZVwiXG4gICAgZXJyLm1lc3NhZ2UgPSB1dGlsLmZvcm1hdC5hcHBseShudWxsLCBhcmd1bWVudHMpXG4gICAgY29uc29sZS5lcnJvcihlcnIuc3RhY2spXG59XG5cbmZ1bmN0aW9uIGRpcihvYmplY3QpIHtcbiAgICBjb25zb2xlLmxvZyh1dGlsLmluc3BlY3Qob2JqZWN0KSArIFwiXFxuXCIpXG59XG5cbmZ1bmN0aW9uIGFzc2VydChleHByZXNzaW9uKSB7XG4gICAgaWYgKCFleHByZXNzaW9uKSB7XG4gICAgICAgIHZhciBhcnIgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAgICAgYXNzZXJ0Lm9rKGZhbHNlLCB1dGlsLmZvcm1hdC5hcHBseShudWxsLCBhcnIpKVxuICAgIH1cbn1cblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xudmFyIGludFNpemUgPSA0O1xudmFyIHplcm9CdWZmZXIgPSBuZXcgQnVmZmVyKGludFNpemUpOyB6ZXJvQnVmZmVyLmZpbGwoMCk7XG52YXIgY2hyc3ogPSA4O1xuXG5mdW5jdGlvbiB0b0FycmF5KGJ1ZiwgYmlnRW5kaWFuKSB7XG4gIGlmICgoYnVmLmxlbmd0aCAlIGludFNpemUpICE9PSAwKSB7XG4gICAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGggKyAoaW50U2l6ZSAtIChidWYubGVuZ3RoICUgaW50U2l6ZSkpO1xuICAgIGJ1ZiA9IEJ1ZmZlci5jb25jYXQoW2J1ZiwgemVyb0J1ZmZlcl0sIGxlbik7XG4gIH1cblxuICB2YXIgYXJyID0gW107XG4gIHZhciBmbiA9IGJpZ0VuZGlhbiA/IGJ1Zi5yZWFkSW50MzJCRSA6IGJ1Zi5yZWFkSW50MzJMRTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyBpICs9IGludFNpemUpIHtcbiAgICBhcnIucHVzaChmbi5jYWxsKGJ1ZiwgaSkpO1xuICB9XG4gIHJldHVybiBhcnI7XG59XG5cbmZ1bmN0aW9uIHRvQnVmZmVyKGFyciwgc2l6ZSwgYmlnRW5kaWFuKSB7XG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHNpemUpO1xuICB2YXIgZm4gPSBiaWdFbmRpYW4gPyBidWYud3JpdGVJbnQzMkJFIDogYnVmLndyaXRlSW50MzJMRTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBmbi5jYWxsKGJ1ZiwgYXJyW2ldLCBpICogNCwgdHJ1ZSk7XG4gIH1cbiAgcmV0dXJuIGJ1Zjtcbn1cblxuZnVuY3Rpb24gaGFzaChidWYsIGZuLCBoYXNoU2l6ZSwgYmlnRW5kaWFuKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIGJ1ZiA9IG5ldyBCdWZmZXIoYnVmKTtcbiAgdmFyIGFyciA9IGZuKHRvQXJyYXkoYnVmLCBiaWdFbmRpYW4pLCBidWYubGVuZ3RoICogY2hyc3opO1xuICByZXR1cm4gdG9CdWZmZXIoYXJyLCBoYXNoU2l6ZSwgYmlnRW5kaWFuKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IGhhc2g6IGhhc2ggfTtcbiIsInZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXJcbnZhciBzaGEgPSByZXF1aXJlKCcuL3NoYScpXG52YXIgc2hhMjU2ID0gcmVxdWlyZSgnLi9zaGEyNTYnKVxudmFyIHJuZyA9IHJlcXVpcmUoJy4vcm5nJylcbnZhciBtZDUgPSByZXF1aXJlKCcuL21kNScpXG5cbnZhciBhbGdvcml0aG1zID0ge1xuICBzaGExOiBzaGEsXG4gIHNoYTI1Njogc2hhMjU2LFxuICBtZDU6IG1kNVxufVxuXG52YXIgYmxvY2tzaXplID0gNjRcbnZhciB6ZXJvQnVmZmVyID0gbmV3IEJ1ZmZlcihibG9ja3NpemUpOyB6ZXJvQnVmZmVyLmZpbGwoMClcbmZ1bmN0aW9uIGhtYWMoZm4sIGtleSwgZGF0YSkge1xuICBpZighQnVmZmVyLmlzQnVmZmVyKGtleSkpIGtleSA9IG5ldyBCdWZmZXIoa2V5KVxuICBpZighQnVmZmVyLmlzQnVmZmVyKGRhdGEpKSBkYXRhID0gbmV3IEJ1ZmZlcihkYXRhKVxuXG4gIGlmKGtleS5sZW5ndGggPiBibG9ja3NpemUpIHtcbiAgICBrZXkgPSBmbihrZXkpXG4gIH0gZWxzZSBpZihrZXkubGVuZ3RoIDwgYmxvY2tzaXplKSB7XG4gICAga2V5ID0gQnVmZmVyLmNvbmNhdChba2V5LCB6ZXJvQnVmZmVyXSwgYmxvY2tzaXplKVxuICB9XG5cbiAgdmFyIGlwYWQgPSBuZXcgQnVmZmVyKGJsb2Nrc2l6ZSksIG9wYWQgPSBuZXcgQnVmZmVyKGJsb2Nrc2l6ZSlcbiAgZm9yKHZhciBpID0gMDsgaSA8IGJsb2Nrc2l6ZTsgaSsrKSB7XG4gICAgaXBhZFtpXSA9IGtleVtpXSBeIDB4MzZcbiAgICBvcGFkW2ldID0ga2V5W2ldIF4gMHg1Q1xuICB9XG5cbiAgdmFyIGhhc2ggPSBmbihCdWZmZXIuY29uY2F0KFtpcGFkLCBkYXRhXSkpXG4gIHJldHVybiBmbihCdWZmZXIuY29uY2F0KFtvcGFkLCBoYXNoXSkpXG59XG5cbmZ1bmN0aW9uIGhhc2goYWxnLCBrZXkpIHtcbiAgYWxnID0gYWxnIHx8ICdzaGExJ1xuICB2YXIgZm4gPSBhbGdvcml0aG1zW2FsZ11cbiAgdmFyIGJ1ZnMgPSBbXVxuICB2YXIgbGVuZ3RoID0gMFxuICBpZighZm4pIGVycm9yKCdhbGdvcml0aG06JywgYWxnLCAnaXMgbm90IHlldCBzdXBwb3J0ZWQnKVxuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGlmKCFCdWZmZXIuaXNCdWZmZXIoZGF0YSkpIGRhdGEgPSBuZXcgQnVmZmVyKGRhdGEpXG4gICAgICAgIFxuICAgICAgYnVmcy5wdXNoKGRhdGEpXG4gICAgICBsZW5ndGggKz0gZGF0YS5sZW5ndGhcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcbiAgICBkaWdlc3Q6IGZ1bmN0aW9uIChlbmMpIHtcbiAgICAgIHZhciBidWYgPSBCdWZmZXIuY29uY2F0KGJ1ZnMpXG4gICAgICB2YXIgciA9IGtleSA/IGhtYWMoZm4sIGtleSwgYnVmKSA6IGZuKGJ1ZilcbiAgICAgIGJ1ZnMgPSBudWxsXG4gICAgICByZXR1cm4gZW5jID8gci50b1N0cmluZyhlbmMpIDogclxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBlcnJvciAoKSB7XG4gIHZhciBtID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oJyAnKVxuICB0aHJvdyBuZXcgRXJyb3IoW1xuICAgIG0sXG4gICAgJ3dlIGFjY2VwdCBwdWxsIHJlcXVlc3RzJyxcbiAgICAnaHR0cDovL2dpdGh1Yi5jb20vZG9taW5pY3RhcnIvY3J5cHRvLWJyb3dzZXJpZnknXG4gICAgXS5qb2luKCdcXG4nKSlcbn1cblxuZXhwb3J0cy5jcmVhdGVIYXNoID0gZnVuY3Rpb24gKGFsZykgeyByZXR1cm4gaGFzaChhbGcpIH1cbmV4cG9ydHMuY3JlYXRlSG1hYyA9IGZ1bmN0aW9uIChhbGcsIGtleSkgeyByZXR1cm4gaGFzaChhbGcsIGtleSkgfVxuZXhwb3J0cy5yYW5kb21CeXRlcyA9IGZ1bmN0aW9uKHNpemUsIGNhbGxiYWNrKSB7XG4gIGlmIChjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgdW5kZWZpbmVkLCBuZXcgQnVmZmVyKHJuZyhzaXplKSkpXG4gICAgfSBjYXRjaCAoZXJyKSB7IGNhbGxiYWNrKGVycikgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKHJuZyhzaXplKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBlYWNoKGEsIGYpIHtcbiAgZm9yKHZhciBpIGluIGEpXG4gICAgZihhW2ldLCBpKVxufVxuXG4vLyB0aGUgbGVhc3QgSSBjYW4gZG8gaXMgbWFrZSBlcnJvciBtZXNzYWdlcyBmb3IgdGhlIHJlc3Qgb2YgdGhlIG5vZGUuanMvY3J5cHRvIGFwaS5cbmVhY2goWydjcmVhdGVDcmVkZW50aWFscydcbiwgJ2NyZWF0ZUNpcGhlcidcbiwgJ2NyZWF0ZUNpcGhlcml2J1xuLCAnY3JlYXRlRGVjaXBoZXInXG4sICdjcmVhdGVEZWNpcGhlcml2J1xuLCAnY3JlYXRlU2lnbidcbiwgJ2NyZWF0ZVZlcmlmeSdcbiwgJ2NyZWF0ZURpZmZpZUhlbGxtYW4nXG4sICdwYmtkZjInXSwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgZXhwb3J0c1tuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICBlcnJvcignc29ycnksJywgbmFtZSwgJ2lzIG5vdCBpbXBsZW1lbnRlZCB5ZXQnKVxuICB9XG59KVxuIiwiLypcclxuICogQSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBSU0EgRGF0YSBTZWN1cml0eSwgSW5jLiBNRDUgTWVzc2FnZVxyXG4gKiBEaWdlc3QgQWxnb3JpdGhtLCBhcyBkZWZpbmVkIGluIFJGQyAxMzIxLlxyXG4gKiBWZXJzaW9uIDIuMSBDb3B5cmlnaHQgKEMpIFBhdWwgSm9obnN0b24gMTk5OSAtIDIwMDIuXHJcbiAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcclxuICogRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIEJTRCBMaWNlbnNlXHJcbiAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBtb3JlIGluZm8uXHJcbiAqL1xyXG5cclxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcclxuXHJcbi8qXHJcbiAqIFBlcmZvcm0gYSBzaW1wbGUgc2VsZi10ZXN0IHRvIHNlZSBpZiB0aGUgVk0gaXMgd29ya2luZ1xyXG4gKi9cclxuZnVuY3Rpb24gbWQ1X3ZtX3Rlc3QoKVxyXG57XHJcbiAgcmV0dXJuIGhleF9tZDUoXCJhYmNcIikgPT0gXCI5MDAxNTA5ODNjZDI0ZmIwZDY5NjNmN2QyOGUxN2Y3MlwiO1xyXG59XHJcblxyXG4vKlxyXG4gKiBDYWxjdWxhdGUgdGhlIE1ENSBvZiBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzLCBhbmQgYSBiaXQgbGVuZ3RoXHJcbiAqL1xyXG5mdW5jdGlvbiBjb3JlX21kNSh4LCBsZW4pXHJcbntcclxuICAvKiBhcHBlbmQgcGFkZGluZyAqL1xyXG4gIHhbbGVuID4+IDVdIHw9IDB4ODAgPDwgKChsZW4pICUgMzIpO1xyXG4gIHhbKCgobGVuICsgNjQpID4+PiA5KSA8PCA0KSArIDE0XSA9IGxlbjtcclxuXHJcbiAgdmFyIGEgPSAgMTczMjU4NDE5MztcclxuICB2YXIgYiA9IC0yNzE3MzM4Nzk7XHJcbiAgdmFyIGMgPSAtMTczMjU4NDE5NDtcclxuICB2YXIgZCA9ICAyNzE3MzM4Nzg7XHJcblxyXG4gIGZvcih2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSArPSAxNilcclxuICB7XHJcbiAgICB2YXIgb2xkYSA9IGE7XHJcbiAgICB2YXIgb2xkYiA9IGI7XHJcbiAgICB2YXIgb2xkYyA9IGM7XHJcbiAgICB2YXIgb2xkZCA9IGQ7XHJcblxyXG4gICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2krIDBdLCA3ICwgLTY4MDg3NjkzNik7XHJcbiAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSsgMV0sIDEyLCAtMzg5NTY0NTg2KTtcclxuICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpKyAyXSwgMTcsICA2MDYxMDU4MTkpO1xyXG4gICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2krIDNdLCAyMiwgLTEwNDQ1MjUzMzApO1xyXG4gICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2krIDRdLCA3ICwgLTE3NjQxODg5Nyk7XHJcbiAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSsgNV0sIDEyLCAgMTIwMDA4MDQyNik7XHJcbiAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSsgNl0sIDE3LCAtMTQ3MzIzMTM0MSk7XHJcbiAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSsgN10sIDIyLCAtNDU3MDU5ODMpO1xyXG4gICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2krIDhdLCA3ICwgIDE3NzAwMzU0MTYpO1xyXG4gICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2krIDldLCAxMiwgLTE5NTg0MTQ0MTcpO1xyXG4gICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2krMTBdLCAxNywgLTQyMDYzKTtcclxuICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpKzExXSwgMjIsIC0xOTkwNDA0MTYyKTtcclxuICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpKzEyXSwgNyAsICAxODA0NjAzNjgyKTtcclxuICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpKzEzXSwgMTIsIC00MDM0MTEwMSk7XHJcbiAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSsxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XHJcbiAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSsxNV0sIDIyLCAgMTIzNjUzNTMyOSk7XHJcblxyXG4gICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2krIDFdLCA1ICwgLTE2NTc5NjUxMCk7XHJcbiAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSsgNl0sIDkgLCAtMTA2OTUwMTYzMik7XHJcbiAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSsxMV0sIDE0LCAgNjQzNzE3NzEzKTtcclxuICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpKyAwXSwgMjAsIC0zNzM4OTczMDIpO1xyXG4gICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2krIDVdLCA1ICwgLTcwMTU1ODY5MSk7XHJcbiAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSsxMF0sIDkgLCAgMzgwMTYwODMpO1xyXG4gICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2krMTVdLCAxNCwgLTY2MDQ3ODMzNSk7XHJcbiAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSsgNF0sIDIwLCAtNDA1NTM3ODQ4KTtcclxuICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpKyA5XSwgNSAsICA1Njg0NDY0MzgpO1xyXG4gICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2krMTRdLCA5ICwgLTEwMTk4MDM2OTApO1xyXG4gICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2krIDNdLCAxNCwgLTE4NzM2Mzk2MSk7XHJcbiAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSsgOF0sIDIwLCAgMTE2MzUzMTUwMSk7XHJcbiAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSsxM10sIDUgLCAtMTQ0NDY4MTQ2Nyk7XHJcbiAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSsgMl0sIDkgLCAtNTE0MDM3ODQpO1xyXG4gICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2krIDddLCAxNCwgIDE3MzUzMjg0NzMpO1xyXG4gICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2krMTJdLCAyMCwgLTE5MjY2MDc3MzQpO1xyXG5cclxuICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpKyA1XSwgNCAsIC0zNzg1NTgpO1xyXG4gICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2krIDhdLCAxMSwgLTIwMjI1NzQ0NjMpO1xyXG4gICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2krMTFdLCAxNiwgIDE4MzkwMzA1NjIpO1xyXG4gICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2krMTRdLCAyMywgLTM1MzA5NTU2KTtcclxuICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpKyAxXSwgNCAsIC0xNTMwOTkyMDYwKTtcclxuICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpKyA0XSwgMTEsICAxMjcyODkzMzUzKTtcclxuICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xyXG4gICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2krMTBdLCAyMywgLTEwOTQ3MzA2NDApO1xyXG4gICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2krMTNdLCA0ICwgIDY4MTI3OTE3NCk7XHJcbiAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSsgMF0sIDExLCAtMzU4NTM3MjIyKTtcclxuICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpKyAzXSwgMTYsIC03MjI1MjE5NzkpO1xyXG4gICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2krIDZdLCAyMywgIDc2MDI5MTg5KTtcclxuICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpKyA5XSwgNCAsIC02NDAzNjQ0ODcpO1xyXG4gICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2krMTJdLCAxMSwgLTQyMTgxNTgzNSk7XHJcbiAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSsxNV0sIDE2LCAgNTMwNzQyNTIwKTtcclxuICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpKyAyXSwgMjMsIC05OTUzMzg2NTEpO1xyXG5cclxuICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpKyAwXSwgNiAsIC0xOTg2MzA4NDQpO1xyXG4gICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2krIDddLCAxMCwgIDExMjY4OTE0MTUpO1xyXG4gICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2krMTRdLCAxNSwgLTE0MTYzNTQ5MDUpO1xyXG4gICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2krIDVdLCAyMSwgLTU3NDM0MDU1KTtcclxuICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpKzEyXSwgNiAsICAxNzAwNDg1NTcxKTtcclxuICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcclxuICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpKzEwXSwgMTUsIC0xMDUxNTIzKTtcclxuICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpKyAxXSwgMjEsIC0yMDU0OTIyNzk5KTtcclxuICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpKyA4XSwgNiAsICAxODczMzEzMzU5KTtcclxuICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpKzE1XSwgMTAsIC0zMDYxMTc0NCk7XHJcbiAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSsgNl0sIDE1LCAtMTU2MDE5ODM4MCk7XHJcbiAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSsxM10sIDIxLCAgMTMwOTE1MTY0OSk7XHJcbiAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSsgNF0sIDYgLCAtMTQ1NTIzMDcwKTtcclxuICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpKzExXSwgMTAsIC0xMTIwMjEwMzc5KTtcclxuICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpKyAyXSwgMTUsICA3MTg3ODcyNTkpO1xyXG4gICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2krIDldLCAyMSwgLTM0MzQ4NTU1MSk7XHJcblxyXG4gICAgYSA9IHNhZmVfYWRkKGEsIG9sZGEpO1xyXG4gICAgYiA9IHNhZmVfYWRkKGIsIG9sZGIpO1xyXG4gICAgYyA9IHNhZmVfYWRkKGMsIG9sZGMpO1xyXG4gICAgZCA9IHNhZmVfYWRkKGQsIG9sZGQpO1xyXG4gIH1cclxuICByZXR1cm4gQXJyYXkoYSwgYiwgYywgZCk7XHJcblxyXG59XHJcblxyXG4vKlxyXG4gKiBUaGVzZSBmdW5jdGlvbnMgaW1wbGVtZW50IHRoZSBmb3VyIGJhc2ljIG9wZXJhdGlvbnMgdGhlIGFsZ29yaXRobSB1c2VzLlxyXG4gKi9cclxuZnVuY3Rpb24gbWQ1X2NtbihxLCBhLCBiLCB4LCBzLCB0KVxyXG57XHJcbiAgcmV0dXJuIHNhZmVfYWRkKGJpdF9yb2woc2FmZV9hZGQoc2FmZV9hZGQoYSwgcSksIHNhZmVfYWRkKHgsIHQpKSwgcyksYik7XHJcbn1cclxuZnVuY3Rpb24gbWQ1X2ZmKGEsIGIsIGMsIGQsIHgsIHMsIHQpXHJcbntcclxuICByZXR1cm4gbWQ1X2NtbigoYiAmIGMpIHwgKCh+YikgJiBkKSwgYSwgYiwgeCwgcywgdCk7XHJcbn1cclxuZnVuY3Rpb24gbWQ1X2dnKGEsIGIsIGMsIGQsIHgsIHMsIHQpXHJcbntcclxuICByZXR1cm4gbWQ1X2NtbigoYiAmIGQpIHwgKGMgJiAofmQpKSwgYSwgYiwgeCwgcywgdCk7XHJcbn1cclxuZnVuY3Rpb24gbWQ1X2hoKGEsIGIsIGMsIGQsIHgsIHMsIHQpXHJcbntcclxuICByZXR1cm4gbWQ1X2NtbihiIF4gYyBeIGQsIGEsIGIsIHgsIHMsIHQpO1xyXG59XHJcbmZ1bmN0aW9uIG1kNV9paShhLCBiLCBjLCBkLCB4LCBzLCB0KVxyXG57XHJcbiAgcmV0dXJuIG1kNV9jbW4oYyBeIChiIHwgKH5kKSksIGEsIGIsIHgsIHMsIHQpO1xyXG59XHJcblxyXG4vKlxyXG4gKiBBZGQgaW50ZWdlcnMsIHdyYXBwaW5nIGF0IDJeMzIuIFRoaXMgdXNlcyAxNi1iaXQgb3BlcmF0aW9ucyBpbnRlcm5hbGx5XHJcbiAqIHRvIHdvcmsgYXJvdW5kIGJ1Z3MgaW4gc29tZSBKUyBpbnRlcnByZXRlcnMuXHJcbiAqL1xyXG5mdW5jdGlvbiBzYWZlX2FkZCh4LCB5KVxyXG57XHJcbiAgdmFyIGxzdyA9ICh4ICYgMHhGRkZGKSArICh5ICYgMHhGRkZGKTtcclxuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XHJcbiAgcmV0dXJuIChtc3cgPDwgMTYpIHwgKGxzdyAmIDB4RkZGRik7XHJcbn1cclxuXHJcbi8qXHJcbiAqIEJpdHdpc2Ugcm90YXRlIGEgMzItYml0IG51bWJlciB0byB0aGUgbGVmdC5cclxuICovXHJcbmZ1bmN0aW9uIGJpdF9yb2wobnVtLCBjbnQpXHJcbntcclxuICByZXR1cm4gKG51bSA8PCBjbnQpIHwgKG51bSA+Pj4gKDMyIC0gY250KSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWQ1KGJ1Zikge1xyXG4gIHJldHVybiBoZWxwZXJzLmhhc2goYnVmLCBjb3JlX21kNSwgMTYpO1xyXG59O1xyXG4iLCIvLyBPcmlnaW5hbCBjb2RlIGFkYXB0ZWQgZnJvbSBSb2JlcnQgS2llZmZlci5cbi8vIGRldGFpbHMgYXQgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWRcbihmdW5jdGlvbigpIHtcbiAgdmFyIF9nbG9iYWwgPSB0aGlzO1xuXG4gIHZhciBtYXRoUk5HLCB3aGF0d2dSTkc7XG5cbiAgLy8gTk9URTogTWF0aC5yYW5kb20oKSBkb2VzIG5vdCBndWFyYW50ZWUgXCJjcnlwdG9ncmFwaGljIHF1YWxpdHlcIlxuICBtYXRoUk5HID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgIHZhciBieXRlcyA9IG5ldyBBcnJheShzaXplKTtcbiAgICB2YXIgcjtcblxuICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICBpZiAoKGkgJiAweDAzKSA9PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgYnl0ZXNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG5cbiAgaWYgKF9nbG9iYWwuY3J5cHRvICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICB3aGF0d2dSTkcgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnl0ZXMpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgfVxuXG4gIG1vZHVsZS5leHBvcnRzID0gd2hhdHdnUk5HIHx8IG1hdGhSTkc7XG5cbn0oKSlcbiIsIi8qXG4gKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNlY3VyZSBIYXNoIEFsZ29yaXRobSwgU0hBLTEsIGFzIGRlZmluZWRcbiAqIGluIEZJUFMgUFVCIDE4MC0xXG4gKiBWZXJzaW9uIDIuMWEgQ29weXJpZ2h0IFBhdWwgSm9obnN0b24gMjAwMCAtIDIwMDIuXG4gKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2VcbiAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBkZXRhaWxzLlxuICovXG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbi8qXG4gKiBDYWxjdWxhdGUgdGhlIFNIQS0xIG9mIGFuIGFycmF5IG9mIGJpZy1lbmRpYW4gd29yZHMsIGFuZCBhIGJpdCBsZW5ndGhcbiAqL1xuZnVuY3Rpb24gY29yZV9zaGExKHgsIGxlbilcbntcbiAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBsZW4gJSAzMik7XG4gIHhbKChsZW4gKyA2NCA+PiA5KSA8PCA0KSArIDE1XSA9IGxlbjtcblxuICB2YXIgdyA9IEFycmF5KDgwKTtcbiAgdmFyIGEgPSAgMTczMjU4NDE5MztcbiAgdmFyIGIgPSAtMjcxNzMzODc5O1xuICB2YXIgYyA9IC0xNzMyNTg0MTk0O1xuICB2YXIgZCA9ICAyNzE3MzM4Nzg7XG4gIHZhciBlID0gLTEwMDk1ODk3NzY7XG5cbiAgZm9yKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDE2KVxuICB7XG4gICAgdmFyIG9sZGEgPSBhO1xuICAgIHZhciBvbGRiID0gYjtcbiAgICB2YXIgb2xkYyA9IGM7XG4gICAgdmFyIG9sZGQgPSBkO1xuICAgIHZhciBvbGRlID0gZTtcblxuICAgIGZvcih2YXIgaiA9IDA7IGogPCA4MDsgaisrKVxuICAgIHtcbiAgICAgIGlmKGogPCAxNikgd1tqXSA9IHhbaSArIGpdO1xuICAgICAgZWxzZSB3W2pdID0gcm9sKHdbai0zXSBeIHdbai04XSBeIHdbai0xNF0gXiB3W2otMTZdLCAxKTtcbiAgICAgIHZhciB0ID0gc2FmZV9hZGQoc2FmZV9hZGQocm9sKGEsIDUpLCBzaGExX2Z0KGosIGIsIGMsIGQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgc2FmZV9hZGQoc2FmZV9hZGQoZSwgd1tqXSksIHNoYTFfa3QoaikpKTtcbiAgICAgIGUgPSBkO1xuICAgICAgZCA9IGM7XG4gICAgICBjID0gcm9sKGIsIDMwKTtcbiAgICAgIGIgPSBhO1xuICAgICAgYSA9IHQ7XG4gICAgfVxuXG4gICAgYSA9IHNhZmVfYWRkKGEsIG9sZGEpO1xuICAgIGIgPSBzYWZlX2FkZChiLCBvbGRiKTtcbiAgICBjID0gc2FmZV9hZGQoYywgb2xkYyk7XG4gICAgZCA9IHNhZmVfYWRkKGQsIG9sZGQpO1xuICAgIGUgPSBzYWZlX2FkZChlLCBvbGRlKTtcbiAgfVxuICByZXR1cm4gQXJyYXkoYSwgYiwgYywgZCwgZSk7XG5cbn1cblxuLypcbiAqIFBlcmZvcm0gdGhlIGFwcHJvcHJpYXRlIHRyaXBsZXQgY29tYmluYXRpb24gZnVuY3Rpb24gZm9yIHRoZSBjdXJyZW50XG4gKiBpdGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gc2hhMV9mdCh0LCBiLCBjLCBkKVxue1xuICBpZih0IDwgMjApIHJldHVybiAoYiAmIGMpIHwgKCh+YikgJiBkKTtcbiAgaWYodCA8IDQwKSByZXR1cm4gYiBeIGMgXiBkO1xuICBpZih0IDwgNjApIHJldHVybiAoYiAmIGMpIHwgKGIgJiBkKSB8IChjICYgZCk7XG4gIHJldHVybiBiIF4gYyBeIGQ7XG59XG5cbi8qXG4gKiBEZXRlcm1pbmUgdGhlIGFwcHJvcHJpYXRlIGFkZGl0aXZlIGNvbnN0YW50IGZvciB0aGUgY3VycmVudCBpdGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gc2hhMV9rdCh0KVxue1xuICByZXR1cm4gKHQgPCAyMCkgPyAgMTUxODUwMDI0OSA6ICh0IDwgNDApID8gIDE4NTk3NzUzOTMgOlxuICAgICAgICAgKHQgPCA2MCkgPyAtMTg5NDAwNzU4OCA6IC04OTk0OTc1MTQ7XG59XG5cbi8qXG4gKiBBZGQgaW50ZWdlcnMsIHdyYXBwaW5nIGF0IDJeMzIuIFRoaXMgdXNlcyAxNi1iaXQgb3BlcmF0aW9ucyBpbnRlcm5hbGx5XG4gKiB0byB3b3JrIGFyb3VuZCBidWdzIGluIHNvbWUgSlMgaW50ZXJwcmV0ZXJzLlxuICovXG5mdW5jdGlvbiBzYWZlX2FkZCh4LCB5KVxue1xuICB2YXIgbHN3ID0gKHggJiAweEZGRkYpICsgKHkgJiAweEZGRkYpO1xuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XG4gIHJldHVybiAobXN3IDw8IDE2KSB8IChsc3cgJiAweEZGRkYpO1xufVxuXG4vKlxuICogQml0d2lzZSByb3RhdGUgYSAzMi1iaXQgbnVtYmVyIHRvIHRoZSBsZWZ0LlxuICovXG5mdW5jdGlvbiByb2wobnVtLCBjbnQpXG57XG4gIHJldHVybiAobnVtIDw8IGNudCkgfCAobnVtID4+PiAoMzIgLSBjbnQpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzaGExKGJ1Zikge1xuICByZXR1cm4gaGVscGVycy5oYXNoKGJ1ZiwgY29yZV9zaGExLCAyMCwgdHJ1ZSk7XG59O1xuIiwiXG4vKipcbiAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2VjdXJlIEhhc2ggQWxnb3JpdGhtLCBTSEEtMjU2LCBhcyBkZWZpbmVkXG4gKiBpbiBGSVBTIDE4MC0yXG4gKiBWZXJzaW9uIDIuMi1iZXRhIENvcHlyaWdodCBBbmdlbCBNYXJpbiwgUGF1bCBKb2huc3RvbiAyMDAwIC0gMjAwOS5cbiAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAqXG4gKi9cblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxudmFyIHNhZmVfYWRkID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgbHN3ID0gKHggJiAweEZGRkYpICsgKHkgJiAweEZGRkYpO1xuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XG4gIHJldHVybiAobXN3IDw8IDE2KSB8IChsc3cgJiAweEZGRkYpO1xufTtcblxudmFyIFMgPSBmdW5jdGlvbihYLCBuKSB7XG4gIHJldHVybiAoWCA+Pj4gbikgfCAoWCA8PCAoMzIgLSBuKSk7XG59O1xuXG52YXIgUiA9IGZ1bmN0aW9uKFgsIG4pIHtcbiAgcmV0dXJuIChYID4+PiBuKTtcbn07XG5cbnZhciBDaCA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgcmV0dXJuICgoeCAmIHkpIF4gKCh+eCkgJiB6KSk7XG59O1xuXG52YXIgTWFqID0gZnVuY3Rpb24oeCwgeSwgeikge1xuICByZXR1cm4gKCh4ICYgeSkgXiAoeCAmIHopIF4gKHkgJiB6KSk7XG59O1xuXG52YXIgU2lnbWEwMjU2ID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKFMoeCwgMikgXiBTKHgsIDEzKSBeIFMoeCwgMjIpKTtcbn07XG5cbnZhciBTaWdtYTEyNTYgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoUyh4LCA2KSBeIFMoeCwgMTEpIF4gUyh4LCAyNSkpO1xufTtcblxudmFyIEdhbW1hMDI1NiA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIChTKHgsIDcpIF4gUyh4LCAxOCkgXiBSKHgsIDMpKTtcbn07XG5cbnZhciBHYW1tYTEyNTYgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoUyh4LCAxNykgXiBTKHgsIDE5KSBeIFIoeCwgMTApKTtcbn07XG5cbnZhciBjb3JlX3NoYTI1NiA9IGZ1bmN0aW9uKG0sIGwpIHtcbiAgdmFyIEsgPSBuZXcgQXJyYXkoMHg0MjhBMkY5OCwweDcxMzc0NDkxLDB4QjVDMEZCQ0YsMHhFOUI1REJBNSwweDM5NTZDMjVCLDB4NTlGMTExRjEsMHg5MjNGODJBNCwweEFCMUM1RUQ1LDB4RDgwN0FBOTgsMHgxMjgzNUIwMSwweDI0MzE4NUJFLDB4NTUwQzdEQzMsMHg3MkJFNUQ3NCwweDgwREVCMUZFLDB4OUJEQzA2QTcsMHhDMTlCRjE3NCwweEU0OUI2OUMxLDB4RUZCRTQ3ODYsMHhGQzE5REM2LDB4MjQwQ0ExQ0MsMHgyREU5MkM2RiwweDRBNzQ4NEFBLDB4NUNCMEE5REMsMHg3NkY5ODhEQSwweDk4M0U1MTUyLDB4QTgzMUM2NkQsMHhCMDAzMjdDOCwweEJGNTk3RkM3LDB4QzZFMDBCRjMsMHhENUE3OTE0NywweDZDQTYzNTEsMHgxNDI5Mjk2NywweDI3QjcwQTg1LDB4MkUxQjIxMzgsMHg0RDJDNkRGQywweDUzMzgwRDEzLDB4NjUwQTczNTQsMHg3NjZBMEFCQiwweDgxQzJDOTJFLDB4OTI3MjJDODUsMHhBMkJGRThBMSwweEE4MUE2NjRCLDB4QzI0QjhCNzAsMHhDNzZDNTFBMywweEQxOTJFODE5LDB4RDY5OTA2MjQsMHhGNDBFMzU4NSwweDEwNkFBMDcwLDB4MTlBNEMxMTYsMHgxRTM3NkMwOCwweDI3NDg3NzRDLDB4MzRCMEJDQjUsMHgzOTFDMENCMywweDRFRDhBQTRBLDB4NUI5Q0NBNEYsMHg2ODJFNkZGMywweDc0OEY4MkVFLDB4NzhBNTYzNkYsMHg4NEM4NzgxNCwweDhDQzcwMjA4LDB4OTBCRUZGRkEsMHhBNDUwNkNFQiwweEJFRjlBM0Y3LDB4QzY3MTc4RjIpO1xuICB2YXIgSEFTSCA9IG5ldyBBcnJheSgweDZBMDlFNjY3LCAweEJCNjdBRTg1LCAweDNDNkVGMzcyLCAweEE1NEZGNTNBLCAweDUxMEU1MjdGLCAweDlCMDU2ODhDLCAweDFGODNEOUFCLCAweDVCRTBDRDE5KTtcbiAgICB2YXIgVyA9IG5ldyBBcnJheSg2NCk7XG4gICAgdmFyIGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgsIGksIGo7XG4gICAgdmFyIFQxLCBUMjtcbiAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgbVtsID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbCAlIDMyKTtcbiAgbVsoKGwgKyA2NCA+PiA5KSA8PCA0KSArIDE1XSA9IGw7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICBhID0gSEFTSFswXTsgYiA9IEhBU0hbMV07IGMgPSBIQVNIWzJdOyBkID0gSEFTSFszXTsgZSA9IEhBU0hbNF07IGYgPSBIQVNIWzVdOyBnID0gSEFTSFs2XTsgaCA9IEhBU0hbN107XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCA2NDsgaisrKSB7XG4gICAgICBpZiAoaiA8IDE2KSB7XG4gICAgICAgIFdbal0gPSBtW2ogKyBpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFdbal0gPSBzYWZlX2FkZChzYWZlX2FkZChzYWZlX2FkZChHYW1tYTEyNTYoV1tqIC0gMl0pLCBXW2ogLSA3XSksIEdhbW1hMDI1NihXW2ogLSAxNV0pKSwgV1tqIC0gMTZdKTtcbiAgICAgIH1cbiAgICAgIFQxID0gc2FmZV9hZGQoc2FmZV9hZGQoc2FmZV9hZGQoc2FmZV9hZGQoaCwgU2lnbWExMjU2KGUpKSwgQ2goZSwgZiwgZykpLCBLW2pdKSwgV1tqXSk7XG4gICAgICBUMiA9IHNhZmVfYWRkKFNpZ21hMDI1NihhKSwgTWFqKGEsIGIsIGMpKTtcbiAgICAgIGggPSBnOyBnID0gZjsgZiA9IGU7IGUgPSBzYWZlX2FkZChkLCBUMSk7IGQgPSBjOyBjID0gYjsgYiA9IGE7IGEgPSBzYWZlX2FkZChUMSwgVDIpO1xuICAgIH1cbiAgICBIQVNIWzBdID0gc2FmZV9hZGQoYSwgSEFTSFswXSk7IEhBU0hbMV0gPSBzYWZlX2FkZChiLCBIQVNIWzFdKTsgSEFTSFsyXSA9IHNhZmVfYWRkKGMsIEhBU0hbMl0pOyBIQVNIWzNdID0gc2FmZV9hZGQoZCwgSEFTSFszXSk7XG4gICAgSEFTSFs0XSA9IHNhZmVfYWRkKGUsIEhBU0hbNF0pOyBIQVNIWzVdID0gc2FmZV9hZGQoZiwgSEFTSFs1XSk7IEhBU0hbNl0gPSBzYWZlX2FkZChnLCBIQVNIWzZdKTsgSEFTSFs3XSA9IHNhZmVfYWRkKGgsIEhBU0hbN10pO1xuICB9XG4gIHJldHVybiBIQVNIO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzaGEyNTYoYnVmKSB7XG4gIHJldHVybiBoZWxwZXJzLmhhc2goYnVmLCBjb3JlX3NoYTI1NiwgMzIsIHRydWUpO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIi9ob21lL3N0aWNrL3dvcmsvdHJlem9yL3RyZXpvci5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5zZXJ0LW1vZHVsZS1nbG9iYWxzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsInZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciB1bmRlZmluZWQ7XG5cbnZhciBpc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGlmICghb2JqIHx8IHRvU3RyaW5nLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScgfHwgb2JqLm5vZGVUeXBlIHx8IG9iai5zZXRJbnRlcnZhbCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciBoYXNfb3duX2NvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc19pc19wcm9wZXJ0eV9vZl9tZXRob2QgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc19vd25fY29uc3RydWN0b3IgJiYgIWhhc19pc19wcm9wZXJ0eV9vZl9tZXRob2QpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikge31cblxuXHRyZXR1cm4ga2V5ID09PSB1bmRlZmluZWQgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzBdLFxuXHRcdGkgPSAxLFxuXHRcdGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0ZGVlcCA9IGZhbHNlO1xuXG5cdC8vIEhhbmRsZSBhIGRlZXAgY29weSBzaXR1YXRpb25cblx0aWYgKHR5cGVvZiB0YXJnZXQgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiB0YXJnZXQgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHRhcmdldCAhPT0gXCJmdW5jdGlvblwiIHx8IHRhcmdldCA9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAoKG9wdGlvbnMgPSBhcmd1bWVudHNbaV0pICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ID09PSBjb3B5KSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBBcnJheS5pc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KTtcblxuXHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdH0gZWxzZSBpZiAoY29weSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGFyZ2V0W25hbWVdID0gY29weTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhc2FwID0gcmVxdWlyZSgnYXNhcCcpXG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZVxuZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICBpZiAodHlwZW9mIHRoaXMgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKVxuICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBmdW5jdGlvbicpXG4gIHZhciBzdGF0ZSA9IG51bGxcbiAgdmFyIHZhbHVlID0gbnVsbFxuICB2YXIgZGVmZXJyZWRzID0gW11cbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgdGhpcy50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBoYW5kbGUobmV3IEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCkpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZShkZWZlcnJlZCkge1xuICAgIGlmIChzdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgYXNhcChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYiA9IHN0YXRlID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkXG4gICAgICBpZiAoY2IgPT09IG51bGwpIHtcbiAgICAgICAgKHN0YXRlID8gZGVmZXJyZWQucmVzb2x2ZSA6IGRlZmVycmVkLnJlamVjdCkodmFsdWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdmFyIHJldFxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2IodmFsdWUpXG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJldClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZShuZXdWYWx1ZSkge1xuICAgIHRyeSB7IC8vUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZikgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKVxuICAgICAgaWYgKG5ld1ZhbHVlICYmICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBuZXdWYWx1ZS50aGVuXG4gICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGRvUmVzb2x2ZSh0aGVuLmJpbmQobmV3VmFsdWUpLCByZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0YXRlID0gdHJ1ZVxuICAgICAgdmFsdWUgPSBuZXdWYWx1ZVxuICAgICAgZmluYWxlKClcbiAgICB9IGNhdGNoIChlKSB7IHJlamVjdChlKSB9XG4gIH1cblxuICBmdW5jdGlvbiByZWplY3QobmV3VmFsdWUpIHtcbiAgICBzdGF0ZSA9IGZhbHNlXG4gICAgdmFsdWUgPSBuZXdWYWx1ZVxuICAgIGZpbmFsZSgpXG4gIH1cblxuICBmdW5jdGlvbiBmaW5hbGUoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRlZmVycmVkcy5sZW5ndGg7IGkgPCBsZW47IGkrKylcbiAgICAgIGhhbmRsZShkZWZlcnJlZHNbaV0pXG4gICAgZGVmZXJyZWRzID0gbnVsbFxuICB9XG5cbiAgZG9SZXNvbHZlKGZuLCByZXNvbHZlLCByZWplY3QpXG59XG5cblxuZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcmVzb2x2ZSwgcmVqZWN0KXtcbiAgdGhpcy5vbkZ1bGZpbGxlZCA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogbnVsbFxuICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsXG4gIHRoaXMucmVzb2x2ZSA9IHJlc29sdmVcbiAgdGhpcy5yZWplY3QgPSByZWplY3Rcbn1cblxuLyoqXG4gKiBUYWtlIGEgcG90ZW50aWFsbHkgbWlzYmVoYXZpbmcgcmVzb2x2ZXIgZnVuY3Rpb24gYW5kIG1ha2Ugc3VyZVxuICogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogTWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBhc3luY2hyb255LlxuICovXG5mdW5jdGlvbiBkb1Jlc29sdmUoZm4sIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgZm4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoZG9uZSkgcmV0dXJuXG4gICAgICBkb25lID0gdHJ1ZVxuICAgICAgb25GdWxmaWxsZWQodmFsdWUpXG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgaWYgKGRvbmUpIHJldHVyblxuICAgICAgZG9uZSA9IHRydWVcbiAgICAgIG9uUmVqZWN0ZWQocmVhc29uKVxuICAgIH0pXG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgaWYgKGRvbmUpIHJldHVyblxuICAgIGRvbmUgPSB0cnVlXG4gICAgb25SZWplY3RlZChleClcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1RoaXMgZmlsZSBjb250YWlucyB0aGVuL3Byb21pc2Ugc3BlY2lmaWMgZXh0ZW5zaW9ucyB0byB0aGUgY29yZSBwcm9taXNlIEFQSVxuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4vY29yZS5qcycpXG52YXIgYXNhcCA9IHJlcXVpcmUoJ2FzYXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2VcblxuLyogU3RhdGljIEZ1bmN0aW9ucyAqL1xuXG5mdW5jdGlvbiBWYWx1ZVByb21pc2UodmFsdWUpIHtcbiAgdGhpcy50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkKSB7XG4gICAgaWYgKHR5cGVvZiBvbkZ1bGZpbGxlZCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRoaXNcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzb2x2ZShvbkZ1bGZpbGxlZCh2YWx1ZSkpXG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgcmVqZWN0KGV4KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG59XG5WYWx1ZVByb21pc2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQcm9taXNlLnByb3RvdHlwZSlcblxudmFyIFRSVUUgPSBuZXcgVmFsdWVQcm9taXNlKHRydWUpXG52YXIgRkFMU0UgPSBuZXcgVmFsdWVQcm9taXNlKGZhbHNlKVxudmFyIE5VTEwgPSBuZXcgVmFsdWVQcm9taXNlKG51bGwpXG52YXIgVU5ERUZJTkVEID0gbmV3IFZhbHVlUHJvbWlzZSh1bmRlZmluZWQpXG52YXIgWkVSTyA9IG5ldyBWYWx1ZVByb21pc2UoMClcbnZhciBFTVBUWVNUUklORyA9IG5ldyBWYWx1ZVByb21pc2UoJycpXG5cblByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSByZXR1cm4gdmFsdWVcblxuICBpZiAodmFsdWUgPT09IG51bGwpIHJldHVybiBOVUxMXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gVU5ERUZJTkVEXG4gIGlmICh2YWx1ZSA9PT0gdHJ1ZSkgcmV0dXJuIFRSVUVcbiAgaWYgKHZhbHVlID09PSBmYWxzZSkgcmV0dXJuIEZBTFNFXG4gIGlmICh2YWx1ZSA9PT0gMCkgcmV0dXJuIFpFUk9cbiAgaWYgKHZhbHVlID09PSAnJykgcmV0dXJuIEVNUFRZU1RSSU5HXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0aGVuID0gdmFsdWUudGhlblxuICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSh0aGVuLmJpbmQodmFsdWUpKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZWplY3QoZXgpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVmFsdWVQcm9taXNlKHZhbHVlKVxufVxuXG5Qcm9taXNlLmZyb20gPSBQcm9taXNlLmNhc3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignUHJvbWlzZS5mcm9tIGFuZCBQcm9taXNlLmNhc3QgYXJlIGRlcHJlY2F0ZWQsIHVzZSBQcm9taXNlLnJlc29sdmUgaW5zdGVhZCcpXG4gIGVyci5uYW1lID0gJ1dhcm5pbmcnXG4gIGNvbnNvbGUud2FybihlcnIuc3RhY2spXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpXG59XG5cblByb21pc2UuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGZuLCBhcmd1bWVudENvdW50KSB7XG4gIGFyZ3VtZW50Q291bnQgPSBhcmd1bWVudENvdW50IHx8IEluZmluaXR5XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHdoaWxlIChhcmdzLmxlbmd0aCAmJiBhcmdzLmxlbmd0aCA+IGFyZ3VtZW50Q291bnQpIHtcbiAgICAgICAgYXJncy5wb3AoKVxuICAgICAgfVxuICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKVxuICAgICAgICBlbHNlIHJlc29sdmUocmVzKVxuICAgICAgfSlcbiAgICAgIGZuLmFwcGx5KHNlbGYsIGFyZ3MpXG4gICAgfSlcbiAgfVxufVxuUHJvbWlzZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgdmFyIGNhbGxiYWNrID0gdHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJyA/IGFyZ3MucG9wKCkgOiBudWxsXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpLm5vZGVpZnkoY2FsbGJhY2spXG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIGlmIChjYWxsYmFjayA9PT0gbnVsbCB8fCB0eXBlb2YgY2FsbGJhY2sgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgcmVqZWN0KGV4KSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FsbGJhY2soZXgpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblByb21pc2UuYWxsID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2FsbGVkV2l0aEFycmF5ID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGFyZ3VtZW50c1swXSlcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjYWxsZWRXaXRoQXJyYXkgPyBhcmd1bWVudHNbMF0gOiBhcmd1bWVudHMpXG5cbiAgaWYgKCFjYWxsZWRXaXRoQXJyYXkpIHtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdQcm9taXNlLmFsbCBzaG91bGQgYmUgY2FsbGVkIHdpdGggYSBzaW5nbGUgYXJyYXksIGNhbGxpbmcgaXQgd2l0aCBtdWx0aXBsZSBhcmd1bWVudHMgaXMgZGVwcmVjYXRlZCcpXG4gICAgZXJyLm5hbWUgPSAnV2FybmluZydcbiAgICBjb25zb2xlLndhcm4oZXJyLnN0YWNrKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKFtdKVxuICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aFxuICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlblxuICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkgeyByZXMoaSwgdmFsKSB9LCByZWplY3QpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXJnc1tpXSA9IHZhbFxuICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZWplY3QoZXgpXG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzKGksIGFyZ3NbaV0pXG4gICAgfVxuICB9KVxufVxuXG5Qcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBcbiAgICByZWplY3QodmFsdWUpO1xuICB9KTtcbn1cblxuUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBcbiAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KVxuICB9KTtcbn1cblxuLyogUHJvdG90eXBlIE1ldGhvZHMgKi9cblxuUHJvbWlzZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICB2YXIgc2VsZiA9IGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnRoZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHRoaXNcbiAgc2VsZi50aGVuKG51bGwsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH0pXG4gIH0pXG59XG5cblByb21pc2UucHJvdG90eXBlLm5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnZnVuY3Rpb24nKSByZXR1cm4gdGhpc1xuXG4gIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKVxuICAgIH0pXG4gIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBhc2FwKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKGVycilcbiAgICB9KVxuICB9KVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG59XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG5cbi8vIGxpbmtlZCBsaXN0IG9mIHRhc2tzIChzaW5nbGUsIHdpdGggaGVhZCBub2RlKVxudmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbnZhciB0YWlsID0gaGVhZDtcbnZhciBmbHVzaGluZyA9IGZhbHNlO1xudmFyIHJlcXVlc3RGbHVzaCA9IHZvaWQgMDtcbnZhciBpc05vZGVKUyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAvKiBqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cblxuICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICAgICAgdmFyIHRhc2sgPSBoZWFkLnRhc2s7XG4gICAgICAgIGhlYWQudGFzayA9IHZvaWQgMDtcbiAgICAgICAgdmFyIGRvbWFpbiA9IGhlYWQuZG9tYWluO1xuXG4gICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGFzaygpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xuICAgICAgICAgICAgICAgIC8vIEluIG5vZGUsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIGNvbnNpZGVyZWQgZmF0YWwgZXJyb3JzLlxuICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gc3luY2hyb25vdXNseSB0byBpbnRlcnJ1cHQgZmx1c2hpbmchXG5cbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29udGludWF0aW9uIGlmIHRoZSB1bmNhdWdodCBleGNlcHRpb24gaXMgc3VwcHJlc3NlZFxuICAgICAgICAgICAgICAgIC8vIGxpc3RlbmluZyBcInVuY2F1Z2h0RXhjZXB0aW9uXCIgZXZlbnRzIChhcyBkb21haW5zIGRvZXMpLlxuICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRocm93IGU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIGFzeW5jaHJvbm91c2x5IHRvIGF2b2lkIHNsb3ctZG93bnMuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZsdXNoaW5nID0gZmFsc2U7XG59XG5cbmlmICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG4gICAgLy8gTm9kZS5qcyBiZWZvcmUgMC45LiBOb3RlIHRoYXQgc29tZSBmYWtlLU5vZGUgZW52aXJvbm1lbnRzLCBsaWtlIHRoZVxuICAgIC8vIE1vY2hhIHRlc3QgcnVubmVyLCBpbnRyb2R1Y2UgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgLlxuICAgIGlzTm9kZUpTID0gdHJ1ZTtcblxuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgfTtcblxufSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJlcXVlc3RGbHVzaCA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgIH07XG4gICAgfVxuXG59IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgIC8vIGh0dHA6Ly93d3cubm9uYmxvY2tpbmcuaW8vMjAxMS8wNi93aW5kb3duZXh0dGljay5odG1sXG4gICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9O1xuXG59IGVsc2Uge1xuICAgIC8vIG9sZCBicm93c2Vyc1xuICAgIHJlcXVlc3RGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYXNhcCh0YXNrKSB7XG4gICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgdGFzazogdGFzayxcbiAgICAgICAgZG9tYWluOiBpc05vZGVKUyAmJiBwcm9jZXNzLmRvbWFpbixcbiAgICAgICAgbmV4dDogbnVsbFxuICAgIH07XG5cbiAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgcmVxdWVzdEZsdXNoKCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhc2FwO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiL2hvbWUvc3RpY2svd29yay90cmV6b3IvdHJlem9yLmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiKSkiLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgdGhpcy50ZXh0ID0gdGhpcy5yZXEubWV0aG9kICE9J0hFQUQnIFxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dCBcbiAgICAgOiBudWxsO1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiBzdHIubGVuZ3RoXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cyB8fCAxMjIzID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHZhciBlcnIgPSBudWxsO1xuICAgIHZhciByZXMgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTsgXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICB9XG5cbiAgICBzZWxmLmNhbGxiYWNrKGVyciwgcmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51bnNldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaikgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGlmICgyID09IGZuLmxlbmd0aCkgcmV0dXJuIGZuKGVyciwgcmVzKTtcbiAgaWYgKGVycikgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICBmbihyZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSBnZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG4gICAgaWYgKDAgPT0geGhyLnN0YXR1cykge1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmRlbCA9IGZ1bmN0aW9uKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsInZhciB0cmF2ZXJzZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBuZXcgVHJhdmVyc2Uob2JqKTtcbn07XG5cbmZ1bmN0aW9uIFRyYXZlcnNlIChvYmopIHtcbiAgICB0aGlzLnZhbHVlID0gb2JqO1xufVxuXG5UcmF2ZXJzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHBzKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHMubGVuZ3RoOyBpICsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBwc1tpXTtcbiAgICAgICAgaWYgKCFub2RlIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG5vZGUsIGtleSkpIHtcbiAgICAgICAgICAgIG5vZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZVtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn07XG5cblRyYXZlcnNlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAocHMpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMudmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcy5sZW5ndGg7IGkgKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHBzW2ldO1xuICAgICAgICBpZiAoIW5vZGUgfHwgIWhhc093blByb3BlcnR5LmNhbGwobm9kZSwga2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlW2tleV07XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcblxuVHJhdmVyc2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChwcywgdmFsdWUpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMudmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcy5sZW5ndGggLSAxOyBpICsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBwc1tpXTtcbiAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKG5vZGUsIGtleSkpIG5vZGVba2V5XSA9IHt9O1xuICAgICAgICBub2RlID0gbm9kZVtrZXldO1xuICAgIH1cbiAgICBub2RlW3BzW2ldXSA9IHZhbHVlO1xuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cblRyYXZlcnNlLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2IpIHtcbiAgICByZXR1cm4gd2Fsayh0aGlzLnZhbHVlLCBjYiwgdHJ1ZSk7XG59O1xuXG5UcmF2ZXJzZS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYikge1xuICAgIHRoaXMudmFsdWUgPSB3YWxrKHRoaXMudmFsdWUsIGNiLCBmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5UcmF2ZXJzZS5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGNiLCBpbml0KSB7XG4gICAgdmFyIHNraXAgPSBhcmd1bWVudHMubGVuZ3RoID09PSAxO1xuICAgIHZhciBhY2MgPSBza2lwID8gdGhpcy52YWx1ZSA6IGluaXQ7XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1Jvb3QgfHwgIXNraXApIHtcbiAgICAgICAgICAgIGFjYyA9IGNiLmNhbGwodGhpcywgYWNjLCB4KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBhY2M7XG59O1xuXG5UcmF2ZXJzZS5wcm90b3R5cGUucGF0aHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFjYyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoeCkge1xuICAgICAgICBhY2MucHVzaCh0aGlzLnBhdGgpOyBcbiAgICB9KTtcbiAgICByZXR1cm4gYWNjO1xufTtcblxuVHJhdmVyc2UucHJvdG90eXBlLm5vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhY2MgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgYWNjLnB1c2godGhpcy5ub2RlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYWNjO1xufTtcblxuVHJhdmVyc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwYXJlbnRzID0gW10sIG5vZGVzID0gW107XG4gICAgXG4gICAgcmV0dXJuIChmdW5jdGlvbiBjbG9uZSAoc3JjKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBhcmVudHNbaV0gPT09IHNyYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2Rlc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHR5cGVvZiBzcmMgPT09ICdvYmplY3QnICYmIHNyYyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGRzdCA9IGNvcHkoc3JjKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcGFyZW50cy5wdXNoKHNyYyk7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKGRzdCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvckVhY2gob2JqZWN0S2V5cyhzcmMpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgZHN0W2tleV0gPSBjbG9uZShzcmNba2V5XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcGFyZW50cy5wb3AoKTtcbiAgICAgICAgICAgIG5vZGVzLnBvcCgpO1xuICAgICAgICAgICAgcmV0dXJuIGRzdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzcmM7XG4gICAgICAgIH1cbiAgICB9KSh0aGlzLnZhbHVlKTtcbn07XG5cbmZ1bmN0aW9uIHdhbGsgKHJvb3QsIGNiLCBpbW11dGFibGUpIHtcbiAgICB2YXIgcGF0aCA9IFtdO1xuICAgIHZhciBwYXJlbnRzID0gW107XG4gICAgdmFyIGFsaXZlID0gdHJ1ZTtcbiAgICBcbiAgICByZXR1cm4gKGZ1bmN0aW9uIHdhbGtlciAobm9kZV8pIHtcbiAgICAgICAgdmFyIG5vZGUgPSBpbW11dGFibGUgPyBjb3B5KG5vZGVfKSA6IG5vZGVfO1xuICAgICAgICB2YXIgbW9kaWZpZXJzID0ge307XG4gICAgICAgIFxuICAgICAgICB2YXIga2VlcEdvaW5nID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgICAgICAgIG5vZGUgOiBub2RlLFxuICAgICAgICAgICAgbm9kZV8gOiBub2RlXyxcbiAgICAgICAgICAgIHBhdGggOiBbXS5jb25jYXQocGF0aCksXG4gICAgICAgICAgICBwYXJlbnQgOiBwYXJlbnRzW3BhcmVudHMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICBwYXJlbnRzIDogcGFyZW50cyxcbiAgICAgICAgICAgIGtleSA6IHBhdGguc2xpY2UoLTEpWzBdLFxuICAgICAgICAgICAgaXNSb290IDogcGF0aC5sZW5ndGggPT09IDAsXG4gICAgICAgICAgICBsZXZlbCA6IHBhdGgubGVuZ3RoLFxuICAgICAgICAgICAgY2lyY3VsYXIgOiBudWxsLFxuICAgICAgICAgICAgdXBkYXRlIDogZnVuY3Rpb24gKHgsIHN0b3BIZXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0ZS5pc1Jvb3QpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUucGFyZW50Lm5vZGVbc3RhdGUua2V5XSA9IHg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXRlLm5vZGUgPSB4O1xuICAgICAgICAgICAgICAgIGlmIChzdG9wSGVyZSkga2VlcEdvaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2RlbGV0ZScgOiBmdW5jdGlvbiAoc3RvcEhlcmUpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgc3RhdGUucGFyZW50Lm5vZGVbc3RhdGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoc3RvcEhlcmUpIGtlZXBHb2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbW92ZSA6IGZ1bmN0aW9uIChzdG9wSGVyZSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0FycmF5KHN0YXRlLnBhcmVudC5ub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wYXJlbnQubm9kZS5zcGxpY2Uoc3RhdGUua2V5LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzdGF0ZS5wYXJlbnQubm9kZVtzdGF0ZS5rZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RvcEhlcmUpIGtlZXBHb2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtleXMgOiBudWxsLFxuICAgICAgICAgICAgYmVmb3JlIDogZnVuY3Rpb24gKGYpIHsgbW9kaWZpZXJzLmJlZm9yZSA9IGYgfSxcbiAgICAgICAgICAgIGFmdGVyIDogZnVuY3Rpb24gKGYpIHsgbW9kaWZpZXJzLmFmdGVyID0gZiB9LFxuICAgICAgICAgICAgcHJlIDogZnVuY3Rpb24gKGYpIHsgbW9kaWZpZXJzLnByZSA9IGYgfSxcbiAgICAgICAgICAgIHBvc3QgOiBmdW5jdGlvbiAoZikgeyBtb2RpZmllcnMucG9zdCA9IGYgfSxcbiAgICAgICAgICAgIHN0b3AgOiBmdW5jdGlvbiAoKSB7IGFsaXZlID0gZmFsc2UgfSxcbiAgICAgICAgICAgIGJsb2NrIDogZnVuY3Rpb24gKCkgeyBrZWVwR29pbmcgPSBmYWxzZSB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBpZiAoIWFsaXZlKSByZXR1cm4gc3RhdGU7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVTdGF0ZSgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdGUubm9kZSA9PT0gJ29iamVjdCcgJiYgc3RhdGUubm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmICghc3RhdGUua2V5cyB8fCBzdGF0ZS5ub2RlXyAhPT0gc3RhdGUubm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5rZXlzID0gb2JqZWN0S2V5cyhzdGF0ZS5ub2RlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzdGF0ZS5pc0xlYWYgPSBzdGF0ZS5rZXlzLmxlbmd0aCA9PSAwO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50c1tpXS5ub2RlXyA9PT0gbm9kZV8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmNpcmN1bGFyID0gcGFyZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhdGUuaXNMZWFmID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5rZXlzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhdGUubm90TGVhZiA9ICFzdGF0ZS5pc0xlYWY7XG4gICAgICAgICAgICBzdGF0ZS5ub3RSb290ID0gIXN0YXRlLmlzUm9vdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdXBkYXRlU3RhdGUoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIHVzZSByZXR1cm4gdmFsdWVzIHRvIHVwZGF0ZSBpZiBkZWZpbmVkXG4gICAgICAgIHZhciByZXQgPSBjYi5jYWxsKHN0YXRlLCBzdGF0ZS5ub2RlKTtcbiAgICAgICAgaWYgKHJldCAhPT0gdW5kZWZpbmVkICYmIHN0YXRlLnVwZGF0ZSkgc3RhdGUudXBkYXRlKHJldCk7XG4gICAgICAgIFxuICAgICAgICBpZiAobW9kaWZpZXJzLmJlZm9yZSkgbW9kaWZpZXJzLmJlZm9yZS5jYWxsKHN0YXRlLCBzdGF0ZS5ub2RlKTtcbiAgICAgICAgXG4gICAgICAgIGlmICgha2VlcEdvaW5nKSByZXR1cm4gc3RhdGU7XG4gICAgICAgIFxuICAgICAgICBpZiAodHlwZW9mIHN0YXRlLm5vZGUgPT0gJ29iamVjdCdcbiAgICAgICAgJiYgc3RhdGUubm9kZSAhPT0gbnVsbCAmJiAhc3RhdGUuY2lyY3VsYXIpIHtcbiAgICAgICAgICAgIHBhcmVudHMucHVzaChzdGF0ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHVwZGF0ZVN0YXRlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvckVhY2goc3RhdGUua2V5cywgZnVuY3Rpb24gKGtleSwgaSkge1xuICAgICAgICAgICAgICAgIHBhdGgucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChtb2RpZmllcnMucHJlKSBtb2RpZmllcnMucHJlLmNhbGwoc3RhdGUsIHN0YXRlLm5vZGVba2V5XSwga2V5KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSB3YWxrZXIoc3RhdGUubm9kZVtrZXldKTtcbiAgICAgICAgICAgICAgICBpZiAoaW1tdXRhYmxlICYmIGhhc093blByb3BlcnR5LmNhbGwoc3RhdGUubm9kZSwga2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5ub2RlW2tleV0gPSBjaGlsZC5ub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjaGlsZC5pc0xhc3QgPSBpID09IHN0YXRlLmtleXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICBjaGlsZC5pc0ZpcnN0ID0gaSA9PSAwO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChtb2RpZmllcnMucG9zdCkgbW9kaWZpZXJzLnBvc3QuY2FsbChzdGF0ZSwgY2hpbGQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBhdGgucG9wKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBhcmVudHMucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChtb2RpZmllcnMuYWZ0ZXIpIG1vZGlmaWVycy5hZnRlci5jYWxsKHN0YXRlLCBzdGF0ZS5ub2RlKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9KShyb290KS5ub2RlO1xufVxuXG5mdW5jdGlvbiBjb3B5IChzcmMpIHtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ29iamVjdCcgJiYgc3JjICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBkc3Q7XG4gICAgICAgIFxuICAgICAgICBpZiAoaXNBcnJheShzcmMpKSB7XG4gICAgICAgICAgICBkc3QgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0RhdGUoc3JjKSkge1xuICAgICAgICAgICAgZHN0ID0gbmV3IERhdGUoc3JjLmdldFRpbWUgPyBzcmMuZ2V0VGltZSgpIDogc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1JlZ0V4cChzcmMpKSB7XG4gICAgICAgICAgICBkc3QgPSBuZXcgUmVnRXhwKHNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNFcnJvcihzcmMpKSB7XG4gICAgICAgICAgICBkc3QgPSB7IG1lc3NhZ2U6IHNyYy5tZXNzYWdlIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNCb29sZWFuKHNyYykpIHtcbiAgICAgICAgICAgIGRzdCA9IG5ldyBCb29sZWFuKHNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNOdW1iZXIoc3JjKSkge1xuICAgICAgICAgICAgZHN0ID0gbmV3IE51bWJlcihzcmMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzU3RyaW5nKHNyYykpIHtcbiAgICAgICAgICAgIGRzdCA9IG5ldyBTdHJpbmcoc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChPYmplY3QuY3JlYXRlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZikge1xuICAgICAgICAgICAgZHN0ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc3JjKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3JjLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgIGRzdCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHByb3RvID1cbiAgICAgICAgICAgICAgICAoc3JjLmNvbnN0cnVjdG9yICYmIHNyYy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUpXG4gICAgICAgICAgICAgICAgfHwgc3JjLl9fcHJvdG9fX1xuICAgICAgICAgICAgICAgIHx8IHt9XG4gICAgICAgICAgICA7XG4gICAgICAgICAgICB2YXIgVCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICAgICAgVC5wcm90b3R5cGUgPSBwcm90bztcbiAgICAgICAgICAgIGRzdCA9IG5ldyBUO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3JFYWNoKG9iamVjdEtleXMoc3JjKSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgZHN0W2tleV0gPSBzcmNba2V5XTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgfVxuICAgIGVsc2UgcmV0dXJuIHNyYztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzIChvYmopIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgcmVzLnB1c2goa2V5KVxuICAgIHJldHVybiByZXM7XG59O1xuXG5mdW5jdGlvbiB0b1MgKG9iaikgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgfVxuZnVuY3Rpb24gaXNEYXRlIChvYmopIHsgcmV0dXJuIHRvUyhvYmopID09PSAnW29iamVjdCBEYXRlXScgfVxuZnVuY3Rpb24gaXNSZWdFeHAgKG9iaikgeyByZXR1cm4gdG9TKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nIH1cbmZ1bmN0aW9uIGlzRXJyb3IgKG9iaikgeyByZXR1cm4gdG9TKG9iaikgPT09ICdbb2JqZWN0IEVycm9yXScgfVxuZnVuY3Rpb24gaXNCb29sZWFuIChvYmopIHsgcmV0dXJuIHRvUyhvYmopID09PSAnW29iamVjdCBCb29sZWFuXScgfVxuZnVuY3Rpb24gaXNOdW1iZXIgKG9iaikgeyByZXR1cm4gdG9TKG9iaikgPT09ICdbb2JqZWN0IE51bWJlcl0nIH1cbmZ1bmN0aW9uIGlzU3RyaW5nIChvYmopIHsgcmV0dXJuIHRvUyhvYmopID09PSAnW29iamVjdCBTdHJpbmddJyB9XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5ICh4cykge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGZvckVhY2ggPSBmdW5jdGlvbiAoeHMsIGZuKSB7XG4gICAgaWYgKHhzLmZvckVhY2gpIHJldHVybiB4cy5mb3JFYWNoKGZuKVxuICAgIGVsc2UgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmbih4c1tpXSwgaSwgeHMpO1xuICAgIH1cbn07XG5cbmZvckVhY2gob2JqZWN0S2V5cyhUcmF2ZXJzZS5wcm90b3R5cGUpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdHJhdmVyc2Vba2V5XSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIHZhciB0ID0gbmV3IFRyYXZlcnNlKG9iaik7XG4gICAgICAgIHJldHVybiB0W2tleV0uYXBwbHkodCwgYXJncyk7XG4gICAgfTtcbn0pO1xuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QuaGFzT3duUHJvcGVydHkgfHwgZnVuY3Rpb24gKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGtleSBpbiBvYmo7XG59O1xuIiwiKGZ1bmN0aW9uIChyb290KSB7XG4gICBcInVzZSBzdHJpY3RcIjtcblxuLyoqKioqIHVub3JtLmpzICoqKioqL1xuXG4vKlxuICogVW5pY29kZU5vcm1hbGl6ZXIgMS4wLjBcbiAqIENvcHlyaWdodCAoYykgMjAwOCBNYXRzdXphXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgKE1JVC1MSUNFTlNFLnR4dCkgYW5kIEdQTCAoR1BMLUxJQ0VOU0UudHh0KSBsaWNlbnNlcy5cbiAqICREYXRlOiAyMDA4LTA2LTA1IDE2OjQ0OjE3ICswMjAwIChUaHUsIDA1IEp1biAyMDA4KSAkXG4gKiAkUmV2OiAxMzMwOSAkXG4gKi9cblxuICAgdmFyIERFRkFVTFRfRkVBVFVSRSA9IFtudWxsLCAwLCB7fV07XG4gICB2YXIgQ0FDSEVfVEhSRVNIT0xEID0gMTA7XG4gICB2YXIgU0Jhc2UgPSAweEFDMDAsIExCYXNlID0gMHgxMTAwLCBWQmFzZSA9IDB4MTE2MSwgVEJhc2UgPSAweDExQTcsIExDb3VudCA9IDE5LCBWQ291bnQgPSAyMSwgVENvdW50ID0gMjg7XG4gICB2YXIgTkNvdW50ID0gVkNvdW50ICogVENvdW50OyAvLyA1ODhcbiAgIHZhciBTQ291bnQgPSBMQ291bnQgKiBOQ291bnQ7IC8vIDExMTcyXG5cbiAgIHZhciBVQ2hhciA9IGZ1bmN0aW9uKGNwLCBmZWF0dXJlKXtcbiAgICAgIHRoaXMuY29kZXBvaW50ID0gY3A7XG4gICAgICB0aGlzLmZlYXR1cmUgPSBmZWF0dXJlO1xuICAgfTtcblxuICAgLy8gU3RyYXRlZ2llc1xuICAgdmFyIGNhY2hlID0ge307XG4gICB2YXIgY2FjaGVDb3VudGVyID0gW107XG4gICBmb3IgKHZhciBpID0gMDsgaSA8PSAweEZGOyArK2kpe1xuICAgICAgY2FjaGVDb3VudGVyW2ldID0gMDtcbiAgIH1cblxuICAgZnVuY3Rpb24gZnJvbUNhY2hlKG5leHQsIGNwLCBuZWVkRmVhdHVyZSl7XG4gICAgICB2YXIgcmV0ID0gY2FjaGVbY3BdO1xuICAgICAgaWYoIXJldCl7XG4gICAgICAgICByZXQgPSBuZXh0KGNwLCBuZWVkRmVhdHVyZSk7XG4gICAgICAgICBpZighIXJldC5mZWF0dXJlICYmICsrY2FjaGVDb3VudGVyWyhjcCA+PiA4KSAmIDB4RkZdID4gQ0FDSEVfVEhSRVNIT0xEKXtcbiAgICAgICAgICAgIGNhY2hlW2NwXSA9IHJldDtcbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICB9XG5cbiAgIGZ1bmN0aW9uIGZyb21EYXRhKG5leHQsIGNwLCBuZWVkRmVhdHVyZSl7XG4gICAgICB2YXIgaGFzaCA9IGNwICYgMHhGRjAwO1xuICAgICAgdmFyIGR1bml0ID0gVUNoYXIudWRhdGFbaGFzaF0gfHwge307XG4gICAgICB2YXIgZiA9IGR1bml0W2NwXTtcbiAgICAgIHJldHVybiBmID8gbmV3IFVDaGFyKGNwLCBmKSA6IG5ldyBVQ2hhcihjcCwgREVGQVVMVF9GRUFUVVJFKTtcbiAgIH1cbiAgIGZ1bmN0aW9uIGZyb21DcE9ubHkobmV4dCwgY3AsIG5lZWRGZWF0dXJlKXtcbiAgICAgIHJldHVybiAhIW5lZWRGZWF0dXJlID8gbmV4dChjcCwgbmVlZEZlYXR1cmUpIDogbmV3IFVDaGFyKGNwLCBudWxsKTtcbiAgIH1cbiAgIGZ1bmN0aW9uIGZyb21SdWxlQmFzZWRKYW1vKG5leHQsIGNwLCBuZWVkRmVhdHVyZSl7XG4gICAgICB2YXIgajtcbiAgICAgIGlmKGNwIDwgTEJhc2UgfHwgKExCYXNlICsgTENvdW50IDw9IGNwICYmIGNwIDwgU0Jhc2UpIHx8IChTQmFzZSArIFNDb3VudCA8IGNwKSl7XG4gICAgICAgICByZXR1cm4gbmV4dChjcCwgbmVlZEZlYXR1cmUpO1xuICAgICAgfVxuICAgICAgaWYoTEJhc2UgPD0gY3AgJiYgY3AgPCBMQmFzZSArIExDb3VudCl7XG4gICAgICAgICB2YXIgYyA9IHt9O1xuICAgICAgICAgdmFyIGJhc2UgPSAoY3AgLSBMQmFzZSkgKiBWQ291bnQ7XG4gICAgICAgICBmb3IgKGogPSAwOyBqIDwgVkNvdW50OyArK2ope1xuICAgICAgICAgICAgY1tWQmFzZSArIGpdID0gU0Jhc2UgKyBUQ291bnQgKiAoaiArIGJhc2UpO1xuICAgICAgICAgfVxuICAgICAgICAgcmV0dXJuIG5ldyBVQ2hhcihjcCwgWywsY10pO1xuICAgICAgfVxuXG4gICAgICB2YXIgU0luZGV4ID0gY3AgLSBTQmFzZTtcbiAgICAgIHZhciBUSW5kZXggPSBTSW5kZXggJSBUQ291bnQ7XG4gICAgICB2YXIgZmVhdHVyZSA9IFtdO1xuICAgICAgaWYoVEluZGV4ICE9PSAwKXtcbiAgICAgICAgIGZlYXR1cmVbMF0gPSBbU0Jhc2UgKyBTSW5kZXggLSBUSW5kZXgsIFRCYXNlICsgVEluZGV4XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICBmZWF0dXJlWzBdID0gW0xCYXNlICsgTWF0aC5mbG9vcihTSW5kZXggLyBOQ291bnQpLCBWQmFzZSArIE1hdGguZmxvb3IoKFNJbmRleCAlIE5Db3VudCkgLyBUQ291bnQpXTtcbiAgICAgICAgIGZlYXR1cmVbMl0gPSB7fTtcbiAgICAgICAgIGZvciAoaiA9IDE7IGogPCBUQ291bnQ7ICsrail7XG4gICAgICAgICAgICBmZWF0dXJlWzJdW1RCYXNlICsgal0gPSBjcCArIGo7XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFVDaGFyKGNwLCBmZWF0dXJlKTtcbiAgIH1cbiAgIGZ1bmN0aW9uIGZyb21DcEZpbHRlcihuZXh0LCBjcCwgbmVlZEZlYXR1cmUpe1xuICAgICAgcmV0dXJuIGNwIDwgNjAgfHwgMTMzMTEgPCBjcCAmJiBjcCA8IDQyNjA3ID8gbmV3IFVDaGFyKGNwLCBERUZBVUxUX0ZFQVRVUkUpIDogbmV4dChjcCwgbmVlZEZlYXR1cmUpO1xuICAgfVxuXG4gICB2YXIgc3RyYXRlZ2llcyA9IFtmcm9tQ3BGaWx0ZXIsIGZyb21DYWNoZSwgZnJvbUNwT25seSwgZnJvbVJ1bGVCYXNlZEphbW8sIGZyb21EYXRhXTtcblxuICAgVUNoYXIuZnJvbUNoYXJDb2RlID0gc3RyYXRlZ2llcy5yZWR1Y2VSaWdodChmdW5jdGlvbiAobmV4dCwgc3RyYXRlZ3kpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoY3AsIG5lZWRGZWF0dXJlKSB7XG4gICAgICAgICByZXR1cm4gc3RyYXRlZ3kobmV4dCwgY3AsIG5lZWRGZWF0dXJlKTtcbiAgICAgIH07XG4gICB9LCBudWxsKTtcblxuICAgVUNoYXIuaXNIaWdoU3Vycm9nYXRlID0gZnVuY3Rpb24oY3Ape1xuICAgICAgcmV0dXJuIGNwID49IDB4RDgwMCAmJiBjcCA8PSAweERCRkY7XG4gICB9O1xuICAgVUNoYXIuaXNMb3dTdXJyb2dhdGUgPSBmdW5jdGlvbihjcCl7XG4gICAgICByZXR1cm4gY3AgPj0gMHhEQzAwICYmIGNwIDw9IDB4REZGRjtcbiAgIH07XG5cbiAgIFVDaGFyLnByb3RvdHlwZS5wcmVwRmVhdHVyZSA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZighdGhpcy5mZWF0dXJlKXtcbiAgICAgICAgIHRoaXMuZmVhdHVyZSA9IFVDaGFyLmZyb21DaGFyQ29kZSh0aGlzLmNvZGVwb2ludCwgdHJ1ZSkuZmVhdHVyZTtcbiAgICAgIH1cbiAgIH07XG5cbiAgIFVDaGFyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZih0aGlzLmNvZGVwb2ludCA8IDB4MTAwMDApe1xuICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5jb2RlcG9pbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHZhciB4ID0gdGhpcy5jb2RlcG9pbnQgLSAweDEwMDAwO1xuICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoTWF0aC5mbG9vcih4IC8gMHg0MDApICsgMHhEODAwLCB4ICUgMHg0MDAgKyAweERDMDApO1xuICAgICAgfVxuICAgfTtcblxuICAgVUNoYXIucHJvdG90eXBlLmdldERlY29tcCA9IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnByZXBGZWF0dXJlKCk7XG4gICAgICByZXR1cm4gdGhpcy5mZWF0dXJlWzBdIHx8IG51bGw7XG4gICB9O1xuXG4gICBVQ2hhci5wcm90b3R5cGUuaXNDb21wYXRpYmlsaXR5ID0gZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMucHJlcEZlYXR1cmUoKTtcbiAgICAgIHJldHVybiAhIXRoaXMuZmVhdHVyZVsxXSAmJiAodGhpcy5mZWF0dXJlWzFdICYgKDEgPDwgOCkpO1xuICAgfTtcbiAgIFVDaGFyLnByb3RvdHlwZS5pc0V4Y2x1ZGUgPSBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5wcmVwRmVhdHVyZSgpO1xuICAgICAgcmV0dXJuICEhdGhpcy5mZWF0dXJlWzFdICYmICh0aGlzLmZlYXR1cmVbMV0gJiAoMSA8PCA5KSk7XG4gICB9O1xuICAgVUNoYXIucHJvdG90eXBlLmdldENhbm9uaWNhbENsYXNzID0gZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMucHJlcEZlYXR1cmUoKTtcbiAgICAgIHJldHVybiAhIXRoaXMuZmVhdHVyZVsxXSA/ICh0aGlzLmZlYXR1cmVbMV0gJiAweGZmKSA6IDA7XG4gICB9O1xuICAgVUNoYXIucHJvdG90eXBlLmdldENvbXBvc2l0ZSA9IGZ1bmN0aW9uKGZvbGxvd2luZyl7XG4gICAgICB0aGlzLnByZXBGZWF0dXJlKCk7XG4gICAgICBpZighdGhpcy5mZWF0dXJlWzJdKXtcbiAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIGNwID0gdGhpcy5mZWF0dXJlWzJdW2ZvbGxvd2luZy5jb2RlcG9pbnRdO1xuICAgICAgcmV0dXJuIGNwID8gVUNoYXIuZnJvbUNoYXJDb2RlKGNwKSA6IG51bGw7XG4gICB9O1xuXG4gICB2YXIgVUNoYXJJdGVyYXRvciA9IGZ1bmN0aW9uKHN0cil7XG4gICAgICB0aGlzLnN0ciA9IHN0cjtcbiAgICAgIHRoaXMuY3Vyc29yID0gMDtcbiAgIH07XG4gICBVQ2hhckl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKCEhdGhpcy5zdHIgJiYgdGhpcy5jdXJzb3IgPCB0aGlzLnN0ci5sZW5ndGgpe1xuICAgICAgICAgdmFyIGNwID0gdGhpcy5zdHIuY2hhckNvZGVBdCh0aGlzLmN1cnNvcisrKTtcbiAgICAgICAgIHZhciBkO1xuICAgICAgICAgaWYoVUNoYXIuaXNIaWdoU3Vycm9nYXRlKGNwKSAmJiB0aGlzLmN1cnNvciA8IHRoaXMuc3RyLmxlbmd0aCAmJiBVQ2hhci5pc0xvd1N1cnJvZ2F0ZSgoZCA9IHRoaXMuc3RyLmNoYXJDb2RlQXQodGhpcy5jdXJzb3IpKSkpe1xuICAgICAgICAgICAgY3AgPSAoY3AgLSAweEQ4MDApICogMHg0MDAgKyAoZCAtMHhEQzAwKSArIDB4MTAwMDA7XG4gICAgICAgICAgICArK3RoaXMuY3Vyc29yO1xuICAgICAgICAgfVxuICAgICAgICAgcmV0dXJuIFVDaGFyLmZyb21DaGFyQ29kZShjcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgdGhpcy5zdHIgPSBudWxsO1xuICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICB9O1xuXG4gICB2YXIgUmVjdXJzRGVjb21wSXRlcmF0b3IgPSBmdW5jdGlvbihpdCwgY2Fubyl7XG4gICAgICB0aGlzLml0ID0gaXQ7XG4gICAgICB0aGlzLmNhbm9uaWNhbCA9IGNhbm87XG4gICAgICB0aGlzLnJlc0J1ZiA9IFtdO1xuICAgfTtcblxuICAgUmVjdXJzRGVjb21wSXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpe1xuICAgICAgZnVuY3Rpb24gcmVjdXJzaXZlRGVjb21wKGNhbm8sIHVjaGFyKXtcbiAgICAgICAgIHZhciBkZWNvbXAgPSB1Y2hhci5nZXREZWNvbXAoKTtcbiAgICAgICAgIGlmKCEhZGVjb21wICYmICEoY2FubyAmJiB1Y2hhci5pc0NvbXBhdGliaWxpdHkoKSkpe1xuICAgICAgICAgICAgdmFyIHJldCA9IFtdO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGRlY29tcC5sZW5ndGg7ICsraSl7XG4gICAgICAgICAgICAgICB2YXIgYSA9IHJlY3Vyc2l2ZURlY29tcChjYW5vLCBVQ2hhci5mcm9tQ2hhckNvZGUoZGVjb21wW2ldKSk7XG4gICAgICAgICAgICAgICAvL3JldC5jb25jYXQoYSk7IC8vPC13aHkgZG9lcyBub3QgdGhpcyB3b3JrP1xuICAgICAgICAgICAgICAgLy9mb2xsb3dpbmcgYmxvY2sgaXMgYSB3b3JrYXJvdW5kLlxuICAgICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGEubGVuZ3RoOyArK2ope1xuICAgICAgICAgICAgICAgICAgcmV0LnB1c2goYVtqXSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbdWNoYXJdO1xuICAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYodGhpcy5yZXNCdWYubGVuZ3RoID09PSAwKXtcbiAgICAgICAgIHZhciB1Y2hhciA9IHRoaXMuaXQubmV4dCgpO1xuICAgICAgICAgaWYoIXVjaGFyKXtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgfVxuICAgICAgICAgdGhpcy5yZXNCdWYgPSByZWN1cnNpdmVEZWNvbXAodGhpcy5jYW5vbmljYWwsIHVjaGFyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlc0J1Zi5zaGlmdCgpO1xuICAgfTtcblxuICAgdmFyIERlY29tcEl0ZXJhdG9yID0gZnVuY3Rpb24oaXQpe1xuICAgICAgdGhpcy5pdCA9IGl0O1xuICAgICAgdGhpcy5yZXNCdWYgPSBbXTtcbiAgIH07XG5cbiAgIERlY29tcEl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBjYztcbiAgICAgIGlmKHRoaXMucmVzQnVmLmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICBkb3tcbiAgICAgICAgICAgIHZhciB1Y2hhciA9IHRoaXMuaXQubmV4dCgpO1xuICAgICAgICAgICAgaWYoIXVjaGFyKXtcbiAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2MgPSB1Y2hhci5nZXRDYW5vbmljYWxDbGFzcygpO1xuICAgICAgICAgICAgdmFyIGluc3B0ID0gdGhpcy5yZXNCdWYubGVuZ3RoO1xuICAgICAgICAgICAgaWYoY2MgIT09IDApe1xuICAgICAgICAgICAgICAgZm9yKDsgaW5zcHQgPiAwOyAtLWluc3B0KXtcbiAgICAgICAgICAgICAgICAgIHZhciB1Y2hhcjIgPSB0aGlzLnJlc0J1ZltpbnNwdCAtIDFdO1xuICAgICAgICAgICAgICAgICAgdmFyIGNjMiA9IHVjaGFyMi5nZXRDYW5vbmljYWxDbGFzcygpO1xuICAgICAgICAgICAgICAgICAgaWYoY2MyIDw9IGNjKXtcbiAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZXNCdWYuc3BsaWNlKGluc3B0LCAwLCB1Y2hhcik7XG4gICAgICAgICB9IHdoaWxlKGNjICE9PSAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlc0J1Zi5zaGlmdCgpO1xuICAgfTtcblxuICAgdmFyIENvbXBJdGVyYXRvciA9IGZ1bmN0aW9uKGl0KXtcbiAgICAgIHRoaXMuaXQgPSBpdDtcbiAgICAgIHRoaXMucHJvY0J1ZiA9IFtdO1xuICAgICAgdGhpcy5yZXNCdWYgPSBbXTtcbiAgICAgIHRoaXMubGFzdENsYXNzID0gbnVsbDtcbiAgIH07XG5cbiAgIENvbXBJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgICB3aGlsZSh0aGlzLnJlc0J1Zi5sZW5ndGggPT09IDApe1xuICAgICAgICAgdmFyIHVjaGFyID0gdGhpcy5pdC5uZXh0KCk7XG4gICAgICAgICBpZighdWNoYXIpe1xuICAgICAgICAgICAgdGhpcy5yZXNCdWYgPSB0aGlzLnByb2NCdWY7XG4gICAgICAgICAgICB0aGlzLnByb2NCdWYgPSBbXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgfVxuICAgICAgICAgaWYodGhpcy5wcm9jQnVmLmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICAgICB0aGlzLmxhc3RDbGFzcyA9IHVjaGFyLmdldENhbm9uaWNhbENsYXNzKCk7XG4gICAgICAgICAgICB0aGlzLnByb2NCdWYucHVzaCh1Y2hhcik7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHN0YXJ0ZXIgPSB0aGlzLnByb2NCdWZbMF07XG4gICAgICAgICAgICB2YXIgY29tcG9zaXRlID0gc3RhcnRlci5nZXRDb21wb3NpdGUodWNoYXIpO1xuICAgICAgICAgICAgdmFyIGNjID0gdWNoYXIuZ2V0Q2Fub25pY2FsQ2xhc3MoKTtcbiAgICAgICAgICAgIGlmKCEhY29tcG9zaXRlICYmICh0aGlzLmxhc3RDbGFzcyA8IGNjIHx8IHRoaXMubGFzdENsYXNzID09PSAwKSl7XG4gICAgICAgICAgICAgICB0aGlzLnByb2NCdWZbMF0gPSBjb21wb3NpdGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgaWYoY2MgPT09IDApe1xuICAgICAgICAgICAgICAgICAgdGhpcy5yZXNCdWYgPSB0aGlzLnByb2NCdWY7XG4gICAgICAgICAgICAgICAgICB0aGlzLnByb2NCdWYgPSBbXTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIHRoaXMubGFzdENsYXNzID0gY2M7XG4gICAgICAgICAgICAgICB0aGlzLnByb2NCdWYucHVzaCh1Y2hhcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZXNCdWYuc2hpZnQoKTtcbiAgIH07XG5cbiAgIHZhciBjcmVhdGVJdGVyYXRvciA9IGZ1bmN0aW9uKG1vZGUsIHN0cil7XG4gICAgICBzd2l0Y2gobW9kZSl7XG4gICAgICAgICBjYXNlIFwiTkZEXCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IERlY29tcEl0ZXJhdG9yKG5ldyBSZWN1cnNEZWNvbXBJdGVyYXRvcihuZXcgVUNoYXJJdGVyYXRvcihzdHIpLCB0cnVlKSk7XG4gICAgICAgICBjYXNlIFwiTkZLRFwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEZWNvbXBJdGVyYXRvcihuZXcgUmVjdXJzRGVjb21wSXRlcmF0b3IobmV3IFVDaGFySXRlcmF0b3Ioc3RyKSwgZmFsc2UpKTtcbiAgICAgICAgIGNhc2UgXCJORkNcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcEl0ZXJhdG9yKG5ldyBEZWNvbXBJdGVyYXRvcihuZXcgUmVjdXJzRGVjb21wSXRlcmF0b3IobmV3IFVDaGFySXRlcmF0b3Ioc3RyKSwgdHJ1ZSkpKTtcbiAgICAgICAgIGNhc2UgXCJORktDXCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbXBJdGVyYXRvcihuZXcgRGVjb21wSXRlcmF0b3IobmV3IFJlY3Vyc0RlY29tcEl0ZXJhdG9yKG5ldyBVQ2hhckl0ZXJhdG9yKHN0ciksIGZhbHNlKSkpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbW9kZSArIFwiIGlzIGludmFsaWRcIjtcbiAgIH07XG4gICB2YXIgbm9ybWFsaXplID0gZnVuY3Rpb24obW9kZSwgc3RyKXtcbiAgICAgIHZhciBpdCA9IGNyZWF0ZUl0ZXJhdG9yKG1vZGUsIHN0cik7XG4gICAgICB2YXIgcmV0ID0gXCJcIjtcbiAgICAgIHZhciB1Y2hhcjtcbiAgICAgIHdoaWxlKCEhKHVjaGFyID0gaXQubmV4dCgpKSl7XG4gICAgICAgICByZXQgKz0gdWNoYXIudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICB9O1xuXG4gICAvKiBBUEkgZnVuY3Rpb25zICovXG4gICBmdW5jdGlvbiBuZmQoc3RyKXtcbiAgICAgIHJldHVybiBub3JtYWxpemUoXCJORkRcIiwgc3RyKTtcbiAgIH1cblxuICAgZnVuY3Rpb24gbmZrZChzdHIpe1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShcIk5GS0RcIiwgc3RyKTtcbiAgIH1cblxuICAgZnVuY3Rpb24gbmZjKHN0cil7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKFwiTkZDXCIsIHN0cik7XG4gICB9XG5cbiAgIGZ1bmN0aW9uIG5ma2Moc3RyKXtcbiAgICAgIHJldHVybiBub3JtYWxpemUoXCJORktDXCIsIHN0cik7XG4gICB9XG5cbi8qIFVuaWNvZGUgZGF0YSAqL1xuVUNoYXIudWRhdGE9e1xuMDp7NjA6WywsezgyNDo4ODE0fV0sNjE6WywsezgyNDo4ODAwfV0sNjI6WywsezgyNDo4ODE1fV0sNjU6Wywsezc2ODoxOTIsNzY5OjE5Myw3NzA6MTk0LDc3MToxOTUsNzcyOjI1Niw3NzQ6MjU4LDc3NTo1NTAsNzc2OjE5Niw3Nzc6Nzg0Miw3Nzg6MTk3LDc4MDo0NjEsNzgzOjUxMiw3ODU6NTE0LDgwMzo3ODQwLDgwNTo3NjgwLDgwODoyNjB9XSw2NjpbLCx7Nzc1Ojc2ODIsODAzOjc2ODQsODE3Ojc2ODZ9XSw2NzpbLCx7NzY5OjI2Miw3NzA6MjY0LDc3NToyNjYsNzgwOjI2OCw4MDc6MTk5fV0sNjg6Wywsezc3NTo3NjkwLDc4MDoyNzAsODAzOjc2OTIsODA3Ojc2OTYsODEzOjc2OTgsODE3Ojc2OTR9XSw2OTpbLCx7NzY4OjIwMCw3Njk6MjAxLDc3MDoyMDIsNzcxOjc4NjgsNzcyOjI3NCw3NzQ6Mjc2LDc3NToyNzgsNzc2OjIwMyw3Nzc6Nzg2Niw3ODA6MjgyLDc4Mzo1MTYsNzg1OjUxOCw4MDM6Nzg2NCw4MDc6NTUyLDgwODoyODAsODEzOjc3MDQsODE2Ojc3MDZ9XSw3MDpbLCx7Nzc1Ojc3MTB9XSw3MTpbLCx7NzY5OjUwMCw3NzA6Mjg0LDc3Mjo3NzEyLDc3NDoyODYsNzc1OjI4OCw3ODA6NDg2LDgwNzoyOTB9XSw3MjpbLCx7NzcwOjI5Miw3NzU6NzcxNCw3NzY6NzcxOCw3ODA6NTQyLDgwMzo3NzE2LDgwNzo3NzIwLDgxNDo3NzIyfV0sNzM6Wywsezc2ODoyMDQsNzY5OjIwNSw3NzA6MjA2LDc3MToyOTYsNzcyOjI5OCw3NzQ6MzAwLDc3NTozMDQsNzc2OjIwNyw3Nzc6Nzg4MCw3ODA6NDYzLDc4Mzo1MjAsNzg1OjUyMiw4MDM6Nzg4Miw4MDg6MzAyLDgxNjo3NzI0fV0sNzQ6Wywsezc3MDozMDh9XSw3NTpbLCx7NzY5Ojc3MjgsNzgwOjQ4OCw4MDM6NzczMCw4MDc6MzEwLDgxNzo3NzMyfV0sNzY6Wywsezc2OTozMTMsNzgwOjMxNyw4MDM6NzczNCw4MDc6MzE1LDgxMzo3NzQwLDgxNzo3NzM4fV0sNzc6Wywsezc2OTo3NzQyLDc3NTo3NzQ0LDgwMzo3NzQ2fV0sNzg6Wywsezc2ODo1MDQsNzY5OjMyMyw3NzE6MjA5LDc3NTo3NzQ4LDc4MDozMjcsODAzOjc3NTAsODA3OjMyNSw4MTM6Nzc1NCw4MTc6Nzc1Mn1dLDc5OlssLHs3Njg6MjEwLDc2OToyMTEsNzcwOjIxMiw3NzE6MjEzLDc3MjozMzIsNzc0OjMzNCw3NzU6NTU4LDc3NjoyMTQsNzc3Ojc4ODYsNzc5OjMzNiw3ODA6NDY1LDc4Mzo1MjQsNzg1OjUyNiw3OTU6NDE2LDgwMzo3ODg0LDgwODo0OTB9XSw4MDpbLCx7NzY5Ojc3NjQsNzc1Ojc3NjZ9XSw4MjpbLCx7NzY5OjM0MCw3NzU6Nzc2OCw3ODA6MzQ0LDc4Mzo1MjgsNzg1OjUzMCw4MDM6Nzc3MCw4MDc6MzQyLDgxNzo3Nzc0fV0sODM6Wywsezc2OTozNDYsNzcwOjM0OCw3NzU6Nzc3Niw3ODA6MzUyLDgwMzo3Nzc4LDgwNjo1MzYsODA3OjM1MH1dLDg0OlssLHs3NzU6Nzc4Niw3ODA6MzU2LDgwMzo3Nzg4LDgwNjo1MzgsODA3OjM1NCw4MTM6Nzc5Miw4MTc6Nzc5MH1dLDg1OlssLHs3Njg6MjE3LDc2OToyMTgsNzcwOjIxOSw3NzE6MzYwLDc3MjozNjIsNzc0OjM2NCw3NzY6MjIwLDc3Nzo3OTEwLDc3ODozNjYsNzc5OjM2OCw3ODA6NDY3LDc4Mzo1MzIsNzg1OjUzNCw3OTU6NDMxLDgwMzo3OTA4LDgwNDo3Nzk0LDgwODozNzAsODEzOjc3OTgsODE2Ojc3OTZ9XSw4NjpbLCx7NzcxOjc4MDQsODAzOjc4MDZ9XSw4NzpbLCx7NzY4Ojc4MDgsNzY5Ojc4MTAsNzcwOjM3Miw3NzU6NzgxNCw3NzY6NzgxMiw4MDM6NzgxNn1dLDg4OlssLHs3NzU6NzgxOCw3NzY6NzgyMH1dLDg5OlssLHs3Njg6NzkyMiw3Njk6MjIxLDc3MDozNzQsNzcxOjc5MjgsNzcyOjU2Miw3NzU6NzgyMiw3NzY6Mzc2LDc3Nzo3OTI2LDgwMzo3OTI0fV0sOTA6Wywsezc2OTozNzcsNzcwOjc4MjQsNzc1OjM3OSw3ODA6MzgxLDgwMzo3ODI2LDgxNzo3ODI4fV0sOTc6Wywsezc2ODoyMjQsNzY5OjIyNSw3NzA6MjI2LDc3MToyMjcsNzcyOjI1Nyw3NzQ6MjU5LDc3NTo1NTEsNzc2OjIyOCw3Nzc6Nzg0Myw3Nzg6MjI5LDc4MDo0NjIsNzgzOjUxMyw3ODU6NTE1LDgwMzo3ODQxLDgwNTo3NjgxLDgwODoyNjF9XSw5ODpbLCx7Nzc1Ojc2ODMsODAzOjc2ODUsODE3Ojc2ODd9XSw5OTpbLCx7NzY5OjI2Myw3NzA6MjY1LDc3NToyNjcsNzgwOjI2OSw4MDc6MjMxfV0sMTAwOlssLHs3NzU6NzY5MSw3ODA6MjcxLDgwMzo3NjkzLDgwNzo3Njk3LDgxMzo3Njk5LDgxNzo3Njk1fV0sMTAxOlssLHs3Njg6MjMyLDc2OToyMzMsNzcwOjIzNCw3NzE6Nzg2OSw3NzI6Mjc1LDc3NDoyNzcsNzc1OjI3OSw3NzY6MjM1LDc3Nzo3ODY3LDc4MDoyODMsNzgzOjUxNyw3ODU6NTE5LDgwMzo3ODY1LDgwNzo1NTMsODA4OjI4MSw4MTM6NzcwNSw4MTY6NzcwN31dLDEwMjpbLCx7Nzc1Ojc3MTF9XSwxMDM6Wywsezc2OTo1MDEsNzcwOjI4NSw3NzI6NzcxMyw3NzQ6Mjg3LDc3NToyODksNzgwOjQ4Nyw4MDc6MjkxfV0sMTA0OlssLHs3NzA6MjkzLDc3NTo3NzE1LDc3Njo3NzE5LDc4MDo1NDMsODAzOjc3MTcsODA3Ojc3MjEsODE0Ojc3MjMsODE3Ojc4MzB9XSwxMDU6Wywsezc2ODoyMzYsNzY5OjIzNyw3NzA6MjM4LDc3MToyOTcsNzcyOjI5OSw3NzQ6MzAxLDc3NjoyMzksNzc3Ojc4ODEsNzgwOjQ2NCw3ODM6NTIxLDc4NTo1MjMsODAzOjc4ODMsODA4OjMwMyw4MTY6NzcyNX1dLDEwNjpbLCx7NzcwOjMwOSw3ODA6NDk2fV0sMTA3OlssLHs3Njk6NzcyOSw3ODA6NDg5LDgwMzo3NzMxLDgwNzozMTEsODE3Ojc3MzN9XSwxMDg6Wywsezc2OTozMTQsNzgwOjMxOCw4MDM6NzczNSw4MDc6MzE2LDgxMzo3NzQxLDgxNzo3NzM5fV0sMTA5OlssLHs3Njk6Nzc0Myw3NzU6Nzc0NSw4MDM6Nzc0N31dLDExMDpbLCx7NzY4OjUwNSw3Njk6MzI0LDc3MToyNDEsNzc1Ojc3NDksNzgwOjMyOCw4MDM6Nzc1MSw4MDc6MzI2LDgxMzo3NzU1LDgxNzo3NzUzfV0sMTExOlssLHs3Njg6MjQyLDc2OToyNDMsNzcwOjI0NCw3NzE6MjQ1LDc3MjozMzMsNzc0OjMzNSw3NzU6NTU5LDc3NjoyNDYsNzc3Ojc4ODcsNzc5OjMzNyw3ODA6NDY2LDc4Mzo1MjUsNzg1OjUyNyw3OTU6NDE3LDgwMzo3ODg1LDgwODo0OTF9XSwxMTI6Wywsezc2OTo3NzY1LDc3NTo3NzY3fV0sMTE0OlssLHs3Njk6MzQxLDc3NTo3NzY5LDc4MDozNDUsNzgzOjUyOSw3ODU6NTMxLDgwMzo3NzcxLDgwNzozNDMsODE3Ojc3NzV9XSwxMTU6Wywsezc2OTozNDcsNzcwOjM0OSw3NzU6Nzc3Nyw3ODA6MzUzLDgwMzo3Nzc5LDgwNjo1MzcsODA3OjM1MX1dLDExNjpbLCx7Nzc1Ojc3ODcsNzc2Ojc4MzEsNzgwOjM1Nyw4MDM6Nzc4OSw4MDY6NTM5LDgwNzozNTUsODEzOjc3OTMsODE3Ojc3OTF9XSwxMTc6Wywsezc2ODoyNDksNzY5OjI1MCw3NzA6MjUxLDc3MTozNjEsNzcyOjM2Myw3NzQ6MzY1LDc3NjoyNTIsNzc3Ojc5MTEsNzc4OjM2Nyw3Nzk6MzY5LDc4MDo0NjgsNzgzOjUzMyw3ODU6NTM1LDc5NTo0MzIsODAzOjc5MDksODA0Ojc3OTUsODA4OjM3MSw4MTM6Nzc5OSw4MTY6Nzc5N31dLDExODpbLCx7NzcxOjc4MDUsODAzOjc4MDd9XSwxMTk6Wywsezc2ODo3ODA5LDc2OTo3ODExLDc3MDozNzMsNzc1Ojc4MTUsNzc2Ojc4MTMsNzc4Ojc4MzIsODAzOjc4MTd9XSwxMjA6Wywsezc3NTo3ODE5LDc3Njo3ODIxfV0sMTIxOlssLHs3Njg6NzkyMyw3Njk6MjUzLDc3MDozNzUsNzcxOjc5MjksNzcyOjU2Myw3NzU6NzgyMyw3NzY6MjU1LDc3Nzo3OTI3LDc3ODo3ODMzLDgwMzo3OTI1fV0sMTIyOlssLHs3Njk6Mzc4LDc3MDo3ODI1LDc3NTozODAsNzgwOjM4Miw4MDM6NzgyNyw4MTc6NzgyOX1dLDE2MDpbWzMyXSwyNTZdLDE2ODpbWzMyLDc3Nl0sMjU2LHs3Njg6ODE3Myw3Njk6OTAxLDgzNDo4MTI5fV0sMTcwOltbOTddLDI1Nl0sMTc1OltbMzIsNzcyXSwyNTZdLDE3ODpbWzUwXSwyNTZdLDE3OTpbWzUxXSwyNTZdLDE4MDpbWzMyLDc2OV0sMjU2XSwxODE6W1s5NTZdLDI1Nl0sMTg0OltbMzIsODA3XSwyNTZdLDE4NTpbWzQ5XSwyNTZdLDE4NjpbWzExMV0sMjU2XSwxODg6W1s0OSw4MjYwLDUyXSwyNTZdLDE4OTpbWzQ5LDgyNjAsNTBdLDI1Nl0sMTkwOltbNTEsODI2MCw1Ml0sMjU2XSwxOTI6W1s2NSw3NjhdXSwxOTM6W1s2NSw3NjldXSwxOTQ6W1s2NSw3NzBdLCx7NzY4Ojc4NDYsNzY5Ojc4NDQsNzcxOjc4NTAsNzc3Ojc4NDh9XSwxOTU6W1s2NSw3NzFdXSwxOTY6W1s2NSw3NzZdLCx7NzcyOjQ3OH1dLDE5NzpbWzY1LDc3OF0sLHs3Njk6NTA2fV0sMTk4OlssLHs3Njk6NTA4LDc3Mjo0ODJ9XSwxOTk6W1s2Nyw4MDddLCx7NzY5Ojc2ODh9XSwyMDA6W1s2OSw3NjhdXSwyMDE6W1s2OSw3NjldXSwyMDI6W1s2OSw3NzBdLCx7NzY4Ojc4NzIsNzY5Ojc4NzAsNzcxOjc4NzYsNzc3Ojc4NzR9XSwyMDM6W1s2OSw3NzZdXSwyMDQ6W1s3Myw3NjhdXSwyMDU6W1s3Myw3NjldXSwyMDY6W1s3Myw3NzBdXSwyMDc6W1s3Myw3NzZdLCx7NzY5Ojc3MjZ9XSwyMDk6W1s3OCw3NzFdXSwyMTA6W1s3OSw3NjhdXSwyMTE6W1s3OSw3NjldXSwyMTI6W1s3OSw3NzBdLCx7NzY4Ojc4OTAsNzY5Ojc4ODgsNzcxOjc4OTQsNzc3Ojc4OTJ9XSwyMTM6W1s3OSw3NzFdLCx7NzY5Ojc3NTYsNzcyOjU1Niw3NzY6Nzc1OH1dLDIxNDpbWzc5LDc3Nl0sLHs3NzI6NTU0fV0sMjE2OlssLHs3Njk6NTEwfV0sMjE3OltbODUsNzY4XV0sMjE4OltbODUsNzY5XV0sMjE5OltbODUsNzcwXV0sMjIwOltbODUsNzc2XSwsezc2ODo0NzUsNzY5OjQ3MSw3NzI6NDY5LDc4MDo0NzN9XSwyMjE6W1s4OSw3NjldXSwyMjQ6W1s5Nyw3NjhdXSwyMjU6W1s5Nyw3NjldXSwyMjY6W1s5Nyw3NzBdLCx7NzY4Ojc4NDcsNzY5Ojc4NDUsNzcxOjc4NTEsNzc3Ojc4NDl9XSwyMjc6W1s5Nyw3NzFdXSwyMjg6W1s5Nyw3NzZdLCx7NzcyOjQ3OX1dLDIyOTpbWzk3LDc3OF0sLHs3Njk6NTA3fV0sMjMwOlssLHs3Njk6NTA5LDc3Mjo0ODN9XSwyMzE6W1s5OSw4MDddLCx7NzY5Ojc2ODl9XSwyMzI6W1sxMDEsNzY4XV0sMjMzOltbMTAxLDc2OV1dLDIzNDpbWzEwMSw3NzBdLCx7NzY4Ojc4NzMsNzY5Ojc4NzEsNzcxOjc4NzcsNzc3Ojc4NzV9XSwyMzU6W1sxMDEsNzc2XV0sMjM2OltbMTA1LDc2OF1dLDIzNzpbWzEwNSw3NjldXSwyMzg6W1sxMDUsNzcwXV0sMjM5OltbMTA1LDc3Nl0sLHs3Njk6NzcyN31dLDI0MTpbWzExMCw3NzFdXSwyNDI6W1sxMTEsNzY4XV0sMjQzOltbMTExLDc2OV1dLDI0NDpbWzExMSw3NzBdLCx7NzY4Ojc4OTEsNzY5Ojc4ODksNzcxOjc4OTUsNzc3Ojc4OTN9XSwyNDU6W1sxMTEsNzcxXSwsezc2OTo3NzU3LDc3Mjo1NTcsNzc2Ojc3NTl9XSwyNDY6W1sxMTEsNzc2XSwsezc3Mjo1NTV9XSwyNDg6Wywsezc2OTo1MTF9XSwyNDk6W1sxMTcsNzY4XV0sMjUwOltbMTE3LDc2OV1dLDI1MTpbWzExNyw3NzBdXSwyNTI6W1sxMTcsNzc2XSwsezc2ODo0NzYsNzY5OjQ3Miw3NzI6NDcwLDc4MDo0NzR9XSwyNTM6W1sxMjEsNzY5XV0sMjU1OltbMTIxLDc3Nl1dfSxcbjI1Njp7MjU2OltbNjUsNzcyXV0sMjU3OltbOTcsNzcyXV0sMjU4OltbNjUsNzc0XSwsezc2ODo3ODU2LDc2OTo3ODU0LDc3MTo3ODYwLDc3Nzo3ODU4fV0sMjU5OltbOTcsNzc0XSwsezc2ODo3ODU3LDc2OTo3ODU1LDc3MTo3ODYxLDc3Nzo3ODU5fV0sMjYwOltbNjUsODA4XV0sMjYxOltbOTcsODA4XV0sMjYyOltbNjcsNzY5XV0sMjYzOltbOTksNzY5XV0sMjY0OltbNjcsNzcwXV0sMjY1OltbOTksNzcwXV0sMjY2OltbNjcsNzc1XV0sMjY3OltbOTksNzc1XV0sMjY4OltbNjcsNzgwXV0sMjY5OltbOTksNzgwXV0sMjcwOltbNjgsNzgwXV0sMjcxOltbMTAwLDc4MF1dLDI3NDpbWzY5LDc3Ml0sLHs3Njg6NzcwMCw3Njk6NzcwMn1dLDI3NTpbWzEwMSw3NzJdLCx7NzY4Ojc3MDEsNzY5Ojc3MDN9XSwyNzY6W1s2OSw3NzRdXSwyNzc6W1sxMDEsNzc0XV0sMjc4OltbNjksNzc1XV0sMjc5OltbMTAxLDc3NV1dLDI4MDpbWzY5LDgwOF1dLDI4MTpbWzEwMSw4MDhdXSwyODI6W1s2OSw3ODBdXSwyODM6W1sxMDEsNzgwXV0sMjg0OltbNzEsNzcwXV0sMjg1OltbMTAzLDc3MF1dLDI4NjpbWzcxLDc3NF1dLDI4NzpbWzEwMyw3NzRdXSwyODg6W1s3MSw3NzVdXSwyODk6W1sxMDMsNzc1XV0sMjkwOltbNzEsODA3XV0sMjkxOltbMTAzLDgwN11dLDI5MjpbWzcyLDc3MF1dLDI5MzpbWzEwNCw3NzBdXSwyOTY6W1s3Myw3NzFdXSwyOTc6W1sxMDUsNzcxXV0sMjk4OltbNzMsNzcyXV0sMjk5OltbMTA1LDc3Ml1dLDMwMDpbWzczLDc3NF1dLDMwMTpbWzEwNSw3NzRdXSwzMDI6W1s3Myw4MDhdXSwzMDM6W1sxMDUsODA4XV0sMzA0OltbNzMsNzc1XV0sMzA2OltbNzMsNzRdLDI1Nl0sMzA3OltbMTA1LDEwNl0sMjU2XSwzMDg6W1s3NCw3NzBdXSwzMDk6W1sxMDYsNzcwXV0sMzEwOltbNzUsODA3XV0sMzExOltbMTA3LDgwN11dLDMxMzpbWzc2LDc2OV1dLDMxNDpbWzEwOCw3NjldXSwzMTU6W1s3Niw4MDddXSwzMTY6W1sxMDgsODA3XV0sMzE3OltbNzYsNzgwXV0sMzE4OltbMTA4LDc4MF1dLDMxOTpbWzc2LDE4M10sMjU2XSwzMjA6W1sxMDgsMTgzXSwyNTZdLDMyMzpbWzc4LDc2OV1dLDMyNDpbWzExMCw3NjldXSwzMjU6W1s3OCw4MDddXSwzMjY6W1sxMTAsODA3XV0sMzI3OltbNzgsNzgwXV0sMzI4OltbMTEwLDc4MF1dLDMyOTpbWzcwMCwxMTBdLDI1Nl0sMzMyOltbNzksNzcyXSwsezc2ODo3NzYwLDc2OTo3NzYyfV0sMzMzOltbMTExLDc3Ml0sLHs3Njg6Nzc2MSw3Njk6Nzc2M31dLDMzNDpbWzc5LDc3NF1dLDMzNTpbWzExMSw3NzRdXSwzMzY6W1s3OSw3NzldXSwzMzc6W1sxMTEsNzc5XV0sMzQwOltbODIsNzY5XV0sMzQxOltbMTE0LDc2OV1dLDM0MjpbWzgyLDgwN11dLDM0MzpbWzExNCw4MDddXSwzNDQ6W1s4Miw3ODBdXSwzNDU6W1sxMTQsNzgwXV0sMzQ2OltbODMsNzY5XSwsezc3NTo3NzgwfV0sMzQ3OltbMTE1LDc2OV0sLHs3NzU6Nzc4MX1dLDM0ODpbWzgzLDc3MF1dLDM0OTpbWzExNSw3NzBdXSwzNTA6W1s4Myw4MDddXSwzNTE6W1sxMTUsODA3XV0sMzUyOltbODMsNzgwXSwsezc3NTo3NzgyfV0sMzUzOltbMTE1LDc4MF0sLHs3NzU6Nzc4M31dLDM1NDpbWzg0LDgwN11dLDM1NTpbWzExNiw4MDddXSwzNTY6W1s4NCw3ODBdXSwzNTc6W1sxMTYsNzgwXV0sMzYwOltbODUsNzcxXSwsezc2OTo3ODAwfV0sMzYxOltbMTE3LDc3MV0sLHs3Njk6NzgwMX1dLDM2MjpbWzg1LDc3Ml0sLHs3NzY6NzgwMn1dLDM2MzpbWzExNyw3NzJdLCx7Nzc2Ojc4MDN9XSwzNjQ6W1s4NSw3NzRdXSwzNjU6W1sxMTcsNzc0XV0sMzY2OltbODUsNzc4XV0sMzY3OltbMTE3LDc3OF1dLDM2ODpbWzg1LDc3OV1dLDM2OTpbWzExNyw3NzldXSwzNzA6W1s4NSw4MDhdXSwzNzE6W1sxMTcsODA4XV0sMzcyOltbODcsNzcwXV0sMzczOltbMTE5LDc3MF1dLDM3NDpbWzg5LDc3MF1dLDM3NTpbWzEyMSw3NzBdXSwzNzY6W1s4OSw3NzZdXSwzNzc6W1s5MCw3NjldXSwzNzg6W1sxMjIsNzY5XV0sMzc5OltbOTAsNzc1XV0sMzgwOltbMTIyLDc3NV1dLDM4MTpbWzkwLDc4MF1dLDM4MjpbWzEyMiw3ODBdXSwzODM6W1sxMTVdLDI1Nix7Nzc1Ojc4MzV9XSw0MTY6W1s3OSw3OTVdLCx7NzY4Ojc5MDAsNzY5Ojc4OTgsNzcxOjc5MDQsNzc3Ojc5MDIsODAzOjc5MDZ9XSw0MTc6W1sxMTEsNzk1XSwsezc2ODo3OTAxLDc2OTo3ODk5LDc3MTo3OTA1LDc3Nzo3OTAzLDgwMzo3OTA3fV0sNDMxOltbODUsNzk1XSwsezc2ODo3OTE0LDc2OTo3OTEyLDc3MTo3OTE4LDc3Nzo3OTE2LDgwMzo3OTIwfV0sNDMyOltbMTE3LDc5NV0sLHs3Njg6NzkxNSw3Njk6NzkxMyw3NzE6NzkxOSw3Nzc6NzkxNyw4MDM6NzkyMX1dLDQzOTpbLCx7NzgwOjQ5NH1dLDQ1MjpbWzY4LDM4MV0sMjU2XSw0NTM6W1s2OCwzODJdLDI1Nl0sNDU0OltbMTAwLDM4Ml0sMjU2XSw0NTU6W1s3Niw3NF0sMjU2XSw0NTY6W1s3NiwxMDZdLDI1Nl0sNDU3OltbMTA4LDEwNl0sMjU2XSw0NTg6W1s3OCw3NF0sMjU2XSw0NTk6W1s3OCwxMDZdLDI1Nl0sNDYwOltbMTEwLDEwNl0sMjU2XSw0NjE6W1s2NSw3ODBdXSw0NjI6W1s5Nyw3ODBdXSw0NjM6W1s3Myw3ODBdXSw0NjQ6W1sxMDUsNzgwXV0sNDY1OltbNzksNzgwXV0sNDY2OltbMTExLDc4MF1dLDQ2NzpbWzg1LDc4MF1dLDQ2ODpbWzExNyw3ODBdXSw0Njk6W1syMjAsNzcyXV0sNDcwOltbMjUyLDc3Ml1dLDQ3MTpbWzIyMCw3NjldXSw0NzI6W1syNTIsNzY5XV0sNDczOltbMjIwLDc4MF1dLDQ3NDpbWzI1Miw3ODBdXSw0NzU6W1syMjAsNzY4XV0sNDc2OltbMjUyLDc2OF1dLDQ3ODpbWzE5Niw3NzJdXSw0Nzk6W1syMjgsNzcyXV0sNDgwOltbNTUwLDc3Ml1dLDQ4MTpbWzU1MSw3NzJdXSw0ODI6W1sxOTgsNzcyXV0sNDgzOltbMjMwLDc3Ml1dLDQ4NjpbWzcxLDc4MF1dLDQ4NzpbWzEwMyw3ODBdXSw0ODg6W1s3NSw3ODBdXSw0ODk6W1sxMDcsNzgwXV0sNDkwOltbNzksODA4XSwsezc3Mjo0OTJ9XSw0OTE6W1sxMTEsODA4XSwsezc3Mjo0OTN9XSw0OTI6W1s0OTAsNzcyXV0sNDkzOltbNDkxLDc3Ml1dLDQ5NDpbWzQzOSw3ODBdXSw0OTU6W1s2NTgsNzgwXV0sNDk2OltbMTA2LDc4MF1dLDQ5NzpbWzY4LDkwXSwyNTZdLDQ5ODpbWzY4LDEyMl0sMjU2XSw0OTk6W1sxMDAsMTIyXSwyNTZdLDUwMDpbWzcxLDc2OV1dLDUwMTpbWzEwMyw3NjldXSw1MDQ6W1s3OCw3NjhdXSw1MDU6W1sxMTAsNzY4XV0sNTA2OltbMTk3LDc2OV1dLDUwNzpbWzIyOSw3NjldXSw1MDg6W1sxOTgsNzY5XV0sNTA5OltbMjMwLDc2OV1dLDUxMDpbWzIxNiw3NjldXSw1MTE6W1syNDgsNzY5XV0sNjYwNDU6WywyMjBdfSxcbjUxMjp7NTEyOltbNjUsNzgzXV0sNTEzOltbOTcsNzgzXV0sNTE0OltbNjUsNzg1XV0sNTE1OltbOTcsNzg1XV0sNTE2OltbNjksNzgzXV0sNTE3OltbMTAxLDc4M11dLDUxODpbWzY5LDc4NV1dLDUxOTpbWzEwMSw3ODVdXSw1MjA6W1s3Myw3ODNdXSw1MjE6W1sxMDUsNzgzXV0sNTIyOltbNzMsNzg1XV0sNTIzOltbMTA1LDc4NV1dLDUyNDpbWzc5LDc4M11dLDUyNTpbWzExMSw3ODNdXSw1MjY6W1s3OSw3ODVdXSw1Mjc6W1sxMTEsNzg1XV0sNTI4OltbODIsNzgzXV0sNTI5OltbMTE0LDc4M11dLDUzMDpbWzgyLDc4NV1dLDUzMTpbWzExNCw3ODVdXSw1MzI6W1s4NSw3ODNdXSw1MzM6W1sxMTcsNzgzXV0sNTM0OltbODUsNzg1XV0sNTM1OltbMTE3LDc4NV1dLDUzNjpbWzgzLDgwNl1dLDUzNzpbWzExNSw4MDZdXSw1Mzg6W1s4NCw4MDZdXSw1Mzk6W1sxMTYsODA2XV0sNTQyOltbNzIsNzgwXV0sNTQzOltbMTA0LDc4MF1dLDU1MDpbWzY1LDc3NV0sLHs3NzI6NDgwfV0sNTUxOltbOTcsNzc1XSwsezc3Mjo0ODF9XSw1NTI6W1s2OSw4MDddLCx7Nzc0Ojc3MDh9XSw1NTM6W1sxMDEsODA3XSwsezc3NDo3NzA5fV0sNTU0OltbMjE0LDc3Ml1dLDU1NTpbWzI0Niw3NzJdXSw1NTY6W1syMTMsNzcyXV0sNTU3OltbMjQ1LDc3Ml1dLDU1ODpbWzc5LDc3NV0sLHs3NzI6NTYwfV0sNTU5OltbMTExLDc3NV0sLHs3NzI6NTYxfV0sNTYwOltbNTU4LDc3Ml1dLDU2MTpbWzU1OSw3NzJdXSw1NjI6W1s4OSw3NzJdXSw1NjM6W1sxMjEsNzcyXV0sNjU4OlssLHs3ODA6NDk1fV0sNjg4OltbMTA0XSwyNTZdLDY4OTpbWzYxNF0sMjU2XSw2OTA6W1sxMDZdLDI1Nl0sNjkxOltbMTE0XSwyNTZdLDY5MjpbWzYzM10sMjU2XSw2OTM6W1s2MzVdLDI1Nl0sNjk0OltbNjQxXSwyNTZdLDY5NTpbWzExOV0sMjU2XSw2OTY6W1sxMjFdLDI1Nl0sNzI4OltbMzIsNzc0XSwyNTZdLDcyOTpbWzMyLDc3NV0sMjU2XSw3MzA6W1szMiw3NzhdLDI1Nl0sNzMxOltbMzIsODA4XSwyNTZdLDczMjpbWzMyLDc3MV0sMjU2XSw3MzM6W1szMiw3NzldLDI1Nl0sNzM2OltbNjExXSwyNTZdLDczNzpbWzEwOF0sMjU2XSw3Mzg6W1sxMTVdLDI1Nl0sNzM5OltbMTIwXSwyNTZdLDc0MDpbWzY2MV0sMjU2XX0sXG43Njg6ezc2ODpbLDIzMF0sNzY5OlssMjMwXSw3NzA6WywyMzBdLDc3MTpbLDIzMF0sNzcyOlssMjMwXSw3NzM6WywyMzBdLDc3NDpbLDIzMF0sNzc1OlssMjMwXSw3NzY6WywyMzAsezc2OTo4MzZ9XSw3Nzc6WywyMzBdLDc3ODpbLDIzMF0sNzc5OlssMjMwXSw3ODA6WywyMzBdLDc4MTpbLDIzMF0sNzgyOlssMjMwXSw3ODM6WywyMzBdLDc4NDpbLDIzMF0sNzg1OlssMjMwXSw3ODY6WywyMzBdLDc4NzpbLDIzMF0sNzg4OlssMjMwXSw3ODk6WywyMzJdLDc5MDpbLDIyMF0sNzkxOlssMjIwXSw3OTI6WywyMjBdLDc5MzpbLDIyMF0sNzk0OlssMjMyXSw3OTU6WywyMTZdLDc5NjpbLDIyMF0sNzk3OlssMjIwXSw3OTg6WywyMjBdLDc5OTpbLDIyMF0sODAwOlssMjIwXSw4MDE6WywyMDJdLDgwMjpbLDIwMl0sODAzOlssMjIwXSw4MDQ6WywyMjBdLDgwNTpbLDIyMF0sODA2OlssMjIwXSw4MDc6WywyMDJdLDgwODpbLDIwMl0sODA5OlssMjIwXSw4MTA6WywyMjBdLDgxMTpbLDIyMF0sODEyOlssMjIwXSw4MTM6WywyMjBdLDgxNDpbLDIyMF0sODE1OlssMjIwXSw4MTY6WywyMjBdLDgxNzpbLDIyMF0sODE4OlssMjIwXSw4MTk6WywyMjBdLDgyMDpbLDFdLDgyMTpbLDFdLDgyMjpbLDFdLDgyMzpbLDFdLDgyNDpbLDFdLDgyNTpbLDIyMF0sODI2OlssMjIwXSw4Mjc6WywyMjBdLDgyODpbLDIyMF0sODI5OlssMjMwXSw4MzA6WywyMzBdLDgzMTpbLDIzMF0sODMyOltbNzY4XSwyMzBdLDgzMzpbWzc2OV0sMjMwXSw4MzQ6WywyMzBdLDgzNTpbWzc4N10sMjMwXSw4MzY6W1s3NzYsNzY5XSwyMzBdLDgzNzpbLDI0MF0sODM4OlssMjMwXSw4Mzk6WywyMjBdLDg0MDpbLDIyMF0sODQxOlssMjIwXSw4NDI6WywyMzBdLDg0MzpbLDIzMF0sODQ0OlssMjMwXSw4NDU6WywyMjBdLDg0NjpbLDIyMF0sODQ4OlssMjMwXSw4NDk6WywyMzBdLDg1MDpbLDIzMF0sODUxOlssMjIwXSw4NTI6WywyMjBdLDg1MzpbLDIyMF0sODU0OlssMjIwXSw4NTU6WywyMzBdLDg1NjpbLDIzMl0sODU3OlssMjIwXSw4NTg6WywyMjBdLDg1OTpbLDIzMF0sODYwOlssMjMzXSw4NjE6WywyMzRdLDg2MjpbLDIzNF0sODYzOlssMjMzXSw4NjQ6WywyMzRdLDg2NTpbLDIzNF0sODY2OlssMjMzXSw4Njc6WywyMzBdLDg2ODpbLDIzMF0sODY5OlssMjMwXSw4NzA6WywyMzBdLDg3MTpbLDIzMF0sODcyOlssMjMwXSw4NzM6WywyMzBdLDg3NDpbLDIzMF0sODc1OlssMjMwXSw4NzY6WywyMzBdLDg3NzpbLDIzMF0sODc4OlssMjMwXSw4Nzk6WywyMzBdLDg4NDpbWzY5N11dLDg5MDpbWzMyLDgzN10sMjU2XSw4OTQ6W1s1OV1dLDkwMDpbWzMyLDc2OV0sMjU2XSw5MDE6W1sxNjgsNzY5XV0sOTAyOltbOTEzLDc2OV1dLDkwMzpbWzE4M11dLDkwNDpbWzkxNyw3NjldXSw5MDU6W1s5MTksNzY5XV0sOTA2OltbOTIxLDc2OV1dLDkwODpbWzkyNyw3NjldXSw5MTA6W1s5MzMsNzY5XV0sOTExOltbOTM3LDc2OV1dLDkxMjpbWzk3MCw3NjldXSw5MTM6Wywsezc2ODo4MTIyLDc2OTo5MDIsNzcyOjgxMjEsNzc0OjgxMjAsNzg3Ojc5NDQsNzg4Ojc5NDUsODM3OjgxMjR9XSw5MTc6Wywsezc2ODo4MTM2LDc2OTo5MDQsNzg3Ojc5NjAsNzg4Ojc5NjF9XSw5MTk6Wywsezc2ODo4MTM4LDc2OTo5MDUsNzg3Ojc5NzYsNzg4Ojc5NzcsODM3OjgxNDB9XSw5MjE6Wywsezc2ODo4MTU0LDc2OTo5MDYsNzcyOjgxNTMsNzc0OjgxNTIsNzc2OjkzOCw3ODc6Nzk5Miw3ODg6Nzk5M31dLDkyNzpbLCx7NzY4OjgxODQsNzY5OjkwOCw3ODc6ODAwOCw3ODg6ODAwOX1dLDkyOTpbLCx7Nzg4OjgxNzJ9XSw5MzM6Wywsezc2ODo4MTcwLDc2OTo5MTAsNzcyOjgxNjksNzc0OjgxNjgsNzc2OjkzOSw3ODg6ODAyNX1dLDkzNzpbLCx7NzY4OjgxODYsNzY5OjkxMSw3ODc6ODA0MCw3ODg6ODA0MSw4Mzc6ODE4OH1dLDkzODpbWzkyMSw3NzZdXSw5Mzk6W1s5MzMsNzc2XV0sOTQwOltbOTQ1LDc2OV0sLHs4Mzc6ODExNn1dLDk0MTpbWzk0OSw3NjldXSw5NDI6W1s5NTEsNzY5XSwsezgzNzo4MTMyfV0sOTQzOltbOTUzLDc2OV1dLDk0NDpbWzk3MSw3NjldXSw5NDU6Wywsezc2ODo4MDQ4LDc2OTo5NDAsNzcyOjgxMTMsNzc0OjgxMTIsNzg3Ojc5MzYsNzg4Ojc5MzcsODM0OjgxMTgsODM3OjgxMTV9XSw5NDk6Wywsezc2ODo4MDUwLDc2OTo5NDEsNzg3Ojc5NTIsNzg4Ojc5NTN9XSw5NTE6Wywsezc2ODo4MDUyLDc2OTo5NDIsNzg3Ojc5NjgsNzg4Ojc5NjksODM0OjgxMzQsODM3OjgxMzF9XSw5NTM6Wywsezc2ODo4MDU0LDc2OTo5NDMsNzcyOjgxNDUsNzc0OjgxNDQsNzc2Ojk3MCw3ODc6Nzk4NCw3ODg6Nzk4NSw4MzQ6ODE1MH1dLDk1OTpbLCx7NzY4OjgwNTYsNzY5Ojk3Miw3ODc6ODAwMCw3ODg6ODAwMX1dLDk2MTpbLCx7Nzg3OjgxNjQsNzg4OjgxNjV9XSw5NjU6Wywsezc2ODo4MDU4LDc2OTo5NzMsNzcyOjgxNjEsNzc0OjgxNjAsNzc2Ojk3MSw3ODc6ODAxNiw3ODg6ODAxNyw4MzQ6ODE2Nn1dLDk2OTpbLCx7NzY4OjgwNjAsNzY5Ojk3NCw3ODc6ODAzMiw3ODg6ODAzMyw4MzQ6ODE4Miw4Mzc6ODE3OX1dLDk3MDpbWzk1Myw3NzZdLCx7NzY4OjgxNDYsNzY5OjkxMiw4MzQ6ODE1MX1dLDk3MTpbWzk2NSw3NzZdLCx7NzY4OjgxNjIsNzY5Ojk0NCw4MzQ6ODE2N31dLDk3MjpbWzk1OSw3NjldXSw5NzM6W1s5NjUsNzY5XV0sOTc0OltbOTY5LDc2OV0sLHs4Mzc6ODE4MH1dLDk3NjpbWzk0Nl0sMjU2XSw5Nzc6W1s5NTJdLDI1Nl0sOTc4OltbOTMzXSwyNTYsezc2OTo5NzksNzc2Ojk4MH1dLDk3OTpbWzk3OCw3NjldXSw5ODA6W1s5NzgsNzc2XV0sOTgxOltbOTY2XSwyNTZdLDk4MjpbWzk2MF0sMjU2XSwxMDA4OltbOTU0XSwyNTZdLDEwMDk6W1s5NjFdLDI1Nl0sMTAxMDpbWzk2Ml0sMjU2XSwxMDEyOltbOTIwXSwyNTZdLDEwMTM6W1s5NDldLDI1Nl0sMTAxNzpbWzkzMV0sMjU2XX0sXG4xMDI0OnsxMDI0OltbMTA0NSw3NjhdXSwxMDI1OltbMTA0NSw3NzZdXSwxMDI3OltbMTA0Myw3NjldXSwxMDMwOlssLHs3NzY6MTAzMX1dLDEwMzE6W1sxMDMwLDc3Nl1dLDEwMzY6W1sxMDUwLDc2OV1dLDEwMzc6W1sxMDQ4LDc2OF1dLDEwMzg6W1sxMDU5LDc3NF1dLDEwNDA6Wywsezc3NDoxMjMyLDc3NjoxMjM0fV0sMTA0MzpbLCx7NzY5OjEwMjd9XSwxMDQ1OlssLHs3Njg6MTAyNCw3NzQ6MTIzOCw3NzY6MTAyNX1dLDEwNDY6Wywsezc3NDoxMjE3LDc3NjoxMjQ0fV0sMTA0NzpbLCx7Nzc2OjEyNDZ9XSwxMDQ4OlssLHs3Njg6MTAzNyw3NzI6MTI1MCw3NzQ6MTA0OSw3NzY6MTI1Mn1dLDEwNDk6W1sxMDQ4LDc3NF1dLDEwNTA6Wywsezc2OToxMDM2fV0sMTA1NDpbLCx7Nzc2OjEyNTR9XSwxMDU5OlssLHs3NzI6MTI2Miw3NzQ6MTAzOCw3NzY6MTI2NCw3Nzk6MTI2Nn1dLDEwNjM6Wywsezc3NjoxMjY4fV0sMTA2NzpbLCx7Nzc2OjEyNzJ9XSwxMDY5OlssLHs3NzY6MTI2MH1dLDEwNzI6Wywsezc3NDoxMjMzLDc3NjoxMjM1fV0sMTA3NTpbLCx7NzY5OjExMDd9XSwxMDc3OlssLHs3Njg6MTEwNCw3NzQ6MTIzOSw3NzY6MTEwNX1dLDEwNzg6Wywsezc3NDoxMjE4LDc3NjoxMjQ1fV0sMTA3OTpbLCx7Nzc2OjEyNDd9XSwxMDgwOlssLHs3Njg6MTExNyw3NzI6MTI1MSw3NzQ6MTA4MSw3NzY6MTI1M31dLDEwODE6W1sxMDgwLDc3NF1dLDEwODI6Wywsezc2OToxMTE2fV0sMTA4NjpbLCx7Nzc2OjEyNTV9XSwxMDkxOlssLHs3NzI6MTI2Myw3NzQ6MTExOCw3NzY6MTI2NSw3Nzk6MTI2N31dLDEwOTU6Wywsezc3NjoxMjY5fV0sMTA5OTpbLCx7Nzc2OjEyNzN9XSwxMTAxOlssLHs3NzY6MTI2MX1dLDExMDQ6W1sxMDc3LDc2OF1dLDExMDU6W1sxMDc3LDc3Nl1dLDExMDc6W1sxMDc1LDc2OV1dLDExMTA6Wywsezc3NjoxMTExfV0sMTExMTpbWzExMTAsNzc2XV0sMTExNjpbWzEwODIsNzY5XV0sMTExNzpbWzEwODAsNzY4XV0sMTExODpbWzEwOTEsNzc0XV0sMTE0MDpbLCx7NzgzOjExNDJ9XSwxMTQxOlssLHs3ODM6MTE0M31dLDExNDI6W1sxMTQwLDc4M11dLDExNDM6W1sxMTQxLDc4M11dLDExNTU6WywyMzBdLDExNTY6WywyMzBdLDExNTc6WywyMzBdLDExNTg6WywyMzBdLDExNTk6WywyMzBdLDEyMTc6W1sxMDQ2LDc3NF1dLDEyMTg6W1sxMDc4LDc3NF1dLDEyMzI6W1sxMDQwLDc3NF1dLDEyMzM6W1sxMDcyLDc3NF1dLDEyMzQ6W1sxMDQwLDc3Nl1dLDEyMzU6W1sxMDcyLDc3Nl1dLDEyMzg6W1sxMDQ1LDc3NF1dLDEyMzk6W1sxMDc3LDc3NF1dLDEyNDA6Wywsezc3NjoxMjQyfV0sMTI0MTpbLCx7Nzc2OjEyNDN9XSwxMjQyOltbMTI0MCw3NzZdXSwxMjQzOltbMTI0MSw3NzZdXSwxMjQ0OltbMTA0Niw3NzZdXSwxMjQ1OltbMTA3OCw3NzZdXSwxMjQ2OltbMTA0Nyw3NzZdXSwxMjQ3OltbMTA3OSw3NzZdXSwxMjUwOltbMTA0OCw3NzJdXSwxMjUxOltbMTA4MCw3NzJdXSwxMjUyOltbMTA0OCw3NzZdXSwxMjUzOltbMTA4MCw3NzZdXSwxMjU0OltbMTA1NCw3NzZdXSwxMjU1OltbMTA4Niw3NzZdXSwxMjU2OlssLHs3NzY6MTI1OH1dLDEyNTc6Wywsezc3NjoxMjU5fV0sMTI1ODpbWzEyNTYsNzc2XV0sMTI1OTpbWzEyNTcsNzc2XV0sMTI2MDpbWzEwNjksNzc2XV0sMTI2MTpbWzExMDEsNzc2XV0sMTI2MjpbWzEwNTksNzcyXV0sMTI2MzpbWzEwOTEsNzcyXV0sMTI2NDpbWzEwNTksNzc2XV0sMTI2NTpbWzEwOTEsNzc2XV0sMTI2NjpbWzEwNTksNzc5XV0sMTI2NzpbWzEwOTEsNzc5XV0sMTI2ODpbWzEwNjMsNzc2XV0sMTI2OTpbWzEwOTUsNzc2XV0sMTI3MjpbWzEwNjcsNzc2XV0sMTI3MzpbWzEwOTksNzc2XV19LFxuMTI4MDp7MTQxNTpbWzEzODEsMTQxMF0sMjU2XSwxNDI1OlssMjIwXSwxNDI2OlssMjMwXSwxNDI3OlssMjMwXSwxNDI4OlssMjMwXSwxNDI5OlssMjMwXSwxNDMwOlssMjIwXSwxNDMxOlssMjMwXSwxNDMyOlssMjMwXSwxNDMzOlssMjMwXSwxNDM0OlssMjIyXSwxNDM1OlssMjIwXSwxNDM2OlssMjMwXSwxNDM3OlssMjMwXSwxNDM4OlssMjMwXSwxNDM5OlssMjMwXSwxNDQwOlssMjMwXSwxNDQxOlssMjMwXSwxNDQyOlssMjIwXSwxNDQzOlssMjIwXSwxNDQ0OlssMjIwXSwxNDQ1OlssMjIwXSwxNDQ2OlssMjIwXSwxNDQ3OlssMjIwXSwxNDQ4OlssMjMwXSwxNDQ5OlssMjMwXSwxNDUwOlssMjIwXSwxNDUxOlssMjMwXSwxNDUyOlssMjMwXSwxNDUzOlssMjIyXSwxNDU0OlssMjI4XSwxNDU1OlssMjMwXSwxNDU2OlssMTBdLDE0NTc6WywxMV0sMTQ1ODpbLDEyXSwxNDU5OlssMTNdLDE0NjA6WywxNF0sMTQ2MTpbLDE1XSwxNDYyOlssMTZdLDE0NjM6WywxN10sMTQ2NDpbLDE4XSwxNDY1OlssMTldLDE0NjY6WywxOV0sMTQ2NzpbLDIwXSwxNDY4OlssMjFdLDE0Njk6WywyMl0sMTQ3MTpbLDIzXSwxNDczOlssMjRdLDE0NzQ6WywyNV0sMTQ3NjpbLDIzMF0sMTQ3NzpbLDIyMF0sMTQ3OTpbLDE4XX0sXG4xNTM2OnsxNTUyOlssMjMwXSwxNTUzOlssMjMwXSwxNTU0OlssMjMwXSwxNTU1OlssMjMwXSwxNTU2OlssMjMwXSwxNTU3OlssMjMwXSwxNTU4OlssMjMwXSwxNTU5OlssMjMwXSwxNTYwOlssMzBdLDE1NjE6WywzMV0sMTU2MjpbLDMyXSwxNTcwOltbMTU3NSwxNjE5XV0sMTU3MTpbWzE1NzUsMTYyMF1dLDE1NzI6W1sxNjA4LDE2MjBdXSwxNTczOltbMTU3NSwxNjIxXV0sMTU3NDpbWzE2MTAsMTYyMF1dLDE1NzU6WywsezE2MTk6MTU3MCwxNjIwOjE1NzEsMTYyMToxNTczfV0sMTYwODpbLCx7MTYyMDoxNTcyfV0sMTYxMDpbLCx7MTYyMDoxNTc0fV0sMTYxMTpbLDI3XSwxNjEyOlssMjhdLDE2MTM6WywyOV0sMTYxNDpbLDMwXSwxNjE1OlssMzFdLDE2MTY6WywzMl0sMTYxNzpbLDMzXSwxNjE4OlssMzRdLDE2MTk6WywyMzBdLDE2MjA6WywyMzBdLDE2MjE6WywyMjBdLDE2MjI6WywyMjBdLDE2MjM6WywyMzBdLDE2MjQ6WywyMzBdLDE2MjU6WywyMzBdLDE2MjY6WywyMzBdLDE2Mjc6WywyMzBdLDE2Mjg6WywyMjBdLDE2Mjk6WywyMzBdLDE2MzA6WywyMzBdLDE2MzE6WywyMjBdLDE2NDg6WywzNV0sMTY1MzpbWzE1NzUsMTY1Ml0sMjU2XSwxNjU0OltbMTYwOCwxNjUyXSwyNTZdLDE2NTU6W1sxNzM1LDE2NTJdLDI1Nl0sMTY1NjpbWzE2MTAsMTY1Ml0sMjU2XSwxNzI4OltbMTc0OSwxNjIwXV0sMTcyOTpbLCx7MTYyMDoxNzMwfV0sMTczMDpbWzE3MjksMTYyMF1dLDE3NDY6WywsezE2MjA6MTc0N31dLDE3NDc6W1sxNzQ2LDE2MjBdXSwxNzQ5OlssLHsxNjIwOjE3Mjh9XSwxNzUwOlssMjMwXSwxNzUxOlssMjMwXSwxNzUyOlssMjMwXSwxNzUzOlssMjMwXSwxNzU0OlssMjMwXSwxNzU1OlssMjMwXSwxNzU2OlssMjMwXSwxNzU5OlssMjMwXSwxNzYwOlssMjMwXSwxNzYxOlssMjMwXSwxNzYyOlssMjMwXSwxNzYzOlssMjIwXSwxNzY0OlssMjMwXSwxNzY3OlssMjMwXSwxNzY4OlssMjMwXSwxNzcwOlssMjIwXSwxNzcxOlssMjMwXSwxNzcyOlssMjMwXSwxNzczOlssMjIwXX0sXG4xNzkyOnsxODA5OlssMzZdLDE4NDA6WywyMzBdLDE4NDE6WywyMjBdLDE4NDI6WywyMzBdLDE4NDM6WywyMzBdLDE4NDQ6WywyMjBdLDE4NDU6WywyMzBdLDE4NDY6WywyMzBdLDE4NDc6WywyMjBdLDE4NDg6WywyMjBdLDE4NDk6WywyMjBdLDE4NTA6WywyMzBdLDE4NTE6WywyMjBdLDE4NTI6WywyMjBdLDE4NTM6WywyMzBdLDE4NTQ6WywyMjBdLDE4NTU6WywyMzBdLDE4NTY6WywyMzBdLDE4NTc6WywyMzBdLDE4NTg6WywyMjBdLDE4NTk6WywyMzBdLDE4NjA6WywyMjBdLDE4NjE6WywyMzBdLDE4NjI6WywyMjBdLDE4NjM6WywyMzBdLDE4NjQ6WywyMjBdLDE4NjU6WywyMzBdLDE4NjY6WywyMzBdLDIwMjc6WywyMzBdLDIwMjg6WywyMzBdLDIwMjk6WywyMzBdLDIwMzA6WywyMzBdLDIwMzE6WywyMzBdLDIwMzI6WywyMzBdLDIwMzM6WywyMzBdLDIwMzQ6WywyMjBdLDIwMzU6WywyMzBdfSxcbjIwNDg6ezIwNzA6WywyMzBdLDIwNzE6WywyMzBdLDIwNzI6WywyMzBdLDIwNzM6WywyMzBdLDIwNzU6WywyMzBdLDIwNzY6WywyMzBdLDIwNzc6WywyMzBdLDIwNzg6WywyMzBdLDIwNzk6WywyMzBdLDIwODA6WywyMzBdLDIwODE6WywyMzBdLDIwODI6WywyMzBdLDIwODM6WywyMzBdLDIwODU6WywyMzBdLDIwODY6WywyMzBdLDIwODc6WywyMzBdLDIwODk6WywyMzBdLDIwOTA6WywyMzBdLDIwOTE6WywyMzBdLDIwOTI6WywyMzBdLDIwOTM6WywyMzBdLDIxMzc6WywyMjBdLDIxMzg6WywyMjBdLDIxMzk6WywyMjBdLDIyNzY6WywyMzBdLDIyNzc6WywyMzBdLDIyNzg6WywyMjBdLDIyNzk6WywyMzBdLDIyODA6WywyMzBdLDIyODE6WywyMjBdLDIyODI6WywyMzBdLDIyODM6WywyMzBdLDIyODQ6WywyMzBdLDIyODU6WywyMjBdLDIyODY6WywyMjBdLDIyODc6WywyMjBdLDIyODg6WywyN10sMjI4OTpbLDI4XSwyMjkwOlssMjldLDIyOTE6WywyMzBdLDIyOTI6WywyMzBdLDIyOTM6WywyMzBdLDIyOTQ6WywyMjBdLDIyOTU6WywyMzBdLDIyOTY6WywyMzBdLDIyOTc6WywyMjBdLDIyOTg6WywyMjBdLDIyOTk6WywyMzBdLDIzMDA6WywyMzBdLDIzMDE6WywyMzBdLDIzMDI6WywyMzBdfSxcbjIzMDQ6ezIzNDQ6WywsezIzNjQ6MjM0NX1dLDIzNDU6W1syMzQ0LDIzNjRdXSwyMzUyOlssLHsyMzY0OjIzNTN9XSwyMzUzOltbMjM1MiwyMzY0XV0sMjM1NTpbLCx7MjM2NDoyMzU2fV0sMjM1NjpbWzIzNTUsMjM2NF1dLDIzNjQ6Wyw3XSwyMzgxOlssOV0sMjM4NTpbLDIzMF0sMjM4NjpbLDIyMF0sMjM4NzpbLDIzMF0sMjM4ODpbLDIzMF0sMjM5MjpbWzIzMjUsMjM2NF0sNTEyXSwyMzkzOltbMjMyNiwyMzY0XSw1MTJdLDIzOTQ6W1syMzI3LDIzNjRdLDUxMl0sMjM5NTpbWzIzMzIsMjM2NF0sNTEyXSwyMzk2OltbMjMzNywyMzY0XSw1MTJdLDIzOTc6W1syMzM4LDIzNjRdLDUxMl0sMjM5ODpbWzIzNDcsMjM2NF0sNTEyXSwyMzk5OltbMjM1MSwyMzY0XSw1MTJdLDI0OTI6Wyw3XSwyNTAzOlssLHsyNDk0OjI1MDcsMjUxOToyNTA4fV0sMjUwNzpbWzI1MDMsMjQ5NF1dLDI1MDg6W1syNTAzLDI1MTldXSwyNTA5OlssOV0sMjUyNDpbWzI0NjUsMjQ5Ml0sNTEyXSwyNTI1OltbMjQ2NiwyNDkyXSw1MTJdLDI1Mjc6W1syNDc5LDI0OTJdLDUxMl19LFxuMjU2MDp7MjYxMTpbWzI2MTAsMjYyMF0sNTEyXSwyNjE0OltbMjYxNiwyNjIwXSw1MTJdLDI2MjA6Wyw3XSwyNjM3OlssOV0sMjY0OTpbWzI1ODIsMjYyMF0sNTEyXSwyNjUwOltbMjU4MywyNjIwXSw1MTJdLDI2NTE6W1syNTg4LDI2MjBdLDUxMl0sMjY1NDpbWzI2MDMsMjYyMF0sNTEyXSwyNzQ4OlssN10sMjc2NTpbLDldLDY4MTA5OlssMjIwXSw2ODExMTpbLDIzMF0sNjgxNTI6WywyMzBdLDY4MTUzOlssMV0sNjgxNTQ6WywyMjBdLDY4MTU5OlssOV19LFxuMjgxNjp7Mjg3NjpbLDddLDI4ODc6WywsezI4Nzg6Mjg5MSwyOTAyOjI4ODgsMjkwMzoyODkyfV0sMjg4ODpbWzI4ODcsMjkwMl1dLDI4OTE6W1syODg3LDI4NzhdXSwyODkyOltbMjg4NywyOTAzXV0sMjg5MzpbLDldLDI5MDg6W1syODQ5LDI4NzZdLDUxMl0sMjkwOTpbWzI4NTAsMjg3Nl0sNTEyXSwyOTYyOlssLHszMDMxOjI5NjR9XSwyOTY0OltbMjk2MiwzMDMxXV0sMzAxNDpbLCx7MzAwNjozMDE4LDMwMzE6MzAyMH1dLDMwMTU6WywsezMwMDY6MzAxOX1dLDMwMTg6W1szMDE0LDMwMDZdXSwzMDE5OltbMzAxNSwzMDA2XV0sMzAyMDpbWzMwMTQsMzAzMV1dLDMwMjE6Wyw5XX0sXG4zMDcyOnszMTQyOlssLHszMTU4OjMxNDR9XSwzMTQ0OltbMzE0MiwzMTU4XV0sMzE0OTpbLDldLDMxNTc6Wyw4NF0sMzE1ODpbLDkxXSwzMjYwOlssN10sMzI2MzpbLCx7MzI4NTozMjY0fV0sMzI2NDpbWzMyNjMsMzI4NV1dLDMyNzA6WywsezMyNjY6MzI3NCwzMjg1OjMyNzEsMzI4NjozMjcyfV0sMzI3MTpbWzMyNzAsMzI4NV1dLDMyNzI6W1szMjcwLDMyODZdXSwzMjc0OltbMzI3MCwzMjY2XSwsezMyODU6MzI3NX1dLDMyNzU6W1szMjc0LDMyODVdXSwzMjc3OlssOV19LFxuMzMyODp7MzM5ODpbLCx7MzM5MDozNDAyLDM0MTU6MzQwNH1dLDMzOTk6WywsezMzOTA6MzQwM31dLDM0MDI6W1szMzk4LDMzOTBdXSwzNDAzOltbMzM5OSwzMzkwXV0sMzQwNDpbWzMzOTgsMzQxNV1dLDM0MDU6Wyw5XSwzNTMwOlssOV0sMzU0NTpbLCx7MzUzMDozNTQ2LDM1MzU6MzU0OCwzNTUxOjM1NTB9XSwzNTQ2OltbMzU0NSwzNTMwXV0sMzU0ODpbWzM1NDUsMzUzNV0sLHszNTMwOjM1NDl9XSwzNTQ5OltbMzU0OCwzNTMwXV0sMzU1MDpbWzM1NDUsMzU1MV1dfSxcbjM1ODQ6ezM2MzU6W1szNjYxLDM2MzRdLDI1Nl0sMzY0MDpbLDEwM10sMzY0MTpbLDEwM10sMzY0MjpbLDldLDM2NTY6WywxMDddLDM2NTc6WywxMDddLDM2NTg6WywxMDddLDM2NTk6WywxMDddLDM3NjM6W1szNzg5LDM3NjJdLDI1Nl0sMzc2ODpbLDExOF0sMzc2OTpbLDExOF0sMzc4NDpbLDEyMl0sMzc4NTpbLDEyMl0sMzc4NjpbLDEyMl0sMzc4NzpbLDEyMl0sMzgwNDpbWzM3NTUsMzczN10sMjU2XSwzODA1OltbMzc1NSwzNzQ1XSwyNTZdfSxcbjM4NDA6ezM4NTI6W1szODUxXSwyNTZdLDM4NjQ6WywyMjBdLDM4NjU6WywyMjBdLDM4OTM6WywyMjBdLDM4OTU6WywyMjBdLDM4OTc6WywyMTZdLDM5MDc6W1szOTA2LDQwMjNdLDUxMl0sMzkxNzpbWzM5MTYsNDAyM10sNTEyXSwzOTIyOltbMzkyMSw0MDIzXSw1MTJdLDM5Mjc6W1szOTI2LDQwMjNdLDUxMl0sMzkzMjpbWzM5MzEsNDAyM10sNTEyXSwzOTQ1OltbMzkwNCw0MDIxXSw1MTJdLDM5NTM6WywxMjldLDM5NTQ6WywxMzBdLDM5NTU6W1szOTUzLDM5NTRdLDUxMl0sMzk1NjpbLDEzMl0sMzk1NzpbWzM5NTMsMzk1Nl0sNTEyXSwzOTU4OltbNDAxOCwzOTY4XSw1MTJdLDM5NTk6W1s0MDE4LDM5NjldLDI1Nl0sMzk2MDpbWzQwMTksMzk2OF0sNTEyXSwzOTYxOltbNDAxOSwzOTY5XSwyNTZdLDM5NjI6WywxMzBdLDM5NjM6WywxMzBdLDM5NjQ6WywxMzBdLDM5NjU6WywxMzBdLDM5Njg6WywxMzBdLDM5Njk6W1szOTUzLDM5NjhdLDUxMl0sMzk3MDpbLDIzMF0sMzk3MTpbLDIzMF0sMzk3MjpbLDldLDM5NzQ6WywyMzBdLDM5NzU6WywyMzBdLDM5ODc6W1szOTg2LDQwMjNdLDUxMl0sMzk5NzpbWzM5OTYsNDAyM10sNTEyXSw0MDAyOltbNDAwMSw0MDIzXSw1MTJdLDQwMDc6W1s0MDA2LDQwMjNdLDUxMl0sNDAxMjpbWzQwMTEsNDAyM10sNTEyXSw0MDI1OltbMzk4NCw0MDIxXSw1MTJdLDQwMzg6WywyMjBdfSxcbjQwOTY6ezQxMzM6WywsezQxNDI6NDEzNH1dLDQxMzQ6W1s0MTMzLDQxNDJdXSw0MTUxOlssN10sNDE1MzpbLDldLDQxNTQ6Wyw5XSw0MjM3OlssMjIwXSw0MzQ4OltbNDMxNl0sMjU2XSw2OTcwMjpbLDldLDY5Nzg1OlssLHs2OTgxODo2OTc4Nn1dLDY5Nzg2OltbNjk3ODUsNjk4MThdXSw2OTc4NzpbLCx7Njk4MTg6Njk3ODh9XSw2OTc4ODpbWzY5Nzg3LDY5ODE4XV0sNjk3OTc6WywsezY5ODE4OjY5ODAzfV0sNjk4MDM6W1s2OTc5Nyw2OTgxOF1dLDY5ODE3OlssOV0sNjk4MTg6Wyw3XX0sXG40MzUyOns2OTg4ODpbLDIzMF0sNjk4ODk6WywyMzBdLDY5ODkwOlssMjMwXSw2OTkzNDpbWzY5OTM3LDY5OTI3XV0sNjk5MzU6W1s2OTkzOCw2OTkyN11dLDY5OTM3OlssLHs2OTkyNzo2OTkzNH1dLDY5OTM4OlssLHs2OTkyNzo2OTkzNX1dLDY5OTM5OlssOV0sNjk5NDA6Wyw5XSw3MDA4MDpbLDldfSxcbjQ4NjQ6ezQ5NTc6WywyMzBdLDQ5NTg6WywyMzBdLDQ5NTk6WywyMzBdfSxcbjU2MzI6ezcxMzUwOlssOV0sNzEzNTE6Wyw3XX0sXG41ODg4Ons1OTA4OlssOV0sNTk0MDpbLDldLDYwOTg6Wyw5XSw2MTA5OlssMjMwXX0sXG42MTQ0Ons2MzEzOlssMjI4XX0sXG42NDAwOns2NDU3OlssMjIyXSw2NDU4OlssMjMwXSw2NDU5OlssMjIwXX0sXG42NjU2Ons2Njc5OlssMjMwXSw2NjgwOlssMjIwXSw2NzUyOlssOV0sNjc3MzpbLDIzMF0sNjc3NDpbLDIzMF0sNjc3NTpbLDIzMF0sNjc3NjpbLDIzMF0sNjc3NzpbLDIzMF0sNjc3ODpbLDIzMF0sNjc3OTpbLDIzMF0sNjc4MDpbLDIzMF0sNjc4MzpbLDIyMF19LFxuNjkxMjp7NjkxNzpbLCx7Njk2NTo2OTE4fV0sNjkxODpbWzY5MTcsNjk2NV1dLDY5MTk6WywsezY5NjU6NjkyMH1dLDY5MjA6W1s2OTE5LDY5NjVdXSw2OTIxOlssLHs2OTY1OjY5MjJ9XSw2OTIyOltbNjkyMSw2OTY1XV0sNjkyMzpbLCx7Njk2NTo2OTI0fV0sNjkyNDpbWzY5MjMsNjk2NV1dLDY5MjU6WywsezY5NjU6NjkyNn1dLDY5MjY6W1s2OTI1LDY5NjVdXSw2OTI5OlssLHs2OTY1OjY5MzB9XSw2OTMwOltbNjkyOSw2OTY1XV0sNjk2NDpbLDddLDY5NzA6WywsezY5NjU6Njk3MX1dLDY5NzE6W1s2OTcwLDY5NjVdXSw2OTcyOlssLHs2OTY1OjY5NzN9XSw2OTczOltbNjk3Miw2OTY1XV0sNjk3NDpbLCx7Njk2NTo2OTc2fV0sNjk3NTpbLCx7Njk2NTo2OTc3fV0sNjk3NjpbWzY5NzQsNjk2NV1dLDY5Nzc6W1s2OTc1LDY5NjVdXSw2OTc4OlssLHs2OTY1OjY5Nzl9XSw2OTc5OltbNjk3OCw2OTY1XV0sNjk4MDpbLDldLDcwMTk6WywyMzBdLDcwMjA6WywyMjBdLDcwMjE6WywyMzBdLDcwMjI6WywyMzBdLDcwMjM6WywyMzBdLDcwMjQ6WywyMzBdLDcwMjU6WywyMzBdLDcwMjY6WywyMzBdLDcwMjc6WywyMzBdLDcwODI6Wyw5XSw3MDgzOlssOV0sNzE0MjpbLDddLDcxNTQ6Wyw5XSw3MTU1OlssOV19LFxuNzE2ODp7NzIyMzpbLDddLDczNzY6WywyMzBdLDczNzc6WywyMzBdLDczNzg6WywyMzBdLDczODA6WywxXSw3MzgxOlssMjIwXSw3MzgyOlssMjIwXSw3MzgzOlssMjIwXSw3Mzg0OlssMjIwXSw3Mzg1OlssMjIwXSw3Mzg2OlssMjMwXSw3Mzg3OlssMjMwXSw3Mzg4OlssMjIwXSw3Mzg5OlssMjIwXSw3MzkwOlssMjIwXSw3MzkxOlssMjIwXSw3MzkyOlssMjMwXSw3Mzk0OlssMV0sNzM5NTpbLDFdLDczOTY6WywxXSw3Mzk3OlssMV0sNzM5ODpbLDFdLDczOTk6WywxXSw3NDAwOlssMV0sNzQwNTpbLDIyMF0sNzQxMjpbLDIzMF19LFxuNzQyNDp7NzQ2ODpbWzY1XSwyNTZdLDc0Njk6W1sxOThdLDI1Nl0sNzQ3MDpbWzY2XSwyNTZdLDc0NzI6W1s2OF0sMjU2XSw3NDczOltbNjldLDI1Nl0sNzQ3NDpbWzM5OF0sMjU2XSw3NDc1OltbNzFdLDI1Nl0sNzQ3NjpbWzcyXSwyNTZdLDc0Nzc6W1s3M10sMjU2XSw3NDc4OltbNzRdLDI1Nl0sNzQ3OTpbWzc1XSwyNTZdLDc0ODA6W1s3Nl0sMjU2XSw3NDgxOltbNzddLDI1Nl0sNzQ4MjpbWzc4XSwyNTZdLDc0ODQ6W1s3OV0sMjU2XSw3NDg1OltbNTQ2XSwyNTZdLDc0ODY6W1s4MF0sMjU2XSw3NDg3OltbODJdLDI1Nl0sNzQ4ODpbWzg0XSwyNTZdLDc0ODk6W1s4NV0sMjU2XSw3NDkwOltbODddLDI1Nl0sNzQ5MTpbWzk3XSwyNTZdLDc0OTI6W1s1OTJdLDI1Nl0sNzQ5MzpbWzU5M10sMjU2XSw3NDk0OltbNzQyNl0sMjU2XSw3NDk1OltbOThdLDI1Nl0sNzQ5NjpbWzEwMF0sMjU2XSw3NDk3OltbMTAxXSwyNTZdLDc0OTg6W1s2MDFdLDI1Nl0sNzQ5OTpbWzYwM10sMjU2XSw3NTAwOltbNjA0XSwyNTZdLDc1MDE6W1sxMDNdLDI1Nl0sNzUwMzpbWzEwN10sMjU2XSw3NTA0OltbMTA5XSwyNTZdLDc1MDU6W1szMzFdLDI1Nl0sNzUwNjpbWzExMV0sMjU2XSw3NTA3OltbNTk2XSwyNTZdLDc1MDg6W1s3NDQ2XSwyNTZdLDc1MDk6W1s3NDQ3XSwyNTZdLDc1MTA6W1sxMTJdLDI1Nl0sNzUxMTpbWzExNl0sMjU2XSw3NTEyOltbMTE3XSwyNTZdLDc1MTM6W1s3NDUzXSwyNTZdLDc1MTQ6W1s2MjNdLDI1Nl0sNzUxNTpbWzExOF0sMjU2XSw3NTE2OltbNzQ2MV0sMjU2XSw3NTE3OltbOTQ2XSwyNTZdLDc1MTg6W1s5NDddLDI1Nl0sNzUxOTpbWzk0OF0sMjU2XSw3NTIwOltbOTY2XSwyNTZdLDc1MjE6W1s5NjddLDI1Nl0sNzUyMjpbWzEwNV0sMjU2XSw3NTIzOltbMTE0XSwyNTZdLDc1MjQ6W1sxMTddLDI1Nl0sNzUyNTpbWzExOF0sMjU2XSw3NTI2OltbOTQ2XSwyNTZdLDc1Mjc6W1s5NDddLDI1Nl0sNzUyODpbWzk2MV0sMjU2XSw3NTI5OltbOTY2XSwyNTZdLDc1MzA6W1s5NjddLDI1Nl0sNzU0NDpbWzEwODVdLDI1Nl0sNzU3OTpbWzU5NF0sMjU2XSw3NTgwOltbOTldLDI1Nl0sNzU4MTpbWzU5N10sMjU2XSw3NTgyOltbMjQwXSwyNTZdLDc1ODM6W1s2MDRdLDI1Nl0sNzU4NDpbWzEwMl0sMjU2XSw3NTg1OltbNjA3XSwyNTZdLDc1ODY6W1s2MDldLDI1Nl0sNzU4NzpbWzYxM10sMjU2XSw3NTg4OltbNjE2XSwyNTZdLDc1ODk6W1s2MTddLDI1Nl0sNzU5MDpbWzYxOF0sMjU2XSw3NTkxOltbNzU0N10sMjU2XSw3NTkyOltbNjY5XSwyNTZdLDc1OTM6W1s2MjFdLDI1Nl0sNzU5NDpbWzc1NTddLDI1Nl0sNzU5NTpbWzY3MV0sMjU2XSw3NTk2OltbNjI1XSwyNTZdLDc1OTc6W1s2MjRdLDI1Nl0sNzU5ODpbWzYyNl0sMjU2XSw3NTk5OltbNjI3XSwyNTZdLDc2MDA6W1s2MjhdLDI1Nl0sNzYwMTpbWzYyOV0sMjU2XSw3NjAyOltbNjMyXSwyNTZdLDc2MDM6W1s2NDJdLDI1Nl0sNzYwNDpbWzY0M10sMjU2XSw3NjA1OltbNDI3XSwyNTZdLDc2MDY6W1s2NDldLDI1Nl0sNzYwNzpbWzY1MF0sMjU2XSw3NjA4OltbNzQ1Ml0sMjU2XSw3NjA5OltbNjUxXSwyNTZdLDc2MTA6W1s2NTJdLDI1Nl0sNzYxMTpbWzEyMl0sMjU2XSw3NjEyOltbNjU2XSwyNTZdLDc2MTM6W1s2NTddLDI1Nl0sNzYxNDpbWzY1OF0sMjU2XSw3NjE1OltbOTUyXSwyNTZdLDc2MTY6WywyMzBdLDc2MTc6WywyMzBdLDc2MTg6WywyMjBdLDc2MTk6WywyMzBdLDc2MjA6WywyMzBdLDc2MjE6WywyMzBdLDc2MjI6WywyMzBdLDc2MjM6WywyMzBdLDc2MjQ6WywyMzBdLDc2MjU6WywyMzBdLDc2MjY6WywyMjBdLDc2Mjc6WywyMzBdLDc2Mjg6WywyMzBdLDc2Mjk6WywyMzRdLDc2MzA6WywyMTRdLDc2MzE6WywyMjBdLDc2MzI6WywyMDJdLDc2MzM6WywyMzBdLDc2MzQ6WywyMzBdLDc2MzU6WywyMzBdLDc2MzY6WywyMzBdLDc2Mzc6WywyMzBdLDc2Mzg6WywyMzBdLDc2Mzk6WywyMzBdLDc2NDA6WywyMzBdLDc2NDE6WywyMzBdLDc2NDI6WywyMzBdLDc2NDM6WywyMzBdLDc2NDQ6WywyMzBdLDc2NDU6WywyMzBdLDc2NDY6WywyMzBdLDc2NDc6WywyMzBdLDc2NDg6WywyMzBdLDc2NDk6WywyMzBdLDc2NTA6WywyMzBdLDc2NTE6WywyMzBdLDc2NTI6WywyMzBdLDc2NTM6WywyMzBdLDc2NTQ6WywyMzBdLDc2NzY6WywyMzNdLDc2Nzc6WywyMjBdLDc2Nzg6WywyMzBdLDc2Nzk6WywyMjBdfSxcbjc2ODA6ezc2ODA6W1s2NSw4MDVdXSw3NjgxOltbOTcsODA1XV0sNzY4MjpbWzY2LDc3NV1dLDc2ODM6W1s5OCw3NzVdXSw3Njg0OltbNjYsODAzXV0sNzY4NTpbWzk4LDgwM11dLDc2ODY6W1s2Niw4MTddXSw3Njg3OltbOTgsODE3XV0sNzY4ODpbWzE5OSw3NjldXSw3Njg5OltbMjMxLDc2OV1dLDc2OTA6W1s2OCw3NzVdXSw3NjkxOltbMTAwLDc3NV1dLDc2OTI6W1s2OCw4MDNdXSw3NjkzOltbMTAwLDgwM11dLDc2OTQ6W1s2OCw4MTddXSw3Njk1OltbMTAwLDgxN11dLDc2OTY6W1s2OCw4MDddXSw3Njk3OltbMTAwLDgwN11dLDc2OTg6W1s2OCw4MTNdXSw3Njk5OltbMTAwLDgxM11dLDc3MDA6W1syNzQsNzY4XV0sNzcwMTpbWzI3NSw3NjhdXSw3NzAyOltbMjc0LDc2OV1dLDc3MDM6W1syNzUsNzY5XV0sNzcwNDpbWzY5LDgxM11dLDc3MDU6W1sxMDEsODEzXV0sNzcwNjpbWzY5LDgxNl1dLDc3MDc6W1sxMDEsODE2XV0sNzcwODpbWzU1Miw3NzRdXSw3NzA5OltbNTUzLDc3NF1dLDc3MTA6W1s3MCw3NzVdXSw3NzExOltbMTAyLDc3NV1dLDc3MTI6W1s3MSw3NzJdXSw3NzEzOltbMTAzLDc3Ml1dLDc3MTQ6W1s3Miw3NzVdXSw3NzE1OltbMTA0LDc3NV1dLDc3MTY6W1s3Miw4MDNdXSw3NzE3OltbMTA0LDgwM11dLDc3MTg6W1s3Miw3NzZdXSw3NzE5OltbMTA0LDc3Nl1dLDc3MjA6W1s3Miw4MDddXSw3NzIxOltbMTA0LDgwN11dLDc3MjI6W1s3Miw4MTRdXSw3NzIzOltbMTA0LDgxNF1dLDc3MjQ6W1s3Myw4MTZdXSw3NzI1OltbMTA1LDgxNl1dLDc3MjY6W1syMDcsNzY5XV0sNzcyNzpbWzIzOSw3NjldXSw3NzI4OltbNzUsNzY5XV0sNzcyOTpbWzEwNyw3NjldXSw3NzMwOltbNzUsODAzXV0sNzczMTpbWzEwNyw4MDNdXSw3NzMyOltbNzUsODE3XV0sNzczMzpbWzEwNyw4MTddXSw3NzM0OltbNzYsODAzXSwsezc3Mjo3NzM2fV0sNzczNTpbWzEwOCw4MDNdLCx7NzcyOjc3Mzd9XSw3NzM2OltbNzczNCw3NzJdXSw3NzM3OltbNzczNSw3NzJdXSw3NzM4OltbNzYsODE3XV0sNzczOTpbWzEwOCw4MTddXSw3NzQwOltbNzYsODEzXV0sNzc0MTpbWzEwOCw4MTNdXSw3NzQyOltbNzcsNzY5XV0sNzc0MzpbWzEwOSw3NjldXSw3NzQ0OltbNzcsNzc1XV0sNzc0NTpbWzEwOSw3NzVdXSw3NzQ2OltbNzcsODAzXV0sNzc0NzpbWzEwOSw4MDNdXSw3NzQ4OltbNzgsNzc1XV0sNzc0OTpbWzExMCw3NzVdXSw3NzUwOltbNzgsODAzXV0sNzc1MTpbWzExMCw4MDNdXSw3NzUyOltbNzgsODE3XV0sNzc1MzpbWzExMCw4MTddXSw3NzU0OltbNzgsODEzXV0sNzc1NTpbWzExMCw4MTNdXSw3NzU2OltbMjEzLDc2OV1dLDc3NTc6W1syNDUsNzY5XV0sNzc1ODpbWzIxMyw3NzZdXSw3NzU5OltbMjQ1LDc3Nl1dLDc3NjA6W1szMzIsNzY4XV0sNzc2MTpbWzMzMyw3NjhdXSw3NzYyOltbMzMyLDc2OV1dLDc3NjM6W1szMzMsNzY5XV0sNzc2NDpbWzgwLDc2OV1dLDc3NjU6W1sxMTIsNzY5XV0sNzc2NjpbWzgwLDc3NV1dLDc3Njc6W1sxMTIsNzc1XV0sNzc2ODpbWzgyLDc3NV1dLDc3Njk6W1sxMTQsNzc1XV0sNzc3MDpbWzgyLDgwM10sLHs3NzI6Nzc3Mn1dLDc3NzE6W1sxMTQsODAzXSwsezc3Mjo3NzczfV0sNzc3MjpbWzc3NzAsNzcyXV0sNzc3MzpbWzc3NzEsNzcyXV0sNzc3NDpbWzgyLDgxN11dLDc3NzU6W1sxMTQsODE3XV0sNzc3NjpbWzgzLDc3NV1dLDc3Nzc6W1sxMTUsNzc1XV0sNzc3ODpbWzgzLDgwM10sLHs3NzU6Nzc4NH1dLDc3Nzk6W1sxMTUsODAzXSwsezc3NTo3Nzg1fV0sNzc4MDpbWzM0Niw3NzVdXSw3NzgxOltbMzQ3LDc3NV1dLDc3ODI6W1szNTIsNzc1XV0sNzc4MzpbWzM1Myw3NzVdXSw3Nzg0OltbNzc3OCw3NzVdXSw3Nzg1OltbNzc3OSw3NzVdXSw3Nzg2OltbODQsNzc1XV0sNzc4NzpbWzExNiw3NzVdXSw3Nzg4OltbODQsODAzXV0sNzc4OTpbWzExNiw4MDNdXSw3NzkwOltbODQsODE3XV0sNzc5MTpbWzExNiw4MTddXSw3NzkyOltbODQsODEzXV0sNzc5MzpbWzExNiw4MTNdXSw3Nzk0OltbODUsODA0XV0sNzc5NTpbWzExNyw4MDRdXSw3Nzk2OltbODUsODE2XV0sNzc5NzpbWzExNyw4MTZdXSw3Nzk4OltbODUsODEzXV0sNzc5OTpbWzExNyw4MTNdXSw3ODAwOltbMzYwLDc2OV1dLDc4MDE6W1szNjEsNzY5XV0sNzgwMjpbWzM2Miw3NzZdXSw3ODAzOltbMzYzLDc3Nl1dLDc4MDQ6W1s4Niw3NzFdXSw3ODA1OltbMTE4LDc3MV1dLDc4MDY6W1s4Niw4MDNdXSw3ODA3OltbMTE4LDgwM11dLDc4MDg6W1s4Nyw3NjhdXSw3ODA5OltbMTE5LDc2OF1dLDc4MTA6W1s4Nyw3NjldXSw3ODExOltbMTE5LDc2OV1dLDc4MTI6W1s4Nyw3NzZdXSw3ODEzOltbMTE5LDc3Nl1dLDc4MTQ6W1s4Nyw3NzVdXSw3ODE1OltbMTE5LDc3NV1dLDc4MTY6W1s4Nyw4MDNdXSw3ODE3OltbMTE5LDgwM11dLDc4MTg6W1s4OCw3NzVdXSw3ODE5OltbMTIwLDc3NV1dLDc4MjA6W1s4OCw3NzZdXSw3ODIxOltbMTIwLDc3Nl1dLDc4MjI6W1s4OSw3NzVdXSw3ODIzOltbMTIxLDc3NV1dLDc4MjQ6W1s5MCw3NzBdXSw3ODI1OltbMTIyLDc3MF1dLDc4MjY6W1s5MCw4MDNdXSw3ODI3OltbMTIyLDgwM11dLDc4Mjg6W1s5MCw4MTddXSw3ODI5OltbMTIyLDgxN11dLDc4MzA6W1sxMDQsODE3XV0sNzgzMTpbWzExNiw3NzZdXSw3ODMyOltbMTE5LDc3OF1dLDc4MzM6W1sxMjEsNzc4XV0sNzgzNDpbWzk3LDcwMl0sMjU2XSw3ODM1OltbMzgzLDc3NV1dLDc4NDA6W1s2NSw4MDNdLCx7NzcwOjc4NTIsNzc0Ojc4NjJ9XSw3ODQxOltbOTcsODAzXSwsezc3MDo3ODUzLDc3NDo3ODYzfV0sNzg0MjpbWzY1LDc3N11dLDc4NDM6W1s5Nyw3NzddXSw3ODQ0OltbMTk0LDc2OV1dLDc4NDU6W1syMjYsNzY5XV0sNzg0NjpbWzE5NCw3NjhdXSw3ODQ3OltbMjI2LDc2OF1dLDc4NDg6W1sxOTQsNzc3XV0sNzg0OTpbWzIyNiw3NzddXSw3ODUwOltbMTk0LDc3MV1dLDc4NTE6W1syMjYsNzcxXV0sNzg1MjpbWzc4NDAsNzcwXV0sNzg1MzpbWzc4NDEsNzcwXV0sNzg1NDpbWzI1OCw3NjldXSw3ODU1OltbMjU5LDc2OV1dLDc4NTY6W1syNTgsNzY4XV0sNzg1NzpbWzI1OSw3NjhdXSw3ODU4OltbMjU4LDc3N11dLDc4NTk6W1syNTksNzc3XV0sNzg2MDpbWzI1OCw3NzFdXSw3ODYxOltbMjU5LDc3MV1dLDc4NjI6W1s3ODQwLDc3NF1dLDc4NjM6W1s3ODQxLDc3NF1dLDc4NjQ6W1s2OSw4MDNdLCx7NzcwOjc4Nzh9XSw3ODY1OltbMTAxLDgwM10sLHs3NzA6Nzg3OX1dLDc4NjY6W1s2OSw3NzddXSw3ODY3OltbMTAxLDc3N11dLDc4Njg6W1s2OSw3NzFdXSw3ODY5OltbMTAxLDc3MV1dLDc4NzA6W1syMDIsNzY5XV0sNzg3MTpbWzIzNCw3NjldXSw3ODcyOltbMjAyLDc2OF1dLDc4NzM6W1syMzQsNzY4XV0sNzg3NDpbWzIwMiw3NzddXSw3ODc1OltbMjM0LDc3N11dLDc4NzY6W1syMDIsNzcxXV0sNzg3NzpbWzIzNCw3NzFdXSw3ODc4OltbNzg2NCw3NzBdXSw3ODc5OltbNzg2NSw3NzBdXSw3ODgwOltbNzMsNzc3XV0sNzg4MTpbWzEwNSw3NzddXSw3ODgyOltbNzMsODAzXV0sNzg4MzpbWzEwNSw4MDNdXSw3ODg0OltbNzksODAzXSwsezc3MDo3ODk2fV0sNzg4NTpbWzExMSw4MDNdLCx7NzcwOjc4OTd9XSw3ODg2OltbNzksNzc3XV0sNzg4NzpbWzExMSw3NzddXSw3ODg4OltbMjEyLDc2OV1dLDc4ODk6W1syNDQsNzY5XV0sNzg5MDpbWzIxMiw3NjhdXSw3ODkxOltbMjQ0LDc2OF1dLDc4OTI6W1syMTIsNzc3XV0sNzg5MzpbWzI0NCw3NzddXSw3ODk0OltbMjEyLDc3MV1dLDc4OTU6W1syNDQsNzcxXV0sNzg5NjpbWzc4ODQsNzcwXV0sNzg5NzpbWzc4ODUsNzcwXV0sNzg5ODpbWzQxNiw3NjldXSw3ODk5OltbNDE3LDc2OV1dLDc5MDA6W1s0MTYsNzY4XV0sNzkwMTpbWzQxNyw3NjhdXSw3OTAyOltbNDE2LDc3N11dLDc5MDM6W1s0MTcsNzc3XV0sNzkwNDpbWzQxNiw3NzFdXSw3OTA1OltbNDE3LDc3MV1dLDc5MDY6W1s0MTYsODAzXV0sNzkwNzpbWzQxNyw4MDNdXSw3OTA4OltbODUsODAzXV0sNzkwOTpbWzExNyw4MDNdXSw3OTEwOltbODUsNzc3XV0sNzkxMTpbWzExNyw3NzddXSw3OTEyOltbNDMxLDc2OV1dLDc5MTM6W1s0MzIsNzY5XV0sNzkxNDpbWzQzMSw3NjhdXSw3OTE1OltbNDMyLDc2OF1dLDc5MTY6W1s0MzEsNzc3XV0sNzkxNzpbWzQzMiw3NzddXSw3OTE4OltbNDMxLDc3MV1dLDc5MTk6W1s0MzIsNzcxXV0sNzkyMDpbWzQzMSw4MDNdXSw3OTIxOltbNDMyLDgwM11dLDc5MjI6W1s4OSw3NjhdXSw3OTIzOltbMTIxLDc2OF1dLDc5MjQ6W1s4OSw4MDNdXSw3OTI1OltbMTIxLDgwM11dLDc5MjY6W1s4OSw3NzddXSw3OTI3OltbMTIxLDc3N11dLDc5Mjg6W1s4OSw3NzFdXSw3OTI5OltbMTIxLDc3MV1dfSxcbjc5MzY6ezc5MzY6W1s5NDUsNzg3XSwsezc2ODo3OTM4LDc2OTo3OTQwLDgzNDo3OTQyLDgzNzo4MDY0fV0sNzkzNzpbWzk0NSw3ODhdLCx7NzY4Ojc5MzksNzY5Ojc5NDEsODM0Ojc5NDMsODM3OjgwNjV9XSw3OTM4OltbNzkzNiw3NjhdLCx7ODM3OjgwNjZ9XSw3OTM5OltbNzkzNyw3NjhdLCx7ODM3OjgwNjd9XSw3OTQwOltbNzkzNiw3NjldLCx7ODM3OjgwNjh9XSw3OTQxOltbNzkzNyw3NjldLCx7ODM3OjgwNjl9XSw3OTQyOltbNzkzNiw4MzRdLCx7ODM3OjgwNzB9XSw3OTQzOltbNzkzNyw4MzRdLCx7ODM3OjgwNzF9XSw3OTQ0OltbOTEzLDc4N10sLHs3Njg6Nzk0Niw3Njk6Nzk0OCw4MzQ6Nzk1MCw4Mzc6ODA3Mn1dLDc5NDU6W1s5MTMsNzg4XSwsezc2ODo3OTQ3LDc2OTo3OTQ5LDgzNDo3OTUxLDgzNzo4MDczfV0sNzk0NjpbWzc5NDQsNzY4XSwsezgzNzo4MDc0fV0sNzk0NzpbWzc5NDUsNzY4XSwsezgzNzo4MDc1fV0sNzk0ODpbWzc5NDQsNzY5XSwsezgzNzo4MDc2fV0sNzk0OTpbWzc5NDUsNzY5XSwsezgzNzo4MDc3fV0sNzk1MDpbWzc5NDQsODM0XSwsezgzNzo4MDc4fV0sNzk1MTpbWzc5NDUsODM0XSwsezgzNzo4MDc5fV0sNzk1MjpbWzk0OSw3ODddLCx7NzY4Ojc5NTQsNzY5Ojc5NTZ9XSw3OTUzOltbOTQ5LDc4OF0sLHs3Njg6Nzk1NSw3Njk6Nzk1N31dLDc5NTQ6W1s3OTUyLDc2OF1dLDc5NTU6W1s3OTUzLDc2OF1dLDc5NTY6W1s3OTUyLDc2OV1dLDc5NTc6W1s3OTUzLDc2OV1dLDc5NjA6W1s5MTcsNzg3XSwsezc2ODo3OTYyLDc2OTo3OTY0fV0sNzk2MTpbWzkxNyw3ODhdLCx7NzY4Ojc5NjMsNzY5Ojc5NjV9XSw3OTYyOltbNzk2MCw3NjhdXSw3OTYzOltbNzk2MSw3NjhdXSw3OTY0OltbNzk2MCw3NjldXSw3OTY1OltbNzk2MSw3NjldXSw3OTY4OltbOTUxLDc4N10sLHs3Njg6Nzk3MCw3Njk6Nzk3Miw4MzQ6Nzk3NCw4Mzc6ODA4MH1dLDc5Njk6W1s5NTEsNzg4XSwsezc2ODo3OTcxLDc2OTo3OTczLDgzNDo3OTc1LDgzNzo4MDgxfV0sNzk3MDpbWzc5NjgsNzY4XSwsezgzNzo4MDgyfV0sNzk3MTpbWzc5NjksNzY4XSwsezgzNzo4MDgzfV0sNzk3MjpbWzc5NjgsNzY5XSwsezgzNzo4MDg0fV0sNzk3MzpbWzc5NjksNzY5XSwsezgzNzo4MDg1fV0sNzk3NDpbWzc5NjgsODM0XSwsezgzNzo4MDg2fV0sNzk3NTpbWzc5NjksODM0XSwsezgzNzo4MDg3fV0sNzk3NjpbWzkxOSw3ODddLCx7NzY4Ojc5NzgsNzY5Ojc5ODAsODM0Ojc5ODIsODM3OjgwODh9XSw3OTc3OltbOTE5LDc4OF0sLHs3Njg6Nzk3OSw3Njk6Nzk4MSw4MzQ6Nzk4Myw4Mzc6ODA4OX1dLDc5Nzg6W1s3OTc2LDc2OF0sLHs4Mzc6ODA5MH1dLDc5Nzk6W1s3OTc3LDc2OF0sLHs4Mzc6ODA5MX1dLDc5ODA6W1s3OTc2LDc2OV0sLHs4Mzc6ODA5Mn1dLDc5ODE6W1s3OTc3LDc2OV0sLHs4Mzc6ODA5M31dLDc5ODI6W1s3OTc2LDgzNF0sLHs4Mzc6ODA5NH1dLDc5ODM6W1s3OTc3LDgzNF0sLHs4Mzc6ODA5NX1dLDc5ODQ6W1s5NTMsNzg3XSwsezc2ODo3OTg2LDc2OTo3OTg4LDgzNDo3OTkwfV0sNzk4NTpbWzk1Myw3ODhdLCx7NzY4Ojc5ODcsNzY5Ojc5ODksODM0Ojc5OTF9XSw3OTg2OltbNzk4NCw3NjhdXSw3OTg3OltbNzk4NSw3NjhdXSw3OTg4OltbNzk4NCw3NjldXSw3OTg5OltbNzk4NSw3NjldXSw3OTkwOltbNzk4NCw4MzRdXSw3OTkxOltbNzk4NSw4MzRdXSw3OTkyOltbOTIxLDc4N10sLHs3Njg6Nzk5NCw3Njk6Nzk5Niw4MzQ6Nzk5OH1dLDc5OTM6W1s5MjEsNzg4XSwsezc2ODo3OTk1LDc2OTo3OTk3LDgzNDo3OTk5fV0sNzk5NDpbWzc5OTIsNzY4XV0sNzk5NTpbWzc5OTMsNzY4XV0sNzk5NjpbWzc5OTIsNzY5XV0sNzk5NzpbWzc5OTMsNzY5XV0sNzk5ODpbWzc5OTIsODM0XV0sNzk5OTpbWzc5OTMsODM0XV0sODAwMDpbWzk1OSw3ODddLCx7NzY4OjgwMDIsNzY5OjgwMDR9XSw4MDAxOltbOTU5LDc4OF0sLHs3Njg6ODAwMyw3Njk6ODAwNX1dLDgwMDI6W1s4MDAwLDc2OF1dLDgwMDM6W1s4MDAxLDc2OF1dLDgwMDQ6W1s4MDAwLDc2OV1dLDgwMDU6W1s4MDAxLDc2OV1dLDgwMDg6W1s5MjcsNzg3XSwsezc2ODo4MDEwLDc2OTo4MDEyfV0sODAwOTpbWzkyNyw3ODhdLCx7NzY4OjgwMTEsNzY5OjgwMTN9XSw4MDEwOltbODAwOCw3NjhdXSw4MDExOltbODAwOSw3NjhdXSw4MDEyOltbODAwOCw3NjldXSw4MDEzOltbODAwOSw3NjldXSw4MDE2OltbOTY1LDc4N10sLHs3Njg6ODAxOCw3Njk6ODAyMCw4MzQ6ODAyMn1dLDgwMTc6W1s5NjUsNzg4XSwsezc2ODo4MDE5LDc2OTo4MDIxLDgzNDo4MDIzfV0sODAxODpbWzgwMTYsNzY4XV0sODAxOTpbWzgwMTcsNzY4XV0sODAyMDpbWzgwMTYsNzY5XV0sODAyMTpbWzgwMTcsNzY5XV0sODAyMjpbWzgwMTYsODM0XV0sODAyMzpbWzgwMTcsODM0XV0sODAyNTpbWzkzMyw3ODhdLCx7NzY4OjgwMjcsNzY5OjgwMjksODM0OjgwMzF9XSw4MDI3OltbODAyNSw3NjhdXSw4MDI5OltbODAyNSw3NjldXSw4MDMxOltbODAyNSw4MzRdXSw4MDMyOltbOTY5LDc4N10sLHs3Njg6ODAzNCw3Njk6ODAzNiw4MzQ6ODAzOCw4Mzc6ODA5Nn1dLDgwMzM6W1s5NjksNzg4XSwsezc2ODo4MDM1LDc2OTo4MDM3LDgzNDo4MDM5LDgzNzo4MDk3fV0sODAzNDpbWzgwMzIsNzY4XSwsezgzNzo4MDk4fV0sODAzNTpbWzgwMzMsNzY4XSwsezgzNzo4MDk5fV0sODAzNjpbWzgwMzIsNzY5XSwsezgzNzo4MTAwfV0sODAzNzpbWzgwMzMsNzY5XSwsezgzNzo4MTAxfV0sODAzODpbWzgwMzIsODM0XSwsezgzNzo4MTAyfV0sODAzOTpbWzgwMzMsODM0XSwsezgzNzo4MTAzfV0sODA0MDpbWzkzNyw3ODddLCx7NzY4OjgwNDIsNzY5OjgwNDQsODM0OjgwNDYsODM3OjgxMDR9XSw4MDQxOltbOTM3LDc4OF0sLHs3Njg6ODA0Myw3Njk6ODA0NSw4MzQ6ODA0Nyw4Mzc6ODEwNX1dLDgwNDI6W1s4MDQwLDc2OF0sLHs4Mzc6ODEwNn1dLDgwNDM6W1s4MDQxLDc2OF0sLHs4Mzc6ODEwN31dLDgwNDQ6W1s4MDQwLDc2OV0sLHs4Mzc6ODEwOH1dLDgwNDU6W1s4MDQxLDc2OV0sLHs4Mzc6ODEwOX1dLDgwNDY6W1s4MDQwLDgzNF0sLHs4Mzc6ODExMH1dLDgwNDc6W1s4MDQxLDgzNF0sLHs4Mzc6ODExMX1dLDgwNDg6W1s5NDUsNzY4XSwsezgzNzo4MTE0fV0sODA0OTpbWzk0MF1dLDgwNTA6W1s5NDksNzY4XV0sODA1MTpbWzk0MV1dLDgwNTI6W1s5NTEsNzY4XSwsezgzNzo4MTMwfV0sODA1MzpbWzk0Ml1dLDgwNTQ6W1s5NTMsNzY4XV0sODA1NTpbWzk0M11dLDgwNTY6W1s5NTksNzY4XV0sODA1NzpbWzk3Ml1dLDgwNTg6W1s5NjUsNzY4XV0sODA1OTpbWzk3M11dLDgwNjA6W1s5NjksNzY4XSwsezgzNzo4MTc4fV0sODA2MTpbWzk3NF1dLDgwNjQ6W1s3OTM2LDgzN11dLDgwNjU6W1s3OTM3LDgzN11dLDgwNjY6W1s3OTM4LDgzN11dLDgwNjc6W1s3OTM5LDgzN11dLDgwNjg6W1s3OTQwLDgzN11dLDgwNjk6W1s3OTQxLDgzN11dLDgwNzA6W1s3OTQyLDgzN11dLDgwNzE6W1s3OTQzLDgzN11dLDgwNzI6W1s3OTQ0LDgzN11dLDgwNzM6W1s3OTQ1LDgzN11dLDgwNzQ6W1s3OTQ2LDgzN11dLDgwNzU6W1s3OTQ3LDgzN11dLDgwNzY6W1s3OTQ4LDgzN11dLDgwNzc6W1s3OTQ5LDgzN11dLDgwNzg6W1s3OTUwLDgzN11dLDgwNzk6W1s3OTUxLDgzN11dLDgwODA6W1s3OTY4LDgzN11dLDgwODE6W1s3OTY5LDgzN11dLDgwODI6W1s3OTcwLDgzN11dLDgwODM6W1s3OTcxLDgzN11dLDgwODQ6W1s3OTcyLDgzN11dLDgwODU6W1s3OTczLDgzN11dLDgwODY6W1s3OTc0LDgzN11dLDgwODc6W1s3OTc1LDgzN11dLDgwODg6W1s3OTc2LDgzN11dLDgwODk6W1s3OTc3LDgzN11dLDgwOTA6W1s3OTc4LDgzN11dLDgwOTE6W1s3OTc5LDgzN11dLDgwOTI6W1s3OTgwLDgzN11dLDgwOTM6W1s3OTgxLDgzN11dLDgwOTQ6W1s3OTgyLDgzN11dLDgwOTU6W1s3OTgzLDgzN11dLDgwOTY6W1s4MDMyLDgzN11dLDgwOTc6W1s4MDMzLDgzN11dLDgwOTg6W1s4MDM0LDgzN11dLDgwOTk6W1s4MDM1LDgzN11dLDgxMDA6W1s4MDM2LDgzN11dLDgxMDE6W1s4MDM3LDgzN11dLDgxMDI6W1s4MDM4LDgzN11dLDgxMDM6W1s4MDM5LDgzN11dLDgxMDQ6W1s4MDQwLDgzN11dLDgxMDU6W1s4MDQxLDgzN11dLDgxMDY6W1s4MDQyLDgzN11dLDgxMDc6W1s4MDQzLDgzN11dLDgxMDg6W1s4MDQ0LDgzN11dLDgxMDk6W1s4MDQ1LDgzN11dLDgxMTA6W1s4MDQ2LDgzN11dLDgxMTE6W1s4MDQ3LDgzN11dLDgxMTI6W1s5NDUsNzc0XV0sODExMzpbWzk0NSw3NzJdXSw4MTE0OltbODA0OCw4MzddXSw4MTE1OltbOTQ1LDgzN11dLDgxMTY6W1s5NDAsODM3XV0sODExODpbWzk0NSw4MzRdLCx7ODM3OjgxMTl9XSw4MTE5OltbODExOCw4MzddXSw4MTIwOltbOTEzLDc3NF1dLDgxMjE6W1s5MTMsNzcyXV0sODEyMjpbWzkxMyw3NjhdXSw4MTIzOltbOTAyXV0sODEyNDpbWzkxMyw4MzddXSw4MTI1OltbMzIsNzg3XSwyNTZdLDgxMjY6W1s5NTNdXSw4MTI3OltbMzIsNzg3XSwyNTYsezc2ODo4MTQxLDc2OTo4MTQyLDgzNDo4MTQzfV0sODEyODpbWzMyLDgzNF0sMjU2XSw4MTI5OltbMTY4LDgzNF1dLDgxMzA6W1s4MDUyLDgzN11dLDgxMzE6W1s5NTEsODM3XV0sODEzMjpbWzk0Miw4MzddXSw4MTM0OltbOTUxLDgzNF0sLHs4Mzc6ODEzNX1dLDgxMzU6W1s4MTM0LDgzN11dLDgxMzY6W1s5MTcsNzY4XV0sODEzNzpbWzkwNF1dLDgxMzg6W1s5MTksNzY4XV0sODEzOTpbWzkwNV1dLDgxNDA6W1s5MTksODM3XV0sODE0MTpbWzgxMjcsNzY4XV0sODE0MjpbWzgxMjcsNzY5XV0sODE0MzpbWzgxMjcsODM0XV0sODE0NDpbWzk1Myw3NzRdXSw4MTQ1OltbOTUzLDc3Ml1dLDgxNDY6W1s5NzAsNzY4XV0sODE0NzpbWzkxMl1dLDgxNTA6W1s5NTMsODM0XV0sODE1MTpbWzk3MCw4MzRdXSw4MTUyOltbOTIxLDc3NF1dLDgxNTM6W1s5MjEsNzcyXV0sODE1NDpbWzkyMSw3NjhdXSw4MTU1OltbOTA2XV0sODE1NzpbWzgxOTAsNzY4XV0sODE1ODpbWzgxOTAsNzY5XV0sODE1OTpbWzgxOTAsODM0XV0sODE2MDpbWzk2NSw3NzRdXSw4MTYxOltbOTY1LDc3Ml1dLDgxNjI6W1s5NzEsNzY4XV0sODE2MzpbWzk0NF1dLDgxNjQ6W1s5NjEsNzg3XV0sODE2NTpbWzk2MSw3ODhdXSw4MTY2OltbOTY1LDgzNF1dLDgxNjc6W1s5NzEsODM0XV0sODE2ODpbWzkzMyw3NzRdXSw4MTY5OltbOTMzLDc3Ml1dLDgxNzA6W1s5MzMsNzY4XV0sODE3MTpbWzkxMF1dLDgxNzI6W1s5MjksNzg4XV0sODE3MzpbWzE2OCw3NjhdXSw4MTc0OltbOTAxXV0sODE3NTpbWzk2XV0sODE3ODpbWzgwNjAsODM3XV0sODE3OTpbWzk2OSw4MzddXSw4MTgwOltbOTc0LDgzN11dLDgxODI6W1s5NjksODM0XSwsezgzNzo4MTgzfV0sODE4MzpbWzgxODIsODM3XV0sODE4NDpbWzkyNyw3NjhdXSw4MTg1OltbOTA4XV0sODE4NjpbWzkzNyw3NjhdXSw4MTg3OltbOTExXV0sODE4ODpbWzkzNyw4MzddXSw4MTg5OltbMTgwXV0sODE5MDpbWzMyLDc4OF0sMjU2LHs3Njg6ODE1Nyw3Njk6ODE1OCw4MzQ6ODE1OX1dfSxcbjgxOTI6ezgxOTI6W1s4MTk0XV0sODE5MzpbWzgxOTVdXSw4MTk0OltbMzJdLDI1Nl0sODE5NTpbWzMyXSwyNTZdLDgxOTY6W1szMl0sMjU2XSw4MTk3OltbMzJdLDI1Nl0sODE5ODpbWzMyXSwyNTZdLDgxOTk6W1szMl0sMjU2XSw4MjAwOltbMzJdLDI1Nl0sODIwMTpbWzMyXSwyNTZdLDgyMDI6W1szMl0sMjU2XSw4MjA5OltbODIwOF0sMjU2XSw4MjE1OltbMzIsODE5XSwyNTZdLDgyMjg6W1s0Nl0sMjU2XSw4MjI5OltbNDYsNDZdLDI1Nl0sODIzMDpbWzQ2LDQ2LDQ2XSwyNTZdLDgyMzk6W1szMl0sMjU2XSw4MjQzOltbODI0Miw4MjQyXSwyNTZdLDgyNDQ6W1s4MjQyLDgyNDIsODI0Ml0sMjU2XSw4MjQ2OltbODI0NSw4MjQ1XSwyNTZdLDgyNDc6W1s4MjQ1LDgyNDUsODI0NV0sMjU2XSw4MjUyOltbMzMsMzNdLDI1Nl0sODI1NDpbWzMyLDc3M10sMjU2XSw4MjYzOltbNjMsNjNdLDI1Nl0sODI2NDpbWzYzLDMzXSwyNTZdLDgyNjU6W1szMyw2M10sMjU2XSw4Mjc5OltbODI0Miw4MjQyLDgyNDIsODI0Ml0sMjU2XSw4Mjg3OltbMzJdLDI1Nl0sODMwNDpbWzQ4XSwyNTZdLDgzMDU6W1sxMDVdLDI1Nl0sODMwODpbWzUyXSwyNTZdLDgzMDk6W1s1M10sMjU2XSw4MzEwOltbNTRdLDI1Nl0sODMxMTpbWzU1XSwyNTZdLDgzMTI6W1s1Nl0sMjU2XSw4MzEzOltbNTddLDI1Nl0sODMxNDpbWzQzXSwyNTZdLDgzMTU6W1s4NzIyXSwyNTZdLDgzMTY6W1s2MV0sMjU2XSw4MzE3OltbNDBdLDI1Nl0sODMxODpbWzQxXSwyNTZdLDgzMTk6W1sxMTBdLDI1Nl0sODMyMDpbWzQ4XSwyNTZdLDgzMjE6W1s0OV0sMjU2XSw4MzIyOltbNTBdLDI1Nl0sODMyMzpbWzUxXSwyNTZdLDgzMjQ6W1s1Ml0sMjU2XSw4MzI1OltbNTNdLDI1Nl0sODMyNjpbWzU0XSwyNTZdLDgzMjc6W1s1NV0sMjU2XSw4MzI4OltbNTZdLDI1Nl0sODMyOTpbWzU3XSwyNTZdLDgzMzA6W1s0M10sMjU2XSw4MzMxOltbODcyMl0sMjU2XSw4MzMyOltbNjFdLDI1Nl0sODMzMzpbWzQwXSwyNTZdLDgzMzQ6W1s0MV0sMjU2XSw4MzM2OltbOTddLDI1Nl0sODMzNzpbWzEwMV0sMjU2XSw4MzM4OltbMTExXSwyNTZdLDgzMzk6W1sxMjBdLDI1Nl0sODM0MDpbWzYwMV0sMjU2XSw4MzQxOltbMTA0XSwyNTZdLDgzNDI6W1sxMDddLDI1Nl0sODM0MzpbWzEwOF0sMjU2XSw4MzQ0OltbMTA5XSwyNTZdLDgzNDU6W1sxMTBdLDI1Nl0sODM0NjpbWzExMl0sMjU2XSw4MzQ3OltbMTE1XSwyNTZdLDgzNDg6W1sxMTZdLDI1Nl0sODM2MDpbWzgyLDExNV0sMjU2XSw4NDAwOlssMjMwXSw4NDAxOlssMjMwXSw4NDAyOlssMV0sODQwMzpbLDFdLDg0MDQ6WywyMzBdLDg0MDU6WywyMzBdLDg0MDY6WywyMzBdLDg0MDc6WywyMzBdLDg0MDg6WywxXSw4NDA5OlssMV0sODQxMDpbLDFdLDg0MTE6WywyMzBdLDg0MTI6WywyMzBdLDg0MTc6WywyMzBdLDg0MjE6WywxXSw4NDIyOlssMV0sODQyMzpbLDIzMF0sODQyNDpbLDIyMF0sODQyNTpbLDIzMF0sODQyNjpbLDFdLDg0Mjc6WywxXSw4NDI4OlssMjIwXSw4NDI5OlssMjIwXSw4NDMwOlssMjIwXSw4NDMxOlssMjIwXSw4NDMyOlssMjMwXX0sXG44NDQ4Ons4NDQ4OltbOTcsNDcsOTldLDI1Nl0sODQ0OTpbWzk3LDQ3LDExNV0sMjU2XSw4NDUwOltbNjddLDI1Nl0sODQ1MTpbWzE3Niw2N10sMjU2XSw4NDUzOltbOTksNDcsMTExXSwyNTZdLDg0NTQ6W1s5OSw0NywxMTddLDI1Nl0sODQ1NTpbWzQwMF0sMjU2XSw4NDU3OltbMTc2LDcwXSwyNTZdLDg0NTg6W1sxMDNdLDI1Nl0sODQ1OTpbWzcyXSwyNTZdLDg0NjA6W1s3Ml0sMjU2XSw4NDYxOltbNzJdLDI1Nl0sODQ2MjpbWzEwNF0sMjU2XSw4NDYzOltbMjk1XSwyNTZdLDg0NjQ6W1s3M10sMjU2XSw4NDY1OltbNzNdLDI1Nl0sODQ2NjpbWzc2XSwyNTZdLDg0Njc6W1sxMDhdLDI1Nl0sODQ2OTpbWzc4XSwyNTZdLDg0NzA6W1s3OCwxMTFdLDI1Nl0sODQ3MzpbWzgwXSwyNTZdLDg0NzQ6W1s4MV0sMjU2XSw4NDc1OltbODJdLDI1Nl0sODQ3NjpbWzgyXSwyNTZdLDg0Nzc6W1s4Ml0sMjU2XSw4NDgwOltbODMsNzddLDI1Nl0sODQ4MTpbWzg0LDY5LDc2XSwyNTZdLDg0ODI6W1s4NCw3N10sMjU2XSw4NDg0OltbOTBdLDI1Nl0sODQ4NjpbWzkzN11dLDg0ODg6W1s5MF0sMjU2XSw4NDkwOltbNzVdXSw4NDkxOltbMTk3XV0sODQ5MjpbWzY2XSwyNTZdLDg0OTM6W1s2N10sMjU2XSw4NDk1OltbMTAxXSwyNTZdLDg0OTY6W1s2OV0sMjU2XSw4NDk3OltbNzBdLDI1Nl0sODQ5OTpbWzc3XSwyNTZdLDg1MDA6W1sxMTFdLDI1Nl0sODUwMTpbWzE0ODhdLDI1Nl0sODUwMjpbWzE0ODldLDI1Nl0sODUwMzpbWzE0OTBdLDI1Nl0sODUwNDpbWzE0OTFdLDI1Nl0sODUwNTpbWzEwNV0sMjU2XSw4NTA3OltbNzAsNjUsODhdLDI1Nl0sODUwODpbWzk2MF0sMjU2XSw4NTA5OltbOTQ3XSwyNTZdLDg1MTA6W1s5MTVdLDI1Nl0sODUxMTpbWzkyOF0sMjU2XSw4NTEyOltbODcyMV0sMjU2XSw4NTE3OltbNjhdLDI1Nl0sODUxODpbWzEwMF0sMjU2XSw4NTE5OltbMTAxXSwyNTZdLDg1MjA6W1sxMDVdLDI1Nl0sODUyMTpbWzEwNl0sMjU2XSw4NTI4OltbNDksODI2MCw1NV0sMjU2XSw4NTI5OltbNDksODI2MCw1N10sMjU2XSw4NTMwOltbNDksODI2MCw0OSw0OF0sMjU2XSw4NTMxOltbNDksODI2MCw1MV0sMjU2XSw4NTMyOltbNTAsODI2MCw1MV0sMjU2XSw4NTMzOltbNDksODI2MCw1M10sMjU2XSw4NTM0OltbNTAsODI2MCw1M10sMjU2XSw4NTM1OltbNTEsODI2MCw1M10sMjU2XSw4NTM2OltbNTIsODI2MCw1M10sMjU2XSw4NTM3OltbNDksODI2MCw1NF0sMjU2XSw4NTM4OltbNTMsODI2MCw1NF0sMjU2XSw4NTM5OltbNDksODI2MCw1Nl0sMjU2XSw4NTQwOltbNTEsODI2MCw1Nl0sMjU2XSw4NTQxOltbNTMsODI2MCw1Nl0sMjU2XSw4NTQyOltbNTUsODI2MCw1Nl0sMjU2XSw4NTQzOltbNDksODI2MF0sMjU2XSw4NTQ0OltbNzNdLDI1Nl0sODU0NTpbWzczLDczXSwyNTZdLDg1NDY6W1s3Myw3Myw3M10sMjU2XSw4NTQ3OltbNzMsODZdLDI1Nl0sODU0ODpbWzg2XSwyNTZdLDg1NDk6W1s4Niw3M10sMjU2XSw4NTUwOltbODYsNzMsNzNdLDI1Nl0sODU1MTpbWzg2LDczLDczLDczXSwyNTZdLDg1NTI6W1s3Myw4OF0sMjU2XSw4NTUzOltbODhdLDI1Nl0sODU1NDpbWzg4LDczXSwyNTZdLDg1NTU6W1s4OCw3Myw3M10sMjU2XSw4NTU2OltbNzZdLDI1Nl0sODU1NzpbWzY3XSwyNTZdLDg1NTg6W1s2OF0sMjU2XSw4NTU5OltbNzddLDI1Nl0sODU2MDpbWzEwNV0sMjU2XSw4NTYxOltbMTA1LDEwNV0sMjU2XSw4NTYyOltbMTA1LDEwNSwxMDVdLDI1Nl0sODU2MzpbWzEwNSwxMThdLDI1Nl0sODU2NDpbWzExOF0sMjU2XSw4NTY1OltbMTE4LDEwNV0sMjU2XSw4NTY2OltbMTE4LDEwNSwxMDVdLDI1Nl0sODU2NzpbWzExOCwxMDUsMTA1LDEwNV0sMjU2XSw4NTY4OltbMTA1LDEyMF0sMjU2XSw4NTY5OltbMTIwXSwyNTZdLDg1NzA6W1sxMjAsMTA1XSwyNTZdLDg1NzE6W1sxMjAsMTA1LDEwNV0sMjU2XSw4NTcyOltbMTA4XSwyNTZdLDg1NzM6W1s5OV0sMjU2XSw4NTc0OltbMTAwXSwyNTZdLDg1NzU6W1sxMDldLDI1Nl0sODU4NTpbWzQ4LDgyNjAsNTFdLDI1Nl0sODU5MjpbLCx7ODI0Ojg2MDJ9XSw4NTk0OlssLHs4MjQ6ODYwM31dLDg1OTY6WywsezgyNDo4NjIyfV0sODYwMjpbWzg1OTIsODI0XV0sODYwMzpbWzg1OTQsODI0XV0sODYyMjpbWzg1OTYsODI0XV0sODY1MzpbWzg2NTYsODI0XV0sODY1NDpbWzg2NjAsODI0XV0sODY1NTpbWzg2NTgsODI0XV0sODY1NjpbLCx7ODI0Ojg2NTN9XSw4NjU4OlssLHs4MjQ6ODY1NX1dLDg2NjA6WywsezgyNDo4NjU0fV19LFxuODcwNDp7ODcwNzpbLCx7ODI0Ojg3MDh9XSw4NzA4OltbODcwNyw4MjRdXSw4NzEyOlssLHs4MjQ6ODcxM31dLDg3MTM6W1s4NzEyLDgyNF1dLDg3MTU6WywsezgyNDo4NzE2fV0sODcxNjpbWzg3MTUsODI0XV0sODczOTpbLCx7ODI0Ojg3NDB9XSw4NzQwOltbODczOSw4MjRdXSw4NzQxOlssLHs4MjQ6ODc0Mn1dLDg3NDI6W1s4NzQxLDgyNF1dLDg3NDg6W1s4NzQ3LDg3NDddLDI1Nl0sODc0OTpbWzg3NDcsODc0Nyw4NzQ3XSwyNTZdLDg3NTE6W1s4NzUwLDg3NTBdLDI1Nl0sODc1MjpbWzg3NTAsODc1MCw4NzUwXSwyNTZdLDg3NjQ6WywsezgyNDo4NzY5fV0sODc2OTpbWzg3NjQsODI0XV0sODc3MTpbLCx7ODI0Ojg3NzJ9XSw4NzcyOltbODc3MSw4MjRdXSw4NzczOlssLHs4MjQ6ODc3NX1dLDg3NzU6W1s4NzczLDgyNF1dLDg3NzY6WywsezgyNDo4Nzc3fV0sODc3NzpbWzg3NzYsODI0XV0sODc4MTpbLCx7ODI0Ojg4MTN9XSw4ODAwOltbNjEsODI0XV0sODgwMTpbLCx7ODI0Ojg4MDJ9XSw4ODAyOltbODgwMSw4MjRdXSw4ODA0OlssLHs4MjQ6ODgxNn1dLDg4MDU6WywsezgyNDo4ODE3fV0sODgxMzpbWzg3ODEsODI0XV0sODgxNDpbWzYwLDgyNF1dLDg4MTU6W1s2Miw4MjRdXSw4ODE2OltbODgwNCw4MjRdXSw4ODE3OltbODgwNSw4MjRdXSw4ODE4OlssLHs4MjQ6ODgyMH1dLDg4MTk6WywsezgyNDo4ODIxfV0sODgyMDpbWzg4MTgsODI0XV0sODgyMTpbWzg4MTksODI0XV0sODgyMjpbLCx7ODI0Ojg4MjR9XSw4ODIzOlssLHs4MjQ6ODgyNX1dLDg4MjQ6W1s4ODIyLDgyNF1dLDg4MjU6W1s4ODIzLDgyNF1dLDg4MjY6WywsezgyNDo4ODMyfV0sODgyNzpbLCx7ODI0Ojg4MzN9XSw4ODI4OlssLHs4MjQ6ODkyOH1dLDg4Mjk6WywsezgyNDo4OTI5fV0sODgzMjpbWzg4MjYsODI0XV0sODgzMzpbWzg4MjcsODI0XV0sODgzNDpbLCx7ODI0Ojg4MzZ9XSw4ODM1OlssLHs4MjQ6ODgzN31dLDg4MzY6W1s4ODM0LDgyNF1dLDg4Mzc6W1s4ODM1LDgyNF1dLDg4Mzg6WywsezgyNDo4ODQwfV0sODgzOTpbLCx7ODI0Ojg4NDF9XSw4ODQwOltbODgzOCw4MjRdXSw4ODQxOltbODgzOSw4MjRdXSw4ODQ5OlssLHs4MjQ6ODkzMH1dLDg4NTA6WywsezgyNDo4OTMxfV0sODg2NjpbLCx7ODI0Ojg4NzZ9XSw4ODcyOlssLHs4MjQ6ODg3N31dLDg4NzM6WywsezgyNDo4ODc4fV0sODg3NTpbLCx7ODI0Ojg4Nzl9XSw4ODc2OltbODg2Niw4MjRdXSw4ODc3OltbODg3Miw4MjRdXSw4ODc4OltbODg3Myw4MjRdXSw4ODc5OltbODg3NSw4MjRdXSw4ODgyOlssLHs4MjQ6ODkzOH1dLDg4ODM6WywsezgyNDo4OTM5fV0sODg4NDpbLCx7ODI0Ojg5NDB9XSw4ODg1OlssLHs4MjQ6ODk0MX1dLDg5Mjg6W1s4ODI4LDgyNF1dLDg5Mjk6W1s4ODI5LDgyNF1dLDg5MzA6W1s4ODQ5LDgyNF1dLDg5MzE6W1s4ODUwLDgyNF1dLDg5Mzg6W1s4ODgyLDgyNF1dLDg5Mzk6W1s4ODgzLDgyNF1dLDg5NDA6W1s4ODg0LDgyNF1dLDg5NDE6W1s4ODg1LDgyNF1dfSxcbjg5NjA6ezkwMDE6W1sxMjI5Nl1dLDkwMDI6W1sxMjI5N11dfSxcbjkyMTY6ezkzMTI6W1s0OV0sMjU2XSw5MzEzOltbNTBdLDI1Nl0sOTMxNDpbWzUxXSwyNTZdLDkzMTU6W1s1Ml0sMjU2XSw5MzE2OltbNTNdLDI1Nl0sOTMxNzpbWzU0XSwyNTZdLDkzMTg6W1s1NV0sMjU2XSw5MzE5OltbNTZdLDI1Nl0sOTMyMDpbWzU3XSwyNTZdLDkzMjE6W1s0OSw0OF0sMjU2XSw5MzIyOltbNDksNDldLDI1Nl0sOTMyMzpbWzQ5LDUwXSwyNTZdLDkzMjQ6W1s0OSw1MV0sMjU2XSw5MzI1OltbNDksNTJdLDI1Nl0sOTMyNjpbWzQ5LDUzXSwyNTZdLDkzMjc6W1s0OSw1NF0sMjU2XSw5MzI4OltbNDksNTVdLDI1Nl0sOTMyOTpbWzQ5LDU2XSwyNTZdLDkzMzA6W1s0OSw1N10sMjU2XSw5MzMxOltbNTAsNDhdLDI1Nl0sOTMzMjpbWzQwLDQ5LDQxXSwyNTZdLDkzMzM6W1s0MCw1MCw0MV0sMjU2XSw5MzM0OltbNDAsNTEsNDFdLDI1Nl0sOTMzNTpbWzQwLDUyLDQxXSwyNTZdLDkzMzY6W1s0MCw1Myw0MV0sMjU2XSw5MzM3OltbNDAsNTQsNDFdLDI1Nl0sOTMzODpbWzQwLDU1LDQxXSwyNTZdLDkzMzk6W1s0MCw1Niw0MV0sMjU2XSw5MzQwOltbNDAsNTcsNDFdLDI1Nl0sOTM0MTpbWzQwLDQ5LDQ4LDQxXSwyNTZdLDkzNDI6W1s0MCw0OSw0OSw0MV0sMjU2XSw5MzQzOltbNDAsNDksNTAsNDFdLDI1Nl0sOTM0NDpbWzQwLDQ5LDUxLDQxXSwyNTZdLDkzNDU6W1s0MCw0OSw1Miw0MV0sMjU2XSw5MzQ2OltbNDAsNDksNTMsNDFdLDI1Nl0sOTM0NzpbWzQwLDQ5LDU0LDQxXSwyNTZdLDkzNDg6W1s0MCw0OSw1NSw0MV0sMjU2XSw5MzQ5OltbNDAsNDksNTYsNDFdLDI1Nl0sOTM1MDpbWzQwLDQ5LDU3LDQxXSwyNTZdLDkzNTE6W1s0MCw1MCw0OCw0MV0sMjU2XSw5MzUyOltbNDksNDZdLDI1Nl0sOTM1MzpbWzUwLDQ2XSwyNTZdLDkzNTQ6W1s1MSw0Nl0sMjU2XSw5MzU1OltbNTIsNDZdLDI1Nl0sOTM1NjpbWzUzLDQ2XSwyNTZdLDkzNTc6W1s1NCw0Nl0sMjU2XSw5MzU4OltbNTUsNDZdLDI1Nl0sOTM1OTpbWzU2LDQ2XSwyNTZdLDkzNjA6W1s1Nyw0Nl0sMjU2XSw5MzYxOltbNDksNDgsNDZdLDI1Nl0sOTM2MjpbWzQ5LDQ5LDQ2XSwyNTZdLDkzNjM6W1s0OSw1MCw0Nl0sMjU2XSw5MzY0OltbNDksNTEsNDZdLDI1Nl0sOTM2NTpbWzQ5LDUyLDQ2XSwyNTZdLDkzNjY6W1s0OSw1Myw0Nl0sMjU2XSw5MzY3OltbNDksNTQsNDZdLDI1Nl0sOTM2ODpbWzQ5LDU1LDQ2XSwyNTZdLDkzNjk6W1s0OSw1Niw0Nl0sMjU2XSw5MzcwOltbNDksNTcsNDZdLDI1Nl0sOTM3MTpbWzUwLDQ4LDQ2XSwyNTZdLDkzNzI6W1s0MCw5Nyw0MV0sMjU2XSw5MzczOltbNDAsOTgsNDFdLDI1Nl0sOTM3NDpbWzQwLDk5LDQxXSwyNTZdLDkzNzU6W1s0MCwxMDAsNDFdLDI1Nl0sOTM3NjpbWzQwLDEwMSw0MV0sMjU2XSw5Mzc3OltbNDAsMTAyLDQxXSwyNTZdLDkzNzg6W1s0MCwxMDMsNDFdLDI1Nl0sOTM3OTpbWzQwLDEwNCw0MV0sMjU2XSw5MzgwOltbNDAsMTA1LDQxXSwyNTZdLDkzODE6W1s0MCwxMDYsNDFdLDI1Nl0sOTM4MjpbWzQwLDEwNyw0MV0sMjU2XSw5MzgzOltbNDAsMTA4LDQxXSwyNTZdLDkzODQ6W1s0MCwxMDksNDFdLDI1Nl0sOTM4NTpbWzQwLDExMCw0MV0sMjU2XSw5Mzg2OltbNDAsMTExLDQxXSwyNTZdLDkzODc6W1s0MCwxMTIsNDFdLDI1Nl0sOTM4ODpbWzQwLDExMyw0MV0sMjU2XSw5Mzg5OltbNDAsMTE0LDQxXSwyNTZdLDkzOTA6W1s0MCwxMTUsNDFdLDI1Nl0sOTM5MTpbWzQwLDExNiw0MV0sMjU2XSw5MzkyOltbNDAsMTE3LDQxXSwyNTZdLDkzOTM6W1s0MCwxMTgsNDFdLDI1Nl0sOTM5NDpbWzQwLDExOSw0MV0sMjU2XSw5Mzk1OltbNDAsMTIwLDQxXSwyNTZdLDkzOTY6W1s0MCwxMjEsNDFdLDI1Nl0sOTM5NzpbWzQwLDEyMiw0MV0sMjU2XSw5Mzk4OltbNjVdLDI1Nl0sOTM5OTpbWzY2XSwyNTZdLDk0MDA6W1s2N10sMjU2XSw5NDAxOltbNjhdLDI1Nl0sOTQwMjpbWzY5XSwyNTZdLDk0MDM6W1s3MF0sMjU2XSw5NDA0OltbNzFdLDI1Nl0sOTQwNTpbWzcyXSwyNTZdLDk0MDY6W1s3M10sMjU2XSw5NDA3OltbNzRdLDI1Nl0sOTQwODpbWzc1XSwyNTZdLDk0MDk6W1s3Nl0sMjU2XSw5NDEwOltbNzddLDI1Nl0sOTQxMTpbWzc4XSwyNTZdLDk0MTI6W1s3OV0sMjU2XSw5NDEzOltbODBdLDI1Nl0sOTQxNDpbWzgxXSwyNTZdLDk0MTU6W1s4Ml0sMjU2XSw5NDE2OltbODNdLDI1Nl0sOTQxNzpbWzg0XSwyNTZdLDk0MTg6W1s4NV0sMjU2XSw5NDE5OltbODZdLDI1Nl0sOTQyMDpbWzg3XSwyNTZdLDk0MjE6W1s4OF0sMjU2XSw5NDIyOltbODldLDI1Nl0sOTQyMzpbWzkwXSwyNTZdLDk0MjQ6W1s5N10sMjU2XSw5NDI1OltbOThdLDI1Nl0sOTQyNjpbWzk5XSwyNTZdLDk0Mjc6W1sxMDBdLDI1Nl0sOTQyODpbWzEwMV0sMjU2XSw5NDI5OltbMTAyXSwyNTZdLDk0MzA6W1sxMDNdLDI1Nl0sOTQzMTpbWzEwNF0sMjU2XSw5NDMyOltbMTA1XSwyNTZdLDk0MzM6W1sxMDZdLDI1Nl0sOTQzNDpbWzEwN10sMjU2XSw5NDM1OltbMTA4XSwyNTZdLDk0MzY6W1sxMDldLDI1Nl0sOTQzNzpbWzExMF0sMjU2XSw5NDM4OltbMTExXSwyNTZdLDk0Mzk6W1sxMTJdLDI1Nl0sOTQ0MDpbWzExM10sMjU2XSw5NDQxOltbMTE0XSwyNTZdLDk0NDI6W1sxMTVdLDI1Nl0sOTQ0MzpbWzExNl0sMjU2XSw5NDQ0OltbMTE3XSwyNTZdLDk0NDU6W1sxMThdLDI1Nl0sOTQ0NjpbWzExOV0sMjU2XSw5NDQ3OltbMTIwXSwyNTZdLDk0NDg6W1sxMjFdLDI1Nl0sOTQ0OTpbWzEyMl0sMjU2XSw5NDUwOltbNDhdLDI1Nl19LFxuMTA3NTI6ezEwNzY0OltbODc0Nyw4NzQ3LDg3NDcsODc0N10sMjU2XSwxMDg2ODpbWzU4LDU4LDYxXSwyNTZdLDEwODY5OltbNjEsNjFdLDI1Nl0sMTA4NzA6W1s2MSw2MSw2MV0sMjU2XSwxMDk3MjpbWzEwOTczLDgyNF0sNTEyXX0sXG4xMTI2NDp7MTEzODg6W1sxMDZdLDI1Nl0sMTEzODk6W1s4Nl0sMjU2XSwxMTUwMzpbLDIzMF0sMTE1MDQ6WywyMzBdLDExNTA1OlssMjMwXX0sXG4xMTUyMDp7MTE2MzE6W1sxMTYxN10sMjU2XSwxMTY0NzpbLDldLDExNzQ0OlssMjMwXSwxMTc0NTpbLDIzMF0sMTE3NDY6WywyMzBdLDExNzQ3OlssMjMwXSwxMTc0ODpbLDIzMF0sMTE3NDk6WywyMzBdLDExNzUwOlssMjMwXSwxMTc1MTpbLDIzMF0sMTE3NTI6WywyMzBdLDExNzUzOlssMjMwXSwxMTc1NDpbLDIzMF0sMTE3NTU6WywyMzBdLDExNzU2OlssMjMwXSwxMTc1NzpbLDIzMF0sMTE3NTg6WywyMzBdLDExNzU5OlssMjMwXSwxMTc2MDpbLDIzMF0sMTE3NjE6WywyMzBdLDExNzYyOlssMjMwXSwxMTc2MzpbLDIzMF0sMTE3NjQ6WywyMzBdLDExNzY1OlssMjMwXSwxMTc2NjpbLDIzMF0sMTE3Njc6WywyMzBdLDExNzY4OlssMjMwXSwxMTc2OTpbLDIzMF0sMTE3NzA6WywyMzBdLDExNzcxOlssMjMwXSwxMTc3MjpbLDIzMF0sMTE3NzM6WywyMzBdLDExNzc0OlssMjMwXSwxMTc3NTpbLDIzMF19LFxuMTE3NzY6ezExOTM1OltbMjc1OTddLDI1Nl0sMTIwMTk6W1s0MDg2M10sMjU2XX0sXG4xMjAzMjp7MTIwMzI6W1sxOTk2OF0sMjU2XSwxMjAzMzpbWzIwMDA4XSwyNTZdLDEyMDM0OltbMjAwMjJdLDI1Nl0sMTIwMzU6W1syMDAzMV0sMjU2XSwxMjAzNjpbWzIwMDU3XSwyNTZdLDEyMDM3OltbMjAxMDFdLDI1Nl0sMTIwMzg6W1syMDEwOF0sMjU2XSwxMjAzOTpbWzIwMTI4XSwyNTZdLDEyMDQwOltbMjAxNTRdLDI1Nl0sMTIwNDE6W1syMDc5OV0sMjU2XSwxMjA0MjpbWzIwODM3XSwyNTZdLDEyMDQzOltbMjA4NDNdLDI1Nl0sMTIwNDQ6W1syMDg2Nl0sMjU2XSwxMjA0NTpbWzIwODg2XSwyNTZdLDEyMDQ2OltbMjA5MDddLDI1Nl0sMTIwNDc6W1syMDk2MF0sMjU2XSwxMjA0ODpbWzIwOTgxXSwyNTZdLDEyMDQ5OltbMjA5OTJdLDI1Nl0sMTIwNTA6W1syMTE0N10sMjU2XSwxMjA1MTpbWzIxMjQxXSwyNTZdLDEyMDUyOltbMjEyNjldLDI1Nl0sMTIwNTM6W1syMTI3NF0sMjU2XSwxMjA1NDpbWzIxMzA0XSwyNTZdLDEyMDU1OltbMjEzMTNdLDI1Nl0sMTIwNTY6W1syMTM0MF0sMjU2XSwxMjA1NzpbWzIxMzUzXSwyNTZdLDEyMDU4OltbMjEzNzhdLDI1Nl0sMTIwNTk6W1syMTQzMF0sMjU2XSwxMjA2MDpbWzIxNDQ4XSwyNTZdLDEyMDYxOltbMjE0NzVdLDI1Nl0sMTIwNjI6W1syMjIzMV0sMjU2XSwxMjA2MzpbWzIyMzAzXSwyNTZdLDEyMDY0OltbMjI3NjNdLDI1Nl0sMTIwNjU6W1syMjc4Nl0sMjU2XSwxMjA2NjpbWzIyNzk0XSwyNTZdLDEyMDY3OltbMjI4MDVdLDI1Nl0sMTIwNjg6W1syMjgyM10sMjU2XSwxMjA2OTpbWzIyODk5XSwyNTZdLDEyMDcwOltbMjMzNzZdLDI1Nl0sMTIwNzE6W1syMzQyNF0sMjU2XSwxMjA3MjpbWzIzNTQ0XSwyNTZdLDEyMDczOltbMjM1NjddLDI1Nl0sMTIwNzQ6W1syMzU4Nl0sMjU2XSwxMjA3NTpbWzIzNjA4XSwyNTZdLDEyMDc2OltbMjM2NjJdLDI1Nl0sMTIwNzc6W1syMzY2NV0sMjU2XSwxMjA3ODpbWzI0MDI3XSwyNTZdLDEyMDc5OltbMjQwMzddLDI1Nl0sMTIwODA6W1syNDA0OV0sMjU2XSwxMjA4MTpbWzI0MDYyXSwyNTZdLDEyMDgyOltbMjQxNzhdLDI1Nl0sMTIwODM6W1syNDE4Nl0sMjU2XSwxMjA4NDpbWzI0MTkxXSwyNTZdLDEyMDg1OltbMjQzMDhdLDI1Nl0sMTIwODY6W1syNDMxOF0sMjU2XSwxMjA4NzpbWzI0MzMxXSwyNTZdLDEyMDg4OltbMjQzMzldLDI1Nl0sMTIwODk6W1syNDQwMF0sMjU2XSwxMjA5MDpbWzI0NDE3XSwyNTZdLDEyMDkxOltbMjQ0MzVdLDI1Nl0sMTIwOTI6W1syNDUxNV0sMjU2XSwxMjA5MzpbWzI1MDk2XSwyNTZdLDEyMDk0OltbMjUxNDJdLDI1Nl0sMTIwOTU6W1syNTE2M10sMjU2XSwxMjA5NjpbWzI1OTAzXSwyNTZdLDEyMDk3OltbMjU5MDhdLDI1Nl0sMTIwOTg6W1syNTk5MV0sMjU2XSwxMjA5OTpbWzI2MDA3XSwyNTZdLDEyMTAwOltbMjYwMjBdLDI1Nl0sMTIxMDE6W1syNjA0MV0sMjU2XSwxMjEwMjpbWzI2MDgwXSwyNTZdLDEyMTAzOltbMjYwODVdLDI1Nl0sMTIxMDQ6W1syNjM1Ml0sMjU2XSwxMjEwNTpbWzI2Mzc2XSwyNTZdLDEyMTA2OltbMjY0MDhdLDI1Nl0sMTIxMDc6W1syNzQyNF0sMjU2XSwxMjEwODpbWzI3NDkwXSwyNTZdLDEyMTA5OltbMjc1MTNdLDI1Nl0sMTIxMTA6W1syNzU3MV0sMjU2XSwxMjExMTpbWzI3NTk1XSwyNTZdLDEyMTEyOltbMjc2MDRdLDI1Nl0sMTIxMTM6W1syNzYxMV0sMjU2XSwxMjExNDpbWzI3NjYzXSwyNTZdLDEyMTE1OltbMjc2NjhdLDI1Nl0sMTIxMTY6W1syNzcwMF0sMjU2XSwxMjExNzpbWzI4Nzc5XSwyNTZdLDEyMTE4OltbMjkyMjZdLDI1Nl0sMTIxMTk6W1syOTIzOF0sMjU2XSwxMjEyMDpbWzI5MjQzXSwyNTZdLDEyMTIxOltbMjkyNDddLDI1Nl0sMTIxMjI6W1syOTI1NV0sMjU2XSwxMjEyMzpbWzI5MjczXSwyNTZdLDEyMTI0OltbMjkyNzVdLDI1Nl0sMTIxMjU6W1syOTM1Nl0sMjU2XSwxMjEyNjpbWzI5NTcyXSwyNTZdLDEyMTI3OltbMjk1NzddLDI1Nl0sMTIxMjg6W1syOTkxNl0sMjU2XSwxMjEyOTpbWzI5OTI2XSwyNTZdLDEyMTMwOltbMjk5NzZdLDI1Nl0sMTIxMzE6W1syOTk4M10sMjU2XSwxMjEzMjpbWzI5OTkyXSwyNTZdLDEyMTMzOltbMzAwMDBdLDI1Nl0sMTIxMzQ6W1szMDA5MV0sMjU2XSwxMjEzNTpbWzMwMDk4XSwyNTZdLDEyMTM2OltbMzAzMjZdLDI1Nl0sMTIxMzc6W1szMDMzM10sMjU2XSwxMjEzODpbWzMwMzgyXSwyNTZdLDEyMTM5OltbMzAzOTldLDI1Nl0sMTIxNDA6W1szMDQ0Nl0sMjU2XSwxMjE0MTpbWzMwNjgzXSwyNTZdLDEyMTQyOltbMzA2OTBdLDI1Nl0sMTIxNDM6W1szMDcwN10sMjU2XSwxMjE0NDpbWzMxMDM0XSwyNTZdLDEyMTQ1OltbMzExNjBdLDI1Nl0sMTIxNDY6W1szMTE2Nl0sMjU2XSwxMjE0NzpbWzMxMzQ4XSwyNTZdLDEyMTQ4OltbMzE0MzVdLDI1Nl0sMTIxNDk6W1szMTQ4MV0sMjU2XSwxMjE1MDpbWzMxODU5XSwyNTZdLDEyMTUxOltbMzE5OTJdLDI1Nl0sMTIxNTI6W1szMjU2Nl0sMjU2XSwxMjE1MzpbWzMyNTkzXSwyNTZdLDEyMTU0OltbMzI2NTBdLDI1Nl0sMTIxNTU6W1szMjcwMV0sMjU2XSwxMjE1NjpbWzMyNzY5XSwyNTZdLDEyMTU3OltbMzI3ODBdLDI1Nl0sMTIxNTg6W1szMjc4Nl0sMjU2XSwxMjE1OTpbWzMyODE5XSwyNTZdLDEyMTYwOltbMzI4OTVdLDI1Nl0sMTIxNjE6W1szMjkwNV0sMjU2XSwxMjE2MjpbWzMzMjUxXSwyNTZdLDEyMTYzOltbMzMyNThdLDI1Nl0sMTIxNjQ6W1szMzI2N10sMjU2XSwxMjE2NTpbWzMzMjc2XSwyNTZdLDEyMTY2OltbMzMyOTJdLDI1Nl0sMTIxNjc6W1szMzMwN10sMjU2XSwxMjE2ODpbWzMzMzExXSwyNTZdLDEyMTY5OltbMzMzOTBdLDI1Nl0sMTIxNzA6W1szMzM5NF0sMjU2XSwxMjE3MTpbWzMzNDAwXSwyNTZdLDEyMTcyOltbMzQzODFdLDI1Nl0sMTIxNzM6W1szNDQxMV0sMjU2XSwxMjE3NDpbWzM0ODgwXSwyNTZdLDEyMTc1OltbMzQ4OTJdLDI1Nl0sMTIxNzY6W1szNDkxNV0sMjU2XSwxMjE3NzpbWzM1MTk4XSwyNTZdLDEyMTc4OltbMzUyMTFdLDI1Nl0sMTIxNzk6W1szNTI4Ml0sMjU2XSwxMjE4MDpbWzM1MzI4XSwyNTZdLDEyMTgxOltbMzU4OTVdLDI1Nl0sMTIxODI6W1szNTkxMF0sMjU2XSwxMjE4MzpbWzM1OTI1XSwyNTZdLDEyMTg0OltbMzU5NjBdLDI1Nl0sMTIxODU6W1szNTk5N10sMjU2XSwxMjE4NjpbWzM2MTk2XSwyNTZdLDEyMTg3OltbMzYyMDhdLDI1Nl0sMTIxODg6W1szNjI3NV0sMjU2XSwxMjE4OTpbWzM2NTIzXSwyNTZdLDEyMTkwOltbMzY1NTRdLDI1Nl0sMTIxOTE6W1szNjc2M10sMjU2XSwxMjE5MjpbWzM2Nzg0XSwyNTZdLDEyMTkzOltbMzY3ODldLDI1Nl0sMTIxOTQ6W1szNzAwOV0sMjU2XSwxMjE5NTpbWzM3MTkzXSwyNTZdLDEyMTk2OltbMzczMThdLDI1Nl0sMTIxOTc6W1szNzMyNF0sMjU2XSwxMjE5ODpbWzM3MzI5XSwyNTZdLDEyMTk5OltbMzgyNjNdLDI1Nl0sMTIyMDA6W1szODI3Ml0sMjU2XSwxMjIwMTpbWzM4NDI4XSwyNTZdLDEyMjAyOltbMzg1ODJdLDI1Nl0sMTIyMDM6W1szODU4NV0sMjU2XSwxMjIwNDpbWzM4NjMyXSwyNTZdLDEyMjA1OltbMzg3MzddLDI1Nl0sMTIyMDY6W1szODc1MF0sMjU2XSwxMjIwNzpbWzM4NzU0XSwyNTZdLDEyMjA4OltbMzg3NjFdLDI1Nl0sMTIyMDk6W1szODg1OV0sMjU2XSwxMjIxMDpbWzM4ODkzXSwyNTZdLDEyMjExOltbMzg4OTldLDI1Nl0sMTIyMTI6W1szODkxM10sMjU2XSwxMjIxMzpbWzM5MDgwXSwyNTZdLDEyMjE0OltbMzkxMzFdLDI1Nl0sMTIyMTU6W1szOTEzNV0sMjU2XSwxMjIxNjpbWzM5MzE4XSwyNTZdLDEyMjE3OltbMzkzMjFdLDI1Nl0sMTIyMTg6W1szOTM0MF0sMjU2XSwxMjIxOTpbWzM5NTkyXSwyNTZdLDEyMjIwOltbMzk2NDBdLDI1Nl0sMTIyMjE6W1szOTY0N10sMjU2XSwxMjIyMjpbWzM5NzE3XSwyNTZdLDEyMjIzOltbMzk3MjddLDI1Nl0sMTIyMjQ6W1szOTczMF0sMjU2XSwxMjIyNTpbWzM5NzQwXSwyNTZdLDEyMjI2OltbMzk3NzBdLDI1Nl0sMTIyMjc6W1s0MDE2NV0sMjU2XSwxMjIyODpbWzQwNTY1XSwyNTZdLDEyMjI5OltbNDA1NzVdLDI1Nl0sMTIyMzA6W1s0MDYxM10sMjU2XSwxMjIzMTpbWzQwNjM1XSwyNTZdLDEyMjMyOltbNDA2NDNdLDI1Nl0sMTIyMzM6W1s0MDY1M10sMjU2XSwxMjIzNDpbWzQwNjU3XSwyNTZdLDEyMjM1OltbNDA2OTddLDI1Nl0sMTIyMzY6W1s0MDcwMV0sMjU2XSwxMjIzNzpbWzQwNzE4XSwyNTZdLDEyMjM4OltbNDA3MjNdLDI1Nl0sMTIyMzk6W1s0MDczNl0sMjU2XSwxMjI0MDpbWzQwNzYzXSwyNTZdLDEyMjQxOltbNDA3NzhdLDI1Nl0sMTIyNDI6W1s0MDc4Nl0sMjU2XSwxMjI0MzpbWzQwODQ1XSwyNTZdLDEyMjQ0OltbNDA4NjBdLDI1Nl0sMTIyNDU6W1s0MDg2NF0sMjU2XX0sXG4xMjI4ODp7MTIyODg6W1szMl0sMjU2XSwxMjMzMDpbLDIxOF0sMTIzMzE6WywyMjhdLDEyMzMyOlssMjMyXSwxMjMzMzpbLDIyMl0sMTIzMzQ6WywyMjRdLDEyMzM1OlssMjI0XSwxMjM0MjpbWzEyMzA2XSwyNTZdLDEyMzQ0OltbMjEzMTNdLDI1Nl0sMTIzNDU6W1syMTMxNl0sMjU2XSwxMjM0NjpbWzIxMzE3XSwyNTZdLDEyMzU4OlssLHsxMjQ0MToxMjQzNn1dLDEyMzYzOlssLHsxMjQ0MToxMjM2NH1dLDEyMzY0OltbMTIzNjMsMTI0NDFdXSwxMjM2NTpbLCx7MTI0NDE6MTIzNjZ9XSwxMjM2NjpbWzEyMzY1LDEyNDQxXV0sMTIzNjc6WywsezEyNDQxOjEyMzY4fV0sMTIzNjg6W1sxMjM2NywxMjQ0MV1dLDEyMzY5OlssLHsxMjQ0MToxMjM3MH1dLDEyMzcwOltbMTIzNjksMTI0NDFdXSwxMjM3MTpbLCx7MTI0NDE6MTIzNzJ9XSwxMjM3MjpbWzEyMzcxLDEyNDQxXV0sMTIzNzM6WywsezEyNDQxOjEyMzc0fV0sMTIzNzQ6W1sxMjM3MywxMjQ0MV1dLDEyMzc1OlssLHsxMjQ0MToxMjM3Nn1dLDEyMzc2OltbMTIzNzUsMTI0NDFdXSwxMjM3NzpbLCx7MTI0NDE6MTIzNzh9XSwxMjM3ODpbWzEyMzc3LDEyNDQxXV0sMTIzNzk6WywsezEyNDQxOjEyMzgwfV0sMTIzODA6W1sxMjM3OSwxMjQ0MV1dLDEyMzgxOlssLHsxMjQ0MToxMjM4Mn1dLDEyMzgyOltbMTIzODEsMTI0NDFdXSwxMjM4MzpbLCx7MTI0NDE6MTIzODR9XSwxMjM4NDpbWzEyMzgzLDEyNDQxXV0sMTIzODU6WywsezEyNDQxOjEyMzg2fV0sMTIzODY6W1sxMjM4NSwxMjQ0MV1dLDEyMzg4OlssLHsxMjQ0MToxMjM4OX1dLDEyMzg5OltbMTIzODgsMTI0NDFdXSwxMjM5MDpbLCx7MTI0NDE6MTIzOTF9XSwxMjM5MTpbWzEyMzkwLDEyNDQxXV0sMTIzOTI6WywsezEyNDQxOjEyMzkzfV0sMTIzOTM6W1sxMjM5MiwxMjQ0MV1dLDEyMzk5OlssLHsxMjQ0MToxMjQwMCwxMjQ0MjoxMjQwMX1dLDEyNDAwOltbMTIzOTksMTI0NDFdXSwxMjQwMTpbWzEyMzk5LDEyNDQyXV0sMTI0MDI6WywsezEyNDQxOjEyNDAzLDEyNDQyOjEyNDA0fV0sMTI0MDM6W1sxMjQwMiwxMjQ0MV1dLDEyNDA0OltbMTI0MDIsMTI0NDJdXSwxMjQwNTpbLCx7MTI0NDE6MTI0MDYsMTI0NDI6MTI0MDd9XSwxMjQwNjpbWzEyNDA1LDEyNDQxXV0sMTI0MDc6W1sxMjQwNSwxMjQ0Ml1dLDEyNDA4OlssLHsxMjQ0MToxMjQwOSwxMjQ0MjoxMjQxMH1dLDEyNDA5OltbMTI0MDgsMTI0NDFdXSwxMjQxMDpbWzEyNDA4LDEyNDQyXV0sMTI0MTE6WywsezEyNDQxOjEyNDEyLDEyNDQyOjEyNDEzfV0sMTI0MTI6W1sxMjQxMSwxMjQ0MV1dLDEyNDEzOltbMTI0MTEsMTI0NDJdXSwxMjQzNjpbWzEyMzU4LDEyNDQxXV0sMTI0NDE6Wyw4XSwxMjQ0MjpbLDhdLDEyNDQzOltbMzIsMTI0NDFdLDI1Nl0sMTI0NDQ6W1szMiwxMjQ0Ml0sMjU2XSwxMjQ0NTpbLCx7MTI0NDE6MTI0NDZ9XSwxMjQ0NjpbWzEyNDQ1LDEyNDQxXV0sMTI0NDc6W1sxMjQyNCwxMjQyNl0sMjU2XSwxMjQ1NDpbLCx7MTI0NDE6MTI1MzJ9XSwxMjQ1OTpbLCx7MTI0NDE6MTI0NjB9XSwxMjQ2MDpbWzEyNDU5LDEyNDQxXV0sMTI0NjE6WywsezEyNDQxOjEyNDYyfV0sMTI0NjI6W1sxMjQ2MSwxMjQ0MV1dLDEyNDYzOlssLHsxMjQ0MToxMjQ2NH1dLDEyNDY0OltbMTI0NjMsMTI0NDFdXSwxMjQ2NTpbLCx7MTI0NDE6MTI0NjZ9XSwxMjQ2NjpbWzEyNDY1LDEyNDQxXV0sMTI0Njc6WywsezEyNDQxOjEyNDY4fV0sMTI0Njg6W1sxMjQ2NywxMjQ0MV1dLDEyNDY5OlssLHsxMjQ0MToxMjQ3MH1dLDEyNDcwOltbMTI0NjksMTI0NDFdXSwxMjQ3MTpbLCx7MTI0NDE6MTI0NzJ9XSwxMjQ3MjpbWzEyNDcxLDEyNDQxXV0sMTI0NzM6WywsezEyNDQxOjEyNDc0fV0sMTI0NzQ6W1sxMjQ3MywxMjQ0MV1dLDEyNDc1OlssLHsxMjQ0MToxMjQ3Nn1dLDEyNDc2OltbMTI0NzUsMTI0NDFdXSwxMjQ3NzpbLCx7MTI0NDE6MTI0Nzh9XSwxMjQ3ODpbWzEyNDc3LDEyNDQxXV0sMTI0Nzk6WywsezEyNDQxOjEyNDgwfV0sMTI0ODA6W1sxMjQ3OSwxMjQ0MV1dLDEyNDgxOlssLHsxMjQ0MToxMjQ4Mn1dLDEyNDgyOltbMTI0ODEsMTI0NDFdXSwxMjQ4NDpbLCx7MTI0NDE6MTI0ODV9XSwxMjQ4NTpbWzEyNDg0LDEyNDQxXV0sMTI0ODY6WywsezEyNDQxOjEyNDg3fV0sMTI0ODc6W1sxMjQ4NiwxMjQ0MV1dLDEyNDg4OlssLHsxMjQ0MToxMjQ4OX1dLDEyNDg5OltbMTI0ODgsMTI0NDFdXSwxMjQ5NTpbLCx7MTI0NDE6MTI0OTYsMTI0NDI6MTI0OTd9XSwxMjQ5NjpbWzEyNDk1LDEyNDQxXV0sMTI0OTc6W1sxMjQ5NSwxMjQ0Ml1dLDEyNDk4OlssLHsxMjQ0MToxMjQ5OSwxMjQ0MjoxMjUwMH1dLDEyNDk5OltbMTI0OTgsMTI0NDFdXSwxMjUwMDpbWzEyNDk4LDEyNDQyXV0sMTI1MDE6WywsezEyNDQxOjEyNTAyLDEyNDQyOjEyNTAzfV0sMTI1MDI6W1sxMjUwMSwxMjQ0MV1dLDEyNTAzOltbMTI1MDEsMTI0NDJdXSwxMjUwNDpbLCx7MTI0NDE6MTI1MDUsMTI0NDI6MTI1MDZ9XSwxMjUwNTpbWzEyNTA0LDEyNDQxXV0sMTI1MDY6W1sxMjUwNCwxMjQ0Ml1dLDEyNTA3OlssLHsxMjQ0MToxMjUwOCwxMjQ0MjoxMjUwOX1dLDEyNTA4OltbMTI1MDcsMTI0NDFdXSwxMjUwOTpbWzEyNTA3LDEyNDQyXV0sMTI1Mjc6WywsezEyNDQxOjEyNTM1fV0sMTI1Mjg6WywsezEyNDQxOjEyNTM2fV0sMTI1Mjk6WywsezEyNDQxOjEyNTM3fV0sMTI1MzA6WywsezEyNDQxOjEyNTM4fV0sMTI1MzI6W1sxMjQ1NCwxMjQ0MV1dLDEyNTM1OltbMTI1MjcsMTI0NDFdXSwxMjUzNjpbWzEyNTI4LDEyNDQxXV0sMTI1Mzc6W1sxMjUyOSwxMjQ0MV1dLDEyNTM4OltbMTI1MzAsMTI0NDFdXSwxMjU0MTpbLCx7MTI0NDE6MTI1NDJ9XSwxMjU0MjpbWzEyNTQxLDEyNDQxXV0sMTI1NDM6W1sxMjQ2NywxMjQ4OF0sMjU2XX0sXG4xMjU0NDp7MTI1OTM6W1s0MzUyXSwyNTZdLDEyNTk0OltbNDM1M10sMjU2XSwxMjU5NTpbWzQ1MjJdLDI1Nl0sMTI1OTY6W1s0MzU0XSwyNTZdLDEyNTk3OltbNDUyNF0sMjU2XSwxMjU5ODpbWzQ1MjVdLDI1Nl0sMTI1OTk6W1s0MzU1XSwyNTZdLDEyNjAwOltbNDM1Nl0sMjU2XSwxMjYwMTpbWzQzNTddLDI1Nl0sMTI2MDI6W1s0NTI4XSwyNTZdLDEyNjAzOltbNDUyOV0sMjU2XSwxMjYwNDpbWzQ1MzBdLDI1Nl0sMTI2MDU6W1s0NTMxXSwyNTZdLDEyNjA2OltbNDUzMl0sMjU2XSwxMjYwNzpbWzQ1MzNdLDI1Nl0sMTI2MDg6W1s0Mzc4XSwyNTZdLDEyNjA5OltbNDM1OF0sMjU2XSwxMjYxMDpbWzQzNTldLDI1Nl0sMTI2MTE6W1s0MzYwXSwyNTZdLDEyNjEyOltbNDM4NV0sMjU2XSwxMjYxMzpbWzQzNjFdLDI1Nl0sMTI2MTQ6W1s0MzYyXSwyNTZdLDEyNjE1OltbNDM2M10sMjU2XSwxMjYxNjpbWzQzNjRdLDI1Nl0sMTI2MTc6W1s0MzY1XSwyNTZdLDEyNjE4OltbNDM2Nl0sMjU2XSwxMjYxOTpbWzQzNjddLDI1Nl0sMTI2MjA6W1s0MzY4XSwyNTZdLDEyNjIxOltbNDM2OV0sMjU2XSwxMjYyMjpbWzQzNzBdLDI1Nl0sMTI2MjM6W1s0NDQ5XSwyNTZdLDEyNjI0OltbNDQ1MF0sMjU2XSwxMjYyNTpbWzQ0NTFdLDI1Nl0sMTI2MjY6W1s0NDUyXSwyNTZdLDEyNjI3OltbNDQ1M10sMjU2XSwxMjYyODpbWzQ0NTRdLDI1Nl0sMTI2Mjk6W1s0NDU1XSwyNTZdLDEyNjMwOltbNDQ1Nl0sMjU2XSwxMjYzMTpbWzQ0NTddLDI1Nl0sMTI2MzI6W1s0NDU4XSwyNTZdLDEyNjMzOltbNDQ1OV0sMjU2XSwxMjYzNDpbWzQ0NjBdLDI1Nl0sMTI2MzU6W1s0NDYxXSwyNTZdLDEyNjM2OltbNDQ2Ml0sMjU2XSwxMjYzNzpbWzQ0NjNdLDI1Nl0sMTI2Mzg6W1s0NDY0XSwyNTZdLDEyNjM5OltbNDQ2NV0sMjU2XSwxMjY0MDpbWzQ0NjZdLDI1Nl0sMTI2NDE6W1s0NDY3XSwyNTZdLDEyNjQyOltbNDQ2OF0sMjU2XSwxMjY0MzpbWzQ0NjldLDI1Nl0sMTI2NDQ6W1s0NDQ4XSwyNTZdLDEyNjQ1OltbNDM3Ml0sMjU2XSwxMjY0NjpbWzQzNzNdLDI1Nl0sMTI2NDc6W1s0NTUxXSwyNTZdLDEyNjQ4OltbNDU1Ml0sMjU2XSwxMjY0OTpbWzQ1NTZdLDI1Nl0sMTI2NTA6W1s0NTU4XSwyNTZdLDEyNjUxOltbNDU2M10sMjU2XSwxMjY1MjpbWzQ1NjddLDI1Nl0sMTI2NTM6W1s0NTY5XSwyNTZdLDEyNjU0OltbNDM4MF0sMjU2XSwxMjY1NTpbWzQ1NzNdLDI1Nl0sMTI2NTY6W1s0NTc1XSwyNTZdLDEyNjU3OltbNDM4MV0sMjU2XSwxMjY1ODpbWzQzODJdLDI1Nl0sMTI2NTk6W1s0Mzg0XSwyNTZdLDEyNjYwOltbNDM4Nl0sMjU2XSwxMjY2MTpbWzQzODddLDI1Nl0sMTI2NjI6W1s0MzkxXSwyNTZdLDEyNjYzOltbNDM5M10sMjU2XSwxMjY2NDpbWzQzOTVdLDI1Nl0sMTI2NjU6W1s0Mzk2XSwyNTZdLDEyNjY2OltbNDM5N10sMjU2XSwxMjY2NzpbWzQzOThdLDI1Nl0sMTI2Njg6W1s0Mzk5XSwyNTZdLDEyNjY5OltbNDQwMl0sMjU2XSwxMjY3MDpbWzQ0MDZdLDI1Nl0sMTI2NzE6W1s0NDE2XSwyNTZdLDEyNjcyOltbNDQyM10sMjU2XSwxMjY3MzpbWzQ0MjhdLDI1Nl0sMTI2NzQ6W1s0NTkzXSwyNTZdLDEyNjc1OltbNDU5NF0sMjU2XSwxMjY3NjpbWzQ0MzldLDI1Nl0sMTI2Nzc6W1s0NDQwXSwyNTZdLDEyNjc4OltbNDQ0MV0sMjU2XSwxMjY3OTpbWzQ0ODRdLDI1Nl0sMTI2ODA6W1s0NDg1XSwyNTZdLDEyNjgxOltbNDQ4OF0sMjU2XSwxMjY4MjpbWzQ0OTddLDI1Nl0sMTI2ODM6W1s0NDk4XSwyNTZdLDEyNjg0OltbNDUwMF0sMjU2XSwxMjY4NTpbWzQ1MTBdLDI1Nl0sMTI2ODY6W1s0NTEzXSwyNTZdLDEyNjkwOltbMTk5NjhdLDI1Nl0sMTI2OTE6W1syMDEwOF0sMjU2XSwxMjY5MjpbWzE5OTc3XSwyNTZdLDEyNjkzOltbMjIyMzVdLDI1Nl0sMTI2OTQ6W1sxOTk3OF0sMjU2XSwxMjY5NTpbWzIwMDEzXSwyNTZdLDEyNjk2OltbMTk5NzldLDI1Nl0sMTI2OTc6W1szMDAwMl0sMjU2XSwxMjY5ODpbWzIwMDU3XSwyNTZdLDEyNjk5OltbMTk5OTNdLDI1Nl0sMTI3MDA6W1sxOTk2OV0sMjU2XSwxMjcwMTpbWzIyODI1XSwyNTZdLDEyNzAyOltbMjIzMjBdLDI1Nl0sMTI3MDM6W1syMDE1NF0sMjU2XX0sXG4xMjgwMDp7MTI4MDA6W1s0MCw0MzUyLDQxXSwyNTZdLDEyODAxOltbNDAsNDM1NCw0MV0sMjU2XSwxMjgwMjpbWzQwLDQzNTUsNDFdLDI1Nl0sMTI4MDM6W1s0MCw0MzU3LDQxXSwyNTZdLDEyODA0OltbNDAsNDM1OCw0MV0sMjU2XSwxMjgwNTpbWzQwLDQzNTksNDFdLDI1Nl0sMTI4MDY6W1s0MCw0MzYxLDQxXSwyNTZdLDEyODA3OltbNDAsNDM2Myw0MV0sMjU2XSwxMjgwODpbWzQwLDQzNjQsNDFdLDI1Nl0sMTI4MDk6W1s0MCw0MzY2LDQxXSwyNTZdLDEyODEwOltbNDAsNDM2Nyw0MV0sMjU2XSwxMjgxMTpbWzQwLDQzNjgsNDFdLDI1Nl0sMTI4MTI6W1s0MCw0MzY5LDQxXSwyNTZdLDEyODEzOltbNDAsNDM3MCw0MV0sMjU2XSwxMjgxNDpbWzQwLDQzNTIsNDQ0OSw0MV0sMjU2XSwxMjgxNTpbWzQwLDQzNTQsNDQ0OSw0MV0sMjU2XSwxMjgxNjpbWzQwLDQzNTUsNDQ0OSw0MV0sMjU2XSwxMjgxNzpbWzQwLDQzNTcsNDQ0OSw0MV0sMjU2XSwxMjgxODpbWzQwLDQzNTgsNDQ0OSw0MV0sMjU2XSwxMjgxOTpbWzQwLDQzNTksNDQ0OSw0MV0sMjU2XSwxMjgyMDpbWzQwLDQzNjEsNDQ0OSw0MV0sMjU2XSwxMjgyMTpbWzQwLDQzNjMsNDQ0OSw0MV0sMjU2XSwxMjgyMjpbWzQwLDQzNjQsNDQ0OSw0MV0sMjU2XSwxMjgyMzpbWzQwLDQzNjYsNDQ0OSw0MV0sMjU2XSwxMjgyNDpbWzQwLDQzNjcsNDQ0OSw0MV0sMjU2XSwxMjgyNTpbWzQwLDQzNjgsNDQ0OSw0MV0sMjU2XSwxMjgyNjpbWzQwLDQzNjksNDQ0OSw0MV0sMjU2XSwxMjgyNzpbWzQwLDQzNzAsNDQ0OSw0MV0sMjU2XSwxMjgyODpbWzQwLDQzNjQsNDQ2Miw0MV0sMjU2XSwxMjgyOTpbWzQwLDQzNjMsNDQ1Nyw0MzY0LDQ0NTMsNDUyMyw0MV0sMjU2XSwxMjgzMDpbWzQwLDQzNjMsNDQ1Nyw0MzcwLDQ0NjIsNDFdLDI1Nl0sMTI4MzI6W1s0MCwxOTk2OCw0MV0sMjU2XSwxMjgzMzpbWzQwLDIwMTA4LDQxXSwyNTZdLDEyODM0OltbNDAsMTk5NzcsNDFdLDI1Nl0sMTI4MzU6W1s0MCwyMjIzNSw0MV0sMjU2XSwxMjgzNjpbWzQwLDIwMTE2LDQxXSwyNTZdLDEyODM3OltbNDAsMjA4NDUsNDFdLDI1Nl0sMTI4Mzg6W1s0MCwxOTk3MSw0MV0sMjU2XSwxMjgzOTpbWzQwLDIwODQzLDQxXSwyNTZdLDEyODQwOltbNDAsMjAwNjEsNDFdLDI1Nl0sMTI4NDE6W1s0MCwyMTMxMyw0MV0sMjU2XSwxMjg0MjpbWzQwLDI2Mzc2LDQxXSwyNTZdLDEyODQzOltbNDAsMjg3NzksNDFdLDI1Nl0sMTI4NDQ6W1s0MCwyNzcwMCw0MV0sMjU2XSwxMjg0NTpbWzQwLDI2NDA4LDQxXSwyNTZdLDEyODQ2OltbNDAsMzczMjksNDFdLDI1Nl0sMTI4NDc6W1s0MCwyMjMwMyw0MV0sMjU2XSwxMjg0ODpbWzQwLDI2MDg1LDQxXSwyNTZdLDEyODQ5OltbNDAsMjY2NjYsNDFdLDI1Nl0sMTI4NTA6W1s0MCwyNjM3Nyw0MV0sMjU2XSwxMjg1MTpbWzQwLDMxMDM4LDQxXSwyNTZdLDEyODUyOltbNDAsMjE1MTcsNDFdLDI1Nl0sMTI4NTM6W1s0MCwyOTMwNSw0MV0sMjU2XSwxMjg1NDpbWzQwLDM2MDAxLDQxXSwyNTZdLDEyODU1OltbNDAsMzEwNjksNDFdLDI1Nl0sMTI4NTY6W1s0MCwyMTE3Miw0MV0sMjU2XSwxMjg1NzpbWzQwLDIwMTk1LDQxXSwyNTZdLDEyODU4OltbNDAsMjE2MjgsNDFdLDI1Nl0sMTI4NTk6W1s0MCwyMzM5OCw0MV0sMjU2XSwxMjg2MDpbWzQwLDMwNDM1LDQxXSwyNTZdLDEyODYxOltbNDAsMjAyMjUsNDFdLDI1Nl0sMTI4NjI6W1s0MCwzNjAzOSw0MV0sMjU2XSwxMjg2MzpbWzQwLDIxMzMyLDQxXSwyNTZdLDEyODY0OltbNDAsMzEwODUsNDFdLDI1Nl0sMTI4NjU6W1s0MCwyMDI0MSw0MV0sMjU2XSwxMjg2NjpbWzQwLDMzMjU4LDQxXSwyNTZdLDEyODY3OltbNDAsMzMyNjcsNDFdLDI1Nl0sMTI4Njg6W1syMTgzOV0sMjU2XSwxMjg2OTpbWzI0MTg4XSwyNTZdLDEyODcwOltbMjU5OTFdLDI1Nl0sMTI4NzE6W1szMTYzMV0sMjU2XSwxMjg4MDpbWzgwLDg0LDY5XSwyNTZdLDEyODgxOltbNTAsNDldLDI1Nl0sMTI4ODI6W1s1MCw1MF0sMjU2XSwxMjg4MzpbWzUwLDUxXSwyNTZdLDEyODg0OltbNTAsNTJdLDI1Nl0sMTI4ODU6W1s1MCw1M10sMjU2XSwxMjg4NjpbWzUwLDU0XSwyNTZdLDEyODg3OltbNTAsNTVdLDI1Nl0sMTI4ODg6W1s1MCw1Nl0sMjU2XSwxMjg4OTpbWzUwLDU3XSwyNTZdLDEyODkwOltbNTEsNDhdLDI1Nl0sMTI4OTE6W1s1MSw0OV0sMjU2XSwxMjg5MjpbWzUxLDUwXSwyNTZdLDEyODkzOltbNTEsNTFdLDI1Nl0sMTI4OTQ6W1s1MSw1Ml0sMjU2XSwxMjg5NTpbWzUxLDUzXSwyNTZdLDEyODk2OltbNDM1Ml0sMjU2XSwxMjg5NzpbWzQzNTRdLDI1Nl0sMTI4OTg6W1s0MzU1XSwyNTZdLDEyODk5OltbNDM1N10sMjU2XSwxMjkwMDpbWzQzNThdLDI1Nl0sMTI5MDE6W1s0MzU5XSwyNTZdLDEyOTAyOltbNDM2MV0sMjU2XSwxMjkwMzpbWzQzNjNdLDI1Nl0sMTI5MDQ6W1s0MzY0XSwyNTZdLDEyOTA1OltbNDM2Nl0sMjU2XSwxMjkwNjpbWzQzNjddLDI1Nl0sMTI5MDc6W1s0MzY4XSwyNTZdLDEyOTA4OltbNDM2OV0sMjU2XSwxMjkwOTpbWzQzNzBdLDI1Nl0sMTI5MTA6W1s0MzUyLDQ0NDldLDI1Nl0sMTI5MTE6W1s0MzU0LDQ0NDldLDI1Nl0sMTI5MTI6W1s0MzU1LDQ0NDldLDI1Nl0sMTI5MTM6W1s0MzU3LDQ0NDldLDI1Nl0sMTI5MTQ6W1s0MzU4LDQ0NDldLDI1Nl0sMTI5MTU6W1s0MzU5LDQ0NDldLDI1Nl0sMTI5MTY6W1s0MzYxLDQ0NDldLDI1Nl0sMTI5MTc6W1s0MzYzLDQ0NDldLDI1Nl0sMTI5MTg6W1s0MzY0LDQ0NDldLDI1Nl0sMTI5MTk6W1s0MzY2LDQ0NDldLDI1Nl0sMTI5MjA6W1s0MzY3LDQ0NDldLDI1Nl0sMTI5MjE6W1s0MzY4LDQ0NDldLDI1Nl0sMTI5MjI6W1s0MzY5LDQ0NDldLDI1Nl0sMTI5MjM6W1s0MzcwLDQ0NDldLDI1Nl0sMTI5MjQ6W1s0MzY2LDQ0NDksNDUzNSw0MzUyLDQ0NTddLDI1Nl0sMTI5MjU6W1s0MzY0LDQ0NjIsNDM2Myw0NDY4XSwyNTZdLDEyOTI2OltbNDM2Myw0NDYyXSwyNTZdLDEyOTI4OltbMTk5NjhdLDI1Nl0sMTI5Mjk6W1syMDEwOF0sMjU2XSwxMjkzMDpbWzE5OTc3XSwyNTZdLDEyOTMxOltbMjIyMzVdLDI1Nl0sMTI5MzI6W1syMDExNl0sMjU2XSwxMjkzMzpbWzIwODQ1XSwyNTZdLDEyOTM0OltbMTk5NzFdLDI1Nl0sMTI5MzU6W1syMDg0M10sMjU2XSwxMjkzNjpbWzIwMDYxXSwyNTZdLDEyOTM3OltbMjEzMTNdLDI1Nl0sMTI5Mzg6W1syNjM3Nl0sMjU2XSwxMjkzOTpbWzI4Nzc5XSwyNTZdLDEyOTQwOltbMjc3MDBdLDI1Nl0sMTI5NDE6W1syNjQwOF0sMjU2XSwxMjk0MjpbWzM3MzI5XSwyNTZdLDEyOTQzOltbMjIzMDNdLDI1Nl0sMTI5NDQ6W1syNjA4NV0sMjU2XSwxMjk0NTpbWzI2NjY2XSwyNTZdLDEyOTQ2OltbMjYzNzddLDI1Nl0sMTI5NDc6W1szMTAzOF0sMjU2XSwxMjk0ODpbWzIxNTE3XSwyNTZdLDEyOTQ5OltbMjkzMDVdLDI1Nl0sMTI5NTA6W1szNjAwMV0sMjU2XSwxMjk1MTpbWzMxMDY5XSwyNTZdLDEyOTUyOltbMjExNzJdLDI1Nl0sMTI5NTM6W1szMTE5Ml0sMjU2XSwxMjk1NDpbWzMwMDA3XSwyNTZdLDEyOTU1OltbMjI4OTldLDI1Nl0sMTI5NTY6W1szNjk2OV0sMjU2XSwxMjk1NzpbWzIwNzc4XSwyNTZdLDEyOTU4OltbMjEzNjBdLDI1Nl0sMTI5NTk6W1syNzg4MF0sMjU2XSwxMjk2MDpbWzM4OTE3XSwyNTZdLDEyOTYxOltbMjAyNDFdLDI1Nl0sMTI5NjI6W1syMDg4OV0sMjU2XSwxMjk2MzpbWzI3NDkxXSwyNTZdLDEyOTY0OltbMTk5NzhdLDI1Nl0sMTI5NjU6W1syMDAxM10sMjU2XSwxMjk2NjpbWzE5OTc5XSwyNTZdLDEyOTY3OltbMjQwMzhdLDI1Nl0sMTI5Njg6W1syMTQ5MV0sMjU2XSwxMjk2OTpbWzIxMzA3XSwyNTZdLDEyOTcwOltbMjM0NDddLDI1Nl0sMTI5NzE6W1syMzM5OF0sMjU2XSwxMjk3MjpbWzMwNDM1XSwyNTZdLDEyOTczOltbMjAyMjVdLDI1Nl0sMTI5NzQ6W1szNjAzOV0sMjU2XSwxMjk3NTpbWzIxMzMyXSwyNTZdLDEyOTc2OltbMjI4MTJdLDI1Nl0sMTI5Nzc6W1s1MSw1NF0sMjU2XSwxMjk3ODpbWzUxLDU1XSwyNTZdLDEyOTc5OltbNTEsNTZdLDI1Nl0sMTI5ODA6W1s1MSw1N10sMjU2XSwxMjk4MTpbWzUyLDQ4XSwyNTZdLDEyOTgyOltbNTIsNDldLDI1Nl0sMTI5ODM6W1s1Miw1MF0sMjU2XSwxMjk4NDpbWzUyLDUxXSwyNTZdLDEyOTg1OltbNTIsNTJdLDI1Nl0sMTI5ODY6W1s1Miw1M10sMjU2XSwxMjk4NzpbWzUyLDU0XSwyNTZdLDEyOTg4OltbNTIsNTVdLDI1Nl0sMTI5ODk6W1s1Miw1Nl0sMjU2XSwxMjk5MDpbWzUyLDU3XSwyNTZdLDEyOTkxOltbNTMsNDhdLDI1Nl0sMTI5OTI6W1s0OSwyNjM3Nl0sMjU2XSwxMjk5MzpbWzUwLDI2Mzc2XSwyNTZdLDEyOTk0OltbNTEsMjYzNzZdLDI1Nl0sMTI5OTU6W1s1MiwyNjM3Nl0sMjU2XSwxMjk5NjpbWzUzLDI2Mzc2XSwyNTZdLDEyOTk3OltbNTQsMjYzNzZdLDI1Nl0sMTI5OTg6W1s1NSwyNjM3Nl0sMjU2XSwxMjk5OTpbWzU2LDI2Mzc2XSwyNTZdLDEzMDAwOltbNTcsMjYzNzZdLDI1Nl0sMTMwMDE6W1s0OSw0OCwyNjM3Nl0sMjU2XSwxMzAwMjpbWzQ5LDQ5LDI2Mzc2XSwyNTZdLDEzMDAzOltbNDksNTAsMjYzNzZdLDI1Nl0sMTMwMDQ6W1s3MiwxMDNdLDI1Nl0sMTMwMDU6W1sxMDEsMTE0LDEwM10sMjU2XSwxMzAwNjpbWzEwMSw4Nl0sMjU2XSwxMzAwNzpbWzc2LDg0LDY4XSwyNTZdLDEzMDA4OltbMTI0NTBdLDI1Nl0sMTMwMDk6W1sxMjQ1Ml0sMjU2XSwxMzAxMDpbWzEyNDU0XSwyNTZdLDEzMDExOltbMTI0NTZdLDI1Nl0sMTMwMTI6W1sxMjQ1OF0sMjU2XSwxMzAxMzpbWzEyNDU5XSwyNTZdLDEzMDE0OltbMTI0NjFdLDI1Nl0sMTMwMTU6W1sxMjQ2M10sMjU2XSwxMzAxNjpbWzEyNDY1XSwyNTZdLDEzMDE3OltbMTI0NjddLDI1Nl0sMTMwMTg6W1sxMjQ2OV0sMjU2XSwxMzAxOTpbWzEyNDcxXSwyNTZdLDEzMDIwOltbMTI0NzNdLDI1Nl0sMTMwMjE6W1sxMjQ3NV0sMjU2XSwxMzAyMjpbWzEyNDc3XSwyNTZdLDEzMDIzOltbMTI0NzldLDI1Nl0sMTMwMjQ6W1sxMjQ4MV0sMjU2XSwxMzAyNTpbWzEyNDg0XSwyNTZdLDEzMDI2OltbMTI0ODZdLDI1Nl0sMTMwMjc6W1sxMjQ4OF0sMjU2XSwxMzAyODpbWzEyNDkwXSwyNTZdLDEzMDI5OltbMTI0OTFdLDI1Nl0sMTMwMzA6W1sxMjQ5Ml0sMjU2XSwxMzAzMTpbWzEyNDkzXSwyNTZdLDEzMDMyOltbMTI0OTRdLDI1Nl0sMTMwMzM6W1sxMjQ5NV0sMjU2XSwxMzAzNDpbWzEyNDk4XSwyNTZdLDEzMDM1OltbMTI1MDFdLDI1Nl0sMTMwMzY6W1sxMjUwNF0sMjU2XSwxMzAzNzpbWzEyNTA3XSwyNTZdLDEzMDM4OltbMTI1MTBdLDI1Nl0sMTMwMzk6W1sxMjUxMV0sMjU2XSwxMzA0MDpbWzEyNTEyXSwyNTZdLDEzMDQxOltbMTI1MTNdLDI1Nl0sMTMwNDI6W1sxMjUxNF0sMjU2XSwxMzA0MzpbWzEyNTE2XSwyNTZdLDEzMDQ0OltbMTI1MThdLDI1Nl0sMTMwNDU6W1sxMjUyMF0sMjU2XSwxMzA0NjpbWzEyNTIxXSwyNTZdLDEzMDQ3OltbMTI1MjJdLDI1Nl0sMTMwNDg6W1sxMjUyM10sMjU2XSwxMzA0OTpbWzEyNTI0XSwyNTZdLDEzMDUwOltbMTI1MjVdLDI1Nl0sMTMwNTE6W1sxMjUyN10sMjU2XSwxMzA1MjpbWzEyNTI4XSwyNTZdLDEzMDUzOltbMTI1MjldLDI1Nl0sMTMwNTQ6W1sxMjUzMF0sMjU2XX0sXG4xMzA1Njp7MTMwNTY6W1sxMjQ1MCwxMjQ5NywxMjU0MCwxMjQ4OF0sMjU2XSwxMzA1NzpbWzEyNDUwLDEyNTIzLDEyNTAxLDEyNDQ5XSwyNTZdLDEzMDU4OltbMTI0NTAsMTI1MzEsMTI1MDYsMTI0NTBdLDI1Nl0sMTMwNTk6W1sxMjQ1MCwxMjU0MCwxMjUyM10sMjU2XSwxMzA2MDpbWzEyNDUyLDEyNDkxLDEyNTMxLDEyNDY0XSwyNTZdLDEzMDYxOltbMTI0NTIsMTI1MzEsMTI0ODFdLDI1Nl0sMTMwNjI6W1sxMjQ1NCwxMjQ1NywxMjUzMV0sMjU2XSwxMzA2MzpbWzEyNDU2LDEyNDczLDEyNDYzLDEyNTQwLDEyNDg5XSwyNTZdLDEzMDY0OltbMTI0NTYsMTI1NDAsMTI0NTksMTI1NDBdLDI1Nl0sMTMwNjU6W1sxMjQ1OCwxMjUzMSwxMjQ3M10sMjU2XSwxMzA2NjpbWzEyNDU4LDEyNTQwLDEyNTEyXSwyNTZdLDEzMDY3OltbMTI0NTksMTI0NTIsMTI1MjJdLDI1Nl0sMTMwNjg6W1sxMjQ1OSwxMjUyMSwxMjQ4MywxMjQ4OF0sMjU2XSwxMzA2OTpbWzEyNDU5LDEyNTI1LDEyNTIyLDEyNTQwXSwyNTZdLDEzMDcwOltbMTI0NjAsMTI1MjUsMTI1MzFdLDI1Nl0sMTMwNzE6W1sxMjQ2MCwxMjUzMSwxMjUxMF0sMjU2XSwxMzA3MjpbWzEyNDYyLDEyNDYwXSwyNTZdLDEzMDczOltbMTI0NjIsMTI0OTEsMTI1NDBdLDI1Nl0sMTMwNzQ6W1sxMjQ2MSwxMjUxNywxMjUyMiwxMjU0MF0sMjU2XSwxMzA3NTpbWzEyNDYyLDEyNTIzLDEyNDgwLDEyNTQwXSwyNTZdLDEzMDc2OltbMTI0NjEsMTI1MjVdLDI1Nl0sMTMwNzc6W1sxMjQ2MSwxMjUyNSwxMjQ2NCwxMjUyMSwxMjUxMl0sMjU2XSwxMzA3ODpbWzEyNDYxLDEyNTI1LDEyNTEzLDEyNTQwLDEyNDg4LDEyNTIzXSwyNTZdLDEzMDc5OltbMTI0NjEsMTI1MjUsMTI1MjcsMTI0ODMsMTI0ODhdLDI1Nl0sMTMwODA6W1sxMjQ2NCwxMjUyMSwxMjUxMl0sMjU2XSwxMzA4MTpbWzEyNDY0LDEyNTIxLDEyNTEyLDEyNDg4LDEyNTMxXSwyNTZdLDEzMDgyOltbMTI0NjMsMTI1MjMsMTI0NzYsMTI0NTIsMTI1MjVdLDI1Nl0sMTMwODM6W1sxMjQ2MywxMjUyNSwxMjU0MCwxMjQ5M10sMjU2XSwxMzA4NDpbWzEyNDY1LDEyNTQwLDEyNDczXSwyNTZdLDEzMDg1OltbMTI0NjcsMTI1MjMsMTI0OTBdLDI1Nl0sMTMwODY6W1sxMjQ2NywxMjU0MCwxMjUwOV0sMjU2XSwxMzA4NzpbWzEyNDY5LDEyNDUyLDEyNDYzLDEyNTIzXSwyNTZdLDEzMDg4OltbMTI0NjksMTI1MzEsMTI0ODEsMTI1NDAsMTI1MTJdLDI1Nl0sMTMwODk6W1sxMjQ3MSwxMjUyMiwxMjUzMSwxMjQ2NF0sMjU2XSwxMzA5MDpbWzEyNDc1LDEyNTMxLDEyNDgxXSwyNTZdLDEzMDkxOltbMTI0NzUsMTI1MzEsMTI0ODhdLDI1Nl0sMTMwOTI6W1sxMjQ4MCwxMjU0MCwxMjQ3M10sMjU2XSwxMzA5MzpbWzEyNDg3LDEyNDcxXSwyNTZdLDEzMDk0OltbMTI0ODksMTI1MjNdLDI1Nl0sMTMwOTU6W1sxMjQ4OCwxMjUzMV0sMjU2XSwxMzA5NjpbWzEyNDkwLDEyNDk0XSwyNTZdLDEzMDk3OltbMTI0OTQsMTI0ODMsMTI0ODhdLDI1Nl0sMTMwOTg6W1sxMjQ5NSwxMjQ1MiwxMjQ4NF0sMjU2XSwxMzA5OTpbWzEyNDk3LDEyNTQwLDEyNDc1LDEyNTMxLDEyNDg4XSwyNTZdLDEzMTAwOltbMTI0OTcsMTI1NDAsMTI0ODRdLDI1Nl0sMTMxMDE6W1sxMjQ5NiwxMjU0MCwxMjUyNCwxMjUyM10sMjU2XSwxMzEwMjpbWzEyNTAwLDEyNDUwLDEyNDczLDEyNDg4LDEyNTIzXSwyNTZdLDEzMTAzOltbMTI1MDAsMTI0NjMsMTI1MjNdLDI1Nl0sMTMxMDQ6W1sxMjUwMCwxMjQ2N10sMjU2XSwxMzEwNTpbWzEyNDk5LDEyNTIzXSwyNTZdLDEzMTA2OltbMTI1MDEsMTI0NDksMTI1MjEsMTI0ODMsMTI0ODldLDI1Nl0sMTMxMDc6W1sxMjUwMSwxMjQ1MSwxMjU0MCwxMjQ4OF0sMjU2XSwxMzEwODpbWzEyNTAyLDEyNDgzLDEyNDcxLDEyNDU1LDEyNTIzXSwyNTZdLDEzMTA5OltbMTI1MDEsMTI1MjEsMTI1MzFdLDI1Nl0sMTMxMTA6W1sxMjUwNCwxMjQ2MywxMjQ3OSwxMjU0MCwxMjUyM10sMjU2XSwxMzExMTpbWzEyNTA2LDEyNDc3XSwyNTZdLDEzMTEyOltbMTI1MDYsMTI0OTEsMTI0OThdLDI1Nl0sMTMxMTM6W1sxMjUwNCwxMjUyMywxMjQ4NF0sMjU2XSwxMzExNDpbWzEyNTA2LDEyNTMxLDEyNDczXSwyNTZdLDEzMTE1OltbMTI1MDYsMTI1NDAsMTI0NzJdLDI1Nl0sMTMxMTY6W1sxMjUwNSwxMjU0MCwxMjQ3OV0sMjU2XSwxMzExNzpbWzEyNTA5LDEyNDUyLDEyNTMxLDEyNDg4XSwyNTZdLDEzMTE4OltbMTI1MDgsMTI1MjMsMTI0ODhdLDI1Nl0sMTMxMTk6W1sxMjUwNywxMjUzMV0sMjU2XSwxMzEyMDpbWzEyNTA5LDEyNTMxLDEyNDg5XSwyNTZdLDEzMTIxOltbMTI1MDcsMTI1NDAsMTI1MjNdLDI1Nl0sMTMxMjI6W1sxMjUwNywxMjU0MCwxMjUzMV0sMjU2XSwxMzEyMzpbWzEyNTEwLDEyNDUyLDEyNDYzLDEyNTI1XSwyNTZdLDEzMTI0OltbMTI1MTAsMTI0NTIsMTI1MjNdLDI1Nl0sMTMxMjU6W1sxMjUxMCwxMjQ4MywxMjQ5NV0sMjU2XSwxMzEyNjpbWzEyNTEwLDEyNTIzLDEyNDYzXSwyNTZdLDEzMTI3OltbMTI1MTAsMTI1MzEsMTI0NzEsMTI1MTksMTI1MzFdLDI1Nl0sMTMxMjg6W1sxMjUxMSwxMjQ2MywxMjUyNSwxMjUzMV0sMjU2XSwxMzEyOTpbWzEyNTExLDEyNTIyXSwyNTZdLDEzMTMwOltbMTI1MTEsMTI1MjIsMTI0OTYsMTI1NDAsMTI1MjNdLDI1Nl0sMTMxMzE6W1sxMjUxMywxMjQ2MF0sMjU2XSwxMzEzMjpbWzEyNTEzLDEyNDYwLDEyNDg4LDEyNTMxXSwyNTZdLDEzMTMzOltbMTI1MTMsMTI1NDAsMTI0ODgsMTI1MjNdLDI1Nl0sMTMxMzQ6W1sxMjUxNiwxMjU0MCwxMjQ4OV0sMjU2XSwxMzEzNTpbWzEyNTE2LDEyNTQwLDEyNTIzXSwyNTZdLDEzMTM2OltbMTI1MTgsMTI0NTAsMTI1MzFdLDI1Nl0sMTMxMzc6W1sxMjUyMiwxMjQ4MywxMjQ4OCwxMjUyM10sMjU2XSwxMzEzODpbWzEyNTIyLDEyNTIxXSwyNTZdLDEzMTM5OltbMTI1MjMsMTI1MDAsMTI1NDBdLDI1Nl0sMTMxNDA6W1sxMjUyMywxMjU0MCwxMjUwMiwxMjUyM10sMjU2XSwxMzE0MTpbWzEyNTI0LDEyNTEyXSwyNTZdLDEzMTQyOltbMTI1MjQsMTI1MzEsMTI0ODgsMTI0NjYsMTI1MzFdLDI1Nl0sMTMxNDM6W1sxMjUyNywxMjQ4MywxMjQ4OF0sMjU2XSwxMzE0NDpbWzQ4LDI4ODU3XSwyNTZdLDEzMTQ1OltbNDksMjg4NTddLDI1Nl0sMTMxNDY6W1s1MCwyODg1N10sMjU2XSwxMzE0NzpbWzUxLDI4ODU3XSwyNTZdLDEzMTQ4OltbNTIsMjg4NTddLDI1Nl0sMTMxNDk6W1s1MywyODg1N10sMjU2XSwxMzE1MDpbWzU0LDI4ODU3XSwyNTZdLDEzMTUxOltbNTUsMjg4NTddLDI1Nl0sMTMxNTI6W1s1NiwyODg1N10sMjU2XSwxMzE1MzpbWzU3LDI4ODU3XSwyNTZdLDEzMTU0OltbNDksNDgsMjg4NTddLDI1Nl0sMTMxNTU6W1s0OSw0OSwyODg1N10sMjU2XSwxMzE1NjpbWzQ5LDUwLDI4ODU3XSwyNTZdLDEzMTU3OltbNDksNTEsMjg4NTddLDI1Nl0sMTMxNTg6W1s0OSw1MiwyODg1N10sMjU2XSwxMzE1OTpbWzQ5LDUzLDI4ODU3XSwyNTZdLDEzMTYwOltbNDksNTQsMjg4NTddLDI1Nl0sMTMxNjE6W1s0OSw1NSwyODg1N10sMjU2XSwxMzE2MjpbWzQ5LDU2LDI4ODU3XSwyNTZdLDEzMTYzOltbNDksNTcsMjg4NTddLDI1Nl0sMTMxNjQ6W1s1MCw0OCwyODg1N10sMjU2XSwxMzE2NTpbWzUwLDQ5LDI4ODU3XSwyNTZdLDEzMTY2OltbNTAsNTAsMjg4NTddLDI1Nl0sMTMxNjc6W1s1MCw1MSwyODg1N10sMjU2XSwxMzE2ODpbWzUwLDUyLDI4ODU3XSwyNTZdLDEzMTY5OltbMTA0LDgwLDk3XSwyNTZdLDEzMTcwOltbMTAwLDk3XSwyNTZdLDEzMTcxOltbNjUsODVdLDI1Nl0sMTMxNzI6W1s5OCw5NywxMTRdLDI1Nl0sMTMxNzM6W1sxMTEsODZdLDI1Nl0sMTMxNzQ6W1sxMTIsOTldLDI1Nl0sMTMxNzU6W1sxMDAsMTA5XSwyNTZdLDEzMTc2OltbMTAwLDEwOSwxNzhdLDI1Nl0sMTMxNzc6W1sxMDAsMTA5LDE3OV0sMjU2XSwxMzE3ODpbWzczLDg1XSwyNTZdLDEzMTc5OltbMjQxNzksMjUxMDRdLDI1Nl0sMTMxODA6W1syNjE1NywyMTY0NF0sMjU2XSwxMzE4MTpbWzIyODIzLDI3NDkxXSwyNTZdLDEzMTgyOltbMjYxMjYsMjc4MzVdLDI1Nl0sMTMxODM6W1syNjY2NiwyNDMzNSwyMDI1MCwzMTAzOF0sMjU2XSwxMzE4NDpbWzExMiw2NV0sMjU2XSwxMzE4NTpbWzExMCw2NV0sMjU2XSwxMzE4NjpbWzk1Niw2NV0sMjU2XSwxMzE4NzpbWzEwOSw2NV0sMjU2XSwxMzE4ODpbWzEwNyw2NV0sMjU2XSwxMzE4OTpbWzc1LDY2XSwyNTZdLDEzMTkwOltbNzcsNjZdLDI1Nl0sMTMxOTE6W1s3MSw2Nl0sMjU2XSwxMzE5MjpbWzk5LDk3LDEwOF0sMjU2XSwxMzE5MzpbWzEwNyw5OSw5NywxMDhdLDI1Nl0sMTMxOTQ6W1sxMTIsNzBdLDI1Nl0sMTMxOTU6W1sxMTAsNzBdLDI1Nl0sMTMxOTY6W1s5NTYsNzBdLDI1Nl0sMTMxOTc6W1s5NTYsMTAzXSwyNTZdLDEzMTk4OltbMTA5LDEwM10sMjU2XSwxMzE5OTpbWzEwNywxMDNdLDI1Nl0sMTMyMDA6W1s3MiwxMjJdLDI1Nl0sMTMyMDE6W1sxMDcsNzIsMTIyXSwyNTZdLDEzMjAyOltbNzcsNzIsMTIyXSwyNTZdLDEzMjAzOltbNzEsNzIsMTIyXSwyNTZdLDEzMjA0OltbODQsNzIsMTIyXSwyNTZdLDEzMjA1OltbOTU2LDg0NjddLDI1Nl0sMTMyMDY6W1sxMDksODQ2N10sMjU2XSwxMzIwNzpbWzEwMCw4NDY3XSwyNTZdLDEzMjA4OltbMTA3LDg0NjddLDI1Nl0sMTMyMDk6W1sxMDIsMTA5XSwyNTZdLDEzMjEwOltbMTEwLDEwOV0sMjU2XSwxMzIxMTpbWzk1NiwxMDldLDI1Nl0sMTMyMTI6W1sxMDksMTA5XSwyNTZdLDEzMjEzOltbOTksMTA5XSwyNTZdLDEzMjE0OltbMTA3LDEwOV0sMjU2XSwxMzIxNTpbWzEwOSwxMDksMTc4XSwyNTZdLDEzMjE2OltbOTksMTA5LDE3OF0sMjU2XSwxMzIxNzpbWzEwOSwxNzhdLDI1Nl0sMTMyMTg6W1sxMDcsMTA5LDE3OF0sMjU2XSwxMzIxOTpbWzEwOSwxMDksMTc5XSwyNTZdLDEzMjIwOltbOTksMTA5LDE3OV0sMjU2XSwxMzIyMTpbWzEwOSwxNzldLDI1Nl0sMTMyMjI6W1sxMDcsMTA5LDE3OV0sMjU2XSwxMzIyMzpbWzEwOSw4NzI1LDExNV0sMjU2XSwxMzIyNDpbWzEwOSw4NzI1LDExNSwxNzhdLDI1Nl0sMTMyMjU6W1s4MCw5N10sMjU2XSwxMzIyNjpbWzEwNyw4MCw5N10sMjU2XSwxMzIyNzpbWzc3LDgwLDk3XSwyNTZdLDEzMjI4OltbNzEsODAsOTddLDI1Nl0sMTMyMjk6W1sxMTQsOTcsMTAwXSwyNTZdLDEzMjMwOltbMTE0LDk3LDEwMCw4NzI1LDExNV0sMjU2XSwxMzIzMTpbWzExNCw5NywxMDAsODcyNSwxMTUsMTc4XSwyNTZdLDEzMjMyOltbMTEyLDExNV0sMjU2XSwxMzIzMzpbWzExMCwxMTVdLDI1Nl0sMTMyMzQ6W1s5NTYsMTE1XSwyNTZdLDEzMjM1OltbMTA5LDExNV0sMjU2XSwxMzIzNjpbWzExMiw4Nl0sMjU2XSwxMzIzNzpbWzExMCw4Nl0sMjU2XSwxMzIzODpbWzk1Niw4Nl0sMjU2XSwxMzIzOTpbWzEwOSw4Nl0sMjU2XSwxMzI0MDpbWzEwNyw4Nl0sMjU2XSwxMzI0MTpbWzc3LDg2XSwyNTZdLDEzMjQyOltbMTEyLDg3XSwyNTZdLDEzMjQzOltbMTEwLDg3XSwyNTZdLDEzMjQ0OltbOTU2LDg3XSwyNTZdLDEzMjQ1OltbMTA5LDg3XSwyNTZdLDEzMjQ2OltbMTA3LDg3XSwyNTZdLDEzMjQ3OltbNzcsODddLDI1Nl0sMTMyNDg6W1sxMDcsOTM3XSwyNTZdLDEzMjQ5OltbNzcsOTM3XSwyNTZdLDEzMjUwOltbOTcsNDYsMTA5LDQ2XSwyNTZdLDEzMjUxOltbNjYsMTEzXSwyNTZdLDEzMjUyOltbOTksOTldLDI1Nl0sMTMyNTM6W1s5OSwxMDBdLDI1Nl0sMTMyNTQ6W1s2Nyw4NzI1LDEwNywxMDNdLDI1Nl0sMTMyNTU6W1s2NywxMTEsNDZdLDI1Nl0sMTMyNTY6W1sxMDAsNjZdLDI1Nl0sMTMyNTc6W1s3MSwxMjFdLDI1Nl0sMTMyNTg6W1sxMDQsOTddLDI1Nl0sMTMyNTk6W1s3Miw4MF0sMjU2XSwxMzI2MDpbWzEwNSwxMTBdLDI1Nl0sMTMyNjE6W1s3NSw3NV0sMjU2XSwxMzI2MjpbWzc1LDc3XSwyNTZdLDEzMjYzOltbMTA3LDExNl0sMjU2XSwxMzI2NDpbWzEwOCwxMDldLDI1Nl0sMTMyNjU6W1sxMDgsMTEwXSwyNTZdLDEzMjY2OltbMTA4LDExMSwxMDNdLDI1Nl0sMTMyNjc6W1sxMDgsMTIwXSwyNTZdLDEzMjY4OltbMTA5LDk4XSwyNTZdLDEzMjY5OltbMTA5LDEwNSwxMDhdLDI1Nl0sMTMyNzA6W1sxMDksMTExLDEwOF0sMjU2XSwxMzI3MTpbWzgwLDcyXSwyNTZdLDEzMjcyOltbMTEyLDQ2LDEwOSw0Nl0sMjU2XSwxMzI3MzpbWzgwLDgwLDc3XSwyNTZdLDEzMjc0OltbODAsODJdLDI1Nl0sMTMyNzU6W1sxMTUsMTE0XSwyNTZdLDEzMjc2OltbODMsMTE4XSwyNTZdLDEzMjc3OltbODcsOThdLDI1Nl0sMTMyNzg6W1s4Niw4NzI1LDEwOV0sMjU2XSwxMzI3OTpbWzY1LDg3MjUsMTA5XSwyNTZdLDEzMjgwOltbNDksMjYwODVdLDI1Nl0sMTMyODE6W1s1MCwyNjA4NV0sMjU2XSwxMzI4MjpbWzUxLDI2MDg1XSwyNTZdLDEzMjgzOltbNTIsMjYwODVdLDI1Nl0sMTMyODQ6W1s1MywyNjA4NV0sMjU2XSwxMzI4NTpbWzU0LDI2MDg1XSwyNTZdLDEzMjg2OltbNTUsMjYwODVdLDI1Nl0sMTMyODc6W1s1NiwyNjA4NV0sMjU2XSwxMzI4ODpbWzU3LDI2MDg1XSwyNTZdLDEzMjg5OltbNDksNDgsMjYwODVdLDI1Nl0sMTMyOTA6W1s0OSw0OSwyNjA4NV0sMjU2XSwxMzI5MTpbWzQ5LDUwLDI2MDg1XSwyNTZdLDEzMjkyOltbNDksNTEsMjYwODVdLDI1Nl0sMTMyOTM6W1s0OSw1MiwyNjA4NV0sMjU2XSwxMzI5NDpbWzQ5LDUzLDI2MDg1XSwyNTZdLDEzMjk1OltbNDksNTQsMjYwODVdLDI1Nl0sMTMyOTY6W1s0OSw1NSwyNjA4NV0sMjU2XSwxMzI5NzpbWzQ5LDU2LDI2MDg1XSwyNTZdLDEzMjk4OltbNDksNTcsMjYwODVdLDI1Nl0sMTMyOTk6W1s1MCw0OCwyNjA4NV0sMjU2XSwxMzMwMDpbWzUwLDQ5LDI2MDg1XSwyNTZdLDEzMzAxOltbNTAsNTAsMjYwODVdLDI1Nl0sMTMzMDI6W1s1MCw1MSwyNjA4NV0sMjU2XSwxMzMwMzpbWzUwLDUyLDI2MDg1XSwyNTZdLDEzMzA0OltbNTAsNTMsMjYwODVdLDI1Nl0sMTMzMDU6W1s1MCw1NCwyNjA4NV0sMjU2XSwxMzMwNjpbWzUwLDU1LDI2MDg1XSwyNTZdLDEzMzA3OltbNTAsNTYsMjYwODVdLDI1Nl0sMTMzMDg6W1s1MCw1NywyNjA4NV0sMjU2XSwxMzMwOTpbWzUxLDQ4LDI2MDg1XSwyNTZdLDEzMzEwOltbNTEsNDksMjYwODVdLDI1Nl0sMTMzMTE6W1sxMDMsOTcsMTA4XSwyNTZdfSxcbjQyNDk2Ons0MjYwNzpbLDIzMF0sNDI2MTI6WywyMzBdLDQyNjEzOlssMjMwXSw0MjYxNDpbLDIzMF0sNDI2MTU6WywyMzBdLDQyNjE2OlssMjMwXSw0MjYxNzpbLDIzMF0sNDI2MTg6WywyMzBdLDQyNjE5OlssMjMwXSw0MjYyMDpbLDIzMF0sNDI2MjE6WywyMzBdLDQyNjU1OlssMjMwXSw0MjczNjpbLDIzMF0sNDI3Mzc6WywyMzBdfSxcbjQyNzUyOns0Mjg2NDpbWzQyODYzXSwyNTZdLDQzMDAwOltbMjk0XSwyNTZdLDQzMDAxOltbMzM5XSwyNTZdfSxcbjQzMDA4Ons0MzAxNDpbLDldLDQzMjA0OlssOV0sNDMyMzI6WywyMzBdLDQzMjMzOlssMjMwXSw0MzIzNDpbLDIzMF0sNDMyMzU6WywyMzBdLDQzMjM2OlssMjMwXSw0MzIzNzpbLDIzMF0sNDMyMzg6WywyMzBdLDQzMjM5OlssMjMwXSw0MzI0MDpbLDIzMF0sNDMyNDE6WywyMzBdLDQzMjQyOlssMjMwXSw0MzI0MzpbLDIzMF0sNDMyNDQ6WywyMzBdLDQzMjQ1OlssMjMwXSw0MzI0NjpbLDIzMF0sNDMyNDc6WywyMzBdLDQzMjQ4OlssMjMwXSw0MzI0OTpbLDIzMF19LFxuNDMyNjQ6ezQzMzA3OlssMjIwXSw0MzMwODpbLDIyMF0sNDMzMDk6WywyMjBdLDQzMzQ3OlssOV0sNDM0NDM6Wyw3XSw0MzQ1NjpbLDldfSxcbjQzNTIwOns0MzY5NjpbLDIzMF0sNDM2OTg6WywyMzBdLDQzNjk5OlssMjMwXSw0MzcwMDpbLDIyMF0sNDM3MDM6WywyMzBdLDQzNzA0OlssMjMwXSw0MzcxMDpbLDIzMF0sNDM3MTE6WywyMzBdLDQzNzEzOlssMjMwXSw0Mzc2NjpbLDldfSxcbjQzNzc2Ons0NDAxMzpbLDldfSxcbjUzNTA0OnsxMTkxMzQ6W1sxMTkxMjcsMTE5MTQxXSw1MTJdLDExOTEzNTpbWzExOTEyOCwxMTkxNDFdLDUxMl0sMTE5MTM2OltbMTE5MTM1LDExOTE1MF0sNTEyXSwxMTkxMzc6W1sxMTkxMzUsMTE5MTUxXSw1MTJdLDExOTEzODpbWzExOTEzNSwxMTkxNTJdLDUxMl0sMTE5MTM5OltbMTE5MTM1LDExOTE1M10sNTEyXSwxMTkxNDA6W1sxMTkxMzUsMTE5MTU0XSw1MTJdLDExOTE0MTpbLDIxNl0sMTE5MTQyOlssMjE2XSwxMTkxNDM6WywxXSwxMTkxNDQ6WywxXSwxMTkxNDU6WywxXSwxMTkxNDk6WywyMjZdLDExOTE1MDpbLDIxNl0sMTE5MTUxOlssMjE2XSwxMTkxNTI6WywyMTZdLDExOTE1MzpbLDIxNl0sMTE5MTU0OlssMjE2XSwxMTkxNjM6WywyMjBdLDExOTE2NDpbLDIyMF0sMTE5MTY1OlssMjIwXSwxMTkxNjY6WywyMjBdLDExOTE2NzpbLDIyMF0sMTE5MTY4OlssMjIwXSwxMTkxNjk6WywyMjBdLDExOTE3MDpbLDIyMF0sMTE5MTczOlssMjMwXSwxMTkxNzQ6WywyMzBdLDExOTE3NTpbLDIzMF0sMTE5MTc2OlssMjMwXSwxMTkxNzc6WywyMzBdLDExOTE3ODpbLDIyMF0sMTE5MTc5OlssMjIwXSwxMTkyMTA6WywyMzBdLDExOTIxMTpbLDIzMF0sMTE5MjEyOlssMjMwXSwxMTkyMTM6WywyMzBdLDExOTIyNzpbWzExOTIyNSwxMTkxNDFdLDUxMl0sMTE5MjI4OltbMTE5MjI2LDExOTE0MV0sNTEyXSwxMTkyMjk6W1sxMTkyMjcsMTE5MTUwXSw1MTJdLDExOTIzMDpbWzExOTIyOCwxMTkxNTBdLDUxMl0sMTE5MjMxOltbMTE5MjI3LDExOTE1MV0sNTEyXSwxMTkyMzI6W1sxMTkyMjgsMTE5MTUxXSw1MTJdfSxcbjUzNzYwOnsxMTkzNjI6WywyMzBdLDExOTM2MzpbLDIzMF0sMTE5MzY0OlssMjMwXX0sXG41NDI3Mjp7MTE5ODA4OltbNjVdLDI1Nl0sMTE5ODA5OltbNjZdLDI1Nl0sMTE5ODEwOltbNjddLDI1Nl0sMTE5ODExOltbNjhdLDI1Nl0sMTE5ODEyOltbNjldLDI1Nl0sMTE5ODEzOltbNzBdLDI1Nl0sMTE5ODE0OltbNzFdLDI1Nl0sMTE5ODE1OltbNzJdLDI1Nl0sMTE5ODE2OltbNzNdLDI1Nl0sMTE5ODE3OltbNzRdLDI1Nl0sMTE5ODE4OltbNzVdLDI1Nl0sMTE5ODE5OltbNzZdLDI1Nl0sMTE5ODIwOltbNzddLDI1Nl0sMTE5ODIxOltbNzhdLDI1Nl0sMTE5ODIyOltbNzldLDI1Nl0sMTE5ODIzOltbODBdLDI1Nl0sMTE5ODI0OltbODFdLDI1Nl0sMTE5ODI1OltbODJdLDI1Nl0sMTE5ODI2OltbODNdLDI1Nl0sMTE5ODI3OltbODRdLDI1Nl0sMTE5ODI4OltbODVdLDI1Nl0sMTE5ODI5OltbODZdLDI1Nl0sMTE5ODMwOltbODddLDI1Nl0sMTE5ODMxOltbODhdLDI1Nl0sMTE5ODMyOltbODldLDI1Nl0sMTE5ODMzOltbOTBdLDI1Nl0sMTE5ODM0OltbOTddLDI1Nl0sMTE5ODM1OltbOThdLDI1Nl0sMTE5ODM2OltbOTldLDI1Nl0sMTE5ODM3OltbMTAwXSwyNTZdLDExOTgzODpbWzEwMV0sMjU2XSwxMTk4Mzk6W1sxMDJdLDI1Nl0sMTE5ODQwOltbMTAzXSwyNTZdLDExOTg0MTpbWzEwNF0sMjU2XSwxMTk4NDI6W1sxMDVdLDI1Nl0sMTE5ODQzOltbMTA2XSwyNTZdLDExOTg0NDpbWzEwN10sMjU2XSwxMTk4NDU6W1sxMDhdLDI1Nl0sMTE5ODQ2OltbMTA5XSwyNTZdLDExOTg0NzpbWzExMF0sMjU2XSwxMTk4NDg6W1sxMTFdLDI1Nl0sMTE5ODQ5OltbMTEyXSwyNTZdLDExOTg1MDpbWzExM10sMjU2XSwxMTk4NTE6W1sxMTRdLDI1Nl0sMTE5ODUyOltbMTE1XSwyNTZdLDExOTg1MzpbWzExNl0sMjU2XSwxMTk4NTQ6W1sxMTddLDI1Nl0sMTE5ODU1OltbMTE4XSwyNTZdLDExOTg1NjpbWzExOV0sMjU2XSwxMTk4NTc6W1sxMjBdLDI1Nl0sMTE5ODU4OltbMTIxXSwyNTZdLDExOTg1OTpbWzEyMl0sMjU2XSwxMTk4NjA6W1s2NV0sMjU2XSwxMTk4NjE6W1s2Nl0sMjU2XSwxMTk4NjI6W1s2N10sMjU2XSwxMTk4NjM6W1s2OF0sMjU2XSwxMTk4NjQ6W1s2OV0sMjU2XSwxMTk4NjU6W1s3MF0sMjU2XSwxMTk4NjY6W1s3MV0sMjU2XSwxMTk4Njc6W1s3Ml0sMjU2XSwxMTk4Njg6W1s3M10sMjU2XSwxMTk4Njk6W1s3NF0sMjU2XSwxMTk4NzA6W1s3NV0sMjU2XSwxMTk4NzE6W1s3Nl0sMjU2XSwxMTk4NzI6W1s3N10sMjU2XSwxMTk4NzM6W1s3OF0sMjU2XSwxMTk4NzQ6W1s3OV0sMjU2XSwxMTk4NzU6W1s4MF0sMjU2XSwxMTk4NzY6W1s4MV0sMjU2XSwxMTk4Nzc6W1s4Ml0sMjU2XSwxMTk4Nzg6W1s4M10sMjU2XSwxMTk4Nzk6W1s4NF0sMjU2XSwxMTk4ODA6W1s4NV0sMjU2XSwxMTk4ODE6W1s4Nl0sMjU2XSwxMTk4ODI6W1s4N10sMjU2XSwxMTk4ODM6W1s4OF0sMjU2XSwxMTk4ODQ6W1s4OV0sMjU2XSwxMTk4ODU6W1s5MF0sMjU2XSwxMTk4ODY6W1s5N10sMjU2XSwxMTk4ODc6W1s5OF0sMjU2XSwxMTk4ODg6W1s5OV0sMjU2XSwxMTk4ODk6W1sxMDBdLDI1Nl0sMTE5ODkwOltbMTAxXSwyNTZdLDExOTg5MTpbWzEwMl0sMjU2XSwxMTk4OTI6W1sxMDNdLDI1Nl0sMTE5ODk0OltbMTA1XSwyNTZdLDExOTg5NTpbWzEwNl0sMjU2XSwxMTk4OTY6W1sxMDddLDI1Nl0sMTE5ODk3OltbMTA4XSwyNTZdLDExOTg5ODpbWzEwOV0sMjU2XSwxMTk4OTk6W1sxMTBdLDI1Nl0sMTE5OTAwOltbMTExXSwyNTZdLDExOTkwMTpbWzExMl0sMjU2XSwxMTk5MDI6W1sxMTNdLDI1Nl0sMTE5OTAzOltbMTE0XSwyNTZdLDExOTkwNDpbWzExNV0sMjU2XSwxMTk5MDU6W1sxMTZdLDI1Nl0sMTE5OTA2OltbMTE3XSwyNTZdLDExOTkwNzpbWzExOF0sMjU2XSwxMTk5MDg6W1sxMTldLDI1Nl0sMTE5OTA5OltbMTIwXSwyNTZdLDExOTkxMDpbWzEyMV0sMjU2XSwxMTk5MTE6W1sxMjJdLDI1Nl0sMTE5OTEyOltbNjVdLDI1Nl0sMTE5OTEzOltbNjZdLDI1Nl0sMTE5OTE0OltbNjddLDI1Nl0sMTE5OTE1OltbNjhdLDI1Nl0sMTE5OTE2OltbNjldLDI1Nl0sMTE5OTE3OltbNzBdLDI1Nl0sMTE5OTE4OltbNzFdLDI1Nl0sMTE5OTE5OltbNzJdLDI1Nl0sMTE5OTIwOltbNzNdLDI1Nl0sMTE5OTIxOltbNzRdLDI1Nl0sMTE5OTIyOltbNzVdLDI1Nl0sMTE5OTIzOltbNzZdLDI1Nl0sMTE5OTI0OltbNzddLDI1Nl0sMTE5OTI1OltbNzhdLDI1Nl0sMTE5OTI2OltbNzldLDI1Nl0sMTE5OTI3OltbODBdLDI1Nl0sMTE5OTI4OltbODFdLDI1Nl0sMTE5OTI5OltbODJdLDI1Nl0sMTE5OTMwOltbODNdLDI1Nl0sMTE5OTMxOltbODRdLDI1Nl0sMTE5OTMyOltbODVdLDI1Nl0sMTE5OTMzOltbODZdLDI1Nl0sMTE5OTM0OltbODddLDI1Nl0sMTE5OTM1OltbODhdLDI1Nl0sMTE5OTM2OltbODldLDI1Nl0sMTE5OTM3OltbOTBdLDI1Nl0sMTE5OTM4OltbOTddLDI1Nl0sMTE5OTM5OltbOThdLDI1Nl0sMTE5OTQwOltbOTldLDI1Nl0sMTE5OTQxOltbMTAwXSwyNTZdLDExOTk0MjpbWzEwMV0sMjU2XSwxMTk5NDM6W1sxMDJdLDI1Nl0sMTE5OTQ0OltbMTAzXSwyNTZdLDExOTk0NTpbWzEwNF0sMjU2XSwxMTk5NDY6W1sxMDVdLDI1Nl0sMTE5OTQ3OltbMTA2XSwyNTZdLDExOTk0ODpbWzEwN10sMjU2XSwxMTk5NDk6W1sxMDhdLDI1Nl0sMTE5OTUwOltbMTA5XSwyNTZdLDExOTk1MTpbWzExMF0sMjU2XSwxMTk5NTI6W1sxMTFdLDI1Nl0sMTE5OTUzOltbMTEyXSwyNTZdLDExOTk1NDpbWzExM10sMjU2XSwxMTk5NTU6W1sxMTRdLDI1Nl0sMTE5OTU2OltbMTE1XSwyNTZdLDExOTk1NzpbWzExNl0sMjU2XSwxMTk5NTg6W1sxMTddLDI1Nl0sMTE5OTU5OltbMTE4XSwyNTZdLDExOTk2MDpbWzExOV0sMjU2XSwxMTk5NjE6W1sxMjBdLDI1Nl0sMTE5OTYyOltbMTIxXSwyNTZdLDExOTk2MzpbWzEyMl0sMjU2XSwxMTk5NjQ6W1s2NV0sMjU2XSwxMTk5NjY6W1s2N10sMjU2XSwxMTk5Njc6W1s2OF0sMjU2XSwxMTk5NzA6W1s3MV0sMjU2XSwxMTk5NzM6W1s3NF0sMjU2XSwxMTk5NzQ6W1s3NV0sMjU2XSwxMTk5Nzc6W1s3OF0sMjU2XSwxMTk5Nzg6W1s3OV0sMjU2XSwxMTk5Nzk6W1s4MF0sMjU2XSwxMTk5ODA6W1s4MV0sMjU2XSwxMTk5ODI6W1s4M10sMjU2XSwxMTk5ODM6W1s4NF0sMjU2XSwxMTk5ODQ6W1s4NV0sMjU2XSwxMTk5ODU6W1s4Nl0sMjU2XSwxMTk5ODY6W1s4N10sMjU2XSwxMTk5ODc6W1s4OF0sMjU2XSwxMTk5ODg6W1s4OV0sMjU2XSwxMTk5ODk6W1s5MF0sMjU2XSwxMTk5OTA6W1s5N10sMjU2XSwxMTk5OTE6W1s5OF0sMjU2XSwxMTk5OTI6W1s5OV0sMjU2XSwxMTk5OTM6W1sxMDBdLDI1Nl0sMTE5OTk1OltbMTAyXSwyNTZdLDExOTk5NzpbWzEwNF0sMjU2XSwxMTk5OTg6W1sxMDVdLDI1Nl0sMTE5OTk5OltbMTA2XSwyNTZdLDEyMDAwMDpbWzEwN10sMjU2XSwxMjAwMDE6W1sxMDhdLDI1Nl0sMTIwMDAyOltbMTA5XSwyNTZdLDEyMDAwMzpbWzExMF0sMjU2XSwxMjAwMDU6W1sxMTJdLDI1Nl0sMTIwMDA2OltbMTEzXSwyNTZdLDEyMDAwNzpbWzExNF0sMjU2XSwxMjAwMDg6W1sxMTVdLDI1Nl0sMTIwMDA5OltbMTE2XSwyNTZdLDEyMDAxMDpbWzExN10sMjU2XSwxMjAwMTE6W1sxMThdLDI1Nl0sMTIwMDEyOltbMTE5XSwyNTZdLDEyMDAxMzpbWzEyMF0sMjU2XSwxMjAwMTQ6W1sxMjFdLDI1Nl0sMTIwMDE1OltbMTIyXSwyNTZdLDEyMDAxNjpbWzY1XSwyNTZdLDEyMDAxNzpbWzY2XSwyNTZdLDEyMDAxODpbWzY3XSwyNTZdLDEyMDAxOTpbWzY4XSwyNTZdLDEyMDAyMDpbWzY5XSwyNTZdLDEyMDAyMTpbWzcwXSwyNTZdLDEyMDAyMjpbWzcxXSwyNTZdLDEyMDAyMzpbWzcyXSwyNTZdLDEyMDAyNDpbWzczXSwyNTZdLDEyMDAyNTpbWzc0XSwyNTZdLDEyMDAyNjpbWzc1XSwyNTZdLDEyMDAyNzpbWzc2XSwyNTZdLDEyMDAyODpbWzc3XSwyNTZdLDEyMDAyOTpbWzc4XSwyNTZdLDEyMDAzMDpbWzc5XSwyNTZdLDEyMDAzMTpbWzgwXSwyNTZdLDEyMDAzMjpbWzgxXSwyNTZdLDEyMDAzMzpbWzgyXSwyNTZdLDEyMDAzNDpbWzgzXSwyNTZdLDEyMDAzNTpbWzg0XSwyNTZdLDEyMDAzNjpbWzg1XSwyNTZdLDEyMDAzNzpbWzg2XSwyNTZdLDEyMDAzODpbWzg3XSwyNTZdLDEyMDAzOTpbWzg4XSwyNTZdLDEyMDA0MDpbWzg5XSwyNTZdLDEyMDA0MTpbWzkwXSwyNTZdLDEyMDA0MjpbWzk3XSwyNTZdLDEyMDA0MzpbWzk4XSwyNTZdLDEyMDA0NDpbWzk5XSwyNTZdLDEyMDA0NTpbWzEwMF0sMjU2XSwxMjAwNDY6W1sxMDFdLDI1Nl0sMTIwMDQ3OltbMTAyXSwyNTZdLDEyMDA0ODpbWzEwM10sMjU2XSwxMjAwNDk6W1sxMDRdLDI1Nl0sMTIwMDUwOltbMTA1XSwyNTZdLDEyMDA1MTpbWzEwNl0sMjU2XSwxMjAwNTI6W1sxMDddLDI1Nl0sMTIwMDUzOltbMTA4XSwyNTZdLDEyMDA1NDpbWzEwOV0sMjU2XSwxMjAwNTU6W1sxMTBdLDI1Nl0sMTIwMDU2OltbMTExXSwyNTZdLDEyMDA1NzpbWzExMl0sMjU2XSwxMjAwNTg6W1sxMTNdLDI1Nl0sMTIwMDU5OltbMTE0XSwyNTZdLDEyMDA2MDpbWzExNV0sMjU2XSwxMjAwNjE6W1sxMTZdLDI1Nl0sMTIwMDYyOltbMTE3XSwyNTZdLDEyMDA2MzpbWzExOF0sMjU2XX0sXG41NDUyODp7MTIwMDY0OltbMTE5XSwyNTZdLDEyMDA2NTpbWzEyMF0sMjU2XSwxMjAwNjY6W1sxMjFdLDI1Nl0sMTIwMDY3OltbMTIyXSwyNTZdLDEyMDA2ODpbWzY1XSwyNTZdLDEyMDA2OTpbWzY2XSwyNTZdLDEyMDA3MTpbWzY4XSwyNTZdLDEyMDA3MjpbWzY5XSwyNTZdLDEyMDA3MzpbWzcwXSwyNTZdLDEyMDA3NDpbWzcxXSwyNTZdLDEyMDA3NzpbWzc0XSwyNTZdLDEyMDA3ODpbWzc1XSwyNTZdLDEyMDA3OTpbWzc2XSwyNTZdLDEyMDA4MDpbWzc3XSwyNTZdLDEyMDA4MTpbWzc4XSwyNTZdLDEyMDA4MjpbWzc5XSwyNTZdLDEyMDA4MzpbWzgwXSwyNTZdLDEyMDA4NDpbWzgxXSwyNTZdLDEyMDA4NjpbWzgzXSwyNTZdLDEyMDA4NzpbWzg0XSwyNTZdLDEyMDA4ODpbWzg1XSwyNTZdLDEyMDA4OTpbWzg2XSwyNTZdLDEyMDA5MDpbWzg3XSwyNTZdLDEyMDA5MTpbWzg4XSwyNTZdLDEyMDA5MjpbWzg5XSwyNTZdLDEyMDA5NDpbWzk3XSwyNTZdLDEyMDA5NTpbWzk4XSwyNTZdLDEyMDA5NjpbWzk5XSwyNTZdLDEyMDA5NzpbWzEwMF0sMjU2XSwxMjAwOTg6W1sxMDFdLDI1Nl0sMTIwMDk5OltbMTAyXSwyNTZdLDEyMDEwMDpbWzEwM10sMjU2XSwxMjAxMDE6W1sxMDRdLDI1Nl0sMTIwMTAyOltbMTA1XSwyNTZdLDEyMDEwMzpbWzEwNl0sMjU2XSwxMjAxMDQ6W1sxMDddLDI1Nl0sMTIwMTA1OltbMTA4XSwyNTZdLDEyMDEwNjpbWzEwOV0sMjU2XSwxMjAxMDc6W1sxMTBdLDI1Nl0sMTIwMTA4OltbMTExXSwyNTZdLDEyMDEwOTpbWzExMl0sMjU2XSwxMjAxMTA6W1sxMTNdLDI1Nl0sMTIwMTExOltbMTE0XSwyNTZdLDEyMDExMjpbWzExNV0sMjU2XSwxMjAxMTM6W1sxMTZdLDI1Nl0sMTIwMTE0OltbMTE3XSwyNTZdLDEyMDExNTpbWzExOF0sMjU2XSwxMjAxMTY6W1sxMTldLDI1Nl0sMTIwMTE3OltbMTIwXSwyNTZdLDEyMDExODpbWzEyMV0sMjU2XSwxMjAxMTk6W1sxMjJdLDI1Nl0sMTIwMTIwOltbNjVdLDI1Nl0sMTIwMTIxOltbNjZdLDI1Nl0sMTIwMTIzOltbNjhdLDI1Nl0sMTIwMTI0OltbNjldLDI1Nl0sMTIwMTI1OltbNzBdLDI1Nl0sMTIwMTI2OltbNzFdLDI1Nl0sMTIwMTI4OltbNzNdLDI1Nl0sMTIwMTI5OltbNzRdLDI1Nl0sMTIwMTMwOltbNzVdLDI1Nl0sMTIwMTMxOltbNzZdLDI1Nl0sMTIwMTMyOltbNzddLDI1Nl0sMTIwMTM0OltbNzldLDI1Nl0sMTIwMTM4OltbODNdLDI1Nl0sMTIwMTM5OltbODRdLDI1Nl0sMTIwMTQwOltbODVdLDI1Nl0sMTIwMTQxOltbODZdLDI1Nl0sMTIwMTQyOltbODddLDI1Nl0sMTIwMTQzOltbODhdLDI1Nl0sMTIwMTQ0OltbODldLDI1Nl0sMTIwMTQ2OltbOTddLDI1Nl0sMTIwMTQ3OltbOThdLDI1Nl0sMTIwMTQ4OltbOTldLDI1Nl0sMTIwMTQ5OltbMTAwXSwyNTZdLDEyMDE1MDpbWzEwMV0sMjU2XSwxMjAxNTE6W1sxMDJdLDI1Nl0sMTIwMTUyOltbMTAzXSwyNTZdLDEyMDE1MzpbWzEwNF0sMjU2XSwxMjAxNTQ6W1sxMDVdLDI1Nl0sMTIwMTU1OltbMTA2XSwyNTZdLDEyMDE1NjpbWzEwN10sMjU2XSwxMjAxNTc6W1sxMDhdLDI1Nl0sMTIwMTU4OltbMTA5XSwyNTZdLDEyMDE1OTpbWzExMF0sMjU2XSwxMjAxNjA6W1sxMTFdLDI1Nl0sMTIwMTYxOltbMTEyXSwyNTZdLDEyMDE2MjpbWzExM10sMjU2XSwxMjAxNjM6W1sxMTRdLDI1Nl0sMTIwMTY0OltbMTE1XSwyNTZdLDEyMDE2NTpbWzExNl0sMjU2XSwxMjAxNjY6W1sxMTddLDI1Nl0sMTIwMTY3OltbMTE4XSwyNTZdLDEyMDE2ODpbWzExOV0sMjU2XSwxMjAxNjk6W1sxMjBdLDI1Nl0sMTIwMTcwOltbMTIxXSwyNTZdLDEyMDE3MTpbWzEyMl0sMjU2XSwxMjAxNzI6W1s2NV0sMjU2XSwxMjAxNzM6W1s2Nl0sMjU2XSwxMjAxNzQ6W1s2N10sMjU2XSwxMjAxNzU6W1s2OF0sMjU2XSwxMjAxNzY6W1s2OV0sMjU2XSwxMjAxNzc6W1s3MF0sMjU2XSwxMjAxNzg6W1s3MV0sMjU2XSwxMjAxNzk6W1s3Ml0sMjU2XSwxMjAxODA6W1s3M10sMjU2XSwxMjAxODE6W1s3NF0sMjU2XSwxMjAxODI6W1s3NV0sMjU2XSwxMjAxODM6W1s3Nl0sMjU2XSwxMjAxODQ6W1s3N10sMjU2XSwxMjAxODU6W1s3OF0sMjU2XSwxMjAxODY6W1s3OV0sMjU2XSwxMjAxODc6W1s4MF0sMjU2XSwxMjAxODg6W1s4MV0sMjU2XSwxMjAxODk6W1s4Ml0sMjU2XSwxMjAxOTA6W1s4M10sMjU2XSwxMjAxOTE6W1s4NF0sMjU2XSwxMjAxOTI6W1s4NV0sMjU2XSwxMjAxOTM6W1s4Nl0sMjU2XSwxMjAxOTQ6W1s4N10sMjU2XSwxMjAxOTU6W1s4OF0sMjU2XSwxMjAxOTY6W1s4OV0sMjU2XSwxMjAxOTc6W1s5MF0sMjU2XSwxMjAxOTg6W1s5N10sMjU2XSwxMjAxOTk6W1s5OF0sMjU2XSwxMjAyMDA6W1s5OV0sMjU2XSwxMjAyMDE6W1sxMDBdLDI1Nl0sMTIwMjAyOltbMTAxXSwyNTZdLDEyMDIwMzpbWzEwMl0sMjU2XSwxMjAyMDQ6W1sxMDNdLDI1Nl0sMTIwMjA1OltbMTA0XSwyNTZdLDEyMDIwNjpbWzEwNV0sMjU2XSwxMjAyMDc6W1sxMDZdLDI1Nl0sMTIwMjA4OltbMTA3XSwyNTZdLDEyMDIwOTpbWzEwOF0sMjU2XSwxMjAyMTA6W1sxMDldLDI1Nl0sMTIwMjExOltbMTEwXSwyNTZdLDEyMDIxMjpbWzExMV0sMjU2XSwxMjAyMTM6W1sxMTJdLDI1Nl0sMTIwMjE0OltbMTEzXSwyNTZdLDEyMDIxNTpbWzExNF0sMjU2XSwxMjAyMTY6W1sxMTVdLDI1Nl0sMTIwMjE3OltbMTE2XSwyNTZdLDEyMDIxODpbWzExN10sMjU2XSwxMjAyMTk6W1sxMThdLDI1Nl0sMTIwMjIwOltbMTE5XSwyNTZdLDEyMDIyMTpbWzEyMF0sMjU2XSwxMjAyMjI6W1sxMjFdLDI1Nl0sMTIwMjIzOltbMTIyXSwyNTZdLDEyMDIyNDpbWzY1XSwyNTZdLDEyMDIyNTpbWzY2XSwyNTZdLDEyMDIyNjpbWzY3XSwyNTZdLDEyMDIyNzpbWzY4XSwyNTZdLDEyMDIyODpbWzY5XSwyNTZdLDEyMDIyOTpbWzcwXSwyNTZdLDEyMDIzMDpbWzcxXSwyNTZdLDEyMDIzMTpbWzcyXSwyNTZdLDEyMDIzMjpbWzczXSwyNTZdLDEyMDIzMzpbWzc0XSwyNTZdLDEyMDIzNDpbWzc1XSwyNTZdLDEyMDIzNTpbWzc2XSwyNTZdLDEyMDIzNjpbWzc3XSwyNTZdLDEyMDIzNzpbWzc4XSwyNTZdLDEyMDIzODpbWzc5XSwyNTZdLDEyMDIzOTpbWzgwXSwyNTZdLDEyMDI0MDpbWzgxXSwyNTZdLDEyMDI0MTpbWzgyXSwyNTZdLDEyMDI0MjpbWzgzXSwyNTZdLDEyMDI0MzpbWzg0XSwyNTZdLDEyMDI0NDpbWzg1XSwyNTZdLDEyMDI0NTpbWzg2XSwyNTZdLDEyMDI0NjpbWzg3XSwyNTZdLDEyMDI0NzpbWzg4XSwyNTZdLDEyMDI0ODpbWzg5XSwyNTZdLDEyMDI0OTpbWzkwXSwyNTZdLDEyMDI1MDpbWzk3XSwyNTZdLDEyMDI1MTpbWzk4XSwyNTZdLDEyMDI1MjpbWzk5XSwyNTZdLDEyMDI1MzpbWzEwMF0sMjU2XSwxMjAyNTQ6W1sxMDFdLDI1Nl0sMTIwMjU1OltbMTAyXSwyNTZdLDEyMDI1NjpbWzEwM10sMjU2XSwxMjAyNTc6W1sxMDRdLDI1Nl0sMTIwMjU4OltbMTA1XSwyNTZdLDEyMDI1OTpbWzEwNl0sMjU2XSwxMjAyNjA6W1sxMDddLDI1Nl0sMTIwMjYxOltbMTA4XSwyNTZdLDEyMDI2MjpbWzEwOV0sMjU2XSwxMjAyNjM6W1sxMTBdLDI1Nl0sMTIwMjY0OltbMTExXSwyNTZdLDEyMDI2NTpbWzExMl0sMjU2XSwxMjAyNjY6W1sxMTNdLDI1Nl0sMTIwMjY3OltbMTE0XSwyNTZdLDEyMDI2ODpbWzExNV0sMjU2XSwxMjAyNjk6W1sxMTZdLDI1Nl0sMTIwMjcwOltbMTE3XSwyNTZdLDEyMDI3MTpbWzExOF0sMjU2XSwxMjAyNzI6W1sxMTldLDI1Nl0sMTIwMjczOltbMTIwXSwyNTZdLDEyMDI3NDpbWzEyMV0sMjU2XSwxMjAyNzU6W1sxMjJdLDI1Nl0sMTIwMjc2OltbNjVdLDI1Nl0sMTIwMjc3OltbNjZdLDI1Nl0sMTIwMjc4OltbNjddLDI1Nl0sMTIwMjc5OltbNjhdLDI1Nl0sMTIwMjgwOltbNjldLDI1Nl0sMTIwMjgxOltbNzBdLDI1Nl0sMTIwMjgyOltbNzFdLDI1Nl0sMTIwMjgzOltbNzJdLDI1Nl0sMTIwMjg0OltbNzNdLDI1Nl0sMTIwMjg1OltbNzRdLDI1Nl0sMTIwMjg2OltbNzVdLDI1Nl0sMTIwMjg3OltbNzZdLDI1Nl0sMTIwMjg4OltbNzddLDI1Nl0sMTIwMjg5OltbNzhdLDI1Nl0sMTIwMjkwOltbNzldLDI1Nl0sMTIwMjkxOltbODBdLDI1Nl0sMTIwMjkyOltbODFdLDI1Nl0sMTIwMjkzOltbODJdLDI1Nl0sMTIwMjk0OltbODNdLDI1Nl0sMTIwMjk1OltbODRdLDI1Nl0sMTIwMjk2OltbODVdLDI1Nl0sMTIwMjk3OltbODZdLDI1Nl0sMTIwMjk4OltbODddLDI1Nl0sMTIwMjk5OltbODhdLDI1Nl0sMTIwMzAwOltbODldLDI1Nl0sMTIwMzAxOltbOTBdLDI1Nl0sMTIwMzAyOltbOTddLDI1Nl0sMTIwMzAzOltbOThdLDI1Nl0sMTIwMzA0OltbOTldLDI1Nl0sMTIwMzA1OltbMTAwXSwyNTZdLDEyMDMwNjpbWzEwMV0sMjU2XSwxMjAzMDc6W1sxMDJdLDI1Nl0sMTIwMzA4OltbMTAzXSwyNTZdLDEyMDMwOTpbWzEwNF0sMjU2XSwxMjAzMTA6W1sxMDVdLDI1Nl0sMTIwMzExOltbMTA2XSwyNTZdLDEyMDMxMjpbWzEwN10sMjU2XSwxMjAzMTM6W1sxMDhdLDI1Nl0sMTIwMzE0OltbMTA5XSwyNTZdLDEyMDMxNTpbWzExMF0sMjU2XSwxMjAzMTY6W1sxMTFdLDI1Nl0sMTIwMzE3OltbMTEyXSwyNTZdLDEyMDMxODpbWzExM10sMjU2XSwxMjAzMTk6W1sxMTRdLDI1Nl19LFxuNTQ3ODQ6ezEyMDMyMDpbWzExNV0sMjU2XSwxMjAzMjE6W1sxMTZdLDI1Nl0sMTIwMzIyOltbMTE3XSwyNTZdLDEyMDMyMzpbWzExOF0sMjU2XSwxMjAzMjQ6W1sxMTldLDI1Nl0sMTIwMzI1OltbMTIwXSwyNTZdLDEyMDMyNjpbWzEyMV0sMjU2XSwxMjAzMjc6W1sxMjJdLDI1Nl0sMTIwMzI4OltbNjVdLDI1Nl0sMTIwMzI5OltbNjZdLDI1Nl0sMTIwMzMwOltbNjddLDI1Nl0sMTIwMzMxOltbNjhdLDI1Nl0sMTIwMzMyOltbNjldLDI1Nl0sMTIwMzMzOltbNzBdLDI1Nl0sMTIwMzM0OltbNzFdLDI1Nl0sMTIwMzM1OltbNzJdLDI1Nl0sMTIwMzM2OltbNzNdLDI1Nl0sMTIwMzM3OltbNzRdLDI1Nl0sMTIwMzM4OltbNzVdLDI1Nl0sMTIwMzM5OltbNzZdLDI1Nl0sMTIwMzQwOltbNzddLDI1Nl0sMTIwMzQxOltbNzhdLDI1Nl0sMTIwMzQyOltbNzldLDI1Nl0sMTIwMzQzOltbODBdLDI1Nl0sMTIwMzQ0OltbODFdLDI1Nl0sMTIwMzQ1OltbODJdLDI1Nl0sMTIwMzQ2OltbODNdLDI1Nl0sMTIwMzQ3OltbODRdLDI1Nl0sMTIwMzQ4OltbODVdLDI1Nl0sMTIwMzQ5OltbODZdLDI1Nl0sMTIwMzUwOltbODddLDI1Nl0sMTIwMzUxOltbODhdLDI1Nl0sMTIwMzUyOltbODldLDI1Nl0sMTIwMzUzOltbOTBdLDI1Nl0sMTIwMzU0OltbOTddLDI1Nl0sMTIwMzU1OltbOThdLDI1Nl0sMTIwMzU2OltbOTldLDI1Nl0sMTIwMzU3OltbMTAwXSwyNTZdLDEyMDM1ODpbWzEwMV0sMjU2XSwxMjAzNTk6W1sxMDJdLDI1Nl0sMTIwMzYwOltbMTAzXSwyNTZdLDEyMDM2MTpbWzEwNF0sMjU2XSwxMjAzNjI6W1sxMDVdLDI1Nl0sMTIwMzYzOltbMTA2XSwyNTZdLDEyMDM2NDpbWzEwN10sMjU2XSwxMjAzNjU6W1sxMDhdLDI1Nl0sMTIwMzY2OltbMTA5XSwyNTZdLDEyMDM2NzpbWzExMF0sMjU2XSwxMjAzNjg6W1sxMTFdLDI1Nl0sMTIwMzY5OltbMTEyXSwyNTZdLDEyMDM3MDpbWzExM10sMjU2XSwxMjAzNzE6W1sxMTRdLDI1Nl0sMTIwMzcyOltbMTE1XSwyNTZdLDEyMDM3MzpbWzExNl0sMjU2XSwxMjAzNzQ6W1sxMTddLDI1Nl0sMTIwMzc1OltbMTE4XSwyNTZdLDEyMDM3NjpbWzExOV0sMjU2XSwxMjAzNzc6W1sxMjBdLDI1Nl0sMTIwMzc4OltbMTIxXSwyNTZdLDEyMDM3OTpbWzEyMl0sMjU2XSwxMjAzODA6W1s2NV0sMjU2XSwxMjAzODE6W1s2Nl0sMjU2XSwxMjAzODI6W1s2N10sMjU2XSwxMjAzODM6W1s2OF0sMjU2XSwxMjAzODQ6W1s2OV0sMjU2XSwxMjAzODU6W1s3MF0sMjU2XSwxMjAzODY6W1s3MV0sMjU2XSwxMjAzODc6W1s3Ml0sMjU2XSwxMjAzODg6W1s3M10sMjU2XSwxMjAzODk6W1s3NF0sMjU2XSwxMjAzOTA6W1s3NV0sMjU2XSwxMjAzOTE6W1s3Nl0sMjU2XSwxMjAzOTI6W1s3N10sMjU2XSwxMjAzOTM6W1s3OF0sMjU2XSwxMjAzOTQ6W1s3OV0sMjU2XSwxMjAzOTU6W1s4MF0sMjU2XSwxMjAzOTY6W1s4MV0sMjU2XSwxMjAzOTc6W1s4Ml0sMjU2XSwxMjAzOTg6W1s4M10sMjU2XSwxMjAzOTk6W1s4NF0sMjU2XSwxMjA0MDA6W1s4NV0sMjU2XSwxMjA0MDE6W1s4Nl0sMjU2XSwxMjA0MDI6W1s4N10sMjU2XSwxMjA0MDM6W1s4OF0sMjU2XSwxMjA0MDQ6W1s4OV0sMjU2XSwxMjA0MDU6W1s5MF0sMjU2XSwxMjA0MDY6W1s5N10sMjU2XSwxMjA0MDc6W1s5OF0sMjU2XSwxMjA0MDg6W1s5OV0sMjU2XSwxMjA0MDk6W1sxMDBdLDI1Nl0sMTIwNDEwOltbMTAxXSwyNTZdLDEyMDQxMTpbWzEwMl0sMjU2XSwxMjA0MTI6W1sxMDNdLDI1Nl0sMTIwNDEzOltbMTA0XSwyNTZdLDEyMDQxNDpbWzEwNV0sMjU2XSwxMjA0MTU6W1sxMDZdLDI1Nl0sMTIwNDE2OltbMTA3XSwyNTZdLDEyMDQxNzpbWzEwOF0sMjU2XSwxMjA0MTg6W1sxMDldLDI1Nl0sMTIwNDE5OltbMTEwXSwyNTZdLDEyMDQyMDpbWzExMV0sMjU2XSwxMjA0MjE6W1sxMTJdLDI1Nl0sMTIwNDIyOltbMTEzXSwyNTZdLDEyMDQyMzpbWzExNF0sMjU2XSwxMjA0MjQ6W1sxMTVdLDI1Nl0sMTIwNDI1OltbMTE2XSwyNTZdLDEyMDQyNjpbWzExN10sMjU2XSwxMjA0Mjc6W1sxMThdLDI1Nl0sMTIwNDI4OltbMTE5XSwyNTZdLDEyMDQyOTpbWzEyMF0sMjU2XSwxMjA0MzA6W1sxMjFdLDI1Nl0sMTIwNDMxOltbMTIyXSwyNTZdLDEyMDQzMjpbWzY1XSwyNTZdLDEyMDQzMzpbWzY2XSwyNTZdLDEyMDQzNDpbWzY3XSwyNTZdLDEyMDQzNTpbWzY4XSwyNTZdLDEyMDQzNjpbWzY5XSwyNTZdLDEyMDQzNzpbWzcwXSwyNTZdLDEyMDQzODpbWzcxXSwyNTZdLDEyMDQzOTpbWzcyXSwyNTZdLDEyMDQ0MDpbWzczXSwyNTZdLDEyMDQ0MTpbWzc0XSwyNTZdLDEyMDQ0MjpbWzc1XSwyNTZdLDEyMDQ0MzpbWzc2XSwyNTZdLDEyMDQ0NDpbWzc3XSwyNTZdLDEyMDQ0NTpbWzc4XSwyNTZdLDEyMDQ0NjpbWzc5XSwyNTZdLDEyMDQ0NzpbWzgwXSwyNTZdLDEyMDQ0ODpbWzgxXSwyNTZdLDEyMDQ0OTpbWzgyXSwyNTZdLDEyMDQ1MDpbWzgzXSwyNTZdLDEyMDQ1MTpbWzg0XSwyNTZdLDEyMDQ1MjpbWzg1XSwyNTZdLDEyMDQ1MzpbWzg2XSwyNTZdLDEyMDQ1NDpbWzg3XSwyNTZdLDEyMDQ1NTpbWzg4XSwyNTZdLDEyMDQ1NjpbWzg5XSwyNTZdLDEyMDQ1NzpbWzkwXSwyNTZdLDEyMDQ1ODpbWzk3XSwyNTZdLDEyMDQ1OTpbWzk4XSwyNTZdLDEyMDQ2MDpbWzk5XSwyNTZdLDEyMDQ2MTpbWzEwMF0sMjU2XSwxMjA0NjI6W1sxMDFdLDI1Nl0sMTIwNDYzOltbMTAyXSwyNTZdLDEyMDQ2NDpbWzEwM10sMjU2XSwxMjA0NjU6W1sxMDRdLDI1Nl0sMTIwNDY2OltbMTA1XSwyNTZdLDEyMDQ2NzpbWzEwNl0sMjU2XSwxMjA0Njg6W1sxMDddLDI1Nl0sMTIwNDY5OltbMTA4XSwyNTZdLDEyMDQ3MDpbWzEwOV0sMjU2XSwxMjA0NzE6W1sxMTBdLDI1Nl0sMTIwNDcyOltbMTExXSwyNTZdLDEyMDQ3MzpbWzExMl0sMjU2XSwxMjA0NzQ6W1sxMTNdLDI1Nl0sMTIwNDc1OltbMTE0XSwyNTZdLDEyMDQ3NjpbWzExNV0sMjU2XSwxMjA0Nzc6W1sxMTZdLDI1Nl0sMTIwNDc4OltbMTE3XSwyNTZdLDEyMDQ3OTpbWzExOF0sMjU2XSwxMjA0ODA6W1sxMTldLDI1Nl0sMTIwNDgxOltbMTIwXSwyNTZdLDEyMDQ4MjpbWzEyMV0sMjU2XSwxMjA0ODM6W1sxMjJdLDI1Nl0sMTIwNDg0OltbMzA1XSwyNTZdLDEyMDQ4NTpbWzU2N10sMjU2XSwxMjA0ODg6W1s5MTNdLDI1Nl0sMTIwNDg5OltbOTE0XSwyNTZdLDEyMDQ5MDpbWzkxNV0sMjU2XSwxMjA0OTE6W1s5MTZdLDI1Nl0sMTIwNDkyOltbOTE3XSwyNTZdLDEyMDQ5MzpbWzkxOF0sMjU2XSwxMjA0OTQ6W1s5MTldLDI1Nl0sMTIwNDk1OltbOTIwXSwyNTZdLDEyMDQ5NjpbWzkyMV0sMjU2XSwxMjA0OTc6W1s5MjJdLDI1Nl0sMTIwNDk4OltbOTIzXSwyNTZdLDEyMDQ5OTpbWzkyNF0sMjU2XSwxMjA1MDA6W1s5MjVdLDI1Nl0sMTIwNTAxOltbOTI2XSwyNTZdLDEyMDUwMjpbWzkyN10sMjU2XSwxMjA1MDM6W1s5MjhdLDI1Nl0sMTIwNTA0OltbOTI5XSwyNTZdLDEyMDUwNTpbWzEwMTJdLDI1Nl0sMTIwNTA2OltbOTMxXSwyNTZdLDEyMDUwNzpbWzkzMl0sMjU2XSwxMjA1MDg6W1s5MzNdLDI1Nl0sMTIwNTA5OltbOTM0XSwyNTZdLDEyMDUxMDpbWzkzNV0sMjU2XSwxMjA1MTE6W1s5MzZdLDI1Nl0sMTIwNTEyOltbOTM3XSwyNTZdLDEyMDUxMzpbWzg3MTFdLDI1Nl0sMTIwNTE0OltbOTQ1XSwyNTZdLDEyMDUxNTpbWzk0Nl0sMjU2XSwxMjA1MTY6W1s5NDddLDI1Nl0sMTIwNTE3OltbOTQ4XSwyNTZdLDEyMDUxODpbWzk0OV0sMjU2XSwxMjA1MTk6W1s5NTBdLDI1Nl0sMTIwNTIwOltbOTUxXSwyNTZdLDEyMDUyMTpbWzk1Ml0sMjU2XSwxMjA1MjI6W1s5NTNdLDI1Nl0sMTIwNTIzOltbOTU0XSwyNTZdLDEyMDUyNDpbWzk1NV0sMjU2XSwxMjA1MjU6W1s5NTZdLDI1Nl0sMTIwNTI2OltbOTU3XSwyNTZdLDEyMDUyNzpbWzk1OF0sMjU2XSwxMjA1Mjg6W1s5NTldLDI1Nl0sMTIwNTI5OltbOTYwXSwyNTZdLDEyMDUzMDpbWzk2MV0sMjU2XSwxMjA1MzE6W1s5NjJdLDI1Nl0sMTIwNTMyOltbOTYzXSwyNTZdLDEyMDUzMzpbWzk2NF0sMjU2XSwxMjA1MzQ6W1s5NjVdLDI1Nl0sMTIwNTM1OltbOTY2XSwyNTZdLDEyMDUzNjpbWzk2N10sMjU2XSwxMjA1Mzc6W1s5NjhdLDI1Nl0sMTIwNTM4OltbOTY5XSwyNTZdLDEyMDUzOTpbWzg3MDZdLDI1Nl0sMTIwNTQwOltbMTAxM10sMjU2XSwxMjA1NDE6W1s5NzddLDI1Nl0sMTIwNTQyOltbMTAwOF0sMjU2XSwxMjA1NDM6W1s5ODFdLDI1Nl0sMTIwNTQ0OltbMTAwOV0sMjU2XSwxMjA1NDU6W1s5ODJdLDI1Nl0sMTIwNTQ2OltbOTEzXSwyNTZdLDEyMDU0NzpbWzkxNF0sMjU2XSwxMjA1NDg6W1s5MTVdLDI1Nl0sMTIwNTQ5OltbOTE2XSwyNTZdLDEyMDU1MDpbWzkxN10sMjU2XSwxMjA1NTE6W1s5MThdLDI1Nl0sMTIwNTUyOltbOTE5XSwyNTZdLDEyMDU1MzpbWzkyMF0sMjU2XSwxMjA1NTQ6W1s5MjFdLDI1Nl0sMTIwNTU1OltbOTIyXSwyNTZdLDEyMDU1NjpbWzkyM10sMjU2XSwxMjA1NTc6W1s5MjRdLDI1Nl0sMTIwNTU4OltbOTI1XSwyNTZdLDEyMDU1OTpbWzkyNl0sMjU2XSwxMjA1NjA6W1s5MjddLDI1Nl0sMTIwNTYxOltbOTI4XSwyNTZdLDEyMDU2MjpbWzkyOV0sMjU2XSwxMjA1NjM6W1sxMDEyXSwyNTZdLDEyMDU2NDpbWzkzMV0sMjU2XSwxMjA1NjU6W1s5MzJdLDI1Nl0sMTIwNTY2OltbOTMzXSwyNTZdLDEyMDU2NzpbWzkzNF0sMjU2XSwxMjA1Njg6W1s5MzVdLDI1Nl0sMTIwNTY5OltbOTM2XSwyNTZdLDEyMDU3MDpbWzkzN10sMjU2XSwxMjA1NzE6W1s4NzExXSwyNTZdLDEyMDU3MjpbWzk0NV0sMjU2XSwxMjA1NzM6W1s5NDZdLDI1Nl0sMTIwNTc0OltbOTQ3XSwyNTZdLDEyMDU3NTpbWzk0OF0sMjU2XX0sXG41NTA0MDp7MTIwNTc2OltbOTQ5XSwyNTZdLDEyMDU3NzpbWzk1MF0sMjU2XSwxMjA1Nzg6W1s5NTFdLDI1Nl0sMTIwNTc5OltbOTUyXSwyNTZdLDEyMDU4MDpbWzk1M10sMjU2XSwxMjA1ODE6W1s5NTRdLDI1Nl0sMTIwNTgyOltbOTU1XSwyNTZdLDEyMDU4MzpbWzk1Nl0sMjU2XSwxMjA1ODQ6W1s5NTddLDI1Nl0sMTIwNTg1OltbOTU4XSwyNTZdLDEyMDU4NjpbWzk1OV0sMjU2XSwxMjA1ODc6W1s5NjBdLDI1Nl0sMTIwNTg4OltbOTYxXSwyNTZdLDEyMDU4OTpbWzk2Ml0sMjU2XSwxMjA1OTA6W1s5NjNdLDI1Nl0sMTIwNTkxOltbOTY0XSwyNTZdLDEyMDU5MjpbWzk2NV0sMjU2XSwxMjA1OTM6W1s5NjZdLDI1Nl0sMTIwNTk0OltbOTY3XSwyNTZdLDEyMDU5NTpbWzk2OF0sMjU2XSwxMjA1OTY6W1s5NjldLDI1Nl0sMTIwNTk3OltbODcwNl0sMjU2XSwxMjA1OTg6W1sxMDEzXSwyNTZdLDEyMDU5OTpbWzk3N10sMjU2XSwxMjA2MDA6W1sxMDA4XSwyNTZdLDEyMDYwMTpbWzk4MV0sMjU2XSwxMjA2MDI6W1sxMDA5XSwyNTZdLDEyMDYwMzpbWzk4Ml0sMjU2XSwxMjA2MDQ6W1s5MTNdLDI1Nl0sMTIwNjA1OltbOTE0XSwyNTZdLDEyMDYwNjpbWzkxNV0sMjU2XSwxMjA2MDc6W1s5MTZdLDI1Nl0sMTIwNjA4OltbOTE3XSwyNTZdLDEyMDYwOTpbWzkxOF0sMjU2XSwxMjA2MTA6W1s5MTldLDI1Nl0sMTIwNjExOltbOTIwXSwyNTZdLDEyMDYxMjpbWzkyMV0sMjU2XSwxMjA2MTM6W1s5MjJdLDI1Nl0sMTIwNjE0OltbOTIzXSwyNTZdLDEyMDYxNTpbWzkyNF0sMjU2XSwxMjA2MTY6W1s5MjVdLDI1Nl0sMTIwNjE3OltbOTI2XSwyNTZdLDEyMDYxODpbWzkyN10sMjU2XSwxMjA2MTk6W1s5MjhdLDI1Nl0sMTIwNjIwOltbOTI5XSwyNTZdLDEyMDYyMTpbWzEwMTJdLDI1Nl0sMTIwNjIyOltbOTMxXSwyNTZdLDEyMDYyMzpbWzkzMl0sMjU2XSwxMjA2MjQ6W1s5MzNdLDI1Nl0sMTIwNjI1OltbOTM0XSwyNTZdLDEyMDYyNjpbWzkzNV0sMjU2XSwxMjA2Mjc6W1s5MzZdLDI1Nl0sMTIwNjI4OltbOTM3XSwyNTZdLDEyMDYyOTpbWzg3MTFdLDI1Nl0sMTIwNjMwOltbOTQ1XSwyNTZdLDEyMDYzMTpbWzk0Nl0sMjU2XSwxMjA2MzI6W1s5NDddLDI1Nl0sMTIwNjMzOltbOTQ4XSwyNTZdLDEyMDYzNDpbWzk0OV0sMjU2XSwxMjA2MzU6W1s5NTBdLDI1Nl0sMTIwNjM2OltbOTUxXSwyNTZdLDEyMDYzNzpbWzk1Ml0sMjU2XSwxMjA2Mzg6W1s5NTNdLDI1Nl0sMTIwNjM5OltbOTU0XSwyNTZdLDEyMDY0MDpbWzk1NV0sMjU2XSwxMjA2NDE6W1s5NTZdLDI1Nl0sMTIwNjQyOltbOTU3XSwyNTZdLDEyMDY0MzpbWzk1OF0sMjU2XSwxMjA2NDQ6W1s5NTldLDI1Nl0sMTIwNjQ1OltbOTYwXSwyNTZdLDEyMDY0NjpbWzk2MV0sMjU2XSwxMjA2NDc6W1s5NjJdLDI1Nl0sMTIwNjQ4OltbOTYzXSwyNTZdLDEyMDY0OTpbWzk2NF0sMjU2XSwxMjA2NTA6W1s5NjVdLDI1Nl0sMTIwNjUxOltbOTY2XSwyNTZdLDEyMDY1MjpbWzk2N10sMjU2XSwxMjA2NTM6W1s5NjhdLDI1Nl0sMTIwNjU0OltbOTY5XSwyNTZdLDEyMDY1NTpbWzg3MDZdLDI1Nl0sMTIwNjU2OltbMTAxM10sMjU2XSwxMjA2NTc6W1s5NzddLDI1Nl0sMTIwNjU4OltbMTAwOF0sMjU2XSwxMjA2NTk6W1s5ODFdLDI1Nl0sMTIwNjYwOltbMTAwOV0sMjU2XSwxMjA2NjE6W1s5ODJdLDI1Nl0sMTIwNjYyOltbOTEzXSwyNTZdLDEyMDY2MzpbWzkxNF0sMjU2XSwxMjA2NjQ6W1s5MTVdLDI1Nl0sMTIwNjY1OltbOTE2XSwyNTZdLDEyMDY2NjpbWzkxN10sMjU2XSwxMjA2Njc6W1s5MThdLDI1Nl0sMTIwNjY4OltbOTE5XSwyNTZdLDEyMDY2OTpbWzkyMF0sMjU2XSwxMjA2NzA6W1s5MjFdLDI1Nl0sMTIwNjcxOltbOTIyXSwyNTZdLDEyMDY3MjpbWzkyM10sMjU2XSwxMjA2NzM6W1s5MjRdLDI1Nl0sMTIwNjc0OltbOTI1XSwyNTZdLDEyMDY3NTpbWzkyNl0sMjU2XSwxMjA2NzY6W1s5MjddLDI1Nl0sMTIwNjc3OltbOTI4XSwyNTZdLDEyMDY3ODpbWzkyOV0sMjU2XSwxMjA2Nzk6W1sxMDEyXSwyNTZdLDEyMDY4MDpbWzkzMV0sMjU2XSwxMjA2ODE6W1s5MzJdLDI1Nl0sMTIwNjgyOltbOTMzXSwyNTZdLDEyMDY4MzpbWzkzNF0sMjU2XSwxMjA2ODQ6W1s5MzVdLDI1Nl0sMTIwNjg1OltbOTM2XSwyNTZdLDEyMDY4NjpbWzkzN10sMjU2XSwxMjA2ODc6W1s4NzExXSwyNTZdLDEyMDY4ODpbWzk0NV0sMjU2XSwxMjA2ODk6W1s5NDZdLDI1Nl0sMTIwNjkwOltbOTQ3XSwyNTZdLDEyMDY5MTpbWzk0OF0sMjU2XSwxMjA2OTI6W1s5NDldLDI1Nl0sMTIwNjkzOltbOTUwXSwyNTZdLDEyMDY5NDpbWzk1MV0sMjU2XSwxMjA2OTU6W1s5NTJdLDI1Nl0sMTIwNjk2OltbOTUzXSwyNTZdLDEyMDY5NzpbWzk1NF0sMjU2XSwxMjA2OTg6W1s5NTVdLDI1Nl0sMTIwNjk5OltbOTU2XSwyNTZdLDEyMDcwMDpbWzk1N10sMjU2XSwxMjA3MDE6W1s5NThdLDI1Nl0sMTIwNzAyOltbOTU5XSwyNTZdLDEyMDcwMzpbWzk2MF0sMjU2XSwxMjA3MDQ6W1s5NjFdLDI1Nl0sMTIwNzA1OltbOTYyXSwyNTZdLDEyMDcwNjpbWzk2M10sMjU2XSwxMjA3MDc6W1s5NjRdLDI1Nl0sMTIwNzA4OltbOTY1XSwyNTZdLDEyMDcwOTpbWzk2Nl0sMjU2XSwxMjA3MTA6W1s5NjddLDI1Nl0sMTIwNzExOltbOTY4XSwyNTZdLDEyMDcxMjpbWzk2OV0sMjU2XSwxMjA3MTM6W1s4NzA2XSwyNTZdLDEyMDcxNDpbWzEwMTNdLDI1Nl0sMTIwNzE1OltbOTc3XSwyNTZdLDEyMDcxNjpbWzEwMDhdLDI1Nl0sMTIwNzE3OltbOTgxXSwyNTZdLDEyMDcxODpbWzEwMDldLDI1Nl0sMTIwNzE5OltbOTgyXSwyNTZdLDEyMDcyMDpbWzkxM10sMjU2XSwxMjA3MjE6W1s5MTRdLDI1Nl0sMTIwNzIyOltbOTE1XSwyNTZdLDEyMDcyMzpbWzkxNl0sMjU2XSwxMjA3MjQ6W1s5MTddLDI1Nl0sMTIwNzI1OltbOTE4XSwyNTZdLDEyMDcyNjpbWzkxOV0sMjU2XSwxMjA3Mjc6W1s5MjBdLDI1Nl0sMTIwNzI4OltbOTIxXSwyNTZdLDEyMDcyOTpbWzkyMl0sMjU2XSwxMjA3MzA6W1s5MjNdLDI1Nl0sMTIwNzMxOltbOTI0XSwyNTZdLDEyMDczMjpbWzkyNV0sMjU2XSwxMjA3MzM6W1s5MjZdLDI1Nl0sMTIwNzM0OltbOTI3XSwyNTZdLDEyMDczNTpbWzkyOF0sMjU2XSwxMjA3MzY6W1s5MjldLDI1Nl0sMTIwNzM3OltbMTAxMl0sMjU2XSwxMjA3Mzg6W1s5MzFdLDI1Nl0sMTIwNzM5OltbOTMyXSwyNTZdLDEyMDc0MDpbWzkzM10sMjU2XSwxMjA3NDE6W1s5MzRdLDI1Nl0sMTIwNzQyOltbOTM1XSwyNTZdLDEyMDc0MzpbWzkzNl0sMjU2XSwxMjA3NDQ6W1s5MzddLDI1Nl0sMTIwNzQ1OltbODcxMV0sMjU2XSwxMjA3NDY6W1s5NDVdLDI1Nl0sMTIwNzQ3OltbOTQ2XSwyNTZdLDEyMDc0ODpbWzk0N10sMjU2XSwxMjA3NDk6W1s5NDhdLDI1Nl0sMTIwNzUwOltbOTQ5XSwyNTZdLDEyMDc1MTpbWzk1MF0sMjU2XSwxMjA3NTI6W1s5NTFdLDI1Nl0sMTIwNzUzOltbOTUyXSwyNTZdLDEyMDc1NDpbWzk1M10sMjU2XSwxMjA3NTU6W1s5NTRdLDI1Nl0sMTIwNzU2OltbOTU1XSwyNTZdLDEyMDc1NzpbWzk1Nl0sMjU2XSwxMjA3NTg6W1s5NTddLDI1Nl0sMTIwNzU5OltbOTU4XSwyNTZdLDEyMDc2MDpbWzk1OV0sMjU2XSwxMjA3NjE6W1s5NjBdLDI1Nl0sMTIwNzYyOltbOTYxXSwyNTZdLDEyMDc2MzpbWzk2Ml0sMjU2XSwxMjA3NjQ6W1s5NjNdLDI1Nl0sMTIwNzY1OltbOTY0XSwyNTZdLDEyMDc2NjpbWzk2NV0sMjU2XSwxMjA3Njc6W1s5NjZdLDI1Nl0sMTIwNzY4OltbOTY3XSwyNTZdLDEyMDc2OTpbWzk2OF0sMjU2XSwxMjA3NzA6W1s5NjldLDI1Nl0sMTIwNzcxOltbODcwNl0sMjU2XSwxMjA3NzI6W1sxMDEzXSwyNTZdLDEyMDc3MzpbWzk3N10sMjU2XSwxMjA3NzQ6W1sxMDA4XSwyNTZdLDEyMDc3NTpbWzk4MV0sMjU2XSwxMjA3NzY6W1sxMDA5XSwyNTZdLDEyMDc3NzpbWzk4Ml0sMjU2XSwxMjA3Nzg6W1s5ODhdLDI1Nl0sMTIwNzc5OltbOTg5XSwyNTZdLDEyMDc4MjpbWzQ4XSwyNTZdLDEyMDc4MzpbWzQ5XSwyNTZdLDEyMDc4NDpbWzUwXSwyNTZdLDEyMDc4NTpbWzUxXSwyNTZdLDEyMDc4NjpbWzUyXSwyNTZdLDEyMDc4NzpbWzUzXSwyNTZdLDEyMDc4ODpbWzU0XSwyNTZdLDEyMDc4OTpbWzU1XSwyNTZdLDEyMDc5MDpbWzU2XSwyNTZdLDEyMDc5MTpbWzU3XSwyNTZdLDEyMDc5MjpbWzQ4XSwyNTZdLDEyMDc5MzpbWzQ5XSwyNTZdLDEyMDc5NDpbWzUwXSwyNTZdLDEyMDc5NTpbWzUxXSwyNTZdLDEyMDc5NjpbWzUyXSwyNTZdLDEyMDc5NzpbWzUzXSwyNTZdLDEyMDc5ODpbWzU0XSwyNTZdLDEyMDc5OTpbWzU1XSwyNTZdLDEyMDgwMDpbWzU2XSwyNTZdLDEyMDgwMTpbWzU3XSwyNTZdLDEyMDgwMjpbWzQ4XSwyNTZdLDEyMDgwMzpbWzQ5XSwyNTZdLDEyMDgwNDpbWzUwXSwyNTZdLDEyMDgwNTpbWzUxXSwyNTZdLDEyMDgwNjpbWzUyXSwyNTZdLDEyMDgwNzpbWzUzXSwyNTZdLDEyMDgwODpbWzU0XSwyNTZdLDEyMDgwOTpbWzU1XSwyNTZdLDEyMDgxMDpbWzU2XSwyNTZdLDEyMDgxMTpbWzU3XSwyNTZdLDEyMDgxMjpbWzQ4XSwyNTZdLDEyMDgxMzpbWzQ5XSwyNTZdLDEyMDgxNDpbWzUwXSwyNTZdLDEyMDgxNTpbWzUxXSwyNTZdLDEyMDgxNjpbWzUyXSwyNTZdLDEyMDgxNzpbWzUzXSwyNTZdLDEyMDgxODpbWzU0XSwyNTZdLDEyMDgxOTpbWzU1XSwyNTZdLDEyMDgyMDpbWzU2XSwyNTZdLDEyMDgyMTpbWzU3XSwyNTZdLDEyMDgyMjpbWzQ4XSwyNTZdLDEyMDgyMzpbWzQ5XSwyNTZdLDEyMDgyNDpbWzUwXSwyNTZdLDEyMDgyNTpbWzUxXSwyNTZdLDEyMDgyNjpbWzUyXSwyNTZdLDEyMDgyNzpbWzUzXSwyNTZdLDEyMDgyODpbWzU0XSwyNTZdLDEyMDgyOTpbWzU1XSwyNTZdLDEyMDgzMDpbWzU2XSwyNTZdLDEyMDgzMTpbWzU3XSwyNTZdfSxcbjYwOTI4OnsxMjY0NjQ6W1sxNTc1XSwyNTZdLDEyNjQ2NTpbWzE1NzZdLDI1Nl0sMTI2NDY2OltbMTU4MF0sMjU2XSwxMjY0Njc6W1sxNTgzXSwyNTZdLDEyNjQ2OTpbWzE2MDhdLDI1Nl0sMTI2NDcwOltbMTU4Nl0sMjU2XSwxMjY0NzE6W1sxNTgxXSwyNTZdLDEyNjQ3MjpbWzE1OTFdLDI1Nl0sMTI2NDczOltbMTYxMF0sMjU2XSwxMjY0NzQ6W1sxNjAzXSwyNTZdLDEyNjQ3NTpbWzE2MDRdLDI1Nl0sMTI2NDc2OltbMTYwNV0sMjU2XSwxMjY0Nzc6W1sxNjA2XSwyNTZdLDEyNjQ3ODpbWzE1ODddLDI1Nl0sMTI2NDc5OltbMTU5M10sMjU2XSwxMjY0ODA6W1sxNjAxXSwyNTZdLDEyNjQ4MTpbWzE1ODldLDI1Nl0sMTI2NDgyOltbMTYwMl0sMjU2XSwxMjY0ODM6W1sxNTg1XSwyNTZdLDEyNjQ4NDpbWzE1ODhdLDI1Nl0sMTI2NDg1OltbMTU3OF0sMjU2XSwxMjY0ODY6W1sxNTc5XSwyNTZdLDEyNjQ4NzpbWzE1ODJdLDI1Nl0sMTI2NDg4OltbMTU4NF0sMjU2XSwxMjY0ODk6W1sxNTkwXSwyNTZdLDEyNjQ5MDpbWzE1OTJdLDI1Nl0sMTI2NDkxOltbMTU5NF0sMjU2XSwxMjY0OTI6W1sxNjQ2XSwyNTZdLDEyNjQ5MzpbWzE3MjJdLDI1Nl0sMTI2NDk0OltbMTY5N10sMjU2XSwxMjY0OTU6W1sxNjQ3XSwyNTZdLDEyNjQ5NzpbWzE1NzZdLDI1Nl0sMTI2NDk4OltbMTU4MF0sMjU2XSwxMjY1MDA6W1sxNjA3XSwyNTZdLDEyNjUwMzpbWzE1ODFdLDI1Nl0sMTI2NTA1OltbMTYxMF0sMjU2XSwxMjY1MDY6W1sxNjAzXSwyNTZdLDEyNjUwNzpbWzE2MDRdLDI1Nl0sMTI2NTA4OltbMTYwNV0sMjU2XSwxMjY1MDk6W1sxNjA2XSwyNTZdLDEyNjUxMDpbWzE1ODddLDI1Nl0sMTI2NTExOltbMTU5M10sMjU2XSwxMjY1MTI6W1sxNjAxXSwyNTZdLDEyNjUxMzpbWzE1ODldLDI1Nl0sMTI2NTE0OltbMTYwMl0sMjU2XSwxMjY1MTY6W1sxNTg4XSwyNTZdLDEyNjUxNzpbWzE1NzhdLDI1Nl0sMTI2NTE4OltbMTU3OV0sMjU2XSwxMjY1MTk6W1sxNTgyXSwyNTZdLDEyNjUyMTpbWzE1OTBdLDI1Nl0sMTI2NTIzOltbMTU5NF0sMjU2XSwxMjY1MzA6W1sxNTgwXSwyNTZdLDEyNjUzNTpbWzE1ODFdLDI1Nl0sMTI2NTM3OltbMTYxMF0sMjU2XSwxMjY1Mzk6W1sxNjA0XSwyNTZdLDEyNjU0MTpbWzE2MDZdLDI1Nl0sMTI2NTQyOltbMTU4N10sMjU2XSwxMjY1NDM6W1sxNTkzXSwyNTZdLDEyNjU0NTpbWzE1ODldLDI1Nl0sMTI2NTQ2OltbMTYwMl0sMjU2XSwxMjY1NDg6W1sxNTg4XSwyNTZdLDEyNjU1MTpbWzE1ODJdLDI1Nl0sMTI2NTUzOltbMTU5MF0sMjU2XSwxMjY1NTU6W1sxNTk0XSwyNTZdLDEyNjU1NzpbWzE3MjJdLDI1Nl0sMTI2NTU5OltbMTY0N10sMjU2XSwxMjY1NjE6W1sxNTc2XSwyNTZdLDEyNjU2MjpbWzE1ODBdLDI1Nl0sMTI2NTY0OltbMTYwN10sMjU2XSwxMjY1Njc6W1sxNTgxXSwyNTZdLDEyNjU2ODpbWzE1OTFdLDI1Nl0sMTI2NTY5OltbMTYxMF0sMjU2XSwxMjY1NzA6W1sxNjAzXSwyNTZdLDEyNjU3MjpbWzE2MDVdLDI1Nl0sMTI2NTczOltbMTYwNl0sMjU2XSwxMjY1NzQ6W1sxNTg3XSwyNTZdLDEyNjU3NTpbWzE1OTNdLDI1Nl0sMTI2NTc2OltbMTYwMV0sMjU2XSwxMjY1Nzc6W1sxNTg5XSwyNTZdLDEyNjU3ODpbWzE2MDJdLDI1Nl0sMTI2NTgwOltbMTU4OF0sMjU2XSwxMjY1ODE6W1sxNTc4XSwyNTZdLDEyNjU4MjpbWzE1NzldLDI1Nl0sMTI2NTgzOltbMTU4Ml0sMjU2XSwxMjY1ODU6W1sxNTkwXSwyNTZdLDEyNjU4NjpbWzE1OTJdLDI1Nl0sMTI2NTg3OltbMTU5NF0sMjU2XSwxMjY1ODg6W1sxNjQ2XSwyNTZdLDEyNjU5MDpbWzE2OTddLDI1Nl0sMTI2NTkyOltbMTU3NV0sMjU2XSwxMjY1OTM6W1sxNTc2XSwyNTZdLDEyNjU5NDpbWzE1ODBdLDI1Nl0sMTI2NTk1OltbMTU4M10sMjU2XSwxMjY1OTY6W1sxNjA3XSwyNTZdLDEyNjU5NzpbWzE2MDhdLDI1Nl0sMTI2NTk4OltbMTU4Nl0sMjU2XSwxMjY1OTk6W1sxNTgxXSwyNTZdLDEyNjYwMDpbWzE1OTFdLDI1Nl0sMTI2NjAxOltbMTYxMF0sMjU2XSwxMjY2MDM6W1sxNjA0XSwyNTZdLDEyNjYwNDpbWzE2MDVdLDI1Nl0sMTI2NjA1OltbMTYwNl0sMjU2XSwxMjY2MDY6W1sxNTg3XSwyNTZdLDEyNjYwNzpbWzE1OTNdLDI1Nl0sMTI2NjA4OltbMTYwMV0sMjU2XSwxMjY2MDk6W1sxNTg5XSwyNTZdLDEyNjYxMDpbWzE2MDJdLDI1Nl0sMTI2NjExOltbMTU4NV0sMjU2XSwxMjY2MTI6W1sxNTg4XSwyNTZdLDEyNjYxMzpbWzE1NzhdLDI1Nl0sMTI2NjE0OltbMTU3OV0sMjU2XSwxMjY2MTU6W1sxNTgyXSwyNTZdLDEyNjYxNjpbWzE1ODRdLDI1Nl0sMTI2NjE3OltbMTU5MF0sMjU2XSwxMjY2MTg6W1sxNTkyXSwyNTZdLDEyNjYxOTpbWzE1OTRdLDI1Nl0sMTI2NjI1OltbMTU3Nl0sMjU2XSwxMjY2MjY6W1sxNTgwXSwyNTZdLDEyNjYyNzpbWzE1ODNdLDI1Nl0sMTI2NjI5OltbMTYwOF0sMjU2XSwxMjY2MzA6W1sxNTg2XSwyNTZdLDEyNjYzMTpbWzE1ODFdLDI1Nl0sMTI2NjMyOltbMTU5MV0sMjU2XSwxMjY2MzM6W1sxNjEwXSwyNTZdLDEyNjYzNTpbWzE2MDRdLDI1Nl0sMTI2NjM2OltbMTYwNV0sMjU2XSwxMjY2Mzc6W1sxNjA2XSwyNTZdLDEyNjYzODpbWzE1ODddLDI1Nl0sMTI2NjM5OltbMTU5M10sMjU2XSwxMjY2NDA6W1sxNjAxXSwyNTZdLDEyNjY0MTpbWzE1ODldLDI1Nl0sMTI2NjQyOltbMTYwMl0sMjU2XSwxMjY2NDM6W1sxNTg1XSwyNTZdLDEyNjY0NDpbWzE1ODhdLDI1Nl0sMTI2NjQ1OltbMTU3OF0sMjU2XSwxMjY2NDY6W1sxNTc5XSwyNTZdLDEyNjY0NzpbWzE1ODJdLDI1Nl0sMTI2NjQ4OltbMTU4NF0sMjU2XSwxMjY2NDk6W1sxNTkwXSwyNTZdLDEyNjY1MDpbWzE1OTJdLDI1Nl0sMTI2NjUxOltbMTU5NF0sMjU2XX0sXG42MTY5Njp7MTI3MjMyOltbNDgsNDZdLDI1Nl0sMTI3MjMzOltbNDgsNDRdLDI1Nl0sMTI3MjM0OltbNDksNDRdLDI1Nl0sMTI3MjM1OltbNTAsNDRdLDI1Nl0sMTI3MjM2OltbNTEsNDRdLDI1Nl0sMTI3MjM3OltbNTIsNDRdLDI1Nl0sMTI3MjM4OltbNTMsNDRdLDI1Nl0sMTI3MjM5OltbNTQsNDRdLDI1Nl0sMTI3MjQwOltbNTUsNDRdLDI1Nl0sMTI3MjQxOltbNTYsNDRdLDI1Nl0sMTI3MjQyOltbNTcsNDRdLDI1Nl0sMTI3MjQ4OltbNDAsNjUsNDFdLDI1Nl0sMTI3MjQ5OltbNDAsNjYsNDFdLDI1Nl0sMTI3MjUwOltbNDAsNjcsNDFdLDI1Nl0sMTI3MjUxOltbNDAsNjgsNDFdLDI1Nl0sMTI3MjUyOltbNDAsNjksNDFdLDI1Nl0sMTI3MjUzOltbNDAsNzAsNDFdLDI1Nl0sMTI3MjU0OltbNDAsNzEsNDFdLDI1Nl0sMTI3MjU1OltbNDAsNzIsNDFdLDI1Nl0sMTI3MjU2OltbNDAsNzMsNDFdLDI1Nl0sMTI3MjU3OltbNDAsNzQsNDFdLDI1Nl0sMTI3MjU4OltbNDAsNzUsNDFdLDI1Nl0sMTI3MjU5OltbNDAsNzYsNDFdLDI1Nl0sMTI3MjYwOltbNDAsNzcsNDFdLDI1Nl0sMTI3MjYxOltbNDAsNzgsNDFdLDI1Nl0sMTI3MjYyOltbNDAsNzksNDFdLDI1Nl0sMTI3MjYzOltbNDAsODAsNDFdLDI1Nl0sMTI3MjY0OltbNDAsODEsNDFdLDI1Nl0sMTI3MjY1OltbNDAsODIsNDFdLDI1Nl0sMTI3MjY2OltbNDAsODMsNDFdLDI1Nl0sMTI3MjY3OltbNDAsODQsNDFdLDI1Nl0sMTI3MjY4OltbNDAsODUsNDFdLDI1Nl0sMTI3MjY5OltbNDAsODYsNDFdLDI1Nl0sMTI3MjcwOltbNDAsODcsNDFdLDI1Nl0sMTI3MjcxOltbNDAsODgsNDFdLDI1Nl0sMTI3MjcyOltbNDAsODksNDFdLDI1Nl0sMTI3MjczOltbNDAsOTAsNDFdLDI1Nl0sMTI3Mjc0OltbMTIzMDgsODMsMTIzMDldLDI1Nl0sMTI3Mjc1OltbNjddLDI1Nl0sMTI3Mjc2OltbODJdLDI1Nl0sMTI3Mjc3OltbNjcsNjhdLDI1Nl0sMTI3Mjc4OltbODcsOTBdLDI1Nl0sMTI3MjgwOltbNjVdLDI1Nl0sMTI3MjgxOltbNjZdLDI1Nl0sMTI3MjgyOltbNjddLDI1Nl0sMTI3MjgzOltbNjhdLDI1Nl0sMTI3Mjg0OltbNjldLDI1Nl0sMTI3Mjg1OltbNzBdLDI1Nl0sMTI3Mjg2OltbNzFdLDI1Nl0sMTI3Mjg3OltbNzJdLDI1Nl0sMTI3Mjg4OltbNzNdLDI1Nl0sMTI3Mjg5OltbNzRdLDI1Nl0sMTI3MjkwOltbNzVdLDI1Nl0sMTI3MjkxOltbNzZdLDI1Nl0sMTI3MjkyOltbNzddLDI1Nl0sMTI3MjkzOltbNzhdLDI1Nl0sMTI3Mjk0OltbNzldLDI1Nl0sMTI3Mjk1OltbODBdLDI1Nl0sMTI3Mjk2OltbODFdLDI1Nl0sMTI3Mjk3OltbODJdLDI1Nl0sMTI3Mjk4OltbODNdLDI1Nl0sMTI3Mjk5OltbODRdLDI1Nl0sMTI3MzAwOltbODVdLDI1Nl0sMTI3MzAxOltbODZdLDI1Nl0sMTI3MzAyOltbODddLDI1Nl0sMTI3MzAzOltbODhdLDI1Nl0sMTI3MzA0OltbODldLDI1Nl0sMTI3MzA1OltbOTBdLDI1Nl0sMTI3MzA2OltbNzIsODZdLDI1Nl0sMTI3MzA3OltbNzcsODZdLDI1Nl0sMTI3MzA4OltbODMsNjhdLDI1Nl0sMTI3MzA5OltbODMsODNdLDI1Nl0sMTI3MzEwOltbODAsODAsODZdLDI1Nl0sMTI3MzExOltbODcsNjddLDI1Nl0sMTI3MzM4OltbNzcsNjddLDI1Nl0sMTI3MzM5OltbNzcsNjhdLDI1Nl0sMTI3Mzc2OltbNjgsNzRdLDI1Nl19LFxuNjE5NTI6ezEyNzQ4ODpbWzEyNDExLDEyMzYzXSwyNTZdLDEyNzQ4OTpbWzEyNDY3LDEyNDY3XSwyNTZdLDEyNzQ5MDpbWzEyNDY5XSwyNTZdLDEyNzUwNDpbWzI1MTYzXSwyNTZdLDEyNzUwNTpbWzIzMzgzXSwyNTZdLDEyNzUwNjpbWzIxNDUyXSwyNTZdLDEyNzUwNzpbWzEyNDg3XSwyNTZdLDEyNzUwODpbWzIwMTA4XSwyNTZdLDEyNzUwOTpbWzIyODEwXSwyNTZdLDEyNzUxMDpbWzM1Mjk5XSwyNTZdLDEyNzUxMTpbWzIyODI1XSwyNTZdLDEyNzUxMjpbWzIwMTMyXSwyNTZdLDEyNzUxMzpbWzI2MTQ0XSwyNTZdLDEyNzUxNDpbWzI4OTYxXSwyNTZdLDEyNzUxNTpbWzI2MDA5XSwyNTZdLDEyNzUxNjpbWzIxMDY5XSwyNTZdLDEyNzUxNzpbWzI0NDYwXSwyNTZdLDEyNzUxODpbWzIwODc3XSwyNTZdLDEyNzUxOTpbWzI2MDMyXSwyNTZdLDEyNzUyMDpbWzIxMDIxXSwyNTZdLDEyNzUyMTpbWzMyMDY2XSwyNTZdLDEyNzUyMjpbWzI5OTgzXSwyNTZdLDEyNzUyMzpbWzM2MDA5XSwyNTZdLDEyNzUyNDpbWzIyNzY4XSwyNTZdLDEyNzUyNTpbWzIxNTYxXSwyNTZdLDEyNzUyNjpbWzI4NDM2XSwyNTZdLDEyNzUyNzpbWzI1MjM3XSwyNTZdLDEyNzUyODpbWzI1NDI5XSwyNTZdLDEyNzUyOTpbWzE5OTY4XSwyNTZdLDEyNzUzMDpbWzE5OTc3XSwyNTZdLDEyNzUzMTpbWzM2OTM4XSwyNTZdLDEyNzUzMjpbWzI0MDM4XSwyNTZdLDEyNzUzMzpbWzIwMDEzXSwyNTZdLDEyNzUzNDpbWzIxNDkxXSwyNTZdLDEyNzUzNTpbWzI1MzUxXSwyNTZdLDEyNzUzNjpbWzM2MjA4XSwyNTZdLDEyNzUzNzpbWzI1MTcxXSwyNTZdLDEyNzUzODpbWzMxMTA1XSwyNTZdLDEyNzUzOTpbWzMxMzU0XSwyNTZdLDEyNzU0MDpbWzIxNTEyXSwyNTZdLDEyNzU0MTpbWzI4Mjg4XSwyNTZdLDEyNzU0MjpbWzI2Mzc3XSwyNTZdLDEyNzU0MzpbWzI2Mzc2XSwyNTZdLDEyNzU0NDpbWzMwMDAzXSwyNTZdLDEyNzU0NTpbWzIxMTA2XSwyNTZdLDEyNzU0NjpbWzIxOTQyXSwyNTZdLDEyNzU1MjpbWzEyMzA4LDI2NDEyLDEyMzA5XSwyNTZdLDEyNzU1MzpbWzEyMzA4LDE5OTc3LDEyMzA5XSwyNTZdLDEyNzU1NDpbWzEyMzA4LDIwMTA4LDEyMzA5XSwyNTZdLDEyNzU1NTpbWzEyMzA4LDIzNDMzLDEyMzA5XSwyNTZdLDEyNzU1NjpbWzEyMzA4LDI4ODU3LDEyMzA5XSwyNTZdLDEyNzU1NzpbWzEyMzA4LDI1MTcxLDEyMzA5XSwyNTZdLDEyNzU1ODpbWzEyMzA4LDMwNDIzLDEyMzA5XSwyNTZdLDEyNzU1OTpbWzEyMzA4LDIxMjEzLDEyMzA5XSwyNTZdLDEyNzU2MDpbWzEyMzA4LDI1OTQzLDEyMzA5XSwyNTZdLDEyNzU2ODpbWzI0NDcxXSwyNTZdLDEyNzU2OTpbWzIxNDg3XSwyNTZdfSxcbjYzNDg4OnsxOTQ1NjA6W1syMDAyOV1dLDE5NDU2MTpbWzIwMDI0XV0sMTk0NTYyOltbMjAwMzNdXSwxOTQ1NjM6W1sxMzEzNjJdXSwxOTQ1NjQ6W1syMDMyMF1dLDE5NDU2NTpbWzIwMzk4XV0sMTk0NTY2OltbMjA0MTFdXSwxOTQ1Njc6W1syMDQ4Ml1dLDE5NDU2ODpbWzIwNjAyXV0sMTk0NTY5OltbMjA2MzNdXSwxOTQ1NzA6W1syMDcxMV1dLDE5NDU3MTpbWzIwNjg3XV0sMTk0NTcyOltbMTM0NzBdXSwxOTQ1NzM6W1sxMzI2NjZdXSwxOTQ1NzQ6W1syMDgxM11dLDE5NDU3NTpbWzIwODIwXV0sMTk0NTc2OltbMjA4MzZdXSwxOTQ1Nzc6W1syMDg1NV1dLDE5NDU3ODpbWzEzMjM4MF1dLDE5NDU3OTpbWzEzNDk3XV0sMTk0NTgwOltbMjA4MzldXSwxOTQ1ODE6W1syMDg3N11dLDE5NDU4MjpbWzEzMjQyN11dLDE5NDU4MzpbWzIwODg3XV0sMTk0NTg0OltbMjA5MDBdXSwxOTQ1ODU6W1syMDE3Ml1dLDE5NDU4NjpbWzIwOTA4XV0sMTk0NTg3OltbMjA5MTddXSwxOTQ1ODg6W1sxNjg0MTVdXSwxOTQ1ODk6W1syMDk4MV1dLDE5NDU5MDpbWzIwOTk1XV0sMTk0NTkxOltbMTM1MzVdXSwxOTQ1OTI6W1syMTA1MV1dLDE5NDU5MzpbWzIxMDYyXV0sMTk0NTk0OltbMjExMDZdXSwxOTQ1OTU6W1syMTExMV1dLDE5NDU5NjpbWzEzNTg5XV0sMTk0NTk3OltbMjExOTFdXSwxOTQ1OTg6W1syMTE5M11dLDE5NDU5OTpbWzIxMjIwXV0sMTk0NjAwOltbMjEyNDJdXSwxOTQ2MDE6W1syMTI1M11dLDE5NDYwMjpbWzIxMjU0XV0sMTk0NjAzOltbMjEyNzFdXSwxOTQ2MDQ6W1syMTMyMV1dLDE5NDYwNTpbWzIxMzI5XV0sMTk0NjA2OltbMjEzMzhdXSwxOTQ2MDc6W1syMTM2M11dLDE5NDYwODpbWzIxMzczXV0sMTk0NjA5OltbMjEzNzVdXSwxOTQ2MTA6W1syMTM3NV1dLDE5NDYxMTpbWzIxMzc1XV0sMTk0NjEyOltbMTMzNjc2XV0sMTk0NjEzOltbMjg3ODRdXSwxOTQ2MTQ6W1syMTQ1MF1dLDE5NDYxNTpbWzIxNDcxXV0sMTk0NjE2OltbMTMzOTg3XV0sMTk0NjE3OltbMjE0ODNdXSwxOTQ2MTg6W1syMTQ4OV1dLDE5NDYxOTpbWzIxNTEwXV0sMTk0NjIwOltbMjE2NjJdXSwxOTQ2MjE6W1syMTU2MF1dLDE5NDYyMjpbWzIxNTc2XV0sMTk0NjIzOltbMjE2MDhdXSwxOTQ2MjQ6W1syMTY2Nl1dLDE5NDYyNTpbWzIxNzUwXV0sMTk0NjI2OltbMjE3NzZdXSwxOTQ2Mjc6W1syMTg0M11dLDE5NDYyODpbWzIxODU5XV0sMTk0NjI5OltbMjE4OTJdXSwxOTQ2MzA6W1syMTg5Ml1dLDE5NDYzMTpbWzIxOTEzXV0sMTk0NjMyOltbMjE5MzFdXSwxOTQ2MzM6W1syMTkzOV1dLDE5NDYzNDpbWzIxOTU0XV0sMTk0NjM1OltbMjIyOTRdXSwxOTQ2MzY6W1syMjAyMl1dLDE5NDYzNzpbWzIyMjk1XV0sMTk0NjM4OltbMjIwOTddXSwxOTQ2Mzk6W1syMjEzMl1dLDE5NDY0MDpbWzIwOTk5XV0sMTk0NjQxOltbMjI3NjZdXSwxOTQ2NDI6W1syMjQ3OF1dLDE5NDY0MzpbWzIyNTE2XV0sMTk0NjQ0OltbMjI1NDFdXSwxOTQ2NDU6W1syMjQxMV1dLDE5NDY0NjpbWzIyNTc4XV0sMTk0NjQ3OltbMjI1NzddXSwxOTQ2NDg6W1syMjcwMF1dLDE5NDY0OTpbWzEzNjQyMF1dLDE5NDY1MDpbWzIyNzcwXV0sMTk0NjUxOltbMjI3NzVdXSwxOTQ2NTI6W1syMjc5MF1dLDE5NDY1MzpbWzIyODEwXV0sMTk0NjU0OltbMjI4MThdXSwxOTQ2NTU6W1syMjg4Ml1dLDE5NDY1NjpbWzEzNjg3Ml1dLDE5NDY1NzpbWzEzNjkzOF1dLDE5NDY1ODpbWzIzMDIwXV0sMTk0NjU5OltbMjMwNjddXSwxOTQ2NjA6W1syMzA3OV1dLDE5NDY2MTpbWzIzMDAwXV0sMTk0NjYyOltbMjMxNDJdXSwxOTQ2NjM6W1sxNDA2Ml1dLDE5NDY2NDpbWzE0MDc2XV0sMTk0NjY1OltbMjMzMDRdXSwxOTQ2NjY6W1syMzM1OF1dLDE5NDY2NzpbWzIzMzU4XV0sMTk0NjY4OltbMTM3NjcyXV0sMTk0NjY5OltbMjM0OTFdXSwxOTQ2NzA6W1syMzUxMl1dLDE5NDY3MTpbWzIzNTI3XV0sMTk0NjcyOltbMjM1MzldXSwxOTQ2NzM6W1sxMzgwMDhdXSwxOTQ2NzQ6W1syMzU1MV1dLDE5NDY3NTpbWzIzNTU4XV0sMTk0Njc2OltbMjQ0MDNdXSwxOTQ2Nzc6W1syMzU4Nl1dLDE5NDY3ODpbWzE0MjA5XV0sMTk0Njc5OltbMjM2NDhdXSwxOTQ2ODA6W1syMzY2Ml1dLDE5NDY4MTpbWzIzNzQ0XV0sMTk0NjgyOltbMjM2OTNdXSwxOTQ2ODM6W1sxMzg3MjRdXSwxOTQ2ODQ6W1syMzg3NV1dLDE5NDY4NTpbWzEzODcyNl1dLDE5NDY4NjpbWzIzOTE4XV0sMTk0Njg3OltbMjM5MTVdXSwxOTQ2ODg6W1syMzkzMl1dLDE5NDY4OTpbWzI0MDMzXV0sMTk0NjkwOltbMjQwMzRdXSwxOTQ2OTE6W1sxNDM4M11dLDE5NDY5MjpbWzI0MDYxXV0sMTk0NjkzOltbMjQxMDRdXSwxOTQ2OTQ6W1syNDEyNV1dLDE5NDY5NTpbWzI0MTY5XV0sMTk0Njk2OltbMTQ0MzRdXSwxOTQ2OTc6W1sxMzk2NTFdXSwxOTQ2OTg6W1sxNDQ2MF1dLDE5NDY5OTpbWzI0MjQwXV0sMTk0NzAwOltbMjQyNDNdXSwxOTQ3MDE6W1syNDI0Nl1dLDE5NDcwMjpbWzI0MjY2XV0sMTk0NzAzOltbMTcyOTQ2XV0sMTk0NzA0OltbMjQzMThdXSwxOTQ3MDU6W1sxNDAwODFdXSwxOTQ3MDY6W1sxNDAwODFdXSwxOTQ3MDc6W1szMzI4MV1dLDE5NDcwODpbWzI0MzU0XV0sMTk0NzA5OltbMjQzNTRdXSwxOTQ3MTA6W1sxNDUzNV1dLDE5NDcxMTpbWzE0NDA1Nl1dLDE5NDcxMjpbWzE1NjEyMl1dLDE5NDcxMzpbWzI0NDE4XV0sMTk0NzE0OltbMjQ0MjddXSwxOTQ3MTU6W1sxNDU2M11dLDE5NDcxNjpbWzI0NDc0XV0sMTk0NzE3OltbMjQ1MjVdXSwxOTQ3MTg6W1syNDUzNV1dLDE5NDcxOTpbWzI0NTY5XV0sMTk0NzIwOltbMjQ3MDVdXSwxOTQ3MjE6W1sxNDY1MF1dLDE5NDcyMjpbWzE0NjIwXV0sMTk0NzIzOltbMjQ3MjRdXSwxOTQ3MjQ6W1sxNDEwMTJdXSwxOTQ3MjU6W1syNDc3NV1dLDE5NDcyNjpbWzI0OTA0XV0sMTk0NzI3OltbMjQ5MDhdXSwxOTQ3Mjg6W1syNDkxMF1dLDE5NDcyOTpbWzI0OTA4XV0sMTk0NzMwOltbMjQ5NTRdXSwxOTQ3MzE6W1syNDk3NF1dLDE5NDczMjpbWzI1MDEwXV0sMTk0NzMzOltbMjQ5OTZdXSwxOTQ3MzQ6W1syNTAwN11dLDE5NDczNTpbWzI1MDU0XV0sMTk0NzM2OltbMjUwNzRdXSwxOTQ3Mzc6W1syNTA3OF1dLDE5NDczODpbWzI1MTA0XV0sMTk0NzM5OltbMjUxMTVdXSwxOTQ3NDA6W1syNTE4MV1dLDE5NDc0MTpbWzI1MjY1XV0sMTk0NzQyOltbMjUzMDBdXSwxOTQ3NDM6W1syNTQyNF1dLDE5NDc0NDpbWzE0MjA5Ml1dLDE5NDc0NTpbWzI1NDA1XV0sMTk0NzQ2OltbMjUzNDBdXSwxOTQ3NDc6W1syNTQ0OF1dLDE5NDc0ODpbWzI1NDc1XV0sMTk0NzQ5OltbMjU1NzJdXSwxOTQ3NTA6W1sxNDIzMjFdXSwxOTQ3NTE6W1syNTYzNF1dLDE5NDc1MjpbWzI1NTQxXV0sMTk0NzUzOltbMjU1MTNdXSwxOTQ3NTQ6W1sxNDg5NF1dLDE5NDc1NTpbWzI1NzA1XV0sMTk0NzU2OltbMjU3MjZdXSwxOTQ3NTc6W1syNTc1N11dLDE5NDc1ODpbWzI1NzE5XV0sMTk0NzU5OltbMTQ5NTZdXSwxOTQ3NjA6W1syNTkzNV1dLDE5NDc2MTpbWzI1OTY0XV0sMTk0NzYyOltbMTQzMzcwXV0sMTk0NzYzOltbMjYwODNdXSwxOTQ3NjQ6W1syNjM2MF1dLDE5NDc2NTpbWzI2MTg1XV0sMTk0NzY2OltbMTUxMjldXSwxOTQ3Njc6W1syNjI1N11dLDE5NDc2ODpbWzE1MTEyXV0sMTk0NzY5OltbMTUwNzZdXSwxOTQ3NzA6W1syMDg4Ml1dLDE5NDc3MTpbWzIwODg1XV0sMTk0NzcyOltbMjYzNjhdXSwxOTQ3NzM6W1syNjI2OF1dLDE5NDc3NDpbWzMyOTQxXV0sMTk0Nzc1OltbMTczNjldXSwxOTQ3NzY6W1syNjM5MV1dLDE5NDc3NzpbWzI2Mzk1XV0sMTk0Nzc4OltbMjY0MDFdXSwxOTQ3Nzk6W1syNjQ2Ml1dLDE5NDc4MDpbWzI2NDUxXV0sMTk0NzgxOltbMTQ0MzIzXV0sMTk0NzgyOltbMTUxNzddXSwxOTQ3ODM6W1syNjYxOF1dLDE5NDc4NDpbWzI2NTAxXV0sMTk0Nzg1OltbMjY3MDZdXSwxOTQ3ODY6W1syNjc1N11dLDE5NDc4NzpbWzE0NDQ5M11dLDE5NDc4ODpbWzI2NzY2XV0sMTk0Nzg5OltbMjY2NTVdXSwxOTQ3OTA6W1syNjkwMF1dLDE5NDc5MTpbWzE1MjYxXV0sMTk0NzkyOltbMjY5NDZdXSwxOTQ3OTM6W1syNzA0M11dLDE5NDc5NDpbWzI3MTE0XV0sMTk0Nzk1OltbMjczMDRdXSwxOTQ3OTY6W1sxNDUwNTldXSwxOTQ3OTc6W1syNzM1NV1dLDE5NDc5ODpbWzE1Mzg0XV0sMTk0Nzk5OltbMjc0MjVdXSwxOTQ4MDA6W1sxNDU1NzVdXSwxOTQ4MDE6W1syNzQ3Nl1dLDE5NDgwMjpbWzE1NDM4XV0sMTk0ODAzOltbMjc1MDZdXSwxOTQ4MDQ6W1syNzU1MV1dLDE5NDgwNTpbWzI3NTc4XV0sMTk0ODA2OltbMjc1NzldXSwxOTQ4MDc6W1sxNDYwNjFdXSwxOTQ4MDg6W1sxMzg1MDddXSwxOTQ4MDk6W1sxNDYxNzBdXSwxOTQ4MTA6W1syNzcyNl1dLDE5NDgxMTpbWzE0NjYyMF1dLDE5NDgxMjpbWzI3ODM5XV0sMTk0ODEzOltbMjc4NTNdXSwxOTQ4MTQ6W1syNzc1MV1dLDE5NDgxNTpbWzI3OTI2XV19LFxuNjM3NDQ6ezYzNzQ0OltbMzU5MTJdXSw2Mzc0NTpbWzI2MzU2XV0sNjM3NDY6W1szNjU1NF1dLDYzNzQ3OltbMzYwNDBdXSw2Mzc0ODpbWzI4MzY5XV0sNjM3NDk6W1syMDAxOF1dLDYzNzUwOltbMjE0NzddXSw2Mzc1MTpbWzQwODYwXV0sNjM3NTI6W1s0MDg2MF1dLDYzNzUzOltbMjI4NjVdXSw2Mzc1NDpbWzM3MzI5XV0sNjM3NTU6W1syMTg5NV1dLDYzNzU2OltbMjI4NTZdXSw2Mzc1NzpbWzI1MDc4XV0sNjM3NTg6W1szMDMxM11dLDYzNzU5OltbMzI2NDVdXSw2Mzc2MDpbWzM0MzY3XV0sNjM3NjE6W1szNDc0Nl1dLDYzNzYyOltbMzUwNjRdXSw2Mzc2MzpbWzM3MDA3XV0sNjM3NjQ6W1syNzEzOF1dLDYzNzY1OltbMjc5MzFdXSw2Mzc2NjpbWzI4ODg5XV0sNjM3Njc6W1syOTY2Ml1dLDYzNzY4OltbMzM4NTNdXSw2Mzc2OTpbWzM3MjI2XV0sNjM3NzA6W1szOTQwOV1dLDYzNzcxOltbMjAwOThdXSw2Mzc3MjpbWzIxMzY1XV0sNjM3NzM6W1syNzM5Nl1dLDYzNzc0OltbMjkyMTFdXSw2Mzc3NTpbWzM0MzQ5XV0sNjM3NzY6W1s0MDQ3OF1dLDYzNzc3OltbMjM4ODhdXSw2Mzc3ODpbWzI4NjUxXV0sNjM3Nzk6W1szNDI1M11dLDYzNzgwOltbMzUxNzJdXSw2Mzc4MTpbWzI1Mjg5XV0sNjM3ODI6W1szMzI0MF1dLDYzNzgzOltbMzQ4NDddXSw2Mzc4NDpbWzI0MjY2XV0sNjM3ODU6W1syNjM5MV1dLDYzNzg2OltbMjgwMTBdXSw2Mzc4NzpbWzI5NDM2XV0sNjM3ODg6W1szNzA3MF1dLDYzNzg5OltbMjAzNThdXSw2Mzc5MDpbWzIwOTE5XV0sNjM3OTE6W1syMTIxNF1dLDYzNzkyOltbMjU3OTZdXSw2Mzc5MzpbWzI3MzQ3XV0sNjM3OTQ6W1syOTIwMF1dLDYzNzk1OltbMzA0MzldXSw2Mzc5NjpbWzMyNzY5XV0sNjM3OTc6W1szNDMxMF1dLDYzNzk4OltbMzQzOTZdXSw2Mzc5OTpbWzM2MzM1XV0sNjM4MDA6W1szODcwNl1dLDYzODAxOltbMzk3OTFdXSw2MzgwMjpbWzQwNDQyXV0sNjM4MDM6W1szMDg2MF1dLDYzODA0OltbMzExMDNdXSw2MzgwNTpbWzMyMTYwXV0sNjM4MDY6W1szMzczN11dLDYzODA3OltbMzc2MzZdXSw2MzgwODpbWzQwNTc1XV0sNjM4MDk6W1szNTU0Ml1dLDYzODEwOltbMjI3NTFdXSw2MzgxMTpbWzI0MzI0XV0sNjM4MTI6W1szMTg0MF1dLDYzODEzOltbMzI4OTRdXSw2MzgxNDpbWzI5MjgyXV0sNjM4MTU6W1szMDkyMl1dLDYzODE2OltbMzYwMzRdXSw2MzgxNzpbWzM4NjQ3XV0sNjM4MTg6W1syMjc0NF1dLDYzODE5OltbMjM2NTBdXSw2MzgyMDpbWzI3MTU1XV0sNjM4MjE6W1syODEyMl1dLDYzODIyOltbMjg0MzFdXSw2MzgyMzpbWzMyMDQ3XV0sNjM4MjQ6W1szMjMxMV1dLDYzODI1OltbMzg0NzVdXSw2MzgyNjpbWzIxMjAyXV0sNjM4Mjc6W1szMjkwN11dLDYzODI4OltbMjA5NTZdXSw2MzgyOTpbWzIwOTQwXV0sNjM4MzA6W1szMTI2MF1dLDYzODMxOltbMzIxOTBdXSw2MzgzMjpbWzMzNzc3XV0sNjM4MzM6W1szODUxN11dLDYzODM0OltbMzU3MTJdXSw2MzgzNTpbWzI1Mjk1XV0sNjM4MzY6W1syNzEzOF1dLDYzODM3OltbMzU1ODJdXSw2MzgzODpbWzIwMDI1XV0sNjM4Mzk6W1syMzUyN11dLDYzODQwOltbMjQ1OTRdXSw2Mzg0MTpbWzI5NTc1XV0sNjM4NDI6W1szMDA2NF1dLDYzODQzOltbMjEyNzFdXSw2Mzg0NDpbWzMwOTcxXV0sNjM4NDU6W1syMDQxNV1dLDYzODQ2OltbMjQ0ODldXSw2Mzg0NzpbWzE5OTgxXV0sNjM4NDg6W1syNzg1Ml1dLDYzODQ5OltbMjU5NzZdXSw2Mzg1MDpbWzMyMDM0XV0sNjM4NTE6W1syMTQ0M11dLDYzODUyOltbMjI2MjJdXSw2Mzg1MzpbWzMwNDY1XV0sNjM4NTQ6W1szMzg2NV1dLDYzODU1OltbMzU0OThdXSw2Mzg1NjpbWzI3NTc4XV0sNjM4NTc6W1szNjc4NF1dLDYzODU4OltbMjc3ODRdXSw2Mzg1OTpbWzI1MzQyXV0sNjM4NjA6W1szMzUwOV1dLDYzODYxOltbMjU1MDRdXSw2Mzg2MjpbWzMwMDUzXV0sNjM4NjM6W1syMDE0Ml1dLDYzODY0OltbMjA4NDFdXSw2Mzg2NTpbWzIwOTM3XV0sNjM4NjY6W1syNjc1M11dLDYzODY3OltbMzE5NzVdXSw2Mzg2ODpbWzMzMzkxXV0sNjM4Njk6W1szNTUzOF1dLDYzODcwOltbMzczMjddXSw2Mzg3MTpbWzIxMjM3XV0sNjM4NzI6W1syMTU3MF1dLDYzODczOltbMjI4OTldXSw2Mzg3NDpbWzI0MzAwXV0sNjM4NzU6W1syNjA1M11dLDYzODc2OltbMjg2NzBdXSw2Mzg3NzpbWzMxMDE4XV0sNjM4Nzg6W1szODMxN11dLDYzODc5OltbMzk1MzBdXSw2Mzg4MDpbWzQwNTk5XV0sNjM4ODE6W1s0MDY1NF1dLDYzODgyOltbMjExNDddXSw2Mzg4MzpbWzI2MzEwXV0sNjM4ODQ6W1syNzUxMV1dLDYzODg1OltbMzY3MDZdXSw2Mzg4NjpbWzI0MTgwXV0sNjM4ODc6W1syNDk3Nl1dLDYzODg4OltbMjUwODhdXSw2Mzg4OTpbWzI1NzU0XV0sNjM4OTA6W1syODQ1MV1dLDYzODkxOltbMjkwMDFdXSw2Mzg5MjpbWzI5ODMzXV0sNjM4OTM6W1szMTE3OF1dLDYzODk0OltbMzIyNDRdXSw2Mzg5NTpbWzMyODc5XV0sNjM4OTY6W1szNjY0Nl1dLDYzODk3OltbMzQwMzBdXSw2Mzg5ODpbWzM2ODk5XV0sNjM4OTk6W1szNzcwNl1dLDYzOTAwOltbMjEwMTVdXSw2MzkwMTpbWzIxMTU1XV0sNjM5MDI6W1syMTY5M11dLDYzOTAzOltbMjg4NzJdXSw2MzkwNDpbWzM1MDEwXV0sNjM5MDU6W1szNTQ5OF1dLDYzOTA2OltbMjQyNjVdXSw2MzkwNzpbWzI0NTY1XV0sNjM5MDg6W1syNTQ2N11dLDYzOTA5OltbMjc1NjZdXSw2MzkxMDpbWzMxODA2XV0sNjM5MTE6W1syOTU1N11dLDYzOTEyOltbMjAxOTZdXSw2MzkxMzpbWzIyMjY1XV0sNjM5MTQ6W1syMzUyN11dLDYzOTE1OltbMjM5OTRdXSw2MzkxNjpbWzI0NjA0XV0sNjM5MTc6W1syOTYxOF1dLDYzOTE4OltbMjk4MDFdXSw2MzkxOTpbWzMyNjY2XV0sNjM5MjA6W1szMjgzOF1dLDYzOTIxOltbMzc0MjhdXSw2MzkyMjpbWzM4NjQ2XV0sNjM5MjM6W1szODcyOF1dLDYzOTI0OltbMzg5MzZdXSw2MzkyNTpbWzIwMzYzXV0sNjM5MjY6W1szMTE1MF1dLDYzOTI3OltbMzczMDBdXSw2MzkyODpbWzM4NTg0XV0sNjM5Mjk6W1syNDgwMV1dLDYzOTMwOltbMjAxMDJdXSw2MzkzMTpbWzIwNjk4XV0sNjM5MzI6W1syMzUzNF1dLDYzOTMzOltbMjM2MTVdXSw2MzkzNDpbWzI2MDA5XV0sNjM5MzU6W1syNzEzOF1dLDYzOTM2OltbMjkxMzRdXSw2MzkzNzpbWzMwMjc0XV0sNjM5Mzg6W1szNDA0NF1dLDYzOTM5OltbMzY5ODhdXSw2Mzk0MDpbWzQwODQ1XV0sNjM5NDE6W1syNjI0OF1dLDYzOTQyOltbMzg0NDZdXSw2Mzk0MzpbWzIxMTI5XV0sNjM5NDQ6W1syNjQ5MV1dLDYzOTQ1OltbMjY2MTFdXSw2Mzk0NjpbWzI3OTY5XV0sNjM5NDc6W1syODMxNl1dLDYzOTQ4OltbMjk3MDVdXSw2Mzk0OTpbWzMwMDQxXV0sNjM5NTA6W1szMDgyN11dLDYzOTUxOltbMzIwMTZdXSw2Mzk1MjpbWzM5MDA2XV0sNjM5NTM6W1syMDg0NV1dLDYzOTU0OltbMjUxMzRdXSw2Mzk1NTpbWzM4NTIwXV0sNjM5NTY6W1syMDUyM11dLDYzOTU3OltbMjM4MzNdXSw2Mzk1ODpbWzI4MTM4XV0sNjM5NTk6W1szNjY1MF1dLDYzOTYwOltbMjQ0NTldXSw2Mzk2MTpbWzI0OTAwXV0sNjM5NjI6W1syNjY0N11dLDYzOTYzOltbMjk1NzVdXSw2Mzk2NDpbWzM4NTM0XV0sNjM5NjU6W1syMTAzM11dLDYzOTY2OltbMjE1MTldXSw2Mzk2NzpbWzIzNjUzXV0sNjM5Njg6W1syNjEzMV1dLDYzOTY5OltbMjY0NDZdXSw2Mzk3MDpbWzI2NzkyXV0sNjM5NzE6W1syNzg3N11dLDYzOTcyOltbMjk3MDJdXSw2Mzk3MzpbWzMwMTc4XV0sNjM5NzQ6W1szMjYzM11dLDYzOTc1OltbMzUwMjNdXSw2Mzk3NjpbWzM1MDQxXV0sNjM5Nzc6W1szNzMyNF1dLDYzOTc4OltbMzg2MjZdXSw2Mzk3OTpbWzIxMzExXV0sNjM5ODA6W1syODM0Nl1dLDYzOTgxOltbMjE1MzNdXSw2Mzk4MjpbWzI5MTM2XV0sNjM5ODM6W1syOTg0OF1dLDYzOTg0OltbMzQyOThdXSw2Mzk4NTpbWzM4NTYzXV0sNjM5ODY6W1s0MDAyM11dLDYzOTg3OltbNDA2MDddXSw2Mzk4ODpbWzI2NTE5XV0sNjM5ODk6W1syODEwN11dLDYzOTkwOltbMzMyNTZdXSw2Mzk5MTpbWzMxNDM1XV0sNjM5OTI6W1szMTUyMF1dLDYzOTkzOltbMzE4OTBdXSw2Mzk5NDpbWzI5Mzc2XV0sNjM5OTU6W1syODgyNV1dLDYzOTk2OltbMzU2NzJdXSw2Mzk5NzpbWzIwMTYwXV0sNjM5OTg6W1szMzU5MF1dLDYzOTk5OltbMjEwNTBdXSwxOTQ4MTY6W1syNzk2Nl1dLDE5NDgxNzpbWzI4MDIzXV0sMTk0ODE4OltbMjc5NjldXSwxOTQ4MTk6W1syODAwOV1dLDE5NDgyMDpbWzI4MDI0XV0sMTk0ODIxOltbMjgwMzddXSwxOTQ4MjI6W1sxNDY3MThdXSwxOTQ4MjM6W1syNzk1Nl1dLDE5NDgyNDpbWzI4MjA3XV0sMTk0ODI1OltbMjgyNzBdXSwxOTQ4MjY6W1sxNTY2N11dLDE5NDgyNzpbWzI4MzYzXV0sMTk0ODI4OltbMjgzNTldXSwxOTQ4Mjk6W1sxNDcxNTNdXSwxOTQ4MzA6W1syODE1M11dLDE5NDgzMTpbWzI4NTI2XV0sMTk0ODMyOltbMTQ3Mjk0XV0sMTk0ODMzOltbMTQ3MzQyXV0sMTk0ODM0OltbMjg2MTRdXSwxOTQ4MzU6W1syODcyOV1dLDE5NDgzNjpbWzI4NzAyXV0sMTk0ODM3OltbMjg2OTldXSwxOTQ4Mzg6W1sxNTc2Nl1dLDE5NDgzOTpbWzI4NzQ2XV0sMTk0ODQwOltbMjg3OTddXSwxOTQ4NDE6W1syODc5MV1dLDE5NDg0MjpbWzI4ODQ1XV0sMTk0ODQzOltbMTMyMzg5XV0sMTk0ODQ0OltbMjg5OTddXSwxOTQ4NDU6W1sxNDgwNjddXSwxOTQ4NDY6W1syOTA4NF1dLDE5NDg0NzpbWzE0ODM5NV1dLDE5NDg0ODpbWzI5MjI0XV0sMTk0ODQ5OltbMjkyMzddXSwxOTQ4NTA6W1syOTI2NF1dLDE5NDg1MTpbWzE0OTAwMF1dLDE5NDg1MjpbWzI5MzEyXV0sMTk0ODUzOltbMjkzMzNdXSwxOTQ4NTQ6W1sxNDkzMDFdXSwxOTQ4NTU6W1sxNDk1MjRdXSwxOTQ4NTY6W1syOTU2Ml1dLDE5NDg1NzpbWzI5NTc5XV0sMTk0ODU4OltbMTYwNDRdXSwxOTQ4NTk6W1syOTYwNV1dLDE5NDg2MDpbWzE2MDU2XV0sMTk0ODYxOltbMTYwNTZdXSwxOTQ4NjI6W1syOTc2N11dLDE5NDg2MzpbWzI5Nzg4XV0sMTk0ODY0OltbMjk4MDldXSwxOTQ4NjU6W1syOTgyOV1dLDE5NDg2NjpbWzI5ODk4XV0sMTk0ODY3OltbMTYxNTVdXSwxOTQ4Njg6W1syOTk4OF1dLDE5NDg2OTpbWzE1MDU4Ml1dLDE5NDg3MDpbWzMwMDE0XV0sMTk0ODcxOltbMTUwNjc0XV0sMTk0ODcyOltbMzAwNjRdXSwxOTQ4NzM6W1sxMzk2NzldXSwxOTQ4NzQ6W1szMDIyNF1dLDE5NDg3NTpbWzE1MTQ1N11dLDE5NDg3NjpbWzE1MTQ4MF1dLDE5NDg3NzpbWzE1MTYyMF1dLDE5NDg3ODpbWzE2MzgwXV0sMTk0ODc5OltbMTYzOTJdXSwxOTQ4ODA6W1szMDQ1Ml1dLDE5NDg4MTpbWzE1MTc5NV1dLDE5NDg4MjpbWzE1MTc5NF1dLDE5NDg4MzpbWzE1MTgzM11dLDE5NDg4NDpbWzE1MTg1OV1dLDE5NDg4NTpbWzMwNDk0XV0sMTk0ODg2OltbMzA0OTVdXSwxOTQ4ODc6W1szMDQ5NV1dLDE5NDg4ODpbWzMwNTM4XV0sMTk0ODg5OltbMTY0NDFdXSwxOTQ4OTA6W1szMDYwM11dLDE5NDg5MTpbWzE2NDU0XV0sMTk0ODkyOltbMTY1MzRdXSwxOTQ4OTM6W1sxNTI2MDVdXSwxOTQ4OTQ6W1szMDc5OF1dLDE5NDg5NTpbWzMwODYwXV0sMTk0ODk2OltbMzA5MjRdXSwxOTQ4OTc6W1sxNjYxMV1dLDE5NDg5ODpbWzE1MzEyNl1dLDE5NDg5OTpbWzMxMDYyXV0sMTk0OTAwOltbMTUzMjQyXV0sMTk0OTAxOltbMTUzMjg1XV0sMTk0OTAyOltbMzExMTldXSwxOTQ5MDM6W1szMTIxMV1dLDE5NDkwNDpbWzE2Njg3XV0sMTk0OTA1OltbMzEyOTZdXSwxOTQ5MDY6W1szMTMwNl1dLDE5NDkwNzpbWzMxMzExXV0sMTk0OTA4OltbMTUzOTgwXV0sMTk0OTA5OltbMTU0Mjc5XV0sMTk0OTEwOltbMTU0Mjc5XV0sMTk0OTExOltbMzE0NzBdXSwxOTQ5MTI6W1sxNjg5OF1dLDE5NDkxMzpbWzE1NDUzOV1dLDE5NDkxNDpbWzMxNjg2XV0sMTk0OTE1OltbMzE2ODldXSwxOTQ5MTY6W1sxNjkzNV1dLDE5NDkxNzpbWzE1NDc1Ml1dLDE5NDkxODpbWzMxOTU0XV0sMTk0OTE5OltbMTcwNTZdXSwxOTQ5MjA6W1szMTk3Nl1dLDE5NDkyMTpbWzMxOTcxXV0sMTk0OTIyOltbMzIwMDBdXSwxOTQ5MjM6W1sxNTU1MjZdXSwxOTQ5MjQ6W1szMjA5OV1dLDE5NDkyNTpbWzE3MTUzXV0sMTk0OTI2OltbMzIxOTldXSwxOTQ5Mjc6W1szMjI1OF1dLDE5NDkyODpbWzMyMzI1XV0sMTk0OTI5OltbMTcyMDRdXSwxOTQ5MzA6W1sxNTYyMDBdXSwxOTQ5MzE6W1sxNTYyMzFdXSwxOTQ5MzI6W1sxNzI0MV1dLDE5NDkzMzpbWzE1NjM3N11dLDE5NDkzNDpbWzMyNjM0XV0sMTk0OTM1OltbMTU2NDc4XV0sMTk0OTM2OltbMzI2NjFdXSwxOTQ5Mzc6W1szMjc2Ml1dLDE5NDkzODpbWzMyNzczXV0sMTk0OTM5OltbMTU2ODkwXV0sMTk0OTQwOltbMTU2OTYzXV0sMTk0OTQxOltbMzI4NjRdXSwxOTQ5NDI6W1sxNTcwOTZdXSwxOTQ5NDM6W1szMjg4MF1dLDE5NDk0NDpbWzE0NDIyM11dLDE5NDk0NTpbWzE3MzY1XV0sMTk0OTQ2OltbMzI5NDZdXSwxOTQ5NDc6W1szMzAyN11dLDE5NDk0ODpbWzE3NDE5XV0sMTk0OTQ5OltbMzMwODZdXSwxOTQ5NTA6W1syMzIyMV1dLDE5NDk1MTpbWzE1NzYwN11dLDE5NDk1MjpbWzE1NzYyMV1dLDE5NDk1MzpbWzE0NDI3NV1dLDE5NDk1NDpbWzE0NDI4NF1dLDE5NDk1NTpbWzMzMjgxXV0sMTk0OTU2OltbMzMyODRdXSwxOTQ5NTc6W1szNjc2Nl1dLDE5NDk1ODpbWzE3NTE1XV0sMTk0OTU5OltbMzM0MjVdXSwxOTQ5NjA6W1szMzQxOV1dLDE5NDk2MTpbWzMzNDM3XV0sMTk0OTYyOltbMjExNzFdXSwxOTQ5NjM6W1szMzQ1N11dLDE5NDk2NDpbWzMzNDU5XV0sMTk0OTY1OltbMzM0NjldXSwxOTQ5NjY6W1szMzUxMF1dLDE5NDk2NzpbWzE1ODUyNF1dLDE5NDk2ODpbWzMzNTA5XV0sMTk0OTY5OltbMzM1NjVdXSwxOTQ5NzA6W1szMzYzNV1dLDE5NDk3MTpbWzMzNzA5XV0sMTk0OTcyOltbMzM1NzFdXSwxOTQ5NzM6W1szMzcyNV1dLDE5NDk3NDpbWzMzNzY3XV0sMTk0OTc1OltbMzM4NzldXSwxOTQ5NzY6W1szMzYxOV1dLDE5NDk3NzpbWzMzNzM4XV0sMTk0OTc4OltbMzM3NDBdXSwxOTQ5Nzk6W1szMzc1Nl1dLDE5NDk4MDpbWzE1ODc3NF1dLDE5NDk4MTpbWzE1OTA4M11dLDE5NDk4MjpbWzE1ODkzM11dLDE5NDk4MzpbWzE3NzA3XV0sMTk0OTg0OltbMzQwMzNdXSwxOTQ5ODU6W1szNDAzNV1dLDE5NDk4NjpbWzM0MDcwXV0sMTk0OTg3OltbMTYwNzE0XV0sMTk0OTg4OltbMzQxNDhdXSwxOTQ5ODk6W1sxNTk1MzJdXSwxOTQ5OTA6W1sxNzc1N11dLDE5NDk5MTpbWzE3NzYxXV0sMTk0OTkyOltbMTU5NjY1XV0sMTk0OTkzOltbMTU5OTU0XV0sMTk0OTk0OltbMTc3NzFdXSwxOTQ5OTU6W1szNDM4NF1dLDE5NDk5NjpbWzM0Mzk2XV0sMTk0OTk3OltbMzQ0MDddXSwxOTQ5OTg6W1szNDQwOV1dLDE5NDk5OTpbWzM0NDczXV0sMTk1MDAwOltbMzQ0NDBdXSwxOTUwMDE6W1szNDU3NF1dLDE5NTAwMjpbWzM0NTMwXV0sMTk1MDAzOltbMzQ2ODFdXSwxOTUwMDQ6W1szNDYwMF1dLDE5NTAwNTpbWzM0NjY3XV0sMTk1MDA2OltbMzQ2OTRdXSwxOTUwMDc6W1sxNzg3OV1dLDE5NTAwODpbWzM0Nzg1XV0sMTk1MDA5OltbMzQ4MTddXSwxOTUwMTA6W1sxNzkxM11dLDE5NTAxMTpbWzM0OTEyXV0sMTk1MDEyOltbMzQ5MTVdXSwxOTUwMTM6W1sxNjEzODNdXSwxOTUwMTQ6W1szNTAzMV1dLDE5NTAxNTpbWzM1MDM4XV0sMTk1MDE2OltbMTc5NzNdXSwxOTUwMTc6W1szNTA2Nl1dLDE5NTAxODpbWzEzNDk5XV0sMTk1MDE5OltbMTYxOTY2XV0sMTk1MDIwOltbMTYyMTUwXV0sMTk1MDIxOltbMTgxMTBdXSwxOTUwMjI6W1sxODExOV1dLDE5NTAyMzpbWzM1NDg4XV0sMTk1MDI0OltbMzU1NjVdXSwxOTUwMjU6W1szNTcyMl1dLDE5NTAyNjpbWzM1OTI1XV0sMTk1MDI3OltbMTYyOTg0XV0sMTk1MDI4OltbMzYwMTFdXSwxOTUwMjk6W1szNjAzM11dLDE5NTAzMDpbWzM2MTIzXV0sMTk1MDMxOltbMzYyMTVdXSwxOTUwMzI6W1sxNjM2MzFdXSwxOTUwMzM6W1sxMzMxMjRdXSwxOTUwMzQ6W1szNjI5OV1dLDE5NTAzNTpbWzM2Mjg0XV0sMTk1MDM2OltbMzYzMzZdXSwxOTUwMzc6W1sxMzMzNDJdXSwxOTUwMzg6W1szNjU2NF1dLDE5NTAzOTpbWzM2NjY0XV0sMTk1MDQwOltbMTY1MzMwXV0sMTk1MDQxOltbMTY1MzU3XV0sMTk1MDQyOltbMzcwMTJdXSwxOTUwNDM6W1szNzEwNV1dLDE5NTA0NDpbWzM3MTM3XV0sMTk1MDQ1OltbMTY1Njc4XV0sMTk1MDQ2OltbMzcxNDddXSwxOTUwNDc6W1szNzQzMl1dLDE5NTA0ODpbWzM3NTkxXV0sMTk1MDQ5OltbMzc1OTJdXSwxOTUwNTA6W1szNzUwMF1dLDE5NTA1MTpbWzM3ODgxXV0sMTk1MDUyOltbMzc5MDldXSwxOTUwNTM6W1sxNjY5MDZdXSwxOTUwNTQ6W1szODI4M11dLDE5NTA1NTpbWzE4ODM3XV0sMTk1MDU2OltbMzgzMjddXSwxOTUwNTc6W1sxNjcyODddXSwxOTUwNTg6W1sxODkxOF1dLDE5NTA1OTpbWzM4NTk1XV0sMTk1MDYwOltbMjM5ODZdXSwxOTUwNjE6W1szODY5MV1dLDE5NTA2MjpbWzE2ODI2MV1dLDE5NTA2MzpbWzE2ODQ3NF1dLDE5NTA2NDpbWzE5MDU0XV0sMTk1MDY1OltbMTkwNjJdXSwxOTUwNjY6W1szODg4MF1dLDE5NTA2NzpbWzE2ODk3MF1dLDE5NTA2ODpbWzE5MTIyXV0sMTk1MDY5OltbMTY5MTEwXV0sMTk1MDcwOltbMzg5MjNdXSwxOTUwNzE6W1szODkyM11dfSxcbjY0MDAwOns2NDAwMDpbWzIwOTk5XV0sNjQwMDE6W1syNDIzMF1dLDY0MDAyOltbMjUyOTldXSw2NDAwMzpbWzMxOTU4XV0sNjQwMDQ6W1syMzQyOV1dLDY0MDA1OltbMjc5MzRdXSw2NDAwNjpbWzI2MjkyXV0sNjQwMDc6W1szNjY2N11dLDY0MDA4OltbMzQ4OTJdXSw2NDAwOTpbWzM4NDc3XV0sNjQwMTA6W1szNTIxMV1dLDY0MDExOltbMjQyNzVdXSw2NDAxMjpbWzIwODAwXV0sNjQwMTM6W1syMTk1Ml1dLDY0MDE2OltbMjI2MThdXSw2NDAxODpbWzI2MjI4XV0sNjQwMjE6W1syMDk1OF1dLDY0MDIyOltbMjk0ODJdXSw2NDAyMzpbWzMwNDEwXV0sNjQwMjQ6W1szMTAzNl1dLDY0MDI1OltbMzEwNzBdXSw2NDAyNjpbWzMxMDc3XV0sNjQwMjc6W1szMTExOV1dLDY0MDI4OltbMzg3NDJdXSw2NDAyOTpbWzMxOTM0XV0sNjQwMzA6W1szMjcwMV1dLDY0MDMyOltbMzQzMjJdXSw2NDAzNDpbWzM1NTc2XV0sNjQwMzc6W1szNjkyMF1dLDY0MDM4OltbMzcxMTddXSw2NDA0MjpbWzM5MTUxXV0sNjQwNDM6W1szOTE2NF1dLDY0MDQ0OltbMzkyMDhdXSw2NDA0NTpbWzQwMzcyXV0sNjQwNDY6W1szNzA4Nl1dLDY0MDQ3OltbMzg1ODNdXSw2NDA0ODpbWzIwMzk4XV0sNjQwNDk6W1syMDcxMV1dLDY0MDUwOltbMjA4MTNdXSw2NDA1MTpbWzIxMTkzXV0sNjQwNTI6W1syMTIyMF1dLDY0MDUzOltbMjEzMjldXSw2NDA1NDpbWzIxOTE3XV0sNjQwNTU6W1syMjAyMl1dLDY0MDU2OltbMjIxMjBdXSw2NDA1NzpbWzIyNTkyXV0sNjQwNTg6W1syMjY5Nl1dLDY0MDU5OltbMjM2NTJdXSw2NDA2MDpbWzIzNjYyXV0sNjQwNjE6W1syNDcyNF1dLDY0MDYyOltbMjQ5MzZdXSw2NDA2MzpbWzI0OTc0XV0sNjQwNjQ6W1syNTA3NF1dLDY0MDY1OltbMjU5MzVdXSw2NDA2NjpbWzI2MDgyXV0sNjQwNjc6W1syNjI1N11dLDY0MDY4OltbMjY3NTddXSw2NDA2OTpbWzI4MDIzXV0sNjQwNzA6W1syODE4Nl1dLDY0MDcxOltbMjg0NTBdXSw2NDA3MjpbWzI5MDM4XV0sNjQwNzM6W1syOTIyN11dLDY0MDc0OltbMjk3MzBdXSw2NDA3NTpbWzMwODY1XV0sNjQwNzY6W1szMTAzOF1dLDY0MDc3OltbMzEwNDldXSw2NDA3ODpbWzMxMDQ4XV0sNjQwNzk6W1szMTA1Nl1dLDY0MDgwOltbMzEwNjJdXSw2NDA4MTpbWzMxMDY5XV0sNjQwODI6W1szMTExN11dLDY0MDgzOltbMzExMThdXSw2NDA4NDpbWzMxMjk2XV0sNjQwODU6W1szMTM2MV1dLDY0MDg2OltbMzE2ODBdXSw2NDA4NzpbWzMyMjQ0XV0sNjQwODg6W1szMjI2NV1dLDY0MDg5OltbMzIzMjFdXSw2NDA5MDpbWzMyNjI2XV0sNjQwOTE6W1szMjc3M11dLDY0MDkyOltbMzMyNjFdXSw2NDA5MzpbWzMzNDAxXV0sNjQwOTQ6W1szMzQwMV1dLDY0MDk1OltbMzM4NzldXSw2NDA5NjpbWzM1MDg4XV0sNjQwOTc6W1szNTIyMl1dLDY0MDk4OltbMzU1ODVdXSw2NDA5OTpbWzM1NjQxXV0sNjQxMDA6W1szNjA1MV1dLDY0MTAxOltbMzYxMDRdXSw2NDEwMjpbWzM2NzkwXV0sNjQxMDM6W1szNjkyMF1dLDY0MTA0OltbMzg2MjddXSw2NDEwNTpbWzM4OTExXV0sNjQxMDY6W1szODk3MV1dLDY0MTA3OltbMjQ2OTNdXSw2NDEwODpbWzE0ODIwNl1dLDY0MTA5OltbMzMzMDRdXSw2NDExMjpbWzIwMDA2XV0sNjQxMTM6W1syMDkxN11dLDY0MTE0OltbMjA4NDBdXSw2NDExNTpbWzIwMzUyXV0sNjQxMTY6W1syMDgwNV1dLDY0MTE3OltbMjA4NjRdXSw2NDExODpbWzIxMTkxXV0sNjQxMTk6W1syMTI0Ml1dLDY0MTIwOltbMjE5MTddXSw2NDEyMTpbWzIxODQ1XV0sNjQxMjI6W1syMTkxM11dLDY0MTIzOltbMjE5ODZdXSw2NDEyNDpbWzIyNjE4XV0sNjQxMjU6W1syMjcwN11dLDY0MTI2OltbMjI4NTJdXSw2NDEyNzpbWzIyODY4XV0sNjQxMjg6W1syMzEzOF1dLDY0MTI5OltbMjMzMzZdXSw2NDEzMDpbWzI0Mjc0XV0sNjQxMzE6W1syNDI4MV1dLDY0MTMyOltbMjQ0MjVdXSw2NDEzMzpbWzI0NDkzXV0sNjQxMzQ6W1syNDc5Ml1dLDY0MTM1OltbMjQ5MTBdXSw2NDEzNjpbWzI0ODQwXV0sNjQxMzc6W1syNDk3NF1dLDY0MTM4OltbMjQ5MjhdXSw2NDEzOTpbWzI1MDc0XV0sNjQxNDA6W1syNTE0MF1dLDY0MTQxOltbMjU1NDBdXSw2NDE0MjpbWzI1NjI4XV0sNjQxNDM6W1syNTY4Ml1dLDY0MTQ0OltbMjU5NDJdXSw2NDE0NTpbWzI2MjI4XV0sNjQxNDY6W1syNjM5MV1dLDY0MTQ3OltbMjYzOTVdXSw2NDE0ODpbWzI2NDU0XV0sNjQxNDk6W1syNzUxM11dLDY0MTUwOltbMjc1NzhdXSw2NDE1MTpbWzI3OTY5XV0sNjQxNTI6W1syODM3OV1dLDY0MTUzOltbMjgzNjNdXSw2NDE1NDpbWzI4NDUwXV0sNjQxNTU6W1syODcwMl1dLDY0MTU2OltbMjkwMzhdXSw2NDE1NzpbWzMwNjMxXV0sNjQxNTg6W1syOTIzN11dLDY0MTU5OltbMjkzNTldXSw2NDE2MDpbWzI5NDgyXV0sNjQxNjE6W1syOTgwOV1dLDY0MTYyOltbMjk5NThdXSw2NDE2MzpbWzMwMDExXV0sNjQxNjQ6W1szMDIzN11dLDY0MTY1OltbMzAyMzldXSw2NDE2NjpbWzMwNDEwXV0sNjQxNjc6W1szMDQyN11dLDY0MTY4OltbMzA0NTJdXSw2NDE2OTpbWzMwNTM4XV0sNjQxNzA6W1szMDUyOF1dLDY0MTcxOltbMzA5MjRdXSw2NDE3MjpbWzMxNDA5XV0sNjQxNzM6W1szMTY4MF1dLDY0MTc0OltbMzE4NjddXSw2NDE3NTpbWzMyMDkxXV0sNjQxNzY6W1szMjI0NF1dLDY0MTc3OltbMzI1NzRdXSw2NDE3ODpbWzMyNzczXV0sNjQxNzk6W1szMzYxOF1dLDY0MTgwOltbMzM3NzVdXSw2NDE4MTpbWzM0NjgxXV0sNjQxODI6W1szNTEzN11dLDY0MTgzOltbMzUyMDZdXSw2NDE4NDpbWzM1MjIyXV0sNjQxODU6W1szNTUxOV1dLDY0MTg2OltbMzU1NzZdXSw2NDE4NzpbWzM1NTMxXV0sNjQxODg6W1szNTU4NV1dLDY0MTg5OltbMzU1ODJdXSw2NDE5MDpbWzM1NTY1XV0sNjQxOTE6W1szNTY0MV1dLDY0MTkyOltbMzU3MjJdXSw2NDE5MzpbWzM2MTA0XV0sNjQxOTQ6W1szNjY2NF1dLDY0MTk1OltbMzY5NzhdXSw2NDE5NjpbWzM3MjczXV0sNjQxOTc6W1szNzQ5NF1dLDY0MTk4OltbMzg1MjRdXSw2NDE5OTpbWzM4NjI3XV0sNjQyMDA6W1szODc0Ml1dLDY0MjAxOltbMzg4NzVdXSw2NDIwMjpbWzM4OTExXV0sNjQyMDM6W1szODkyM11dLDY0MjA0OltbMzg5NzFdXSw2NDIwNTpbWzM5Njk4XV0sNjQyMDY6W1s0MDg2MF1dLDY0MjA3OltbMTQxMzg2XV0sNjQyMDg6W1sxNDEzODBdXSw2NDIwOTpbWzE0NDM0MV1dLDY0MjEwOltbMTUyNjFdXSw2NDIxMTpbWzE2NDA4XV0sNjQyMTI6W1sxNjQ0MV1dLDY0MjEzOltbMTUyMTM3XV0sNjQyMTQ6W1sxNTQ4MzJdXSw2NDIxNTpbWzE2MzUzOV1dLDY0MjE2OltbNDA3NzFdXSw2NDIxNzpbWzQwODQ2XV0sMTk1MDcyOltbMzg5NTNdXSwxOTUwNzM6W1sxNjkzOThdXSwxOTUwNzQ6W1szOTEzOF1dLDE5NTA3NTpbWzE5MjUxXV0sMTk1MDc2OltbMzkyMDldXSwxOTUwNzc6W1szOTMzNV1dLDE5NTA3ODpbWzM5MzYyXV0sMTk1MDc5OltbMzk0MjJdXSwxOTUwODA6W1sxOTQwNl1dLDE5NTA4MTpbWzE3MDgwMF1dLDE5NTA4MjpbWzM5Njk4XV0sMTk1MDgzOltbNDAwMDBdXSwxOTUwODQ6W1s0MDE4OV1dLDE5NTA4NTpbWzE5NjYyXV0sMTk1MDg2OltbMTk2OTNdXSwxOTUwODc6W1s0MDI5NV1dLDE5NTA4ODpbWzE3MjIzOF1dLDE5NTA4OTpbWzE5NzA0XV0sMTk1MDkwOltbMTcyMjkzXV0sMTk1MDkxOltbMTcyNTU4XV0sMTk1MDkyOltbMTcyNjg5XV0sMTk1MDkzOltbNDA2MzVdXSwxOTUwOTQ6W1sxOTc5OF1dLDE5NTA5NTpbWzQwNjk3XV0sMTk1MDk2OltbNDA3MDJdXSwxOTUwOTc6W1s0MDcwOV1dLDE5NTA5ODpbWzQwNzE5XV0sMTk1MDk5OltbNDA3MjZdXSwxOTUxMDA6W1s0MDc2M11dLDE5NTEwMTpbWzE3MzU2OF1dfSxcbjY0MjU2Ons2NDI1NjpbWzEwMiwxMDJdLDI1Nl0sNjQyNTc6W1sxMDIsMTA1XSwyNTZdLDY0MjU4OltbMTAyLDEwOF0sMjU2XSw2NDI1OTpbWzEwMiwxMDIsMTA1XSwyNTZdLDY0MjYwOltbMTAyLDEwMiwxMDhdLDI1Nl0sNjQyNjE6W1szODMsMTE2XSwyNTZdLDY0MjYyOltbMTE1LDExNl0sMjU2XSw2NDI3NTpbWzEzOTYsMTM5OF0sMjU2XSw2NDI3NjpbWzEzOTYsMTM4MV0sMjU2XSw2NDI3NzpbWzEzOTYsMTM4N10sMjU2XSw2NDI3ODpbWzE0MDYsMTM5OF0sMjU2XSw2NDI3OTpbWzEzOTYsMTM4OV0sMjU2XSw2NDI4NTpbWzE0OTcsMTQ2MF0sNTEyXSw2NDI4NjpbLDI2XSw2NDI4NzpbWzE1MjIsMTQ2M10sNTEyXSw2NDI4ODpbWzE1MDZdLDI1Nl0sNjQyODk6W1sxNDg4XSwyNTZdLDY0MjkwOltbMTQ5MV0sMjU2XSw2NDI5MTpbWzE0OTJdLDI1Nl0sNjQyOTI6W1sxNDk5XSwyNTZdLDY0MjkzOltbMTUwMF0sMjU2XSw2NDI5NDpbWzE1MDFdLDI1Nl0sNjQyOTU6W1sxNTEyXSwyNTZdLDY0Mjk2OltbMTUxNF0sMjU2XSw2NDI5NzpbWzQzXSwyNTZdLDY0Mjk4OltbMTUxMywxNDczXSw1MTJdLDY0Mjk5OltbMTUxMywxNDc0XSw1MTJdLDY0MzAwOltbNjQzMjksMTQ3M10sNTEyXSw2NDMwMTpbWzY0MzI5LDE0NzRdLDUxMl0sNjQzMDI6W1sxNDg4LDE0NjNdLDUxMl0sNjQzMDM6W1sxNDg4LDE0NjRdLDUxMl0sNjQzMDQ6W1sxNDg4LDE0NjhdLDUxMl0sNjQzMDU6W1sxNDg5LDE0NjhdLDUxMl0sNjQzMDY6W1sxNDkwLDE0NjhdLDUxMl0sNjQzMDc6W1sxNDkxLDE0NjhdLDUxMl0sNjQzMDg6W1sxNDkyLDE0NjhdLDUxMl0sNjQzMDk6W1sxNDkzLDE0NjhdLDUxMl0sNjQzMTA6W1sxNDk0LDE0NjhdLDUxMl0sNjQzMTI6W1sxNDk2LDE0NjhdLDUxMl0sNjQzMTM6W1sxNDk3LDE0NjhdLDUxMl0sNjQzMTQ6W1sxNDk4LDE0NjhdLDUxMl0sNjQzMTU6W1sxNDk5LDE0NjhdLDUxMl0sNjQzMTY6W1sxNTAwLDE0NjhdLDUxMl0sNjQzMTg6W1sxNTAyLDE0NjhdLDUxMl0sNjQzMjA6W1sxNTA0LDE0NjhdLDUxMl0sNjQzMjE6W1sxNTA1LDE0NjhdLDUxMl0sNjQzMjM6W1sxNTA3LDE0NjhdLDUxMl0sNjQzMjQ6W1sxNTA4LDE0NjhdLDUxMl0sNjQzMjY6W1sxNTEwLDE0NjhdLDUxMl0sNjQzMjc6W1sxNTExLDE0NjhdLDUxMl0sNjQzMjg6W1sxNTEyLDE0NjhdLDUxMl0sNjQzMjk6W1sxNTEzLDE0NjhdLDUxMl0sNjQzMzA6W1sxNTE0LDE0NjhdLDUxMl0sNjQzMzE6W1sxNDkzLDE0NjVdLDUxMl0sNjQzMzI6W1sxNDg5LDE0NzFdLDUxMl0sNjQzMzM6W1sxNDk5LDE0NzFdLDUxMl0sNjQzMzQ6W1sxNTA4LDE0NzFdLDUxMl0sNjQzMzU6W1sxNDg4LDE1MDBdLDI1Nl0sNjQzMzY6W1sxNjQ5XSwyNTZdLDY0MzM3OltbMTY0OV0sMjU2XSw2NDMzODpbWzE2NTldLDI1Nl0sNjQzMzk6W1sxNjU5XSwyNTZdLDY0MzQwOltbMTY1OV0sMjU2XSw2NDM0MTpbWzE2NTldLDI1Nl0sNjQzNDI6W1sxNjYyXSwyNTZdLDY0MzQzOltbMTY2Ml0sMjU2XSw2NDM0NDpbWzE2NjJdLDI1Nl0sNjQzNDU6W1sxNjYyXSwyNTZdLDY0MzQ2OltbMTY2NF0sMjU2XSw2NDM0NzpbWzE2NjRdLDI1Nl0sNjQzNDg6W1sxNjY0XSwyNTZdLDY0MzQ5OltbMTY2NF0sMjU2XSw2NDM1MDpbWzE2NThdLDI1Nl0sNjQzNTE6W1sxNjU4XSwyNTZdLDY0MzUyOltbMTY1OF0sMjU2XSw2NDM1MzpbWzE2NThdLDI1Nl0sNjQzNTQ6W1sxNjYzXSwyNTZdLDY0MzU1OltbMTY2M10sMjU2XSw2NDM1NjpbWzE2NjNdLDI1Nl0sNjQzNTc6W1sxNjYzXSwyNTZdLDY0MzU4OltbMTY1N10sMjU2XSw2NDM1OTpbWzE2NTddLDI1Nl0sNjQzNjA6W1sxNjU3XSwyNTZdLDY0MzYxOltbMTY1N10sMjU2XSw2NDM2MjpbWzE3MDBdLDI1Nl0sNjQzNjM6W1sxNzAwXSwyNTZdLDY0MzY0OltbMTcwMF0sMjU2XSw2NDM2NTpbWzE3MDBdLDI1Nl0sNjQzNjY6W1sxNzAyXSwyNTZdLDY0MzY3OltbMTcwMl0sMjU2XSw2NDM2ODpbWzE3MDJdLDI1Nl0sNjQzNjk6W1sxNzAyXSwyNTZdLDY0MzcwOltbMTY2OF0sMjU2XSw2NDM3MTpbWzE2NjhdLDI1Nl0sNjQzNzI6W1sxNjY4XSwyNTZdLDY0MzczOltbMTY2OF0sMjU2XSw2NDM3NDpbWzE2NjddLDI1Nl0sNjQzNzU6W1sxNjY3XSwyNTZdLDY0Mzc2OltbMTY2N10sMjU2XSw2NDM3NzpbWzE2NjddLDI1Nl0sNjQzNzg6W1sxNjcwXSwyNTZdLDY0Mzc5OltbMTY3MF0sMjU2XSw2NDM4MDpbWzE2NzBdLDI1Nl0sNjQzODE6W1sxNjcwXSwyNTZdLDY0MzgyOltbMTY3MV0sMjU2XSw2NDM4MzpbWzE2NzFdLDI1Nl0sNjQzODQ6W1sxNjcxXSwyNTZdLDY0Mzg1OltbMTY3MV0sMjU2XSw2NDM4NjpbWzE2NzddLDI1Nl0sNjQzODc6W1sxNjc3XSwyNTZdLDY0Mzg4OltbMTY3Nl0sMjU2XSw2NDM4OTpbWzE2NzZdLDI1Nl0sNjQzOTA6W1sxNjc4XSwyNTZdLDY0MzkxOltbMTY3OF0sMjU2XSw2NDM5MjpbWzE2NzJdLDI1Nl0sNjQzOTM6W1sxNjcyXSwyNTZdLDY0Mzk0OltbMTY4OF0sMjU2XSw2NDM5NTpbWzE2ODhdLDI1Nl0sNjQzOTY6W1sxNjgxXSwyNTZdLDY0Mzk3OltbMTY4MV0sMjU2XSw2NDM5ODpbWzE3MDVdLDI1Nl0sNjQzOTk6W1sxNzA1XSwyNTZdLDY0NDAwOltbMTcwNV0sMjU2XSw2NDQwMTpbWzE3MDVdLDI1Nl0sNjQ0MDI6W1sxNzExXSwyNTZdLDY0NDAzOltbMTcxMV0sMjU2XSw2NDQwNDpbWzE3MTFdLDI1Nl0sNjQ0MDU6W1sxNzExXSwyNTZdLDY0NDA2OltbMTcxNV0sMjU2XSw2NDQwNzpbWzE3MTVdLDI1Nl0sNjQ0MDg6W1sxNzE1XSwyNTZdLDY0NDA5OltbMTcxNV0sMjU2XSw2NDQxMDpbWzE3MTNdLDI1Nl0sNjQ0MTE6W1sxNzEzXSwyNTZdLDY0NDEyOltbMTcxM10sMjU2XSw2NDQxMzpbWzE3MTNdLDI1Nl0sNjQ0MTQ6W1sxNzIyXSwyNTZdLDY0NDE1OltbMTcyMl0sMjU2XSw2NDQxNjpbWzE3MjNdLDI1Nl0sNjQ0MTc6W1sxNzIzXSwyNTZdLDY0NDE4OltbMTcyM10sMjU2XSw2NDQxOTpbWzE3MjNdLDI1Nl0sNjQ0MjA6W1sxNzI4XSwyNTZdLDY0NDIxOltbMTcyOF0sMjU2XSw2NDQyMjpbWzE3MjldLDI1Nl0sNjQ0MjM6W1sxNzI5XSwyNTZdLDY0NDI0OltbMTcyOV0sMjU2XSw2NDQyNTpbWzE3MjldLDI1Nl0sNjQ0MjY6W1sxNzI2XSwyNTZdLDY0NDI3OltbMTcyNl0sMjU2XSw2NDQyODpbWzE3MjZdLDI1Nl0sNjQ0Mjk6W1sxNzI2XSwyNTZdLDY0NDMwOltbMTc0Nl0sMjU2XSw2NDQzMTpbWzE3NDZdLDI1Nl0sNjQ0MzI6W1sxNzQ3XSwyNTZdLDY0NDMzOltbMTc0N10sMjU2XSw2NDQ2NzpbWzE3MDldLDI1Nl0sNjQ0Njg6W1sxNzA5XSwyNTZdLDY0NDY5OltbMTcwOV0sMjU2XSw2NDQ3MDpbWzE3MDldLDI1Nl0sNjQ0NzE6W1sxNzM1XSwyNTZdLDY0NDcyOltbMTczNV0sMjU2XSw2NDQ3MzpbWzE3MzRdLDI1Nl0sNjQ0NzQ6W1sxNzM0XSwyNTZdLDY0NDc1OltbMTczNl0sMjU2XSw2NDQ3NjpbWzE3MzZdLDI1Nl0sNjQ0Nzc6W1sxNjU1XSwyNTZdLDY0NDc4OltbMTczOV0sMjU2XSw2NDQ3OTpbWzE3MzldLDI1Nl0sNjQ0ODA6W1sxNzMzXSwyNTZdLDY0NDgxOltbMTczM10sMjU2XSw2NDQ4MjpbWzE3MzddLDI1Nl0sNjQ0ODM6W1sxNzM3XSwyNTZdLDY0NDg0OltbMTc0NF0sMjU2XSw2NDQ4NTpbWzE3NDRdLDI1Nl0sNjQ0ODY6W1sxNzQ0XSwyNTZdLDY0NDg3OltbMTc0NF0sMjU2XSw2NDQ4ODpbWzE2MDldLDI1Nl0sNjQ0ODk6W1sxNjA5XSwyNTZdLDY0NDkwOltbMTU3NCwxNTc1XSwyNTZdLDY0NDkxOltbMTU3NCwxNTc1XSwyNTZdLDY0NDkyOltbMTU3NCwxNzQ5XSwyNTZdLDY0NDkzOltbMTU3NCwxNzQ5XSwyNTZdLDY0NDk0OltbMTU3NCwxNjA4XSwyNTZdLDY0NDk1OltbMTU3NCwxNjA4XSwyNTZdLDY0NDk2OltbMTU3NCwxNzM1XSwyNTZdLDY0NDk3OltbMTU3NCwxNzM1XSwyNTZdLDY0NDk4OltbMTU3NCwxNzM0XSwyNTZdLDY0NDk5OltbMTU3NCwxNzM0XSwyNTZdLDY0NTAwOltbMTU3NCwxNzM2XSwyNTZdLDY0NTAxOltbMTU3NCwxNzM2XSwyNTZdLDY0NTAyOltbMTU3NCwxNzQ0XSwyNTZdLDY0NTAzOltbMTU3NCwxNzQ0XSwyNTZdLDY0NTA0OltbMTU3NCwxNzQ0XSwyNTZdLDY0NTA1OltbMTU3NCwxNjA5XSwyNTZdLDY0NTA2OltbMTU3NCwxNjA5XSwyNTZdLDY0NTA3OltbMTU3NCwxNjA5XSwyNTZdLDY0NTA4OltbMTc0MF0sMjU2XSw2NDUwOTpbWzE3NDBdLDI1Nl0sNjQ1MTA6W1sxNzQwXSwyNTZdLDY0NTExOltbMTc0MF0sMjU2XX0sXG42NDUxMjp7NjQ1MTI6W1sxNTc0LDE1ODBdLDI1Nl0sNjQ1MTM6W1sxNTc0LDE1ODFdLDI1Nl0sNjQ1MTQ6W1sxNTc0LDE2MDVdLDI1Nl0sNjQ1MTU6W1sxNTc0LDE2MDldLDI1Nl0sNjQ1MTY6W1sxNTc0LDE2MTBdLDI1Nl0sNjQ1MTc6W1sxNTc2LDE1ODBdLDI1Nl0sNjQ1MTg6W1sxNTc2LDE1ODFdLDI1Nl0sNjQ1MTk6W1sxNTc2LDE1ODJdLDI1Nl0sNjQ1MjA6W1sxNTc2LDE2MDVdLDI1Nl0sNjQ1MjE6W1sxNTc2LDE2MDldLDI1Nl0sNjQ1MjI6W1sxNTc2LDE2MTBdLDI1Nl0sNjQ1MjM6W1sxNTc4LDE1ODBdLDI1Nl0sNjQ1MjQ6W1sxNTc4LDE1ODFdLDI1Nl0sNjQ1MjU6W1sxNTc4LDE1ODJdLDI1Nl0sNjQ1MjY6W1sxNTc4LDE2MDVdLDI1Nl0sNjQ1Mjc6W1sxNTc4LDE2MDldLDI1Nl0sNjQ1Mjg6W1sxNTc4LDE2MTBdLDI1Nl0sNjQ1Mjk6W1sxNTc5LDE1ODBdLDI1Nl0sNjQ1MzA6W1sxNTc5LDE2MDVdLDI1Nl0sNjQ1MzE6W1sxNTc5LDE2MDldLDI1Nl0sNjQ1MzI6W1sxNTc5LDE2MTBdLDI1Nl0sNjQ1MzM6W1sxNTgwLDE1ODFdLDI1Nl0sNjQ1MzQ6W1sxNTgwLDE2MDVdLDI1Nl0sNjQ1MzU6W1sxNTgxLDE1ODBdLDI1Nl0sNjQ1MzY6W1sxNTgxLDE2MDVdLDI1Nl0sNjQ1Mzc6W1sxNTgyLDE1ODBdLDI1Nl0sNjQ1Mzg6W1sxNTgyLDE1ODFdLDI1Nl0sNjQ1Mzk6W1sxNTgyLDE2MDVdLDI1Nl0sNjQ1NDA6W1sxNTg3LDE1ODBdLDI1Nl0sNjQ1NDE6W1sxNTg3LDE1ODFdLDI1Nl0sNjQ1NDI6W1sxNTg3LDE1ODJdLDI1Nl0sNjQ1NDM6W1sxNTg3LDE2MDVdLDI1Nl0sNjQ1NDQ6W1sxNTg5LDE1ODFdLDI1Nl0sNjQ1NDU6W1sxNTg5LDE2MDVdLDI1Nl0sNjQ1NDY6W1sxNTkwLDE1ODBdLDI1Nl0sNjQ1NDc6W1sxNTkwLDE1ODFdLDI1Nl0sNjQ1NDg6W1sxNTkwLDE1ODJdLDI1Nl0sNjQ1NDk6W1sxNTkwLDE2MDVdLDI1Nl0sNjQ1NTA6W1sxNTkxLDE1ODFdLDI1Nl0sNjQ1NTE6W1sxNTkxLDE2MDVdLDI1Nl0sNjQ1NTI6W1sxNTkyLDE2MDVdLDI1Nl0sNjQ1NTM6W1sxNTkzLDE1ODBdLDI1Nl0sNjQ1NTQ6W1sxNTkzLDE2MDVdLDI1Nl0sNjQ1NTU6W1sxNTk0LDE1ODBdLDI1Nl0sNjQ1NTY6W1sxNTk0LDE2MDVdLDI1Nl0sNjQ1NTc6W1sxNjAxLDE1ODBdLDI1Nl0sNjQ1NTg6W1sxNjAxLDE1ODFdLDI1Nl0sNjQ1NTk6W1sxNjAxLDE1ODJdLDI1Nl0sNjQ1NjA6W1sxNjAxLDE2MDVdLDI1Nl0sNjQ1NjE6W1sxNjAxLDE2MDldLDI1Nl0sNjQ1NjI6W1sxNjAxLDE2MTBdLDI1Nl0sNjQ1NjM6W1sxNjAyLDE1ODFdLDI1Nl0sNjQ1NjQ6W1sxNjAyLDE2MDVdLDI1Nl0sNjQ1NjU6W1sxNjAyLDE2MDldLDI1Nl0sNjQ1NjY6W1sxNjAyLDE2MTBdLDI1Nl0sNjQ1Njc6W1sxNjAzLDE1NzVdLDI1Nl0sNjQ1Njg6W1sxNjAzLDE1ODBdLDI1Nl0sNjQ1Njk6W1sxNjAzLDE1ODFdLDI1Nl0sNjQ1NzA6W1sxNjAzLDE1ODJdLDI1Nl0sNjQ1NzE6W1sxNjAzLDE2MDRdLDI1Nl0sNjQ1NzI6W1sxNjAzLDE2MDVdLDI1Nl0sNjQ1NzM6W1sxNjAzLDE2MDldLDI1Nl0sNjQ1NzQ6W1sxNjAzLDE2MTBdLDI1Nl0sNjQ1NzU6W1sxNjA0LDE1ODBdLDI1Nl0sNjQ1NzY6W1sxNjA0LDE1ODFdLDI1Nl0sNjQ1Nzc6W1sxNjA0LDE1ODJdLDI1Nl0sNjQ1Nzg6W1sxNjA0LDE2MDVdLDI1Nl0sNjQ1Nzk6W1sxNjA0LDE2MDldLDI1Nl0sNjQ1ODA6W1sxNjA0LDE2MTBdLDI1Nl0sNjQ1ODE6W1sxNjA1LDE1ODBdLDI1Nl0sNjQ1ODI6W1sxNjA1LDE1ODFdLDI1Nl0sNjQ1ODM6W1sxNjA1LDE1ODJdLDI1Nl0sNjQ1ODQ6W1sxNjA1LDE2MDVdLDI1Nl0sNjQ1ODU6W1sxNjA1LDE2MDldLDI1Nl0sNjQ1ODY6W1sxNjA1LDE2MTBdLDI1Nl0sNjQ1ODc6W1sxNjA2LDE1ODBdLDI1Nl0sNjQ1ODg6W1sxNjA2LDE1ODFdLDI1Nl0sNjQ1ODk6W1sxNjA2LDE1ODJdLDI1Nl0sNjQ1OTA6W1sxNjA2LDE2MDVdLDI1Nl0sNjQ1OTE6W1sxNjA2LDE2MDldLDI1Nl0sNjQ1OTI6W1sxNjA2LDE2MTBdLDI1Nl0sNjQ1OTM6W1sxNjA3LDE1ODBdLDI1Nl0sNjQ1OTQ6W1sxNjA3LDE2MDVdLDI1Nl0sNjQ1OTU6W1sxNjA3LDE2MDldLDI1Nl0sNjQ1OTY6W1sxNjA3LDE2MTBdLDI1Nl0sNjQ1OTc6W1sxNjEwLDE1ODBdLDI1Nl0sNjQ1OTg6W1sxNjEwLDE1ODFdLDI1Nl0sNjQ1OTk6W1sxNjEwLDE1ODJdLDI1Nl0sNjQ2MDA6W1sxNjEwLDE2MDVdLDI1Nl0sNjQ2MDE6W1sxNjEwLDE2MDldLDI1Nl0sNjQ2MDI6W1sxNjEwLDE2MTBdLDI1Nl0sNjQ2MDM6W1sxNTg0LDE2NDhdLDI1Nl0sNjQ2MDQ6W1sxNTg1LDE2NDhdLDI1Nl0sNjQ2MDU6W1sxNjA5LDE2NDhdLDI1Nl0sNjQ2MDY6W1szMiwxNjEyLDE2MTddLDI1Nl0sNjQ2MDc6W1szMiwxNjEzLDE2MTddLDI1Nl0sNjQ2MDg6W1szMiwxNjE0LDE2MTddLDI1Nl0sNjQ2MDk6W1szMiwxNjE1LDE2MTddLDI1Nl0sNjQ2MTA6W1szMiwxNjE2LDE2MTddLDI1Nl0sNjQ2MTE6W1szMiwxNjE3LDE2NDhdLDI1Nl0sNjQ2MTI6W1sxNTc0LDE1ODVdLDI1Nl0sNjQ2MTM6W1sxNTc0LDE1ODZdLDI1Nl0sNjQ2MTQ6W1sxNTc0LDE2MDVdLDI1Nl0sNjQ2MTU6W1sxNTc0LDE2MDZdLDI1Nl0sNjQ2MTY6W1sxNTc0LDE2MDldLDI1Nl0sNjQ2MTc6W1sxNTc0LDE2MTBdLDI1Nl0sNjQ2MTg6W1sxNTc2LDE1ODVdLDI1Nl0sNjQ2MTk6W1sxNTc2LDE1ODZdLDI1Nl0sNjQ2MjA6W1sxNTc2LDE2MDVdLDI1Nl0sNjQ2MjE6W1sxNTc2LDE2MDZdLDI1Nl0sNjQ2MjI6W1sxNTc2LDE2MDldLDI1Nl0sNjQ2MjM6W1sxNTc2LDE2MTBdLDI1Nl0sNjQ2MjQ6W1sxNTc4LDE1ODVdLDI1Nl0sNjQ2MjU6W1sxNTc4LDE1ODZdLDI1Nl0sNjQ2MjY6W1sxNTc4LDE2MDVdLDI1Nl0sNjQ2Mjc6W1sxNTc4LDE2MDZdLDI1Nl0sNjQ2Mjg6W1sxNTc4LDE2MDldLDI1Nl0sNjQ2Mjk6W1sxNTc4LDE2MTBdLDI1Nl0sNjQ2MzA6W1sxNTc5LDE1ODVdLDI1Nl0sNjQ2MzE6W1sxNTc5LDE1ODZdLDI1Nl0sNjQ2MzI6W1sxNTc5LDE2MDVdLDI1Nl0sNjQ2MzM6W1sxNTc5LDE2MDZdLDI1Nl0sNjQ2MzQ6W1sxNTc5LDE2MDldLDI1Nl0sNjQ2MzU6W1sxNTc5LDE2MTBdLDI1Nl0sNjQ2MzY6W1sxNjAxLDE2MDldLDI1Nl0sNjQ2Mzc6W1sxNjAxLDE2MTBdLDI1Nl0sNjQ2Mzg6W1sxNjAyLDE2MDldLDI1Nl0sNjQ2Mzk6W1sxNjAyLDE2MTBdLDI1Nl0sNjQ2NDA6W1sxNjAzLDE1NzVdLDI1Nl0sNjQ2NDE6W1sxNjAzLDE2MDRdLDI1Nl0sNjQ2NDI6W1sxNjAzLDE2MDVdLDI1Nl0sNjQ2NDM6W1sxNjAzLDE2MDldLDI1Nl0sNjQ2NDQ6W1sxNjAzLDE2MTBdLDI1Nl0sNjQ2NDU6W1sxNjA0LDE2MDVdLDI1Nl0sNjQ2NDY6W1sxNjA0LDE2MDldLDI1Nl0sNjQ2NDc6W1sxNjA0LDE2MTBdLDI1Nl0sNjQ2NDg6W1sxNjA1LDE1NzVdLDI1Nl0sNjQ2NDk6W1sxNjA1LDE2MDVdLDI1Nl0sNjQ2NTA6W1sxNjA2LDE1ODVdLDI1Nl0sNjQ2NTE6W1sxNjA2LDE1ODZdLDI1Nl0sNjQ2NTI6W1sxNjA2LDE2MDVdLDI1Nl0sNjQ2NTM6W1sxNjA2LDE2MDZdLDI1Nl0sNjQ2NTQ6W1sxNjA2LDE2MDldLDI1Nl0sNjQ2NTU6W1sxNjA2LDE2MTBdLDI1Nl0sNjQ2NTY6W1sxNjA5LDE2NDhdLDI1Nl0sNjQ2NTc6W1sxNjEwLDE1ODVdLDI1Nl0sNjQ2NTg6W1sxNjEwLDE1ODZdLDI1Nl0sNjQ2NTk6W1sxNjEwLDE2MDVdLDI1Nl0sNjQ2NjA6W1sxNjEwLDE2MDZdLDI1Nl0sNjQ2NjE6W1sxNjEwLDE2MDldLDI1Nl0sNjQ2NjI6W1sxNjEwLDE2MTBdLDI1Nl0sNjQ2NjM6W1sxNTc0LDE1ODBdLDI1Nl0sNjQ2NjQ6W1sxNTc0LDE1ODFdLDI1Nl0sNjQ2NjU6W1sxNTc0LDE1ODJdLDI1Nl0sNjQ2NjY6W1sxNTc0LDE2MDVdLDI1Nl0sNjQ2Njc6W1sxNTc0LDE2MDddLDI1Nl0sNjQ2Njg6W1sxNTc2LDE1ODBdLDI1Nl0sNjQ2Njk6W1sxNTc2LDE1ODFdLDI1Nl0sNjQ2NzA6W1sxNTc2LDE1ODJdLDI1Nl0sNjQ2NzE6W1sxNTc2LDE2MDVdLDI1Nl0sNjQ2NzI6W1sxNTc2LDE2MDddLDI1Nl0sNjQ2NzM6W1sxNTc4LDE1ODBdLDI1Nl0sNjQ2NzQ6W1sxNTc4LDE1ODFdLDI1Nl0sNjQ2NzU6W1sxNTc4LDE1ODJdLDI1Nl0sNjQ2NzY6W1sxNTc4LDE2MDVdLDI1Nl0sNjQ2Nzc6W1sxNTc4LDE2MDddLDI1Nl0sNjQ2Nzg6W1sxNTc5LDE2MDVdLDI1Nl0sNjQ2Nzk6W1sxNTgwLDE1ODFdLDI1Nl0sNjQ2ODA6W1sxNTgwLDE2MDVdLDI1Nl0sNjQ2ODE6W1sxNTgxLDE1ODBdLDI1Nl0sNjQ2ODI6W1sxNTgxLDE2MDVdLDI1Nl0sNjQ2ODM6W1sxNTgyLDE1ODBdLDI1Nl0sNjQ2ODQ6W1sxNTgyLDE2MDVdLDI1Nl0sNjQ2ODU6W1sxNTg3LDE1ODBdLDI1Nl0sNjQ2ODY6W1sxNTg3LDE1ODFdLDI1Nl0sNjQ2ODc6W1sxNTg3LDE1ODJdLDI1Nl0sNjQ2ODg6W1sxNTg3LDE2MDVdLDI1Nl0sNjQ2ODk6W1sxNTg5LDE1ODFdLDI1Nl0sNjQ2OTA6W1sxNTg5LDE1ODJdLDI1Nl0sNjQ2OTE6W1sxNTg5LDE2MDVdLDI1Nl0sNjQ2OTI6W1sxNTkwLDE1ODBdLDI1Nl0sNjQ2OTM6W1sxNTkwLDE1ODFdLDI1Nl0sNjQ2OTQ6W1sxNTkwLDE1ODJdLDI1Nl0sNjQ2OTU6W1sxNTkwLDE2MDVdLDI1Nl0sNjQ2OTY6W1sxNTkxLDE1ODFdLDI1Nl0sNjQ2OTc6W1sxNTkyLDE2MDVdLDI1Nl0sNjQ2OTg6W1sxNTkzLDE1ODBdLDI1Nl0sNjQ2OTk6W1sxNTkzLDE2MDVdLDI1Nl0sNjQ3MDA6W1sxNTk0LDE1ODBdLDI1Nl0sNjQ3MDE6W1sxNTk0LDE2MDVdLDI1Nl0sNjQ3MDI6W1sxNjAxLDE1ODBdLDI1Nl0sNjQ3MDM6W1sxNjAxLDE1ODFdLDI1Nl0sNjQ3MDQ6W1sxNjAxLDE1ODJdLDI1Nl0sNjQ3MDU6W1sxNjAxLDE2MDVdLDI1Nl0sNjQ3MDY6W1sxNjAyLDE1ODFdLDI1Nl0sNjQ3MDc6W1sxNjAyLDE2MDVdLDI1Nl0sNjQ3MDg6W1sxNjAzLDE1ODBdLDI1Nl0sNjQ3MDk6W1sxNjAzLDE1ODFdLDI1Nl0sNjQ3MTA6W1sxNjAzLDE1ODJdLDI1Nl0sNjQ3MTE6W1sxNjAzLDE2MDRdLDI1Nl0sNjQ3MTI6W1sxNjAzLDE2MDVdLDI1Nl0sNjQ3MTM6W1sxNjA0LDE1ODBdLDI1Nl0sNjQ3MTQ6W1sxNjA0LDE1ODFdLDI1Nl0sNjQ3MTU6W1sxNjA0LDE1ODJdLDI1Nl0sNjQ3MTY6W1sxNjA0LDE2MDVdLDI1Nl0sNjQ3MTc6W1sxNjA0LDE2MDddLDI1Nl0sNjQ3MTg6W1sxNjA1LDE1ODBdLDI1Nl0sNjQ3MTk6W1sxNjA1LDE1ODFdLDI1Nl0sNjQ3MjA6W1sxNjA1LDE1ODJdLDI1Nl0sNjQ3MjE6W1sxNjA1LDE2MDVdLDI1Nl0sNjQ3MjI6W1sxNjA2LDE1ODBdLDI1Nl0sNjQ3MjM6W1sxNjA2LDE1ODFdLDI1Nl0sNjQ3MjQ6W1sxNjA2LDE1ODJdLDI1Nl0sNjQ3MjU6W1sxNjA2LDE2MDVdLDI1Nl0sNjQ3MjY6W1sxNjA2LDE2MDddLDI1Nl0sNjQ3Mjc6W1sxNjA3LDE1ODBdLDI1Nl0sNjQ3Mjg6W1sxNjA3LDE2MDVdLDI1Nl0sNjQ3Mjk6W1sxNjA3LDE2NDhdLDI1Nl0sNjQ3MzA6W1sxNjEwLDE1ODBdLDI1Nl0sNjQ3MzE6W1sxNjEwLDE1ODFdLDI1Nl0sNjQ3MzI6W1sxNjEwLDE1ODJdLDI1Nl0sNjQ3MzM6W1sxNjEwLDE2MDVdLDI1Nl0sNjQ3MzQ6W1sxNjEwLDE2MDddLDI1Nl0sNjQ3MzU6W1sxNTc0LDE2MDVdLDI1Nl0sNjQ3MzY6W1sxNTc0LDE2MDddLDI1Nl0sNjQ3Mzc6W1sxNTc2LDE2MDVdLDI1Nl0sNjQ3Mzg6W1sxNTc2LDE2MDddLDI1Nl0sNjQ3Mzk6W1sxNTc4LDE2MDVdLDI1Nl0sNjQ3NDA6W1sxNTc4LDE2MDddLDI1Nl0sNjQ3NDE6W1sxNTc5LDE2MDVdLDI1Nl0sNjQ3NDI6W1sxNTc5LDE2MDddLDI1Nl0sNjQ3NDM6W1sxNTg3LDE2MDVdLDI1Nl0sNjQ3NDQ6W1sxNTg3LDE2MDddLDI1Nl0sNjQ3NDU6W1sxNTg4LDE2MDVdLDI1Nl0sNjQ3NDY6W1sxNTg4LDE2MDddLDI1Nl0sNjQ3NDc6W1sxNjAzLDE2MDRdLDI1Nl0sNjQ3NDg6W1sxNjAzLDE2MDVdLDI1Nl0sNjQ3NDk6W1sxNjA0LDE2MDVdLDI1Nl0sNjQ3NTA6W1sxNjA2LDE2MDVdLDI1Nl0sNjQ3NTE6W1sxNjA2LDE2MDddLDI1Nl0sNjQ3NTI6W1sxNjEwLDE2MDVdLDI1Nl0sNjQ3NTM6W1sxNjEwLDE2MDddLDI1Nl0sNjQ3NTQ6W1sxNjAwLDE2MTQsMTYxN10sMjU2XSw2NDc1NTpbWzE2MDAsMTYxNSwxNjE3XSwyNTZdLDY0NzU2OltbMTYwMCwxNjE2LDE2MTddLDI1Nl0sNjQ3NTc6W1sxNTkxLDE2MDldLDI1Nl0sNjQ3NTg6W1sxNTkxLDE2MTBdLDI1Nl0sNjQ3NTk6W1sxNTkzLDE2MDldLDI1Nl0sNjQ3NjA6W1sxNTkzLDE2MTBdLDI1Nl0sNjQ3NjE6W1sxNTk0LDE2MDldLDI1Nl0sNjQ3NjI6W1sxNTk0LDE2MTBdLDI1Nl0sNjQ3NjM6W1sxNTg3LDE2MDldLDI1Nl0sNjQ3NjQ6W1sxNTg3LDE2MTBdLDI1Nl0sNjQ3NjU6W1sxNTg4LDE2MDldLDI1Nl0sNjQ3NjY6W1sxNTg4LDE2MTBdLDI1Nl0sNjQ3Njc6W1sxNTgxLDE2MDldLDI1Nl19LFxuNjQ3Njg6ezY0NzY4OltbMTU4MSwxNjEwXSwyNTZdLDY0NzY5OltbMTU4MCwxNjA5XSwyNTZdLDY0NzcwOltbMTU4MCwxNjEwXSwyNTZdLDY0NzcxOltbMTU4MiwxNjA5XSwyNTZdLDY0NzcyOltbMTU4MiwxNjEwXSwyNTZdLDY0NzczOltbMTU4OSwxNjA5XSwyNTZdLDY0Nzc0OltbMTU4OSwxNjEwXSwyNTZdLDY0Nzc1OltbMTU5MCwxNjA5XSwyNTZdLDY0Nzc2OltbMTU5MCwxNjEwXSwyNTZdLDY0Nzc3OltbMTU4OCwxNTgwXSwyNTZdLDY0Nzc4OltbMTU4OCwxNTgxXSwyNTZdLDY0Nzc5OltbMTU4OCwxNTgyXSwyNTZdLDY0NzgwOltbMTU4OCwxNjA1XSwyNTZdLDY0NzgxOltbMTU4OCwxNTg1XSwyNTZdLDY0NzgyOltbMTU4NywxNTg1XSwyNTZdLDY0NzgzOltbMTU4OSwxNTg1XSwyNTZdLDY0Nzg0OltbMTU5MCwxNTg1XSwyNTZdLDY0Nzg1OltbMTU5MSwxNjA5XSwyNTZdLDY0Nzg2OltbMTU5MSwxNjEwXSwyNTZdLDY0Nzg3OltbMTU5MywxNjA5XSwyNTZdLDY0Nzg4OltbMTU5MywxNjEwXSwyNTZdLDY0Nzg5OltbMTU5NCwxNjA5XSwyNTZdLDY0NzkwOltbMTU5NCwxNjEwXSwyNTZdLDY0NzkxOltbMTU4NywxNjA5XSwyNTZdLDY0NzkyOltbMTU4NywxNjEwXSwyNTZdLDY0NzkzOltbMTU4OCwxNjA5XSwyNTZdLDY0Nzk0OltbMTU4OCwxNjEwXSwyNTZdLDY0Nzk1OltbMTU4MSwxNjA5XSwyNTZdLDY0Nzk2OltbMTU4MSwxNjEwXSwyNTZdLDY0Nzk3OltbMTU4MCwxNjA5XSwyNTZdLDY0Nzk4OltbMTU4MCwxNjEwXSwyNTZdLDY0Nzk5OltbMTU4MiwxNjA5XSwyNTZdLDY0ODAwOltbMTU4MiwxNjEwXSwyNTZdLDY0ODAxOltbMTU4OSwxNjA5XSwyNTZdLDY0ODAyOltbMTU4OSwxNjEwXSwyNTZdLDY0ODAzOltbMTU5MCwxNjA5XSwyNTZdLDY0ODA0OltbMTU5MCwxNjEwXSwyNTZdLDY0ODA1OltbMTU4OCwxNTgwXSwyNTZdLDY0ODA2OltbMTU4OCwxNTgxXSwyNTZdLDY0ODA3OltbMTU4OCwxNTgyXSwyNTZdLDY0ODA4OltbMTU4OCwxNjA1XSwyNTZdLDY0ODA5OltbMTU4OCwxNTg1XSwyNTZdLDY0ODEwOltbMTU4NywxNTg1XSwyNTZdLDY0ODExOltbMTU4OSwxNTg1XSwyNTZdLDY0ODEyOltbMTU5MCwxNTg1XSwyNTZdLDY0ODEzOltbMTU4OCwxNTgwXSwyNTZdLDY0ODE0OltbMTU4OCwxNTgxXSwyNTZdLDY0ODE1OltbMTU4OCwxNTgyXSwyNTZdLDY0ODE2OltbMTU4OCwxNjA1XSwyNTZdLDY0ODE3OltbMTU4NywxNjA3XSwyNTZdLDY0ODE4OltbMTU4OCwxNjA3XSwyNTZdLDY0ODE5OltbMTU5MSwxNjA1XSwyNTZdLDY0ODIwOltbMTU4NywxNTgwXSwyNTZdLDY0ODIxOltbMTU4NywxNTgxXSwyNTZdLDY0ODIyOltbMTU4NywxNTgyXSwyNTZdLDY0ODIzOltbMTU4OCwxNTgwXSwyNTZdLDY0ODI0OltbMTU4OCwxNTgxXSwyNTZdLDY0ODI1OltbMTU4OCwxNTgyXSwyNTZdLDY0ODI2OltbMTU5MSwxNjA1XSwyNTZdLDY0ODI3OltbMTU5MiwxNjA1XSwyNTZdLDY0ODI4OltbMTU3NSwxNjExXSwyNTZdLDY0ODI5OltbMTU3NSwxNjExXSwyNTZdLDY0ODQ4OltbMTU3OCwxNTgwLDE2MDVdLDI1Nl0sNjQ4NDk6W1sxNTc4LDE1ODEsMTU4MF0sMjU2XSw2NDg1MDpbWzE1NzgsMTU4MSwxNTgwXSwyNTZdLDY0ODUxOltbMTU3OCwxNTgxLDE2MDVdLDI1Nl0sNjQ4NTI6W1sxNTc4LDE1ODIsMTYwNV0sMjU2XSw2NDg1MzpbWzE1NzgsMTYwNSwxNTgwXSwyNTZdLDY0ODU0OltbMTU3OCwxNjA1LDE1ODFdLDI1Nl0sNjQ4NTU6W1sxNTc4LDE2MDUsMTU4Ml0sMjU2XSw2NDg1NjpbWzE1ODAsMTYwNSwxNTgxXSwyNTZdLDY0ODU3OltbMTU4MCwxNjA1LDE1ODFdLDI1Nl0sNjQ4NTg6W1sxNTgxLDE2MDUsMTYxMF0sMjU2XSw2NDg1OTpbWzE1ODEsMTYwNSwxNjA5XSwyNTZdLDY0ODYwOltbMTU4NywxNTgxLDE1ODBdLDI1Nl0sNjQ4NjE6W1sxNTg3LDE1ODAsMTU4MV0sMjU2XSw2NDg2MjpbWzE1ODcsMTU4MCwxNjA5XSwyNTZdLDY0ODYzOltbMTU4NywxNjA1LDE1ODFdLDI1Nl0sNjQ4NjQ6W1sxNTg3LDE2MDUsMTU4MV0sMjU2XSw2NDg2NTpbWzE1ODcsMTYwNSwxNTgwXSwyNTZdLDY0ODY2OltbMTU4NywxNjA1LDE2MDVdLDI1Nl0sNjQ4Njc6W1sxNTg3LDE2MDUsMTYwNV0sMjU2XSw2NDg2ODpbWzE1ODksMTU4MSwxNTgxXSwyNTZdLDY0ODY5OltbMTU4OSwxNTgxLDE1ODFdLDI1Nl0sNjQ4NzA6W1sxNTg5LDE2MDUsMTYwNV0sMjU2XSw2NDg3MTpbWzE1ODgsMTU4MSwxNjA1XSwyNTZdLDY0ODcyOltbMTU4OCwxNTgxLDE2MDVdLDI1Nl0sNjQ4NzM6W1sxNTg4LDE1ODAsMTYxMF0sMjU2XSw2NDg3NDpbWzE1ODgsMTYwNSwxNTgyXSwyNTZdLDY0ODc1OltbMTU4OCwxNjA1LDE1ODJdLDI1Nl0sNjQ4NzY6W1sxNTg4LDE2MDUsMTYwNV0sMjU2XSw2NDg3NzpbWzE1ODgsMTYwNSwxNjA1XSwyNTZdLDY0ODc4OltbMTU5MCwxNTgxLDE2MDldLDI1Nl0sNjQ4Nzk6W1sxNTkwLDE1ODIsMTYwNV0sMjU2XSw2NDg4MDpbWzE1OTAsMTU4MiwxNjA1XSwyNTZdLDY0ODgxOltbMTU5MSwxNjA1LDE1ODFdLDI1Nl0sNjQ4ODI6W1sxNTkxLDE2MDUsMTU4MV0sMjU2XSw2NDg4MzpbWzE1OTEsMTYwNSwxNjA1XSwyNTZdLDY0ODg0OltbMTU5MSwxNjA1LDE2MTBdLDI1Nl0sNjQ4ODU6W1sxNTkzLDE1ODAsMTYwNV0sMjU2XSw2NDg4NjpbWzE1OTMsMTYwNSwxNjA1XSwyNTZdLDY0ODg3OltbMTU5MywxNjA1LDE2MDVdLDI1Nl0sNjQ4ODg6W1sxNTkzLDE2MDUsMTYwOV0sMjU2XSw2NDg4OTpbWzE1OTQsMTYwNSwxNjA1XSwyNTZdLDY0ODkwOltbMTU5NCwxNjA1LDE2MTBdLDI1Nl0sNjQ4OTE6W1sxNTk0LDE2MDUsMTYwOV0sMjU2XSw2NDg5MjpbWzE2MDEsMTU4MiwxNjA1XSwyNTZdLDY0ODkzOltbMTYwMSwxNTgyLDE2MDVdLDI1Nl0sNjQ4OTQ6W1sxNjAyLDE2MDUsMTU4MV0sMjU2XSw2NDg5NTpbWzE2MDIsMTYwNSwxNjA1XSwyNTZdLDY0ODk2OltbMTYwNCwxNTgxLDE2MDVdLDI1Nl0sNjQ4OTc6W1sxNjA0LDE1ODEsMTYxMF0sMjU2XSw2NDg5ODpbWzE2MDQsMTU4MSwxNjA5XSwyNTZdLDY0ODk5OltbMTYwNCwxNTgwLDE1ODBdLDI1Nl0sNjQ5MDA6W1sxNjA0LDE1ODAsMTU4MF0sMjU2XSw2NDkwMTpbWzE2MDQsMTU4MiwxNjA1XSwyNTZdLDY0OTAyOltbMTYwNCwxNTgyLDE2MDVdLDI1Nl0sNjQ5MDM6W1sxNjA0LDE2MDUsMTU4MV0sMjU2XSw2NDkwNDpbWzE2MDQsMTYwNSwxNTgxXSwyNTZdLDY0OTA1OltbMTYwNSwxNTgxLDE1ODBdLDI1Nl0sNjQ5MDY6W1sxNjA1LDE1ODEsMTYwNV0sMjU2XSw2NDkwNzpbWzE2MDUsMTU4MSwxNjEwXSwyNTZdLDY0OTA4OltbMTYwNSwxNTgwLDE1ODFdLDI1Nl0sNjQ5MDk6W1sxNjA1LDE1ODAsMTYwNV0sMjU2XSw2NDkxMDpbWzE2MDUsMTU4MiwxNTgwXSwyNTZdLDY0OTExOltbMTYwNSwxNTgyLDE2MDVdLDI1Nl0sNjQ5MTQ6W1sxNjA1LDE1ODAsMTU4Ml0sMjU2XSw2NDkxNTpbWzE2MDcsMTYwNSwxNTgwXSwyNTZdLDY0OTE2OltbMTYwNywxNjA1LDE2MDVdLDI1Nl0sNjQ5MTc6W1sxNjA2LDE1ODEsMTYwNV0sMjU2XSw2NDkxODpbWzE2MDYsMTU4MSwxNjA5XSwyNTZdLDY0OTE5OltbMTYwNiwxNTgwLDE2MDVdLDI1Nl0sNjQ5MjA6W1sxNjA2LDE1ODAsMTYwNV0sMjU2XSw2NDkyMTpbWzE2MDYsMTU4MCwxNjA5XSwyNTZdLDY0OTIyOltbMTYwNiwxNjA1LDE2MTBdLDI1Nl0sNjQ5MjM6W1sxNjA2LDE2MDUsMTYwOV0sMjU2XSw2NDkyNDpbWzE2MTAsMTYwNSwxNjA1XSwyNTZdLDY0OTI1OltbMTYxMCwxNjA1LDE2MDVdLDI1Nl0sNjQ5MjY6W1sxNTc2LDE1ODIsMTYxMF0sMjU2XSw2NDkyNzpbWzE1NzgsMTU4MCwxNjEwXSwyNTZdLDY0OTI4OltbMTU3OCwxNTgwLDE2MDldLDI1Nl0sNjQ5Mjk6W1sxNTc4LDE1ODIsMTYxMF0sMjU2XSw2NDkzMDpbWzE1NzgsMTU4MiwxNjA5XSwyNTZdLDY0OTMxOltbMTU3OCwxNjA1LDE2MTBdLDI1Nl0sNjQ5MzI6W1sxNTc4LDE2MDUsMTYwOV0sMjU2XSw2NDkzMzpbWzE1ODAsMTYwNSwxNjEwXSwyNTZdLDY0OTM0OltbMTU4MCwxNTgxLDE2MDldLDI1Nl0sNjQ5MzU6W1sxNTgwLDE2MDUsMTYwOV0sMjU2XSw2NDkzNjpbWzE1ODcsMTU4MiwxNjA5XSwyNTZdLDY0OTM3OltbMTU4OSwxNTgxLDE2MTBdLDI1Nl0sNjQ5Mzg6W1sxNTg4LDE1ODEsMTYxMF0sMjU2XSw2NDkzOTpbWzE1OTAsMTU4MSwxNjEwXSwyNTZdLDY0OTQwOltbMTYwNCwxNTgwLDE2MTBdLDI1Nl0sNjQ5NDE6W1sxNjA0LDE2MDUsMTYxMF0sMjU2XSw2NDk0MjpbWzE2MTAsMTU4MSwxNjEwXSwyNTZdLDY0OTQzOltbMTYxMCwxNTgwLDE2MTBdLDI1Nl0sNjQ5NDQ6W1sxNjEwLDE2MDUsMTYxMF0sMjU2XSw2NDk0NTpbWzE2MDUsMTYwNSwxNjEwXSwyNTZdLDY0OTQ2OltbMTYwMiwxNjA1LDE2MTBdLDI1Nl0sNjQ5NDc6W1sxNjA2LDE1ODEsMTYxMF0sMjU2XSw2NDk0ODpbWzE2MDIsMTYwNSwxNTgxXSwyNTZdLDY0OTQ5OltbMTYwNCwxNTgxLDE2MDVdLDI1Nl0sNjQ5NTA6W1sxNTkzLDE2MDUsMTYxMF0sMjU2XSw2NDk1MTpbWzE2MDMsMTYwNSwxNjEwXSwyNTZdLDY0OTUyOltbMTYwNiwxNTgwLDE1ODFdLDI1Nl0sNjQ5NTM6W1sxNjA1LDE1ODIsMTYxMF0sMjU2XSw2NDk1NDpbWzE2MDQsMTU4MCwxNjA1XSwyNTZdLDY0OTU1OltbMTYwMywxNjA1LDE2MDVdLDI1Nl0sNjQ5NTY6W1sxNjA0LDE1ODAsMTYwNV0sMjU2XSw2NDk1NzpbWzE2MDYsMTU4MCwxNTgxXSwyNTZdLDY0OTU4OltbMTU4MCwxNTgxLDE2MTBdLDI1Nl0sNjQ5NTk6W1sxNTgxLDE1ODAsMTYxMF0sMjU2XSw2NDk2MDpbWzE2MDUsMTU4MCwxNjEwXSwyNTZdLDY0OTYxOltbMTYwMSwxNjA1LDE2MTBdLDI1Nl0sNjQ5NjI6W1sxNTc2LDE1ODEsMTYxMF0sMjU2XSw2NDk2MzpbWzE2MDMsMTYwNSwxNjA1XSwyNTZdLDY0OTY0OltbMTU5MywxNTgwLDE2MDVdLDI1Nl0sNjQ5NjU6W1sxNTg5LDE2MDUsMTYwNV0sMjU2XSw2NDk2NjpbWzE1ODcsMTU4MiwxNjEwXSwyNTZdLDY0OTY3OltbMTYwNiwxNTgwLDE2MTBdLDI1Nl0sNjUwMDg6W1sxNTg5LDE2MDQsMTc0Nl0sMjU2XSw2NTAwOTpbWzE2MDIsMTYwNCwxNzQ2XSwyNTZdLDY1MDEwOltbMTU3NSwxNjA0LDE2MDQsMTYwN10sMjU2XSw2NTAxMTpbWzE1NzUsMTYwMywxNTc2LDE1ODVdLDI1Nl0sNjUwMTI6W1sxNjA1LDE1ODEsMTYwNSwxNTgzXSwyNTZdLDY1MDEzOltbMTU4OSwxNjA0LDE1OTMsMTYwNV0sMjU2XSw2NTAxNDpbWzE1ODUsMTU4NywxNjA4LDE2MDRdLDI1Nl0sNjUwMTU6W1sxNTkzLDE2MDQsMTYxMCwxNjA3XSwyNTZdLDY1MDE2OltbMTYwOCwxNTg3LDE2MDQsMTYwNV0sMjU2XSw2NTAxNzpbWzE1ODksMTYwNCwxNjA5XSwyNTZdLDY1MDE4OltbMTU4OSwxNjA0LDE2MDksMzIsMTU3NSwxNjA0LDE2MDQsMTYwNywzMiwxNTkzLDE2MDQsMTYxMCwxNjA3LDMyLDE2MDgsMTU4NywxNjA0LDE2MDVdLDI1Nl0sNjUwMTk6W1sxNTgwLDE2MDQsMzIsMTU4MCwxNjA0LDE1NzUsMTYwNCwxNjA3XSwyNTZdLDY1MDIwOltbMTU4NSwxNzQwLDE1NzUsMTYwNF0sMjU2XX0sXG42NTAyNDp7NjUwNDA6W1s0NF0sMjU2XSw2NTA0MTpbWzEyMjg5XSwyNTZdLDY1MDQyOltbMTIyOTBdLDI1Nl0sNjUwNDM6W1s1OF0sMjU2XSw2NTA0NDpbWzU5XSwyNTZdLDY1MDQ1OltbMzNdLDI1Nl0sNjUwNDY6W1s2M10sMjU2XSw2NTA0NzpbWzEyMzEwXSwyNTZdLDY1MDQ4OltbMTIzMTFdLDI1Nl0sNjUwNDk6W1s4MjMwXSwyNTZdLDY1MDU2OlssMjMwXSw2NTA1NzpbLDIzMF0sNjUwNTg6WywyMzBdLDY1MDU5OlssMjMwXSw2NTA2MDpbLDIzMF0sNjUwNjE6WywyMzBdLDY1MDYyOlssMjMwXSw2NTA3MjpbWzgyMjldLDI1Nl0sNjUwNzM6W1s4MjEyXSwyNTZdLDY1MDc0OltbODIxMV0sMjU2XSw2NTA3NTpbWzk1XSwyNTZdLDY1MDc2OltbOTVdLDI1Nl0sNjUwNzc6W1s0MF0sMjU2XSw2NTA3ODpbWzQxXSwyNTZdLDY1MDc5OltbMTIzXSwyNTZdLDY1MDgwOltbMTI1XSwyNTZdLDY1MDgxOltbMTIzMDhdLDI1Nl0sNjUwODI6W1sxMjMwOV0sMjU2XSw2NTA4MzpbWzEyMzA0XSwyNTZdLDY1MDg0OltbMTIzMDVdLDI1Nl0sNjUwODU6W1sxMjI5OF0sMjU2XSw2NTA4NjpbWzEyMjk5XSwyNTZdLDY1MDg3OltbMTIyOTZdLDI1Nl0sNjUwODg6W1sxMjI5N10sMjU2XSw2NTA4OTpbWzEyMzAwXSwyNTZdLDY1MDkwOltbMTIzMDFdLDI1Nl0sNjUwOTE6W1sxMjMwMl0sMjU2XSw2NTA5MjpbWzEyMzAzXSwyNTZdLDY1MDk1OltbOTFdLDI1Nl0sNjUwOTY6W1s5M10sMjU2XSw2NTA5NzpbWzgyNTRdLDI1Nl0sNjUwOTg6W1s4MjU0XSwyNTZdLDY1MDk5OltbODI1NF0sMjU2XSw2NTEwMDpbWzgyNTRdLDI1Nl0sNjUxMDE6W1s5NV0sMjU2XSw2NTEwMjpbWzk1XSwyNTZdLDY1MTAzOltbOTVdLDI1Nl0sNjUxMDQ6W1s0NF0sMjU2XSw2NTEwNTpbWzEyMjg5XSwyNTZdLDY1MTA2OltbNDZdLDI1Nl0sNjUxMDg6W1s1OV0sMjU2XSw2NTEwOTpbWzU4XSwyNTZdLDY1MTEwOltbNjNdLDI1Nl0sNjUxMTE6W1szM10sMjU2XSw2NTExMjpbWzgyMTJdLDI1Nl0sNjUxMTM6W1s0MF0sMjU2XSw2NTExNDpbWzQxXSwyNTZdLDY1MTE1OltbMTIzXSwyNTZdLDY1MTE2OltbMTI1XSwyNTZdLDY1MTE3OltbMTIzMDhdLDI1Nl0sNjUxMTg6W1sxMjMwOV0sMjU2XSw2NTExOTpbWzM1XSwyNTZdLDY1MTIwOltbMzhdLDI1Nl0sNjUxMjE6W1s0Ml0sMjU2XSw2NTEyMjpbWzQzXSwyNTZdLDY1MTIzOltbNDVdLDI1Nl0sNjUxMjQ6W1s2MF0sMjU2XSw2NTEyNTpbWzYyXSwyNTZdLDY1MTI2OltbNjFdLDI1Nl0sNjUxMjg6W1s5Ml0sMjU2XSw2NTEyOTpbWzM2XSwyNTZdLDY1MTMwOltbMzddLDI1Nl0sNjUxMzE6W1s2NF0sMjU2XSw2NTEzNjpbWzMyLDE2MTFdLDI1Nl0sNjUxMzc6W1sxNjAwLDE2MTFdLDI1Nl0sNjUxMzg6W1szMiwxNjEyXSwyNTZdLDY1MTQwOltbMzIsMTYxM10sMjU2XSw2NTE0MjpbWzMyLDE2MTRdLDI1Nl0sNjUxNDM6W1sxNjAwLDE2MTRdLDI1Nl0sNjUxNDQ6W1szMiwxNjE1XSwyNTZdLDY1MTQ1OltbMTYwMCwxNjE1XSwyNTZdLDY1MTQ2OltbMzIsMTYxNl0sMjU2XSw2NTE0NzpbWzE2MDAsMTYxNl0sMjU2XSw2NTE0ODpbWzMyLDE2MTddLDI1Nl0sNjUxNDk6W1sxNjAwLDE2MTddLDI1Nl0sNjUxNTA6W1szMiwxNjE4XSwyNTZdLDY1MTUxOltbMTYwMCwxNjE4XSwyNTZdLDY1MTUyOltbMTU2OV0sMjU2XSw2NTE1MzpbWzE1NzBdLDI1Nl0sNjUxNTQ6W1sxNTcwXSwyNTZdLDY1MTU1OltbMTU3MV0sMjU2XSw2NTE1NjpbWzE1NzFdLDI1Nl0sNjUxNTc6W1sxNTcyXSwyNTZdLDY1MTU4OltbMTU3Ml0sMjU2XSw2NTE1OTpbWzE1NzNdLDI1Nl0sNjUxNjA6W1sxNTczXSwyNTZdLDY1MTYxOltbMTU3NF0sMjU2XSw2NTE2MjpbWzE1NzRdLDI1Nl0sNjUxNjM6W1sxNTc0XSwyNTZdLDY1MTY0OltbMTU3NF0sMjU2XSw2NTE2NTpbWzE1NzVdLDI1Nl0sNjUxNjY6W1sxNTc1XSwyNTZdLDY1MTY3OltbMTU3Nl0sMjU2XSw2NTE2ODpbWzE1NzZdLDI1Nl0sNjUxNjk6W1sxNTc2XSwyNTZdLDY1MTcwOltbMTU3Nl0sMjU2XSw2NTE3MTpbWzE1NzddLDI1Nl0sNjUxNzI6W1sxNTc3XSwyNTZdLDY1MTczOltbMTU3OF0sMjU2XSw2NTE3NDpbWzE1NzhdLDI1Nl0sNjUxNzU6W1sxNTc4XSwyNTZdLDY1MTc2OltbMTU3OF0sMjU2XSw2NTE3NzpbWzE1NzldLDI1Nl0sNjUxNzg6W1sxNTc5XSwyNTZdLDY1MTc5OltbMTU3OV0sMjU2XSw2NTE4MDpbWzE1NzldLDI1Nl0sNjUxODE6W1sxNTgwXSwyNTZdLDY1MTgyOltbMTU4MF0sMjU2XSw2NTE4MzpbWzE1ODBdLDI1Nl0sNjUxODQ6W1sxNTgwXSwyNTZdLDY1MTg1OltbMTU4MV0sMjU2XSw2NTE4NjpbWzE1ODFdLDI1Nl0sNjUxODc6W1sxNTgxXSwyNTZdLDY1MTg4OltbMTU4MV0sMjU2XSw2NTE4OTpbWzE1ODJdLDI1Nl0sNjUxOTA6W1sxNTgyXSwyNTZdLDY1MTkxOltbMTU4Ml0sMjU2XSw2NTE5MjpbWzE1ODJdLDI1Nl0sNjUxOTM6W1sxNTgzXSwyNTZdLDY1MTk0OltbMTU4M10sMjU2XSw2NTE5NTpbWzE1ODRdLDI1Nl0sNjUxOTY6W1sxNTg0XSwyNTZdLDY1MTk3OltbMTU4NV0sMjU2XSw2NTE5ODpbWzE1ODVdLDI1Nl0sNjUxOTk6W1sxNTg2XSwyNTZdLDY1MjAwOltbMTU4Nl0sMjU2XSw2NTIwMTpbWzE1ODddLDI1Nl0sNjUyMDI6W1sxNTg3XSwyNTZdLDY1MjAzOltbMTU4N10sMjU2XSw2NTIwNDpbWzE1ODddLDI1Nl0sNjUyMDU6W1sxNTg4XSwyNTZdLDY1MjA2OltbMTU4OF0sMjU2XSw2NTIwNzpbWzE1ODhdLDI1Nl0sNjUyMDg6W1sxNTg4XSwyNTZdLDY1MjA5OltbMTU4OV0sMjU2XSw2NTIxMDpbWzE1ODldLDI1Nl0sNjUyMTE6W1sxNTg5XSwyNTZdLDY1MjEyOltbMTU4OV0sMjU2XSw2NTIxMzpbWzE1OTBdLDI1Nl0sNjUyMTQ6W1sxNTkwXSwyNTZdLDY1MjE1OltbMTU5MF0sMjU2XSw2NTIxNjpbWzE1OTBdLDI1Nl0sNjUyMTc6W1sxNTkxXSwyNTZdLDY1MjE4OltbMTU5MV0sMjU2XSw2NTIxOTpbWzE1OTFdLDI1Nl0sNjUyMjA6W1sxNTkxXSwyNTZdLDY1MjIxOltbMTU5Ml0sMjU2XSw2NTIyMjpbWzE1OTJdLDI1Nl0sNjUyMjM6W1sxNTkyXSwyNTZdLDY1MjI0OltbMTU5Ml0sMjU2XSw2NTIyNTpbWzE1OTNdLDI1Nl0sNjUyMjY6W1sxNTkzXSwyNTZdLDY1MjI3OltbMTU5M10sMjU2XSw2NTIyODpbWzE1OTNdLDI1Nl0sNjUyMjk6W1sxNTk0XSwyNTZdLDY1MjMwOltbMTU5NF0sMjU2XSw2NTIzMTpbWzE1OTRdLDI1Nl0sNjUyMzI6W1sxNTk0XSwyNTZdLDY1MjMzOltbMTYwMV0sMjU2XSw2NTIzNDpbWzE2MDFdLDI1Nl0sNjUyMzU6W1sxNjAxXSwyNTZdLDY1MjM2OltbMTYwMV0sMjU2XSw2NTIzNzpbWzE2MDJdLDI1Nl0sNjUyMzg6W1sxNjAyXSwyNTZdLDY1MjM5OltbMTYwMl0sMjU2XSw2NTI0MDpbWzE2MDJdLDI1Nl0sNjUyNDE6W1sxNjAzXSwyNTZdLDY1MjQyOltbMTYwM10sMjU2XSw2NTI0MzpbWzE2MDNdLDI1Nl0sNjUyNDQ6W1sxNjAzXSwyNTZdLDY1MjQ1OltbMTYwNF0sMjU2XSw2NTI0NjpbWzE2MDRdLDI1Nl0sNjUyNDc6W1sxNjA0XSwyNTZdLDY1MjQ4OltbMTYwNF0sMjU2XSw2NTI0OTpbWzE2MDVdLDI1Nl0sNjUyNTA6W1sxNjA1XSwyNTZdLDY1MjUxOltbMTYwNV0sMjU2XSw2NTI1MjpbWzE2MDVdLDI1Nl0sNjUyNTM6W1sxNjA2XSwyNTZdLDY1MjU0OltbMTYwNl0sMjU2XSw2NTI1NTpbWzE2MDZdLDI1Nl0sNjUyNTY6W1sxNjA2XSwyNTZdLDY1MjU3OltbMTYwN10sMjU2XSw2NTI1ODpbWzE2MDddLDI1Nl0sNjUyNTk6W1sxNjA3XSwyNTZdLDY1MjYwOltbMTYwN10sMjU2XSw2NTI2MTpbWzE2MDhdLDI1Nl0sNjUyNjI6W1sxNjA4XSwyNTZdLDY1MjYzOltbMTYwOV0sMjU2XSw2NTI2NDpbWzE2MDldLDI1Nl0sNjUyNjU6W1sxNjEwXSwyNTZdLDY1MjY2OltbMTYxMF0sMjU2XSw2NTI2NzpbWzE2MTBdLDI1Nl0sNjUyNjg6W1sxNjEwXSwyNTZdLDY1MjY5OltbMTYwNCwxNTcwXSwyNTZdLDY1MjcwOltbMTYwNCwxNTcwXSwyNTZdLDY1MjcxOltbMTYwNCwxNTcxXSwyNTZdLDY1MjcyOltbMTYwNCwxNTcxXSwyNTZdLDY1MjczOltbMTYwNCwxNTczXSwyNTZdLDY1Mjc0OltbMTYwNCwxNTczXSwyNTZdLDY1Mjc1OltbMTYwNCwxNTc1XSwyNTZdLDY1Mjc2OltbMTYwNCwxNTc1XSwyNTZdfSxcbjY1MjgwOns2NTI4MTpbWzMzXSwyNTZdLDY1MjgyOltbMzRdLDI1Nl0sNjUyODM6W1szNV0sMjU2XSw2NTI4NDpbWzM2XSwyNTZdLDY1Mjg1OltbMzddLDI1Nl0sNjUyODY6W1szOF0sMjU2XSw2NTI4NzpbWzM5XSwyNTZdLDY1Mjg4OltbNDBdLDI1Nl0sNjUyODk6W1s0MV0sMjU2XSw2NTI5MDpbWzQyXSwyNTZdLDY1MjkxOltbNDNdLDI1Nl0sNjUyOTI6W1s0NF0sMjU2XSw2NTI5MzpbWzQ1XSwyNTZdLDY1Mjk0OltbNDZdLDI1Nl0sNjUyOTU6W1s0N10sMjU2XSw2NTI5NjpbWzQ4XSwyNTZdLDY1Mjk3OltbNDldLDI1Nl0sNjUyOTg6W1s1MF0sMjU2XSw2NTI5OTpbWzUxXSwyNTZdLDY1MzAwOltbNTJdLDI1Nl0sNjUzMDE6W1s1M10sMjU2XSw2NTMwMjpbWzU0XSwyNTZdLDY1MzAzOltbNTVdLDI1Nl0sNjUzMDQ6W1s1Nl0sMjU2XSw2NTMwNTpbWzU3XSwyNTZdLDY1MzA2OltbNThdLDI1Nl0sNjUzMDc6W1s1OV0sMjU2XSw2NTMwODpbWzYwXSwyNTZdLDY1MzA5OltbNjFdLDI1Nl0sNjUzMTA6W1s2Ml0sMjU2XSw2NTMxMTpbWzYzXSwyNTZdLDY1MzEyOltbNjRdLDI1Nl0sNjUzMTM6W1s2NV0sMjU2XSw2NTMxNDpbWzY2XSwyNTZdLDY1MzE1OltbNjddLDI1Nl0sNjUzMTY6W1s2OF0sMjU2XSw2NTMxNzpbWzY5XSwyNTZdLDY1MzE4OltbNzBdLDI1Nl0sNjUzMTk6W1s3MV0sMjU2XSw2NTMyMDpbWzcyXSwyNTZdLDY1MzIxOltbNzNdLDI1Nl0sNjUzMjI6W1s3NF0sMjU2XSw2NTMyMzpbWzc1XSwyNTZdLDY1MzI0OltbNzZdLDI1Nl0sNjUzMjU6W1s3N10sMjU2XSw2NTMyNjpbWzc4XSwyNTZdLDY1MzI3OltbNzldLDI1Nl0sNjUzMjg6W1s4MF0sMjU2XSw2NTMyOTpbWzgxXSwyNTZdLDY1MzMwOltbODJdLDI1Nl0sNjUzMzE6W1s4M10sMjU2XSw2NTMzMjpbWzg0XSwyNTZdLDY1MzMzOltbODVdLDI1Nl0sNjUzMzQ6W1s4Nl0sMjU2XSw2NTMzNTpbWzg3XSwyNTZdLDY1MzM2OltbODhdLDI1Nl0sNjUzMzc6W1s4OV0sMjU2XSw2NTMzODpbWzkwXSwyNTZdLDY1MzM5OltbOTFdLDI1Nl0sNjUzNDA6W1s5Ml0sMjU2XSw2NTM0MTpbWzkzXSwyNTZdLDY1MzQyOltbOTRdLDI1Nl0sNjUzNDM6W1s5NV0sMjU2XSw2NTM0NDpbWzk2XSwyNTZdLDY1MzQ1OltbOTddLDI1Nl0sNjUzNDY6W1s5OF0sMjU2XSw2NTM0NzpbWzk5XSwyNTZdLDY1MzQ4OltbMTAwXSwyNTZdLDY1MzQ5OltbMTAxXSwyNTZdLDY1MzUwOltbMTAyXSwyNTZdLDY1MzUxOltbMTAzXSwyNTZdLDY1MzUyOltbMTA0XSwyNTZdLDY1MzUzOltbMTA1XSwyNTZdLDY1MzU0OltbMTA2XSwyNTZdLDY1MzU1OltbMTA3XSwyNTZdLDY1MzU2OltbMTA4XSwyNTZdLDY1MzU3OltbMTA5XSwyNTZdLDY1MzU4OltbMTEwXSwyNTZdLDY1MzU5OltbMTExXSwyNTZdLDY1MzYwOltbMTEyXSwyNTZdLDY1MzYxOltbMTEzXSwyNTZdLDY1MzYyOltbMTE0XSwyNTZdLDY1MzYzOltbMTE1XSwyNTZdLDY1MzY0OltbMTE2XSwyNTZdLDY1MzY1OltbMTE3XSwyNTZdLDY1MzY2OltbMTE4XSwyNTZdLDY1MzY3OltbMTE5XSwyNTZdLDY1MzY4OltbMTIwXSwyNTZdLDY1MzY5OltbMTIxXSwyNTZdLDY1MzcwOltbMTIyXSwyNTZdLDY1MzcxOltbMTIzXSwyNTZdLDY1MzcyOltbMTI0XSwyNTZdLDY1MzczOltbMTI1XSwyNTZdLDY1Mzc0OltbMTI2XSwyNTZdLDY1Mzc1OltbMTA2MjldLDI1Nl0sNjUzNzY6W1sxMDYzMF0sMjU2XSw2NTM3NzpbWzEyMjkwXSwyNTZdLDY1Mzc4OltbMTIzMDBdLDI1Nl0sNjUzNzk6W1sxMjMwMV0sMjU2XSw2NTM4MDpbWzEyMjg5XSwyNTZdLDY1MzgxOltbMTI1MzldLDI1Nl0sNjUzODI6W1sxMjUzMF0sMjU2XSw2NTM4MzpbWzEyNDQ5XSwyNTZdLDY1Mzg0OltbMTI0NTFdLDI1Nl0sNjUzODU6W1sxMjQ1M10sMjU2XSw2NTM4NjpbWzEyNDU1XSwyNTZdLDY1Mzg3OltbMTI0NTddLDI1Nl0sNjUzODg6W1sxMjUxNV0sMjU2XSw2NTM4OTpbWzEyNTE3XSwyNTZdLDY1MzkwOltbMTI1MTldLDI1Nl0sNjUzOTE6W1sxMjQ4M10sMjU2XSw2NTM5MjpbWzEyNTQwXSwyNTZdLDY1MzkzOltbMTI0NTBdLDI1Nl0sNjUzOTQ6W1sxMjQ1Ml0sMjU2XSw2NTM5NTpbWzEyNDU0XSwyNTZdLDY1Mzk2OltbMTI0NTZdLDI1Nl0sNjUzOTc6W1sxMjQ1OF0sMjU2XSw2NTM5ODpbWzEyNDU5XSwyNTZdLDY1Mzk5OltbMTI0NjFdLDI1Nl0sNjU0MDA6W1sxMjQ2M10sMjU2XSw2NTQwMTpbWzEyNDY1XSwyNTZdLDY1NDAyOltbMTI0NjddLDI1Nl0sNjU0MDM6W1sxMjQ2OV0sMjU2XSw2NTQwNDpbWzEyNDcxXSwyNTZdLDY1NDA1OltbMTI0NzNdLDI1Nl0sNjU0MDY6W1sxMjQ3NV0sMjU2XSw2NTQwNzpbWzEyNDc3XSwyNTZdLDY1NDA4OltbMTI0NzldLDI1Nl0sNjU0MDk6W1sxMjQ4MV0sMjU2XSw2NTQxMDpbWzEyNDg0XSwyNTZdLDY1NDExOltbMTI0ODZdLDI1Nl0sNjU0MTI6W1sxMjQ4OF0sMjU2XSw2NTQxMzpbWzEyNDkwXSwyNTZdLDY1NDE0OltbMTI0OTFdLDI1Nl0sNjU0MTU6W1sxMjQ5Ml0sMjU2XSw2NTQxNjpbWzEyNDkzXSwyNTZdLDY1NDE3OltbMTI0OTRdLDI1Nl0sNjU0MTg6W1sxMjQ5NV0sMjU2XSw2NTQxOTpbWzEyNDk4XSwyNTZdLDY1NDIwOltbMTI1MDFdLDI1Nl0sNjU0MjE6W1sxMjUwNF0sMjU2XSw2NTQyMjpbWzEyNTA3XSwyNTZdLDY1NDIzOltbMTI1MTBdLDI1Nl0sNjU0MjQ6W1sxMjUxMV0sMjU2XSw2NTQyNTpbWzEyNTEyXSwyNTZdLDY1NDI2OltbMTI1MTNdLDI1Nl0sNjU0Mjc6W1sxMjUxNF0sMjU2XSw2NTQyODpbWzEyNTE2XSwyNTZdLDY1NDI5OltbMTI1MThdLDI1Nl0sNjU0MzA6W1sxMjUyMF0sMjU2XSw2NTQzMTpbWzEyNTIxXSwyNTZdLDY1NDMyOltbMTI1MjJdLDI1Nl0sNjU0MzM6W1sxMjUyM10sMjU2XSw2NTQzNDpbWzEyNTI0XSwyNTZdLDY1NDM1OltbMTI1MjVdLDI1Nl0sNjU0MzY6W1sxMjUyN10sMjU2XSw2NTQzNzpbWzEyNTMxXSwyNTZdLDY1NDM4OltbMTI0NDFdLDI1Nl0sNjU0Mzk6W1sxMjQ0Ml0sMjU2XSw2NTQ0MDpbWzEyNjQ0XSwyNTZdLDY1NDQxOltbMTI1OTNdLDI1Nl0sNjU0NDI6W1sxMjU5NF0sMjU2XSw2NTQ0MzpbWzEyNTk1XSwyNTZdLDY1NDQ0OltbMTI1OTZdLDI1Nl0sNjU0NDU6W1sxMjU5N10sMjU2XSw2NTQ0NjpbWzEyNTk4XSwyNTZdLDY1NDQ3OltbMTI1OTldLDI1Nl0sNjU0NDg6W1sxMjYwMF0sMjU2XSw2NTQ0OTpbWzEyNjAxXSwyNTZdLDY1NDUwOltbMTI2MDJdLDI1Nl0sNjU0NTE6W1sxMjYwM10sMjU2XSw2NTQ1MjpbWzEyNjA0XSwyNTZdLDY1NDUzOltbMTI2MDVdLDI1Nl0sNjU0NTQ6W1sxMjYwNl0sMjU2XSw2NTQ1NTpbWzEyNjA3XSwyNTZdLDY1NDU2OltbMTI2MDhdLDI1Nl0sNjU0NTc6W1sxMjYwOV0sMjU2XSw2NTQ1ODpbWzEyNjEwXSwyNTZdLDY1NDU5OltbMTI2MTFdLDI1Nl0sNjU0NjA6W1sxMjYxMl0sMjU2XSw2NTQ2MTpbWzEyNjEzXSwyNTZdLDY1NDYyOltbMTI2MTRdLDI1Nl0sNjU0NjM6W1sxMjYxNV0sMjU2XSw2NTQ2NDpbWzEyNjE2XSwyNTZdLDY1NDY1OltbMTI2MTddLDI1Nl0sNjU0NjY6W1sxMjYxOF0sMjU2XSw2NTQ2NzpbWzEyNjE5XSwyNTZdLDY1NDY4OltbMTI2MjBdLDI1Nl0sNjU0Njk6W1sxMjYyMV0sMjU2XSw2NTQ3MDpbWzEyNjIyXSwyNTZdLDY1NDc0OltbMTI2MjNdLDI1Nl0sNjU0NzU6W1sxMjYyNF0sMjU2XSw2NTQ3NjpbWzEyNjI1XSwyNTZdLDY1NDc3OltbMTI2MjZdLDI1Nl0sNjU0Nzg6W1sxMjYyN10sMjU2XSw2NTQ3OTpbWzEyNjI4XSwyNTZdLDY1NDgyOltbMTI2MjldLDI1Nl0sNjU0ODM6W1sxMjYzMF0sMjU2XSw2NTQ4NDpbWzEyNjMxXSwyNTZdLDY1NDg1OltbMTI2MzJdLDI1Nl0sNjU0ODY6W1sxMjYzM10sMjU2XSw2NTQ4NzpbWzEyNjM0XSwyNTZdLDY1NDkwOltbMTI2MzVdLDI1Nl0sNjU0OTE6W1sxMjYzNl0sMjU2XSw2NTQ5MjpbWzEyNjM3XSwyNTZdLDY1NDkzOltbMTI2MzhdLDI1Nl0sNjU0OTQ6W1sxMjYzOV0sMjU2XSw2NTQ5NTpbWzEyNjQwXSwyNTZdLDY1NDk4OltbMTI2NDFdLDI1Nl0sNjU0OTk6W1sxMjY0Ml0sMjU2XSw2NTUwMDpbWzEyNjQzXSwyNTZdLDY1NTA0OltbMTYyXSwyNTZdLDY1NTA1OltbMTYzXSwyNTZdLDY1NTA2OltbMTcyXSwyNTZdLDY1NTA3OltbMTc1XSwyNTZdLDY1NTA4OltbMTY2XSwyNTZdLDY1NTA5OltbMTY1XSwyNTZdLDY1NTEwOltbODM2MV0sMjU2XSw2NTUxMjpbWzk0NzRdLDI1Nl0sNjU1MTM6W1s4NTkyXSwyNTZdLDY1NTE0OltbODU5M10sMjU2XSw2NTUxNTpbWzg1OTRdLDI1Nl0sNjU1MTY6W1s4NTk1XSwyNTZdLDY1NTE3OltbOTYzMl0sMjU2XSw2NTUxODpbWzk2NzVdLDI1Nl19XG5cbn07XG5cbiAgIC8qKioqKiBNb2R1bGUgdG8gZXhwb3J0ICovXG4gICB2YXIgdW5vcm0gPSB7XG4gICAgICBuZmM6IG5mYyxcbiAgICAgIG5mZDogbmZkLFxuICAgICAgbmZrYzogbmZrYyxcbiAgICAgIG5ma2Q6IG5ma2QsXG4gICB9O1xuXG4gICAvKmdsb2JhbHMgbW9kdWxlOnRydWUsZGVmaW5lOnRydWUqL1xuXG4gICAvLyBDb21tb25KU1xuICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIG1vZHVsZS5leHBvcnRzID0gdW5vcm07XG5cbiAgIC8vIEFNRFxuICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgZGVmaW5lKFwidW5vcm1cIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgcmV0dXJuIHVub3JtO1xuICAgICAgfSk7XG5cbiAgIC8vIEdsb2JhbFxuICAgfSBlbHNlIHtcbiAgICAgIHJvb3QudW5vcm0gPSB1bm9ybTtcbiAgIH1cblxuICAgLyoqKioqIEV4cG9ydCBhcyBzaGltIGZvciBTdHJpbmc6Om5vcm1hbGl6ZSBtZXRob2QgKioqKiovXG4gICAvKlxuICAgICAgaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTpzcGVjaWZpY2F0aW9uX2RyYWZ0cyNub3ZlbWJlcl84XzIwMTNfZHJhZnRfcmV2XzIxXG5cbiAgICAgIDIxLjEuMy4xMiBTdHJpbmcucHJvdG90eXBlLm5vcm1hbGl6ZShmb3JtPVwiTkZDXCIpXG4gICAgICBXaGVuIHRoZSBub3JtYWxpemUgbWV0aG9kIGlzIGNhbGxlZCB3aXRoIG9uZSBhcmd1bWVudCBmb3JtLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcblxuICAgICAgMS4gTGV0IE8gYmUgQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcyB2YWx1ZSkuXG4gICAgICAyLiBMZXQgUyBiZSBUb1N0cmluZyhPKS5cbiAgICAgIDMuIFJldHVybklmQWJydXB0KFMpLlxuICAgICAgNC4gSWYgZm9ybSBpcyBub3QgcHJvdmlkZWQgb3IgdW5kZWZpbmVkIGxldCBmb3JtIGJlIFwiTkZDXCIuXG4gICAgICA1LiBMZXQgZiBiZSBUb1N0cmluZyhmb3JtKS5cbiAgICAgIDYuIFJldHVybklmQWJydXB0KGYpLlxuICAgICAgNy4gSWYgZiBpcyBub3Qgb25lIG9mIFwiTkZDXCIsIFwiTkZEXCIsIFwiTkZLQ1wiLCBvciBcIk5GS0RcIiwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgRXhjZXB0aW9uLlxuICAgICAgOC4gTGV0IG5zIGJlIHRoZSBTdHJpbmcgdmFsdWUgaXMgdGhlIHJlc3VsdCBvZiBub3JtYWxpemluZyBTIGludG8gdGhlIG5vcm1hbGl6YXRpb24gZm9ybSBuYW1lZCBieSBmIGFzIHNwZWNpZmllZCBpbiBVbmljb2RlIFN0YW5kYXJkIEFubmV4ICMxNSwgVW5pY29kZU5vcm1hbGl6YXRvaW4gRm9ybXMuXG4gICAgICA5LiBSZXR1cm4gbnMuXG5cbiAgICAgIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIG5vcm1hbGl6ZSBtZXRob2QgaXMgMC5cblxuICAgICAgKk5PVEUqIFRoZSBub3JtYWxpemUgZnVuY3Rpb24gaXMgaW50ZW50aW9uYWxseSBnZW5lcmljOyBpdCBkb2VzIG5vdCByZXF1aXJlIHRoYXQgaXRzIHRoaXMgdmFsdWUgYmUgYSBTdHJpbmcgb2JqZWN0LiBUaGVyZWZvcmUgaXQgY2FuIGJlIHRyYW5zZmVycmVkIHRvIG90aGVyIGtpbmRzIG9mIG9iamVjdHMgZm9yIHVzZSBhcyBhIG1ldGhvZC5cbiAgICovXG4gICBpZiAoIVN0cmluZy5wcm90b3R5cGUubm9ybWFsaXplKSB7XG4gICAgICBTdHJpbmcucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgIHZhciBzdHIgPSBcIlwiICsgdGhpcztcbiAgICAgICAgIGZvcm0gPSAgZm9ybSA9PT0gdW5kZWZpbmVkID8gXCJORkNcIiA6IGZvcm07XG5cbiAgICAgICAgIGlmIChmb3JtID09PSBcIk5GQ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5vcm0ubmZjKHN0cik7XG4gICAgICAgICB9IGVsc2UgaWYgKGZvcm0gPT09IFwiTkZEXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bm9ybS5uZmQoc3RyKTtcbiAgICAgICAgIH0gZWxzZSBpZiAoZm9ybSA9PT0gXCJORktDXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bm9ybS5uZmtjKHN0cik7XG4gICAgICAgICB9IGVsc2UgaWYgKGZvcm0gPT09IFwiTkZLRFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5vcm0ubmZrZChzdHIpO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiSW52YWxpZCBub3JtYWxpemF0aW9uIGZvcm06IFwiICsgZm9ybSk7XG4gICAgICAgICB9XG4gICAgICB9O1xuICAgfVxufSh0aGlzKSk7XG4iXX0=
(2)
});
