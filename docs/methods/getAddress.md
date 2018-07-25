## Get address
Display requested address derived by given BIP32 path on device and returns it to caller. User is asked to confirm the export on Trezor.

ES6
```javascript
const result = await TrezorConnect.getAddress(params);
```

CommonJS
```javascript
TrezorConnect.getAddress(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
#### Exporting single address
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `showOnTrezor` — *optional* `boolean` determines if address will be displayed on device. Default is set to `true`
* `coin` - *optional* `string` determines network definition specified in [coins.json](../../src/data/coins.json) file. Coin `shortcut`, `name` or `label` can be used. If `coin` is not set API will try to get network definition from `path`.
* `crossChain` — *optional* `boolean` Advanced feature. Use it only if you are know what you are doing. Allows to generate address between chains. For example Bitcoin path on Litecoin network will display cross chain address in Litecoin format.

#### Exporting bundle of addresses
* `bundle` - `Array` of Objects with `path`, `showOnTrezor`, `coin` and `crossChain` fields

### Example
Display third address of first bitcoin account:
```javascript
TrezorConnect.getAddress({
    path: "m/49'/0'/0'/0'/2'",
    coin: "btc"
});
```
Return a bundle of addresses from first bitcoin account without displaying them on device:
```javascript
TrezorConnect.getAddress({
    bundle: [
        { path: "m/49'/0'/0'/0/0", showOnTrezor: false }, // address 1
        { path: "m/49'/0'/0'/0/1", showOnTrezor: false }, // address 2
        { path: "m/49'/0'/0'/0/2", showOnTrezor: false }  // address 3
    ]
});
```

### Result
Result with only one address
```javascript
{
    success: true,
    payload: {
        address: string,     // displayed address
        path: Array<number>, // hardended path
        serializedPath: string,
    }
}
```
Result with bundle of addresses
```javascript
{
    success: true,
    payload: [
        { address: string, path: Array<number>, serializedPath: string }, // address 1
        { address: string, path: Array<number>, serializedPath: string }, // address 2
        { address: string, path: Array<number>, serializedPath: string }, // address 3
    ]
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
TrezorConnect.getAddress("m/49'/0'/4'/0/0", function(result) {
    // added "serializedPath" field
});
```
should be
```javascript
// params are key-value pairs inside Object
TrezorConnect.getAddress({ 
    path: "m/49'/0'/4'/0/0" 
}).then(function(result) {
    ...
})
```
