## Symmetric key-value encryption

`TrezorConnect.cipherKeyValue({ path, key, value, encrypt, askOnEncrypt, askOnDecrypt, iv })` asks device to encrypt value
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
