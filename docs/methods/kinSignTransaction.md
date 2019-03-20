
## Kin: Sign transaction
Asks device to sign given transaction. User is asked to confirm all transaction
details on Trezor.

ES6
```javascript
const result = await TrezorConnect.kinSignTransaction(params);
```

CommonJS
```javascript
TrezorConnect.kinSignTransaction(params).then(function(result) {

});
```

### Params 
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L149-L154)
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `networkPassphrase` - *obligatory* `string` network passphrase
* `transaction` - *obligatory* `Object` type of [KinTransaction](../../src/js/types/kin.js#L129)

### Example
```javascript
TrezorConnect.kinSignTransaction(
    path: "m/44'/2017'/0'/",
    networkPassphrase: "Kin Mainnet ; December 2018",
    transaction: {
        source: "GAXSFOOGF4ELO5HT5PTN23T5XE6D5QWL3YBHSVQ2HWOFEJNYYMRJENBV",
        fee: 100,
        sequence: 4294967296,
        timebounds: {
            minTime: null,
            maxTime: null
        },
        memo: {
            id: null,
            type: 0,
            text: null,
            hash: null
        },
        operations: [
            {
                type: "payment",
                source: "GAXSFOOGF4ELO5HT5PTN23T5XE6D5QWL3YBHSVQ2HWOFEJNYYMRJENBV",
                destination: "GAXSFOOGF4ELO5HT5PTN23T5XE6D5QWL3YBHSVQ2HWOFEJNYYMRJENBV",
                asset: null,
                amount: "10000"
            }
        ]
    }
});
```

### Result
###### [flowtype](../../src/js/types/response.js#L129-L132)
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
