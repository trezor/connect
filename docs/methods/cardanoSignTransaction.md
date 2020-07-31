
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
###### [flowtype](../../src/js/types/networks/cardano.js#L62-L90)
* `inputs` — *obligatory* `Array` of [CardanoInput](../../src/js/types/networks/cardano.js#L64)
* `outputs` - *obligatory* `Array` of [CardanoOutput](../../src/js/types/networks/cardano.js#L69)
* `fee` - *obligatory* `String`
* `ttl` - *obligatory* `String`
* `protocolMagic` - *obligatory* `Integer` 764824073 for Mainnet, 42 for Testnet
* `networkId` - *obligatory* `Integer` 1 for Mainnet, 0 for Testnet

### Example
```javascript
TrezorConnect.cardanoSignTransaction({
    inputs: [
        {
            path: "m/44'/1815'/0'/0/1",
            prev_hash: "1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc",
            prev_index: 0,
        }
    ],
    outputs: [
        {
            address: "Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2",
            amount: "3003112",
        },
        {
            addressParameters: {
                addressType: 0,
                path: "m/1852'/1815'/0'/0/0",
                stakingPath: "m/1852'/1815'/0'/2/0",
            },
            amount: "7120787",
        }
    ],
    fee: "42",
    ttl: "10",
    protocolMagic: 764824073,
    networkId: 1,
});
```

### Result
###### [flowtype](../../src/js/types/networks/cardano.js#L86-L89)
```javascript
{
    success: true,
    payload: {
        hash: string,
        serializedTx: string,
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
