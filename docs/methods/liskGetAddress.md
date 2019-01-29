## Lisk: get address
Display requested address derived by given BIP32 path on device and returns it to caller. User is presented with a description of the requested key and asked to confirm the export on Trezor.

ES6
```javascript
const result = await TrezorConnect.liskGetAddress(params);
```

CommonJS
```javascript
TrezorConnect.liskGetAddress(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
#### Exporting single address
* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `address` — *optional* `string` address for validation (read `Handle button request` section below)
* `showOnTrezor` — *optional* `boolean` determines if address will be displayed on device. Default is set to `true`

#### Exporting bundle of addresses
* `bundle` - `Array` of Objects with `path` and `showOnTrezor` fields

#### Handle button request
Since trezor-connect@6.0.4 there is a possibility to handle `UI.ADDRESS_VALIDATION` event which will be triggered once the address is displayed on the device.
You can handle this event and display custom UI inside of your application.

If certain conditions are fulfilled popup will not be used at all:
- the user gave permissions to communicate with Trezor
- device is authenticated by pin/passphrase
- application has `TrezorConnect.on(UI.ADDRESS_VALIDATION, () => {});` listener registered
- parameter `address` is set
- parameter `showOnTrezor` is set to `true` (or not set at all)
- application is requesting ONLY ONE(!) address


### Example
Display address of first Lisk account:
```javascript
TrezorConnect.liskGetAddress({
    path: "m/44'/134'/0'"
});
```
Return a bundle of Lisk addresses without displaying them on device:
```javascript
TrezorConnect.liskGetAddress({
    bundle: [
        { path: "m/44'/134'/0'", showOnTrezor: false }, // account 1
        { path: "m/44'/134'/1'", showOnTrezor: false }, // account 2
        { path: "m/44'/134'/2'", showOnTrezor: false }  // account 3
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

const result = await TrezorConnect.liskGetAddress({
    path: "m/44'/134'/0'",
    address: "3685460048641680438L",
});
// dont forget to hide your custom UI after you get the result!
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
