
## Lisk: Sign transaction
Asks device to sign given transaction using the private key derived by given BIP32 path. User is asked to confirm all transaction
details on Trezor.

ES6
```javascript
const result = await TrezorConnect.liskSignTransaction(params);
```

CommonJS
```javascript
TrezorConnect.liskSignTransaction(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L69-L72)
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `transaction` - *obligatory* `Object` type of [LiskTransaction](../../src/js/types/lisk.js#38)

### Example
```javascript
TrezorConnect.liskSignTransaction(
    path: "m/44'/134'/0'/0'",
    transaction: {
        amount: "10000000",
        recipientId: "9971262264659915921L",
        timestamp: 57525937,
        type: 0,
        fee: "20000000",
        asset: {
            data: "Test data"
        }
    }
);
```

### Result
###### [flowtype](../../src/js/types/response.js#L181-L185)
```javascript
{
    success: true,
    payload: {
        signature: string
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
