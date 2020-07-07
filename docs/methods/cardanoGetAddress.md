## Cardano: get address
Display requested address derived by given [BIP32-Ed25519](https://cardanolaunch.com/assets/Ed25519_BIP.pdf) path on device and returns it to caller. User is presented with a description of the requested key and asked to confirm the export on Trezor.

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
* `path` — *obligatory* `string | Array<number>` minimum length is `5`. [read more](path.md)
* `address` — *optional* `string` address for validation (read `Handle button request` section below)
* `protocolMagic` - *obligatory* `Integer` 0 for Mainnet, 42 for Testnet
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
Display address of first cardano account:
```javascript
TrezorConnect.cardanoGetAddress({
    path: "m/44'/1815'/0'/0/0",
    protocolMagic: 0,
});
```
Return a bundle of cardano addresses without displaying them on device:
```javascript
TrezorConnect.cardanoGetAddress({
    bundle: [
        { path: "m/44'/1815'/0'/0/0", protocolMagic: 0, showOnTrezor: false }, // account 1, address 1
        { path: "m/44'/1815'/1'/0/1", protocolMagic: 0, showOnTrezor: false }, // account 2, address 2
        { path: "m/44'/1815'/2'/0/2", protocolMagic: 0, showOnTrezor: false }  // account 3, address 3
        { path: "m/44'/1815'/0'/0/0", protocolMagic: 42, showOnTrezor: false }  // account 1, address 0, testnet
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

const result = await TrezorConnect.cardanoGetAddress({
    path: "m/44'/1815'/0'/0/0",
    protocolMagic: 0,
    address: "Ae2tdPwUPEZ5YUb8sM3eS8JqKgrRLzhiu71crfuH2MFtqaYr5ACNRdsswsZ",
});
// dont forget to hide your custom UI after you get the result!
```

### Result
Result with only one address
```javascript
{
    success: true,
    payload: {
        path: Array<number>, // hardended path
        serializedPath: string,
        protocolMagic: number,
        address: string,
    }
}
```
Result with bundle of addresses
```javascript
{
    success: true,
    payload: [
        { path: Array<number>, serializedPath: string, protocolMagic: number, address: string }, // account 1, address 1
        { path: Array<number>, serializedPath: string, protocolMagic: number, address: string }, // account 2, address 2
        { path: Array<number>, serializedPath: string, protocolMagic: number, address: string }  // account 3, address 3
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
