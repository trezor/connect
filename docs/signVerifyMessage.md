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
