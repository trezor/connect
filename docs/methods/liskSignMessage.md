## Lisk: sign message

Asks device to sign a message using the private key derived by given BIP32 path.

ES6
```javascript
const result = await TrezorConnect.liskSignMessage(params);
```

CommonJS
```javascript
TrezorConnect.liskSignMessage(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L188-L191)
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `message` - *obligatory* `string` message to sign in plain text

### Example
```javascript
TrezorConnect.liskSignMessage({
    path: "m/44'/134'/0'",
    message: "example message"
});
```

### Result
###### [flowtype](../../src/js/types/response.js#L142-L145)
```javascript
{
    success: true,
    payload: {
        public_key: string,
        signature: string,
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
