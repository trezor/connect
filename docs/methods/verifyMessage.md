## Verify message

Asks device to
verify a message using the signer address and signature.

ES6
```javascript
const result = await TrezorConnect.verifyMessage(params);
```

CommonJS
```javascript
TrezorConnect.verifyMessage(params).then(function(result) {

});
```

### Params 
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L156-L161)
* `address` - *required* `string` signer address,
* `message` - *required* `string` signed message,
* `signature` - *required* `string` signature in base64 format,
* `coin` - *required* `string` Determines network definition specified in [coins.json](../../src/data/coins.json) file. Coin `shortcut`, `name` or `label` can be used.
* `hex` - *optional* `boolean` convert message from hex

### Example
```javascript
TrezorConnect.verifyMessage({
    address: "3BD8TL6iShVzizQzvo789SuynEKGpLTms9",
    message: "example message",
    signature: "JO7vL3tOB1qQyfSeIVLvdEw9G1tCvL+lNj78XDAVM4t6UptADs3kXDTO2+2ZeEOLFL4/+wm+BBdSpo3kb3Cnsas=",
    coin: "btc"
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
var address = "3BD8TL6iShVzizQzvo789SuynEKGpLTms9";
var signature = "JO7vL3tOB1qQyfSeIVLvdEw9G1tCvL+lNj78XDAVM4t6UptADs3kXDTO2+2ZeEOLFL4/+wm+BBdSpo3kb3Cnsas=";
TrezorConnect.verifyMessage(
    address,
    signature,
    "example message",
    function(result) {
    ...
}, "bitcoin");
```
version 5
```javascript
// params are key-value pairs inside Object
TrezorConnect.verifyMessage({ 
    address: "3BD8TL6iShVzizQzvo789SuynEKGpLTms9",
    signature: "JO7vL3tOB1qQyfSeIVLvdEw9G1tCvL+lNj78XDAVM4t6UptADs3kXDTO2+2ZeEOLFL4/+wm+BBdSpo3kb3Cnsas=",
    message: "example message",
    coin: "btc"
}).then(function(result) {
    ...
})
```
