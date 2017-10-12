# TREZOR Connect API

[![Build Status](https://travis-ci.org/trezor/connect.svg?branch=master)](https://travis-ci.org/trezor/connect) [![gitter](https://badges.gitter.im/trezor/community.svg)](https://gitter.im/trezor/community)

TREZOR Connect is a platform for easy integration of TREZOR into 3rd party
services. It provides websites with functionality to authenticate users, access
public keys and sign transactions. User interface is presented in a secure popup
window:

![login dialog](docs/login_dialog.png)

User needs to confirm actions on his TREZOR:

![login dialog](docs/confirm.png)

More general (and slightly obsolete) info can be found [here](https://doc.satoshilabs.com/trezor-tech/api-connect.html).

Examples of usage can be found on https://connect.trezor.io/4/examples/

## Usage

First, you need to include the library in your page:

```html
<script src="https://connect.trezor.io/4/connect.js"></script>
```

All API calls have a callback argument.  Callback is guaranteed to get called
with a result object, even if user closes the window, network connection times
out, etc.  In case of failure, `result.success` is false and `result.error` is
the error message.  It is recommended to log the error message and let user
restart the action.

All the API calls also have an optional parameter requiredFirmware; you can
require that firmware version or newer (for example, 1.4.0 for Ethereum support)
- see example xpub-ethereum.

## Versions

We started tagging versions and releasing them to separate URLs, so we don't break
any existing (and working) integrations.

Currently, we are at version 4, which has an url `https://connect.trezor.io/4/connect.js`. The older version
at `https://trezor.github.io/connect/connect.js`, `https://connect.trezor.io/3/connect.js`, `https://connect.trezor.io/2/connect.js` is still working, but new features are not being added.

With regards to this repo - All updates should go to `master` branch, the releases are in corresponding branches. The `gh-pages` is the same older version, that is used at `trezor.github.io/connect/connect.js`, and it's there for backwards compatibility; please don't touch.


1. [Login](#login)
2. [Export public key](#export-public-key)
3. [Sign transaction](#sign-transaction)
4. [Request payment](#request-payment) (including broadcasting the resulting transaction to the network)
5. [Sign & Verify message](#sign-message)
6. [Symmetric key-value encryption](#symmetric-key-value-encryption)
7. [Get account info](#get-account-info) (including info about balance and first unused address)

## Login

Challenge-response authentication via TREZOR. To protect against replay attacks,
you must use a server-side generated and randomized `challenge_hidden` for every
attempt.  You can also provide a visual challenge that will be shown on the
device.

Service backend needs to check whether the signature matches the generated
`challenge_hidden`, provided `challenge_visual` and stored `public_key` fields.
If that is the case, the backend either creates an account (if the `public_key`
identity is seen for the first time) or signs in the user (if the `public_key`
identity is already a known user).

To understand the full mechanics, please consult the Challenge-Response chapter
of
[SLIP-0013: Authentication using deterministic hierarchy](https://github.com/satoshilabs/slips/blob/master/slip-0013.md).

### Using Javascript API

[Example:](examples/login-js.html)

```javascript
// site icon, optional. at least 48x48px
var hosticon = 'https://example.com/icon.png';

// server-side generated and randomized challenges
var challenge_hidden = '';
var challenge_visual = '';

TrezorConnect.requestLogin(hosticon, challenge_hidden, challenge_visual, function (result) {
	if (result.success) {
		console.log('Public key:', result.public_key); // pubkey in hex
		console.log('Signature:', result.signature); // signature in hex
        console.log('Version 2:', result.version === 2); // version field
	} else {
		console.error('Error:', result.error);
	}
});
```

### Using HTML button

All `<trezor:login>` tags get transformed into HTML login buttons. The
parameters are exactly the same as for
[`TrezorConnect.requestLogin`](#using-javascript-api), but `callback` represents
name of global function that gets called with the result.

[Example:](examples/login.html)

```html
<script>
function trezorLoginCallback(result) {
    if (result.success) {
        console.log('Public key:', result.public_key); // pubkey in hex
        console.log('Signature:', result.signature); // signature in hex
        console.log('Version 2:', result.version === 2); // version field
    } else {
        console.error('Error:', result.error);
    }
}
</script>

<!-- callback is a name of global function -->
<!-- challenges are server-side generated and randomized -->
<!-- site icon is optional and at least 48x48px -->
<!-- text is optional -->
<trezor:login callback="trezorLoginCallback"
              challenge_hidden="0123456789abcdef"
              challenge_visual="Lorem Ipsum"
              text="Sign in with TREZOR"
              icon="https://example.com/icon.png"></trezor:login>
```

`<trezor:login>` tags are rendered after loading the TREZOR Connect script. In
case you need to render dynamically created content, call
`TrezorConnect.renderLoginButtons()`.

You can restyle the login button to fit the look of your website.  See the
example in [`examples/login-restyled.html`](examples/login-restyled.html).  The
default CSS being used is [`login_buttons.css`](login_buttons.css):

![login button](docs/login_button.png)

### Server side

Here is the reference implementation of the server-side signature verification
written in various languages:

- **C#**: [`examples/server.cs`](examples/server.cs)
- **Javascript**: [`examples/server.js`](examples/server.js)
- **PHP**: [`examples/server.php`](examples/server.php)
- **Python**: [`examples/server.py`](examples/server.py)
- **Ruby**: [`examples/server.rb`](examples/server.rb)

## Export public key

`TrezorConnect.getXPubKey(path, callback)` retrieves BIP32 extended public key
by path. User is presented with a description of the requested key and asked to
confirm the export.

If you want to use this method with altcoins you need to set currency using method:
```javascript
    TrezorConnect.setCurrency(coin);
```
where coin is a string parameter with coin_name, coin_shortcut or coin_label declared in [`coins.json`](https://github.com/trezor/trezor-common/blob/master/coins.json) file.
By default currency is set to Bitcoin.

[Example:](examples/xpubkey.html)

```javascript
var path = "m/44'/0'/0'"; // first BIP44 account

// var path = [44 | 0x80000000,
//             0  | 0x80000000,
//             0  | 0x80000000]; // same, in raw form

TrezorConnect.setCurrency('BTC');
TrezorConnect.getXPubKey(path, function (result) {
    if (result.success) {
        console.log('XPUB:', result.xpubkey); // serialized XPUB
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

If you omit the path, BIP-0044 account discovery is performed and user is
presented with a list of discovered accounts.  Node of selected account is then
exported.  [Example.](examples/xpubkey-discovery.html)

## Sign transaction

`TrezorConnect.signTx(inputs, outputs, callback)` asks device to sign given
inputs and outputs of pre-composed transaction.  User is asked to confirm all tx
details on TREZOR.

- `inputs`: array of [`TxInputType`](https://github.com/trezor/trezor-common/blob/master/protob/types.proto#L145-L158)
- `outputs`: array of [`TxOutputType`](https://github.com/trezor/trezor-common/blob/master/protob/types.proto#L160-L172)

If you want to use this method with altcoins you need to set currency using method:
```javascript
    TrezorConnect.setCurrency(coin);
```
where coin is a string parameter with coin_name, coin_shortcut or coin_label declared in [`coins.json`](https://github.com/trezor/trezor-common/blob/master/coins.json) file.
By default currency is set to Bitcoin.

[PAYTOADDRESS example:](examples/signtx-paytoaddress.html)

```javascript
// spend one change output
var inputs = [{
    address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 0],
    prev_index: 0,
    prev_hash: 'b035d89d4543ce5713c553d69431698116a822c57c03ddacf3f04b763d1999ac'
}];

// send to 1 address output and one change output
var outputs = [{
    address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 1],
    amount: 3181747,
    script_type: 'PAYTOADDRESS'
}, {
    address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
    amount: 200000,
    script_type: 'PAYTOADDRESS'
}];

TrezorConnect.setCurrency('BTC');
TrezorConnect.signTx(inputs, outputs, function (result) {
    if (result.success) {
        console.log('Transaction:', result.serialized_tx); // tx in hex
        console.log('Signatures:', result.signatures); // array of signatures, in hex
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

[SPENDP2SHWITNESS example:](examples/signtx-paytoaddress.html)
```javascript
// spend one segwit change output
var inputs = [{
    address_n: [49 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 0],
    prev_index: 0,
    prev_hash: 'b035d89d4543ce5713c553d69431698116a822c57c03ddacf3f04b763d1999ac'
    amount: 3382047,
    script_type: 'SPENDP2SHWITNESS'
}];

// send to 1 address output and one segwit change output
var outputs = [{
    address_n: [49 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 1],
    amount: 3181747,
    script_type: 'PAYTOP2SHWITNESS'
}, {
    address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
    amount: 200000,
    script_type: 'PAYTOADDRESS'
}];

TrezorConnect.setCurrency('BTC');
TrezorConnect.signTx(inputs, outputs, function (result) {
    if (result.success) {
        console.log('Transaction:', result.serialized_tx); // tx in hex
        console.log('Signatures:', result.signatures); // array of signatures, in hex
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

[PAYTOMULTISIG example.](examples/signtx-paytomultisig.html)

## Sign Ethereum transaction

```javascript
TrezorConnect.ethereumSignTx(
  address_n, // address path - either array or string, see example
  nonce,     // nonce - hexadecimal string
  gas_price, // gas price - hexadecimal string
  gas_limit, // gas limit - hexadecimal string
  to,        // address
  value,     // value in wei, hexadecimal string
  data,      // data, hexadecimal string OR null for no data
  chain_id,  // chain id for EIP-155 - is only used in fw 1.4.2 and newer, older will ignore it
  callback)
```

This will return signature in three components - v, r, s - v is number, the rest is hexadecimal string.

All the hexa strings are *without* the '0x' prefix, *including the address*.

[Ethereum example:](examples/signtx-ethereum.html)


## Request payment

`TrezorConnect.composeAndSignTx(recipients, callback)` requests a payment from
the user's wallet to a set of given recipients.  Internally, a BIP-0044 account
discovery is performed, user is presented with a list of accounts.  After
selecting an account, transaction is composed by internal coin-selection
preferences.  Transaction is then signed and returned in the same format as
`signTx`.  Change output is added automatically, if needed.

If you want to use this method with altcoins you need to set currency using method:
```javascript
    TrezorConnect.setCurrency(coin);
```
where coin is a string parameter with coin_name, coin_shortcut or coin_label declared in [`coins.json`](https://github.com/trezor/trezor-common/blob/master/coins.json) file.
By default currency is set to Bitcoin.

[Example:](examples/composetx.html)

```javascript
var recipients = [{
    address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
    amount: 200000
}];

TrezorConnect.composeAndSignTx(recipients, function (result) {
    if (result.success) {
        console.log('Serialized TX:', result.serialized_tx); // tx in hex
        console.log('Signatures:', result.signatures); // array of signatures, in hex
    } else {
        console.error('Error:', result.error); // error message
    }
});

```

You can also push and broadcast the resulting transaction to the Bitcoin network with a call.

[Example:](examples/composetx-push.html)
```javascript
TrezorConnect.composeAndSignTx(outputs, function (result) {
    if (result.success) {
        TrezorConnect.pushTransaction(result.serialized_tx, function (pushResult) {
            if (pushResult.success) {
                console.log('Transaction pushed. Id:', pushResult.txid); // ID of the transaction
            } else {
                console.error('Error:', pushResult.error); // error message
            }
        });
    } else {
        console.error('Error:', result.error); // error message
    }
});

```

## Sign & Verify message

`TrezorConnect.signMessage(path, message, callback [, coin])` asks device to
sign a message using the private key derived by given BIP32 path. Path can be specified
either as an array of numbers or as string m/A'/B'/C/...

Message is signed and address + signature is returned

`TrezorConnect.verifyMessage(address, signature, message, callback [, coin])` asks device to
verify a message using the address and signature.

Message is verified and success is returned.

[Example:](examples/signmsg.html)

```javascript
// Sign message
var path="m/44'/0'/0";
var message='Example message';

TrezorConnect.signMessage(path, message, function (result) {
    if (result.success) {
        console.log('Message signed!', result.signature); // signature in base64
        console.log('Signing address:', result.address); // address in standard b58c form
    } else {
        console.error('Error:', result.error); // error message
    }
});

// Verify message
var address = '1FS8haK8SCjUyMHCCiDAFLoDD1kQBwc7Zk';
var signature = 'H4P2mQ0Bc/o5gZ+VU+zclw+ls7c2zLM/g5TfnEzkwdOlJQaEo2OqYwwa5uh+NH71IoOVzMSFPCGA4+7dTy16DQc=';

TrezorConnect.verifyMessage(address, signature, message, function (result) {
    if (response.success) {
        console.log("Success! Verified.");
    } else {
        console.log(response.error);
    }
});
```

**note:** The argument coin is optional and defaults to "Bitcoin" if missing.

The message can be UTF-8; however, TREZOR is not displaying non-ascii characters, and third-party apps are not dealing with them correctly either. Therefore, using ASCII only is recommended.

## Sign & Verify Ethereum message

`TrezorConnect.ethereumSignMessage(path, message, callback)` asks device to
sign a message using the private key derived by given BIP32 path. Path can be specified
either as an array of numbers or as string m/A'/B'/C/...

Message is signed and address + signature is returned

[Example:](examples/signmsg-ethereum.html)

```javascript
var path="m/44'/0'/0";
var message="Example message";
TrezorConnect.ethereumSignMessage(path, message, function (result) {
    if (result.success) {
        console.log('Message signed!', result.signature); // signature in hex
        console.log('Signing address:', result.address); // address in standard b58c form
    } else {
        console.error('Error:', result.error); // error message
    }
});
```
The message can be UTF-8; however, TREZOR is not displaying non-ascii characters, and third-party apps are not dealing with them correctly either. Therefore, using ASCII only is recommended.

## Verify Ethereum message

`TrezorConnect.ethereumVerifyMessage(address, signature, message, callback)` asks device to
verify a message using the ethereum address and signature.

Message is verified and success is returned.

[Example:](examples/signmsg-ethereum.html)

```javascript
var address="b1125f399310202822d7ee3eed38a65481a928ec"; // address in hex
var signature="7eb0c3ebaaabc8ff67a5413a79512293f0184ed3d136fc873f188b3dd39e043f3036f42c75c7c05e236b37f75dbe4b154437391bbe219e5e8d7d69ac4d89d6231c"; // signature in hex
var message="Example message"; // message utf8
TrezorConnect.ethereumVerifyMessage(path, signature, message, function (result) {
    if (result.success) {
        console.log(result.success);
    } else {
        console.error('Error:', result.error); // error message
    }
});
```
The message can be UTF-8; however, TREZOR is not displaying non-ascii characters, and third-party apps are not dealing with them correctly either. Therefore, using ASCII only is recommended.

## Symmetric key-value encryption

`TrezorConnect.cipherKeyValue(path, key, value, encrypt, ask_on_encrypt, ask_on_decrypt, callback)` asks device to
encrypt value
using the private key derived by given BIP32 path and the given key. Path can be specified
either as an array of numbers or as string m/A'/B'/C/... , value must be hexadecimal value - with length a multiple of 16 bytes (so 32 letters in hexadecimal).

More information can be found in [SLIP-0011](https://github.com/satoshilabs/slips/blob/master/slip-0011.md). IV is always computed automatically.

[Example](examples/signmsg.html):

```javascript
var path = "m/44'/0'/0";
var key = 'This is displayed on TREZOR on encrypt.';
var value = '1c0ffeec0ffeec0ffeec0ffeec0ffee1';
var encrypt = true;
var ask_on_encrypt = true;
var ask_on_decrypt = false;

TrezorConnect.cipherKeyValue(path, key, value, encrypt, ask_on_encrypt, ask_on_decrypt, function (result) {
    if (result.success) {
        console.log('Encrypted!', result.value); // in hexadecimal
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

## Get account info

`TrezorConnect.getAccountInfo(description, callback)` gets an info of an account.

[Example:](examples/accountinfo.html)
```javascript
var description = "m/44'/0'/2'"; // third account (see below)

TrezorConnect.getAccountInfo(description, function (result) {
    if (result.success) { // success
        console.log('Account ID: ', result.id);
        console.log('Account path: ', result.path);
        console.log('Serialized account path: ', result.serializedPath);
        console.log('Xpub', result.xpub);

        console.log('Fresh address (first unused address): ', result.freshAddress);
        console.log('Fresh address ID: ', result.freshAddressId);
        console.log('Fresh address path: ', result.freshAddressPath);
        console.log('Serialized fresh address path: ', result.serializedFreshAddressPath);

        console.log('Balance in satoshis (including unconfirmed):', result.balance);
        console.log('Balance in satoshis (only confirmed):', result.confirmed);
    } else {
        console.error('Error:', result.error); // error message
    }
});

```

Description can be one of the following:

* `null` (or `undefined`) - in that case, the user is presented with his accounts and has to select one
* path - either as a string (`"m/44'/0'/2'`), or as an array (`[44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000]`)
    * it has to be a BIP44 path for Bitcoin, meaning it has to start with `44'/0'/`.
* id - ID of the account (either as a string or as a number)
    * note that accounts have zero-based IDs, but the numbering on the screen start with "Account #1"; so account with id 2 is "Account #3", etc.
* xpub - xpub of the account
    * the xpub must start with `xpub`, and has to belong to one of the first 10 accounts
* { account_index: 0, account_type: 'legacy' } - An object with account ID and account type legacy/segwit

## Show address / get address

`TrezorConnect.getAddress(path, coin, segwit, callback)` shows address on device and returns it to caller

[Example:](examples/accountinfo.html)
```javascript
var path = "m/44'/0'/2'/0/0";
var coin = "Testnet";  // "Bitcoin", "Litecoin", etc
var segwit = true; // segwit makes sense only on Litecoin and Testnet

TrezorConnect.getAddress(path, coin, segwit, function (response) {
    if (result.success) { // success
        console.log('Address: ', result.address);
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

## Ethereum - Show address / get address

`TrezorConnect.ethereumGetAddress(path, callback)` shows address on device and returns it to caller

[Example:](examples/accountinfo.html)
```javascript
var path = "m/44'/60'/0'/0/0"

TrezorConnect.ethereumGetAddress(path, function (response) {
    if (result.success) { // success
        console.log('Address: ', result.address);
    } else {
        console.error('Error:', result.error); // error message
    }
});
```
