## Cardano: sign message

Asks device to sign a message using the private key derived by given [BIP32-Ed25519](https://cardanolaunch.com/assets/Ed25519_BIP.pdf) path.

ES6
```javascript
const result = await TrezorConnect.cardanoSignMessage(params);
```

CommonJS
```javascript
TrezorConnect.cardanoSignMessage(params).then(function(result) {

});
```

### Params 
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/cardano.js#L63-L66)
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `message` - *obligatory* `string` message to sign in plain text

### Example
```javascript
TrezorConnect.cardanoSignMessage({
    path: "m/44'/1815'/0'",
    message: "example message"
});
```

### Result
###### [flowtype](../../src/js/types/cardano.js#L67-L72)
```javascript
{
    success: true,
    payload: {
        publicKey: string,
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
