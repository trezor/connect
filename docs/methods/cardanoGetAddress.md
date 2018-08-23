## Cardano: get address
Display requested address derived by given BIP32 path on device and returns it to caller. User is presented with a description of the requested key and asked to confirm the export on Trezor.

ES6
```javascript
const result = await TrezorConnect.cardanoGetAddress(params);
```

CommonJS
```javascript
TrezorConnect.cardanoGetAddress(params).then(function(result) {

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
Display address of first cardano account:
```javascript
TrezorConnect.cardanoGetAddress({
    path: "m/44'/1815'/0'"
});
```
Return a bundle of cardano addresses without displaying them on device:
```javascript
TrezorConnect.cardanoGetAddress({
    bundle: [
        { path: "m/44'/1815'/0'", showOnTrezor: false }, // account 1
        { path: "m/44'/1815'/1'", showOnTrezor: false }, // account 2
        { path: "m/44'/1815'/2'", showOnTrezor: false }  // account 3
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
        publicKey: string,
        node: HDPubNode, // BIP32 serialization format
        rootHDPassphrase: string,
    }
}
```
Result with bundle of addresses
```javascript
{
    success: true,
    payload: [
        { address: string, path: Array<number>, serializedPath: string, publicKey: string, node: HDPubNode, rootHDPassphrase: string }, // account 1
        { address: string, path: Array<number>, serializedPath: string, publicKey: string, node: HDPubNode, rootHDPassphrase: string }, // account 2
        { address: string, path: Array<number>, serializedPath: string, publicKey: string, node: HDPubNode, rootHDPassphrase: string }  // account 3
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
