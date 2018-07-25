## NEM: get address
Display requested address on device and returns it to caller.
User is presented with a description of the requested key and asked to confirm the export.

ES6
```javascript
const result = await TrezorConnect.nemGetAddress(params);
```

CommonJS
```javascript
TrezorConnect.nemGetAddress(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
#### Exporting single address
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `network` — *optional* `number` `0x68` - Mainnet, `0x96` - Testnet, `0x60` - Mijin. Default is set to `Mainnet`
* `showOnTrezor` — *optional* `boolean` determines if address will be displayed on device. Default is set to `true`

#### Exporting bundle of addresses
- `bundle` - `Array` of Objects with `path`, `network` and `showOnTrezor` fields

### Example
Display address of third nem account:
```javascript
TrezorConnect.nemGetAddress({
    path: "m/44'/43'/4'"
});
```
Return a bundle of NEM addresses without displaying them on device:
```javascript
TrezorConnect.nemGetAddress({
    bundle: [
        { path: "m/44'/43'/0'", showOnTrezor: false }, // account 1
        { path: "m/44'/43'/1'", showOnTrezor: false }, // account 2
        { path: "m/44'/43'/2'", showOnTrezor: false }  // account 3
    ]
});
```

### Result
Result with only one address
```javascript
{
    success: true,
    payload: {
        address: string,
        path: Array<number>,
        serializedPath: string,
    }
}
```
Result with bundle of addresses
```javascript
{
    success: true,
    payload: [
        { address: string, path: Array<number>, serializedPath: string }, // account 1
        { address: string, path: Array<number>, serializedPath: string }, // account 2
        { address: string, path: Array<number>, serializedPath: string }, // account 3
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

version 4 and below
```javascript
TrezorConnect.nemGetAddress(
    "m/44'/43'/0'", 
    0x68, 
    function(result) {
        result.address,
        result.path
    }
);
```
version 5
```javascript
// params are key-value pairs inside Object
TrezorConnect.nemGetAddress({ 
    path: "m/44'/43'/0'",
    network: 0x68,
    showOnTrezor: true
}).then(function(result) {
    result.address,    // no change
    result.path,       // no change
    result.serializedPath   // added
})
```
