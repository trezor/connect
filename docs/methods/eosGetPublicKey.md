## Eos: get public key
Display requested public key derived by given BIP32 path on device and returns it to caller. 
User is presented with a description of the requested public key and asked to confirm the export.

ES6
```javascript
const result = await TrezorConnect.eosGetPublicKey(params);
```

CommonJS
```javascript
TrezorConnect.eosGetPublicKey(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
#### Exporting single address
* `path` — *obligatory* `string | Array<number>` minimum length is `5`. [read more](path.md)
* `showOnTrezor` — *optional* `boolean` determines if address will be displayed on device. Default is set to `true`

#### Exporting bundle of addresses
* `bundle` - `Array` of Objects with `path` and `showOnTrezor` fields

### Example
Displays public key derived from BIP32 path:
```javascript
TrezorConnect.eosGetPublicKey({
    path: "m/44'/194'/0'/0/0"
});
```
Return a bundle of public keys without displaying them on device:
```javascript
TrezorConnect.eosGetPublicKey({
    bundle: [
        { path: "m/44'/194'/0'/0/0", showOnTrezor: false }, // public key 1
        { path: "m/44'/194'/0'/0/1", showOnTrezor: false }, // public key 2
        { path: "m/44'/194'/0'/0/2", showOnTrezor: false }  // public key 3
    ]
});
```
Validate address using custom UI inside of your application:
```javascript
import TrezorConnect, { UI } from 'trezor-connect';

TrezorConnect.on(UI.ADDRESS_VALIDATION, data => {
    console.log("Handle button request", data.address, data.serializedPath);
    // here you can display custom UI inside of your app
});

const result = await TrezorConnect.eosGetPublicKey({
    path: "m/44'/194'/0'/0/0",
    address: "0x73d0385F4d8E00C5e6504C6030F47BF6212736A8",
});
// dont forget to hide your custom UI after you get the result!
```

### Result
Result with only one public key
```javascript
{
    success: true,
    payload: {
        wifPublicKey: string,
        rawPublicKey: string,
    }
}
```
Result with bundle of public keys sorted by FIFO
```javascript
{
    success: true,
    payload: [
        { wifPublicKey: string, rawPublicKey: string }, // public key 1
        { wifPublicKey: string, rawPublicKey: string }, // public key 2
        { wifPublicKey: string, rawPublicKey: string }  // public key 3
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