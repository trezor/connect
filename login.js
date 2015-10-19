this.TrezorConnect = (function () {
    'use strict';

    var chrome = window.chrome;
    var IS_CHROME_APP = chrome && chrome.app && chrome.app.window;

    var ERR_TIMED_OUT = 'Loading timed out';
    var ERR_WINDOW_CLOSED = 'Window closed';
    var ERR_WINDOW_BLOCKED = 'Window blocked';
    var ERR_ALREADY_WAITING = 'Already waiting for a response';
    var ERR_CHROME_NOT_CONNECTED = 'Internal Chrome popup is not responding.';

    var DISABLE_LOGIN_BUTTONS = window.TREZOR_DISABLE_LOGIN_BUTTONS || false;
    var CHROME_URL = window.TREZOR_CHROME_URL || './chrome/wrapper.html';
    var POPUP_URL = window.TREZOR_POPUP_URL || 'https://trezor.github.io/connect/popup/popup.html';
    var POPUP_PATH = window.TREZOR_POPUP_PATH || 'https://trezor.github.io/connect/';
    var POPUP_ORIGIN = window.TREZOR_POPUP_ORIGIN || 'https://trezor.github.io';

    var POPUP_INIT_TIMEOUT = 15000;

    /**
     * Public API.
     */
    function TrezorConnect() {

        var manager = new PopupManager();

        /**
         * Popup errors.
         */
        this.ERR_TIMED_OUT = ERR_TIMED_OUT;
        this.ERR_WINDOW_CLOSED = ERR_WINDOW_CLOSED;
        this.ERR_WINDOW_BLOCKED = ERR_WINDOW_BLOCKED;
        this.ERR_ALREADY_WAITING = ERR_ALREADY_WAITING;
        this.ERR_CHROME_NOT_CONNECTED = ERR_CHROME_NOT_CONNECTED;

        /**
         * @param {boolean} value
         */
        this.closeAfterSuccess = function (value) { manager.closeAfterSuccess = value; };

        /**
         * @param {boolean} value
         */
        this.closeAfterFailure = function (value) { manager.closeAfterFailure = value; };

        /**
         * @typedef XPubKeyResult
         * @param {boolean} success
         * @param {?string} error
         * @param {?string} xpubkey  serialized extended public key
         * @param {?string} path     BIP32 serializd path of the key
         */

        /**
         * Load BIP32 extended public key by path.
         *
         * Path can be specified either in the string form ("m/44'/1/0") or as
         * raw integer array. In case you omit the path, user is asked to select
         * a BIP32 account to export, and the result contains m/44'/0'/x' node
         * of the account.
         *
         * @param {?(string|array<number>)} path
         * @param {function(XPubKeyResult)} callback
         */
        this.getXPubKey = function (path, callback) {
            if (typeof path === 'string') {
                path = parseHDPath(path);
            }
            manager.sendWithChannel({
                type: 'xpubkey',
                path: path
            }, callback);
        };

        /**
         * @typedef SignTxResult
         * @param {boolean} success
         * @param {?string} error
         * @param {?string} serialized_tx      serialized tx, in hex, including signatures
         * @param {?array<string>} signatures  array of input signatures, in hex
         */

        /**
         * Sign a transaction in the device and return both serialized
         * transaction and the signatures.
         *
         * @param {array<TxInputType>} inputs
         * @param {array<TxOutputType>} outputs
         * @param {function(SignTxResult)} callback
         *
         * @see https://github.com/trezor/trezor-common/blob/master/protob/types.proto
         */
        this.signTx = function (inputs, outputs, callback) {
            manager.sendWithChannel({
                type: 'signtx',
                inputs: inputs,
                outputs: outputs
            }, callback);
        };

        /**
         * @typedef TxRecipient
         * @param {number} amount   the amount to send, in satoshis
         * @param {string} address  the address of the recipient
         */

        /**
         * Compose a transaction by doing BIP-0044 discovery, letting the user
         * select an account, and picking UTXO by internal preferences.
         * Transaction is then signed and returned in the same format as
         * `signTx`.  Only supports BIP-0044 accounts (single-signature).
         *
         * @param {array<TxRecipient>} recipients
         * @param {function(SignTxResult)} callback
         */
        this.composeAndSignTx = function (recipients, callback) {
            manager.sendWithChannel({
                type: 'composetx',
                recipients: recipients
            }, callback);
        };

        /**
         * @typedef RequestLoginResult
         * @param {boolean} success
         * @param {?string} error
         * @param {?string} public_key  public key used for signing, in hex
         * @param {?string} signature   signature, in hex
         */

        /**
         * Sign a login challenge for active origin.
         *
         * @param {?string} hosticon
         * @param {string} challenge_hidden
         * @param {string} challenge_visual
         * @param {string|function(RequestLoginResult)} callback
         *
         * @see https://github.com/trezor/trezor-common/blob/master/protob/messages.proto
         */
        this.requestLogin = function (
            hosticon,
            challenge_hidden,
            challenge_visual,
            callback
        ) {
            if (typeof callback === 'string') {
                // special case for a login through <trezor:login> button.
                // `callback` is name of global var
                callback = window[callback];
            }
            if (!callback) {
                throw new TypeError('TrezorConnect: login callback not found');
            }
            manager.sendWithChannel({
                type: 'login',
                icon: hosticon,
                challenge_hidden: challenge_hidden,
                challenge_visual: challenge_visual
            }, callback);
        };

        var LOGIN_CSS =
            '<style>@import url("@connect_path@/login_buttons.css")</style>';

        var LOGIN_ONCLICK =
            'TrezorConnect.requestLogin('
            + "'@hosticon@','@challenge_hidden@','@challenge_visual@','@callback@'"
            + ')';

        var LOGIN_HTML =
            '<div id="trezorconnect-wrapper">'
            + '  <a id="trezorconnect-button" onclick="' + LOGIN_ONCLICK + '">'
            + '    <span id="trezorconnect-icon"></span>'
            + '    <span id="trezorconnect-text">@text@</span>'
            + '  </a>'
            + '  <span id="trezorconnect-info">'
            + '    <a id="trezorconnect-infolink" href="https://www.buytrezor.com/"'
            + '       target="_blank">What is TREZOR?</a>'
            + '  </span>'
            + '</div>';

        /**
         * Find <trezor:login> elements and replace them with login buttons.
         * It's not required to use these special elements, feel free to call
         * `TrezorConnect.requestLogin` directly.
         */
        this.renderLoginButtons = function () {
            var elements = document.getElementsByTagName('trezor:login');

            for (var i = 0; i < elements.length; i++) {
                var e = elements[i];
                var text = e.getAttribute('text') || 'Sign in with TREZOR';
                var callback = e.getAttribute('callback') || '';
                var hosticon = e.getAttribute('icon') || '';
                var challenge_hidden = e.getAttribute('challenge_hidden') || '';
                var challenge_visual = e.getAttribute('challenge_visual') || '';

                // it's not valid to put markup into attributes, so let users
                // supply a raw text and make TREZOR bold
                text = text.replace('TREZOR', '<strong>TREZOR</strong>');

                e.parentNode.innerHTML =
                    (LOGIN_CSS + LOGIN_HTML)
                    .replace('@text@', text)
                    .replace('@callback@', callback)
                    .replace('@hosticon@', hosticon)
                    .replace('@challenge_hidden@', challenge_hidden)
                    .replace('@challenge_visual@', challenge_visual)
                    .replace('@connect_path@', POPUP_PATH);
            }
        };
    }

    /*
     * `getXPubKey()`
     */

    function parseHDPath(string) {
        return string
            .toLowerCase()
            .split('/')
            .filter(function (p) { return p !== 'm'; })
            .map(function (p) {
                var n = parseInt(p);
                if (p[p.length - 1] === "'") { // hardened index
                    n = n | 0x80000000;
                }
                return n;
            });
    }

    /*
     * Popup management
     */

    function ChromePopup(url, name, width, height) {
        var left = (screen.width - width) / 2;
        var top = (screen.height - height) / 2;
        var opts = {
            id: name,
            innerBounds: {
                width: width,
                height: height,
                left: left,
                top: top
            }
        };

        var closed = function () {
            if (this.onclose) {
                this.onclose(false); // never report as blocked
            }
        }.bind(this);

        var opened = function (w) {
            this.window = w;
            this.window.onClosed.addListener(closed);
        }.bind(this);

        chrome.app.window.create(url, opts, opened);

        this.name = name;
        this.window = null;
        this.onclose = null;
    }

    function ChromeChannel(popup, waiting) {
        var port = null;

        var respond = function (data) {
            if (waiting) {
                var w = waiting;
                waiting = null;
                w(data);
            }
        };

        var setup = function (p) {
            if (p.name === popup.name) {
                port = p;
                port.onMessage.addListener(respond);
                chrome.runtime.onConnect.removeListener(setup);
            }
        };

        chrome.runtime.onConnect.addListener(setup);

        this.respond = respond;

        this.close = function () {
            chrome.runtime.onConnect.removeListener(setup);
            port.onMessage.removeListener(respond);
            port.disconnect();
            port = null;
        };

        this.send = function (value, callback) {
            if (waiting === null) {
                waiting = callback;

                if (port) {
                    port.postMessage(value);
                } else {
                    throw new Error(ERR_CHROME_NOT_CONNECTED);
                }
            } else {
                throw new Error(ERR_ALREADY_WAITING);
            }
        };
    }

    function Popup(url, origin, name, width, height) {
        var left = (screen.width - width) / 2;
        var top = (screen.height - height) / 2;
        var opts =
            'width=' + width +
            ',height=' + height +
            ',left=' + left +
            ',top=' + top +
            ',menubar=no' +
            ',toolbar=no' +
            ',location=no' +
            ',personalbar=no' +
            ',status=no';
        var w = window.open(url, name, opts);

        var interval;
        var blocked = w.closed;
        var iterate = function () {
            if (w.closed) {
                clearInterval(interval);
                if (this.onclose) {
                    this.onclose(blocked);
                }
            }
        }.bind(this);
        interval = setInterval(iterate, 100);

        this.window = w;
        this.origin = origin;
        this.onclose = null;
    }

    function Channel(popup, waiting) {

        var respond = function (data) {
            if (waiting) {
                var w = waiting;
                waiting = null;
                w(data);
            }
        };

        var receive = function (event) {
            if (event.source === popup.window && event.origin === popup.origin) {
                respond(event.data);
            }
        };

        window.addEventListener('message', receive);

        this.respond = respond;

        this.close = function () {
            window.removeEventListener('message', receive);
        };

        this.send = function (value, callback) {
            if (waiting === null) {
                waiting = callback;
                popup.window.postMessage(value, popup.origin);
            } else {
                throw new Error(ERR_ALREADY_WAITING);
            }
        };
    }

    function ConnectedChannel(p) {

        var ready = function () {
            clearTimeout(this.timeout);
            this.popup.onclose = null;
            this.ready = true;
            this.onready();
        }.bind(this);

        var closed = function (blocked) {
            clearTimeout(this.timeout);
            this.channel.close();
            if (blocked) {
                this.onerror(new Error(ERR_WINDOW_BLOCKED));
            } else {
                this.onerror(new Error(ERR_WINDOW_CLOSED));
            }
        }.bind(this);

        var timedout = function () {
            this.popup.onclose = null;
            if (this.popup.window) {
                this.popup.window.close();
            }
            this.channel.close();
            this.onerror(new Error(ERR_TIMED_OUT));
        }.bind(this);

        if (IS_CHROME_APP) {
            this.popup = new ChromePopup(p.chromeUrl, p.name, p.width, p.height);
            this.channel = new ChromeChannel(this.popup, ready);
        } else {
            this.popup = new Popup(p.url, p.origin, p.name, p.width, p.height);
            this.channel = new Channel(this.popup, ready);
        }

        this.timeout = setTimeout(timedout, POPUP_INIT_TIMEOUT);

        this.popup.onclose = closed;

        this.ready = false;
        this.onready = null;
        this.onerror = null;
    }

    function PopupManager() {
        var cc = null;

        var closed = function () {
            cc.channel.respond(new Error(ERR_WINDOW_CLOSED));
            cc.channel.close();
            cc = null;
        };

        var open = function (callback) {
            cc = new ConnectedChannel({
                name: 'trezor-connect',
                width: 600,
                height: 500,
                origin: POPUP_ORIGIN,
                path: POPUP_PATH,
                url: POPUP_URL,
                chromeUrl: CHROME_URL
            });
            cc.onready = function () {
                cc.popup.onclose = closed;
                callback(cc.channel);
            };
            cc.onerror = function (error) {
                cc = null;
                callback(error);
            };
        }.bind(this);

        this.closeAfterSuccess = true;
        this.closeAfterFailure = true;

        this.close = function () {
            if (cc && cc.popup.window) {
                cc.popup.window.close();
            }
        };

        this.waitForChannel = function (callback) {
            if (cc) {
                if (cc.ready) {
                    callback(cc.channel);
                } else {
                    callback(new Error(ERR_ALREADY_WAITING));
                }
            } else {
                open(callback);
            }
        };

        this.sendWithChannel = function (message, callback) {

            var respond = function (response) {
                var succ = response.success && this.closeAfterSuccess;
                var fail = !response.success && this.closeAfterFailure;
                if (succ || fail) {
                    this.close();
                }
                callback(response);
            }.bind(this);

            var onresponse = function (response) {
                if (response instanceof Error) {
                    var error = response;
                    respond({ success: false, error: error.message });
                } else {
                    respond(response);
                }
            };

            var onchannel = function (channel) {
                if (channel instanceof Error) {
                    var error = channel;
                    respond({ success: false, error: error.message });
                } else {
                    channel.send(message, onresponse);
                }
            };

            this.waitForChannel(onchannel);
        };
    }

    var exports = new TrezorConnect();

    if (!IS_CHROME_APP && !DISABLE_LOGIN_BUTTONS) {
        exports.renderLoginButtons();
    }

    return exports;

}());
