## Ethereum: verify message

Asks device to
verify a message using the signer address and signature.

ES6
```javascript
const result = await TrezorConnect.ethereumVerifyMessage(params);
```

CommonJS
```javascript
TrezorConnect.ethereumVerifyMessage(params).then(function(result) {

});
```

### Params 
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L74-L78)
* `address` - *required* `string` signer address. "0x" prefix is optional
* `message` - *required* `string` signed message in plain text
* `hex` - *optional* `boolean` convert message from hex
* `signature` - *required* `string` signature in hexadecimal format. "0x" prefix is optional

### Example
```javascript
TrezorConnect.ethereumVerifyMessage({
    address: "0xdA0b608bdb1a4A154325C854607c68950b4F1a34",
    message: "Example message",
    signature: "11dc86c631ef5d9388c5e245501d571b864af1a717cbbb3ca1f6dacbf330742957242aa52b36bbe7bb46dce6ff0ead0548cc5a5ce76d0aaed166fd40cb3fc6e51c",
});
```

### Result
###### [flowtype](../../src/js/types/response.js#L133-L136)
```javascript
{
    success: true,
    payload: {
        message: "Message verified"
    }
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

version 4 and below
```javascript
var address = "dA0b608bdb1a4A154325C854607c68950b4F1a34"; 
var signature = "11dc86c631ef5d9388c5e245501d571b864af1a717cbbb3ca1f6dacbf330742957242aa52b36bbe7bb46dce6ff0ead0548cc5a5ce76d0aaed166fd40cb3fc6e51c"; 
TrezorConnect.ethereumVerifyMessage(
    address, // address without "0x" prefix
    signature, // signature without "0x" prefix
    "Example message",
    function(result) {
        // result not changed
    }
);
```
version 5
```javascript
// params are key-value pairs inside Object
TrezorConnect.ethereumVerifyMessage({ 
    address: "0xdA0b608bdb1a4A154325C854607c68950b4F1a34",
    signature: "0x11dc86c631ef5d9388c5e245501d571b864af1a717cbbb3ca1f6dacbf330742957242aa52b36bbe7bb46dce6ff0ead0548cc5a5ce76d0aaed166fd40cb3fc6e51c",
    message: "Example message"
}).then(function(result) {
    // result not changed
})
```
