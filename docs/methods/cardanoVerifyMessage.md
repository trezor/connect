## Cardano: verify message

Asks device to
verify a message using the signer public key and signature.

ES6
```javascript
const result = await TrezorConnect.cardanoVerifyMessage(params);
```

CommonJS
```javascript
TrezorConnect.cardanoVerifyMessage(params).then(function(result) {

});
```

### Params 
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/cardano.js#L81-L85)
* `publicKey` - *obligatory* `string` signer public key.
* `message` - *obligatory* `string` signed message in plain text
* `signature` - *obligatory* `string` signature in hexadecimal format.

### Example
```javascript
TrezorConnect.cardanoVerifyMessage({
    publicKey: "e34e53a1ef72f0493a227e051b0f223fa27aab2ee98af48fc2a8cb29407c2f27",
    message: "Example message",
    signature: "ac979a384a5eacebdcb11770d1202ca19791bff5fca95d64eb287d15009cfb4808ed95025ebf1b4abf394fba683ffab85321e588d4982ac99a6ad69017139d00",
});
```

### Result
###### [flowtype](../../src/js/types/cardano.js#L87-L91)
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
