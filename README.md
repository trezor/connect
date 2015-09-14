# TREZOR Connect API

Connect is a platform for easy integration of TREZOR into 3rd party
services. It provides websites with functionality to authenticate users, access
public keys and sign transactions. User interface is presented in a secure popup
window:

![login dialog](docs/login_dialog.png)

## Usage

First, you need to include the library in your page:

```html
<script src="https://trezor.github.io/connect/login.js"></script>
```

All API calls have a callback argument.  Callback is guaranteed to get called
with a result object, even if user closes the window, network connection times
out, etc.  In case of failure, `result.success` is false and `result.error` is
the error message.  It is recommended to log the error message and let user
restart the action.

1. [Login](#login)
2. [Export public key](#export-public-key)
3. [Sign transaction](#sign-transaction)

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
[SLIP-0013: Authentication using deterministic hierarchy](http://doc.satoshilabs.com/slips/slip-0013.html).

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
name of global function that gets called with the result, and optional `text`
allows to override the default "Login with **TREZOR**".

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
<trezor:login callback="trezorLoginCallback"
              challenge_hidden="0123456789abcdef"
              challenge_visual="Lorem Ipsum"
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

- **Python**: [`examples/server.py`](examples/server.py)
- **PHP**: [`examples/server.php`](examples/server.php)
- **Ruby**: [`examples/server.rb`](examples/server.rb)

## Export public key

`TrezorConnect.getXPubKey(path, callback)` retrieves BIP32 extended public key
by path.  User is presented with a description of the requested key and asked to
confirm the export.

[Example:](examples/xpubkey.html)

```javascript
var path = "m/44'/0'/0'"; // first BIP44 account

// var path = [44 | 0x80000000,
//             0  | 0x80000000,
//             0  | 0x80000000]; // same, in raw form

TrezorConnect.getXPubKey(path, function (result) {
    if (result.success) {
        console.log('XPUB:', result.xpub); // serialized XPUB
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

## Sign transaction

`TrezorConnect.signTx(inputs, outputs, callback)` asks device to sign given
inputs and outputs of pre-composed transaction.  User is asked to confirm all tx
details on TREZOR.

- `inputs`: array of [`TxInputType`](https://github.com/trezor/trezor-common/blob/master/protob/types.proto#L145-L158)
- `outputs`: array of [`TxOutputType`](https://github.com/trezor/trezor-common/blob/master/protob/types.proto#L160-L172)


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

TrezorConnect.signTx(inputs, outputs, function (result) {
    if (result.success) {
        console.log('Transaction:', result.serialized_tx); // tx in hex
        console.log('Signatures:', result.signatures); // array of signatures, in hex
    } else {
        console.error('Error:', result.error); // error message
    }
});
```
