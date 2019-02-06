## Get account info

Gets an info of specified account.

ES6
```javascript
const result = await TrezorConnect.getAccountInfo(params);
```

CommonJS
```javascript
TrezorConnect.getAccountInfo(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
#### Using path
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `coin` — *obligatory* `string` determines network definition specified in [coins.json](../../src/data/coins.json) file. Coin `shortcut`, `name` or `label` can be used.

#### Using public key
* `xpub` — *obligatory* `string` public key of account
* `coin` — *obligatory* `string` determines network definition specified in [coins.json](../../src/data/coins.json) file. Coin `shortcut`, `name` or `label` can be used.

#### Using discovery
BIP-0044 account discovery is performed and user is presented with a list of accounts. Result is returned after account selection.
- `coin` — *obligatory* `string` determines network definition specified in [coins.json](../../src/data/coins.json) file. Coin `shortcut`, `name` or `label` can be used.

### Example
Get info about first bitcoin account
```javascript
TrezorConnect.getAccountInfo({
    path: "m/49'/0'/0'",
    coin: "btc",
});
```

Get info about account using public key
```javascript
TrezorConnect.getAccountInfo({
    xpub: "xpub6CVKsQYXc9awxgV1tWbG4foDvdcnieK2JkbpPEBKB5WwAPKBZ1mstLbKVB4ov7QzxzjaxNK6EfmNY5Jsk2cG26EVcEkycGW4tchT2dyUhrx",
    coin: "btc",
});
```

Get info about account using BIP-0044 account discovery
```javascript
TrezorConnect.getAccountInfo({
    coin: "btc",
});
```

### Result
```javascript
{
    success: true,
    payload: {
        id: number,                           // account id
        path: Array<number>,                  // hardended path
        serializedPath: string,               // serialized path
        xpub: string,                         // public key
        address: string,                      // current address
        addressIndex: number,                 // current address index
        addressPath: Array<number>,           // hardended address path
        addressSerializedPath: Array<number>, // serialized address path
        balance: number,                      // account balance (including unconfirmed transactions)
        confirmed: number,                    // account confirmed balance
        transactions: number,                 // transactions count
        utxo: Array<Utxo>,                    // unspent outputs [detail](../../src/js/types/response.js#L57)
        usedAddresses: Array<{ address: string, received: number }>, // used addresses with received amount
        unusedAddresses: Array<string>,       // unused addresses
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

v4 and below:
```javascript
TrezorConnect.getAccountInfo("m/49'/0'/0'", function(result) {
    result.id               // not changed
    result.serializedPath   // not changed
    result.path             // not changed
    result.xpub             // not changed
    result.freshAddress     // renamed to "address"
    result.freshAddressPath // renamed to "addressPath"
    result.freshAddressId   // renamed to "addressIndex"
    result.serializedFreshAddressPath // renamed to "addressSerializedPath"
    result.balance   // not changed
    result.confirmed // not changed

});
```
should be
```javascript
// params are key-value pairs inside Object
TrezorConnect.composeTransaction({ 
    path: "m/49'/0'/0'",
    coin: "btc"
}).then(function(result) {
    ...
})
```
