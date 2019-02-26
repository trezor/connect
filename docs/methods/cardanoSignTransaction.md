
## Cardano: Sign transaction
Asks device to sign given transaction. User is asked to confirm all transaction
details on Trezor.

ES6
```javascript
const result = await TrezorConnect.cardanoSignTransaction(params);
```

CommonJS
```javascript
TrezorConnect.cardanoSignTransaction(params).then(function(result) {

});
```

### Params 
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/cardano.js#L45-L59)
* `inputs` — *obligatory* `Array` of [CardanoInput](../../src/js/types/cardano.js#L31)
* `outputs` - *obligatory* `Array` of [CardanoOutput](../../src/js/types/cardano.js#L37)
* `transactions` - *obligatory* `Array` of strings
* `protocol_magic` - *obligatory* `Integer` 764824073 for Mainnet, 1097911063 for Testnet

### Example
```javascript
TrezorConnect.cardanoSignTransaction({
    inputs: [
        {
            path: "m/44'/1815'/0'/0/1",
            prev_hash: "1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc",
            prev_index: 0,
            type: 0
        }
    ],
    outputs: [
        {
            address: "Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2",
            amount: "3003112"
        },
        {
            path: "m/44'/1815'/0'/0/1",
            amount: "7120787"
        }
    ],
    transactions: [
        "839f8200d818582482582008abb575fac4c39d5bf80683f7f0c37e48f4e3d96e37d1f6611919a7241b456600ff9f8282d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a00305becffa0",
        "839f8200d818582482582008abb575fac4c39d5bf80683f7f0c37e48f4e3d96e37d1f6611919a7241b456600ff9f8282d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a00305becffa0",
        "839f8200d818582482582008abb575fac4c39d5bf80683f7f0c37e48f4e3d96e37d1f6611919a7241b456600ff9f8282d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a00305becffa0",
        "839f8200d818582482582008abb575fac4c39d5bf80683f7f0c37e48f4e3d96e37d1f6611919a7241b456600ff9f8282d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a00305becffa0",
        "839f8200d818582482582008abb575fac4c39d5bf80683f7f0c37e48f4e3d96e37d1f6611919a7241b456600ff9f8282d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a00305becffa0",
        "839f8200d818582482582008abb575fac4c39d5bf80683f7f0c37e48f4e3d96e37d1f6611919a7241b456600ff9f8282d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a00305becffa0",
    ],
    protocol_magic: 764824073
});
```

### Result
###### [flowtype](../../src/js/types/cardano.js#L56-L59)
```javascript
{
    success: true,
    payload: {
        hash: string,
        body: string,
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
