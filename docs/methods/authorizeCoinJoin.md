## Bitcoin: authorize CoinJoin
Allow device to do preauthorized operations in `signTransaction`, `getOwnershipProof` and `getOwnershipId` methods without further user interaction.

Permission persists until device disconnection or `maxTotalFee` limit is reached.

ES6
```javascript
const result = await TrezorConnect.authorizeCoinJoin(params);
```

CommonJS
```javascript
TrezorConnect.authorizeCoinJoin(params).then(function(result) {

});
```

> :warning: **This feature is experimental! Do not use it in production!**

> :warning: **Supported only by Trezor T with Firmware 2.4.4 or higher!**

### Params
[****Optional common params****](commonParams.md)
#### Exporting single id
* `path` — *required* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `maxTotalFee` — *required* `number`
* `feePerAnonymity` — *optional* `number`
* `coin` — *optional* `string` determines network definition specified in [coins.json](../../src/data/coins.json) file. Coin `shortcut`, `name` or `label` can be used. If `coin` is not set API will try to get network definition from `path`.
* `scriptType` — *optional* `InputScriptType`
* `amountUnit` — *optional* `AmountUnit`


### Example:
```javascript
TrezorConnect.authorizeCoinJoin({
    path: "m/86'/0'/0'/0/0",
    maxTotalFee: 100000,
});
```

### Result
```javascript
{
    success: true,
    payload: {
        message: 'CoinJoin authorized'
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
