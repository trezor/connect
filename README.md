# TREZOR Connect API (version TPM)

TREZOR Connect is a platform for easy integration of TREZOR into 3rd party services. It provides websites with functionality to authenticate users, access public keys and sign transactions. User interface is presented in a secure popup window.

## Versions

We started tagging versions and releasing them to separate URLs, so we don't break any existing (and working) integrations.
Currently, we are at version TPM, which is used by Trezor Password Manager and has an url `https://connect.trezor.io/tpm/trezor-connect.js`.

## Install

Install with npm:
```html
npm install trezor-connect
```

Install with yarn:
```html
yarn add trezor-connect
```

Or include library as inline script
```html
<script src="https://connect.trezor.io/tpm/trezor-connect.js"></script>
```

## Methods

All API calls are promises. Resolve is guaranteed to get called
with a result object, even if user closes the window, network connection times
out, etc. In case of failure, `result.success` is false and `result.error` is
the error message. It is recommended to log the error message and let user
restart the action.

1. [Symmetric key-value encryption](#symmetric-key-value-encryption)

## Symmetric key-value encryption

`TrezorConnect.cipherKeyValue({ path, key, value, encrypt, askOnEncrypt, askOnDecrypt })` asks device to encrypt value
using the private key derived by given BIP32 path and the given key. 
Path can be specified either as an array of numbers or as string m/A'/B'/C/... ,
value must be hexadecimal value - with length a multiple of 16 bytes (so 32 letters in hexadecimal).
IV is always computed automatically.

More information can be found in [SLIP-0011](https://github.com/satoshilabs/slips/blob/master/slip-0011.md). 

```javascript
TrezorConnect.cipherKeyValue({
    path: "m/44'/0'/0",
    key: "This is displayed on TREZOR on encrypt.",
    value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1",
    encrypt: true,
    askOnEncrypt: true,
    askOnDecrypt: true
}).then( function(result) {
    if (result.success) {
        console.log('Encrypted!', result.value); // in hexadecimal
    } else {
        console.error('Error:', result.error); // error message
    }
});
```
