## Symmetric key-value encryption
Asks device to encrypt value using the private key derived by given BIP32 path and the given key. IV is always computed automatically.

More information can be found in [SLIP-0011](https://github.com/satoshilabs/slips/blob/master/slip-0011.md).

ES6
```javascript
const result = await TrezorConnect.cipherKeyValue(params);
```

CommonJS
```javascript
TrezorConnect.cipherKeyValue(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
<br>
Common parameter `useEmptyPassphrase` - is set to `true`

#### Encrypt single value
* `path` — *obligatory* `string | Array<number>` minimum length is `1`. [read more](path.md)
* `key` — *optional* `string` // TODO
* `value` — *optional* `string` hexadecimal value with length a multiple of 16 bytes (32 letters in hexadecimal)
* `askOnEncrypt` - *optional* `boolean` // TODO
* `askOnDecrypt` - *optional* `boolean` // TODO

#### Encrypt multiple values
* `bundle` - `Array` of Objects with `path`, `key`, `value`, `askOnEncrypt`, `askOnDecrypt` fields

### Example
Return encrypted value:
```javascript
TrezorConnect.cipherKeyValue({
    path: "m/49'/0'/0'",
    key: "This text is displayed on Trezor during encrypt",
    value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1",
    encrypt: true,
    askOnEncrypt: true,
    askOnDecrypt: true
});
```
Return a bundle of encrypted values:
```javascript
TrezorConnect.cipherKeyValue({
    bundle: [
        { path: "m/49'/0'/0'", key: "1 text on Trezor", value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1", encrypt: true  },
        { path: "m/49'/0'/1'", key: "2 text on Trezor", value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1", encrypt: false },
        { path: "m/49'/0'/2'", key: "3 text on Trezor", value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1" }
    ]
});
```
### Result
Result with only one value
```javascript
{
    success: true,
    payload: {
        value: string
    }
}
```
Result with bundle of values
```javascript
{
    success: true,
    payload: [
        { value: string },
        { value: string },
        { value: string }
    ]
}
```
Error
```javascript
{
    success: false,
    payload: {
        error: string // error message
    }
}
```

### Migration from older version

version 4 and below:
```javascript
TrezorConnect.cipherKeyValue(
    "m/49'/0'/0'",     // path
    "This is displayed on TREZOR during encrypt", // key
    "1c0ffeec0ffeec0ffeec0ffeec0ffee1",           // value
    true,              // encrypt
    true,              // ask on encrypt
    true,              // ask on decrypt
    function(result) { // callback
        // result not changed
    }
);
```
version 5
```javascript
// params are key-value pairs inside Object
TrezorConnect.cipherKeyValue({ 
    path: "m/49'/0'/0'",
    key: "This is displayed on TREZOR during encrypt",
    value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1",
    encrypt: true,
    askOnEncrypt: true,
    askOnDecrypt: true
}).then(function(result) {
    // result not changed
})
```
