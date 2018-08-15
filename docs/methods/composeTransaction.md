## Compose transaction

Requests a payment from the users wallet to a set of given outputs. Internally a BIP-0044 account
discovery is performed and user is presented with a list of accounts. After account selection user is presented with list of fee selection. After selecting a fee transaction is signed and returned in hexadecimal format.
Change output is added automatically, if needed.

ES6
```javascript
const result = await TrezorConnect.composeTransaction(params);
```

CommonJS
```javascript
TrezorConnect.composeTransaction(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
* `outputs` — *obligatory* `Array` of recipients Objects described below
* `coin` — *obligatory* `string` determines network definition specified in [coins.json](../../src/data/coins.json) file. Coin `shortcut`, `name` or `label` can be used.
* `push` — *optional* `boolean` determines if composed transaction will be broadcasted into blockchain.

### Outputs objects:
* `regular output`
    - `amount` - *obligatory* `string` value to send in satohosi
    - `address` - *obligatory* `string` recipient address
* `send-max` - spends all available inputs from account
    - `type` - *obligatory* with `send-max` value
    - `address` - *obligatory* `string` recipient address
* `opreturn` - [read more](https://wiki.trezor.io/OP_RETURN)
    - `type` - *obligatory* with `opreturn` value
    - `dataHex` - *optional* `hexadecimal string` with arbitrary data

### Example
Send 0.002 BTC to "18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2"
```javascript
TrezorConnect.composeTransaction({
    outputs: [
        { amount: "200000", address: "18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2" }
    ]
    coin: "btc",
    push: true
});
```

### Result
```javascript
{
    success: true,
    payload: {
        signatures: Array<string>, // signer signatures
        serializedTx: string,        // serialized transaction 
        txid?: string,             // blockchain transaction id
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

version 4 and below:
```javascript
var recipients = [{
    amount: 200000,
    address: "18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2"
}];

TrezorConnect.setCurrency("btc");
TrezorConnect.composeAndSignTx(recipients, function(result) {
    result.signatures    // not changed
    result.serialized_tx // renamed to "serializedTx"
    // added "txid" field if "push" is set to true
});
```
version 5
```javascript

var recipients = [{
    amount: "200000",
    address: "18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2"
}];
// params are key-value pairs inside Object
TrezorConnect.composeTransaction({ 
    outputs: recipients,
    coin: "btc"
}).then(function(result) {
    ...
})
```
