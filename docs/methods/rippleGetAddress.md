## Ripple: get address
Display requested address on device and returns it to caller. User is presented with a description of the requested key and asked to confirm the export.

ES6
```javascript
const result = await TrezorConnect.rippleGetAddress(params);
```

CommonJS
```javascript
TrezorConnect.rippleGetAddress(params).then(function(result) {

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
Display third address of second ripple account:
```javascript
TrezorConnect.rippleGetAddress({
    path: "m/44'/144'/1'/0/2"
});
```
Return a bundle of ripple addresses without displaying them on device:
```javascript
TrezorConnect.rippleGetAddress({
    bundle: [
        { path: "m/44'/144'/0'/0/0", showOnTrezor: false }, // account 1
        { path: "m/44'/144'/1'/0/1", showOnTrezor: false }, // account 2
        { path: "m/44'/144'/2'/0/2", showOnTrezor: false }  // account 3
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
        { address: string, path: Array<number>, serializedPath: string }, // account 1, address 1
        { address: string, path: Array<number>, serializedPath: string }, // account 2, address 2
        { address: string, path: Array<number>, serializedPath: string }, // account 3, address 3
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
