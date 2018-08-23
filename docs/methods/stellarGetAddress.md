## Stellar: get address
Display requested address on device and returns it to caller. User is presented with a description of the requested key and asked to confirm the export.

ES6
```javascript
const result = await TrezorConnect.stellarGetAddress(params);
```

CommonJS
```javascript
TrezorConnect.stellarGetAddress(params).then(function(result) {

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
Display address of first stellar account:
```javascript
TrezorConnect.stellarGetAddress({
    path: "m/44'/148'/0'"
});
```
Return a bundle of stellar addresses without displaying them on device:
```javascript
TrezorConnect.stellarGetAddress({
    bundle: [
        { path: "m/44'/148'/0'", showOnTrezor: false }, // account 1
        { path: "m/44'/148'/1'", showOnTrezor: false }, // account 2
        { path: "m/44'/148'/2'", showOnTrezor: false }  // account 3
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
