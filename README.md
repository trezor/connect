# TREZOR Connect API (version 5)

TREZOR Connect is a platform for easy integration of TREZOR into 3rd party services. It provides websites with functionality to authenticate users, access public keys and sign transactions. User interface is presented in a secure popup window.

## Versions

We started tagging versions and releasing them to separate URLs, so we don't break any existing (and working) integrations.
Currently, we are at version 5 has an url `https://connect.trezor.io/5/trezor-connect.js`.

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
<script src="https://connect.trezor.io/5/trezor-connect.js"></script>
```

## Methods

All API calls are promises. Resolve is guaranteed to get called
with a `result` object, even if user closes the window, network connection times
out, etc. In case of failure, `result.success` is set to false and `result.payload.error` is
the error message. It is recommended to log the error message and let user
restart the action.

## Documentation

* [Login](docs/requestLogin.md)
* [Export public key](docs/getPublicKey.md)
* [Sign transaction](docs/signTransaction.md)
* [Request payment](docs/composeTransaction.md)
* [Sign and Verify message](docs/signVerifyMessage.md)
* [Get account info](docs/getAcountInfo.md)
* [Show address](docs/showAddress.md)
* [Symmetric key-value encryption](docs/cipherKeyValue.md)
