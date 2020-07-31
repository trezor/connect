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
* `addressParameters` — *obligatory* see description below
* `address` — *optional* `string` address for validation (read `Handle button request` section below)
* `protocolMagic` - *obligatory* `Integer` 764824073 for Mainnet, 42 for Testnet
* `networkId` - *obligatory* `Integer` 1 for Mainnet, 0 for Testnet
* `showOnTrezor` — *optional* `boolean` determines if address will be displayed on device. Default is set to `true`

#### Exporting bundle of addresses
* `bundle` - `Array` of Objects with single address fields

#### Address Parameters
###### [flowtype](../../src/js/types/networks/cardano.js#L37-L43)
* `addressType` - *obligatory* `CardanoAddressType`/`number` - you can use the flow `CARDANO_ADDRESS_TYPE` object or typescript `CardanoAddressType` enum
* `path` — *obligatory* `string | Array<number>` minimum length is `5`. [read more](path.md)
* `stakingPath` — *optional* `string | Array<number>` minimum length is `5`. [read more](path.md) Used for base address derivation
* `stakingKeyHash` - *optional* `string` hex string of staking key hash. Used for base address derivation (as an alternative to `stakingPath`)
* `certificatePointer` - *optional* `CardanoCertificatePointer` object. Must contain `number`s `blockIndex`, `txIndex` and `certificateIndex`. ([flowtype](../../src/js/types/networks/cardano.js#L31-L35)) Used for pointer address derivation. [read more about pointer address](https://hydra.iohk.io/build/2006688/download/1/delegation_design_spec.pdf#subsubsection.3.2.2)


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
Display byron address of first cardano account:
```javascript
TrezorConnect.cardanoGetAddress({
    addressParameters: {
        addressType: 8,
        path: "m/44'/1815'/0'/0/0",
    },
    protocolMagic: 764824073,
    networkId: 1,
});
```
Display base address of first cardano account:
```javascript
TrezorConnect.cardanoGetAddress({
    addressParameters: {
        addressType: 0,
        path: "m/1852'/1815'/0'/0/0",
        stakingPath: "m/1852'/1815'/0'/2/0",
    },
    protocolMagic: 764824073,
    networkId: 1,
});
```
Display pointer address of first cardano account:
```javascript
TrezorConnect.cardanoGetAddress({
    addressParameters: {
        addressType: 4,
        path: "m/1852'/1815'/0'/0/0",
        certificatePointer: {
            blockIndex: 1,
            txIndex: 2,
            certificateIndex: 3,
        },
    },
    protocolMagic: 764824073,
    networkId: 1,
});
```
Return a bundle of cardano addresses without displaying them on device:
```javascript
TrezorConnect.cardanoGetAddress({
    bundle: [
        // byron address, account 1, address 1
        {
            addressParameters: {
                addressType: 8,
                path: "m/44'/1815'/0'/0/0",
            },
            protocolMagic: 764824073,
            networkId: 1,
            showOnTrezor: false
        },
        // base address with staking key hash, account 1, address 1
        {
            addressParameters: {
                addressType: 0,
                path: "m/1852'/1815'/0'/0/0",
                stakingKeyHash: '1bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff',
            },
            protocolMagic: 764824073,
            networkId: 1,
            showOnTrezor: false
        },
        // byron address, account 2, address 3, testnet
        {
            addressParameters: {
                addressType: 8,
                path: "m/44'/1815'/1'/0/2",
            },
            protocolMagic: 42,
            networkId: 0,
            showOnTrezor: false
        },
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
    addressParameters: {
        addressType: 8,
        path: "m/44'/1815'/0'/0/0",
    },
    protocolMagic: 764824073,
    networkId: 0,
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
        addressParameters: {
            addressType: number,
            path: Array<number>, // hardend path
            stakingPath?: Array<number>, // hardend path
            stakingKeyHash?: string,
            certificatePointer?: {
                blockIndex: number,
                txIndex: number,
                certificatePointer: number,
            }
        }
        serializedPath: string,
        serializedStakingPath?: string,
        protocolMagic: number,
        networkId: number,
        address: string,
    }
}
```
Result with bundle of addresses
```javascript
{
    success: true,
    payload: [
        {
            addressParameters: {
                addressType: number,
                path: Array<number>, // hardend path
                stakingPath?: Array<number>, // hardend path
                stakingKeyHash?: string,
                certificatePointer?: {
                    blockIndex: number,
                    txIndex: number,
                    certificatePointer: number,
                }
            }
            serializedPath: string,
            serializedStakingPath?: string,
            protocolMagic: number,
            networkId: number,
            address: string,
        },
        {
            addressParameters: {
                addressType: number,
                path: Array<number>, // hardend path
                stakingPath?: Array<number>, // hardend path
                stakingKeyHash?: string,
                certificatePointer?: {
                    blockIndex: number,
                    txIndex: number,
                    certificatePointer: number,
                }
            }
            serializedPath: string,
            serializedStakingPath?: string,
            protocolMagic: number,
            networkId: number,
            address: string,
        },
        {
            addressParameters: {
                addressType: number,
                path: Array<number>, // hardend path
                stakingPath?: Array<number>, // hardend path
                stakingKeyHash?: string,
                certificatePointer?: {
                    blockIndex: number,
                    txIndex: number,
                    certificatePointer: number,
                }
            }
            serializedPath: string,
            serializedStakingPath?: string,
            protocolMagic: number,
            networkId: number,
            address: string,
        },
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
