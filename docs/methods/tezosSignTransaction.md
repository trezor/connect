
## Tezos: Sign transaction
Asks device to sign given transaction. User is asked to confirm all transaction
details on Trezor.

ES6
```javascript
const result = await TrezorConnect.tezosSignTransaction(params);
```

CommonJS
```javascript
TrezorConnect.tezosSignTransaction(params).then(function(result) {

});
```

### Params 
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/tezos.js#L104-L108)
* `path` - *obligatory* `string | Array<number>`
* `branch` - *obligatory* `string`
* `operation` - *obligatory* `Object` type of [TezosOperation](../../src/js/types/tezos.js#L54)

### Example
Sign transaction operation
```javascript
TrezorConnect.tezosSignTransaction({
    path: "m/44'/1729'/0'",
    branch: "BKk7ZsvvkQSntQ31j2Hxsw8bfYtUKGjsKHT2aQrxAqUYyQUHxmM",
    operation: {
        transaction: {
            source: "tz1ckrgqGGGBt4jGDmwFhtXc1LNpZJUnA9F2",
            destination: "tz1cTfmc5uuBr2DmHDgkXTAoEcufvXLwq5TP",
            counter: 20449,
            amount: 1000000000,
            fee: 10000,
            gas_limit: 11000,
            storage_limit: 277
        }
    }
});
```

Sign origination operation
```javascript
TrezorConnect.tezosSignTransaction({
    path: "m/44'/1729'/0'",
    branch: "BLHRTdZ5vUKSDbkp5vcG1m6ZTST4SRiHWUhGodysLTbvACwi77d",
    operation: {
        origination: {
            source: "tz1ckrgqGGGBt4jGDmwFhtXc1LNpZJUnA9F2",
            manager_pubkey: "tz1ckrgqGGGBt4jGDmwFhtXc1LNpZJUnA9F2",
            delegate: "tz1boot1pK9h2BVGXdyvfQSv8kd1LQM6H889",
            balance: 100000000,
            fee: 10000,
            counter: 20450,
            gas_limit: 10100,
            storage_limit: 277,
            spendable: true,
            delegatable: true
        }
    }
});
```

Sign delegation operation
```javascript
TrezorConnect.tezosSignTransaction({
    path: "m/44'/1729'/0'",
    branch: "BMXAKyvzcH1sGQMqpvqXsZGskYU4GuY9Y14c9g3LcNzMRtfLzFa",
    operation: {
        reveal: {
            source: "KT1XYKxAFhtpTKWyoK2MrAQsMQ39KyV7NyA9",
            public_key: "edpkuxZ5W8c2jmcaGuCFZxRDSWxS7hp98zcwj2YpUZkJWs5F7UMuF6",
            counter: 1,
            fee: 10000,
            gas_limit: 10100,
            storage_limit: 277
        },
        delegation: {
            source: "KT1XYKxAFhtpTKWyoK2MrAQsMQ39KyV7NyA9",
            delegate: "tz1boot3mLsohEn4pV9Te3hQihH6N8U3ks59",
            counter: 2,
            fee: 10000,
            gas_limit: 10100,
            storage_limit: 277
        }
    }
});
```

### Result
###### [flowtype](../../src/js/types/tezos.js#L110-L114)
```javascript
{
    success: true,
    payload: {
        signature: string,
        sig_op_contents: string,
        operation_hash: string,
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
