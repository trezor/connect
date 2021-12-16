## Ethereum: Sign Typed Data

Asks device to sign an [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data message using the private key derived by given BIP32 path.

User is asked to confirm all signing details on Trezor Model T.

ES6

```javascript
const result = await TrezorConnect.ethereumSignTypedData(params);
```

CommonJS

```javascript
TrezorConnect.ethereumSignTypedData(params).then(function(result) {

});
```

> :warning: **Supported only by Trezor T with Firmware 2.4.3 or higher!** 

### Params

[****Optional common params****](commonParams.md)

###### [flowtype](../../src/js/types/networks/ethereum.js#L102-105)

* `path` — *obligatory* `string | Array<number>` minimum length is `3`. [read more](path.md)
* `data` - *obligatory* `Object` type of [`EthereumSignTypedDataMessage`](../../src/js/types/networks/ethereum.js#L90)`. A JSON Schema definition can be found in the [EIP-712 spec]([EIP-712](https://eips.ethereum.org/EIPS/eip-712)).
* `metamask_v4_compat` - *obligatory* `boolean` set to `true` for compatibility with [MetaMask's signTypedData_v4](https://docs.metamask.io/guide/signing-data.html#sign-typed-data-v4).

### Example

```javascript
TrezorConnect.ethereumSignMessage({
    path: "m/44'/60'/0'",
    data: {
        types: {
            EIP712Domain: [
                {
                    name: 'name',
                    type: 'string',
                },
            ],
            Message: [
                {
                    name: "Best Wallet",
                    type: "string"
                },
                {
                    name: "Number",
                    type: "uint64"
                }
            ]
        },
        primaryType: 'Message',
        domain: {
            name: 'example.trezor.io',
        },
        message: {
            "Best Wallet": "Trezor Model T",
            // be careful with JavaScript numbers: MAX_SAFE_INTEGER is quite low
            "Number": `${2n ** 55n}`,
        },
    },
    metamask_v4_compat: true,
});
```

### Result

###### [flowtype](../../src/js/types/api.js#L257)

```javascript
{
    success: true,
    payload: {
        address: string,
        signature: string, // hexadecimal string with "0x" prefix
    }
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
