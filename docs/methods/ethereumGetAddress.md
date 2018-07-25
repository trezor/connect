## Ethereum: get address
Display requested address derived by given BIP32 path on device and returns it to caller. User is presented with a description of the requested key and asked to confirm the export on Trezor.

ES6
```javascript
const result = await TrezorConnect.ethereumGetAddress(params);
```

CommonJS
```javascript
TrezorConnect.ethereumGetAddress(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
#### Exporting single address
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `showOnTrezor` — *optional* `boolean` determines if address will be displayed on device. Default is set to `true`

#### Exporting bundle of addresses
* `bundle` - `Array` of Objects with `path` and `showOnTrezor` fields

### Example
Display address of first ethereum account:
```javascript
TrezorConnect.ethereumGetAddress({
    path: "m/44'/60'/0'"
});
```
Return a bundle of ethereum addresses without displaying them on device:
```javascript
TrezorConnect.ethereumGetAddress({
    bundle: [
        { path: "m/44'/60'/0'", showOnTrezor: false }, // account 1
        { path: "m/44'/60'/1'", showOnTrezor: false }, // account 2
        { path: "m/44'/60'/2'", showOnTrezor: false }  // account 3
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
Result with bundle of addresses sorted by FIFO
```javascript
{
    success: true,
    payload: [
        { address: string, path: Array<number>, serializedPath: string }, // account 1
        { address: string, path: Array<number>, serializedPath: string }, // account 2
        { address: string, path: Array<number>, serializedPath: string }  // account 3
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

version 4 and below:
```javascript
TrezorConnect.ethereumGetAddress("m/44'/60'/0'", function(result) {
    result.address // address without "0x" prefix and without checksum
    result.path
});
```
version 5
```javascript
// params are key-value pairs inside Object
TrezorConnect.ethereumGetAddress({ 
    path: "m/44'/60'/0'" 
}).then(function(result) {
    result.address   // address with "0x" prefix and checksum
    result.path      // no change
    result.serializedPath // added
})
```
