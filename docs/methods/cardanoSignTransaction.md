
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
###### [flowtype](../../src/js/types/networks/cardano.js#L62-L109)
* `inputs` — *obligatory* `Array` of [CardanoInput](../../src/js/types/networks/cardano.js#L71)
* `outputs` - *obligatory* `Array` of [CardanoOutput](../../src/js/types/networks/cardano.js#L76)
* `fee` - *obligatory* `String`
* `ttl` - *obligatory* `String`
* `protocolMagic` - *obligatory* `Integer` 764824073 for Mainnet, 42 for Testnet
* `networkId` - *obligatory* `Integer` 1 for Mainnet, 0 for Testnet
* `certificates` - *optional* `Array` of [CardanoCertificate](../../src/js/types/networks/cardano.js#L83)
* `withdrawals` - *optional* `Array` of [CardanoWithdrawal](../../src/js/types/networks/cardano.js#L88)
* `metadata` - *optional* `String`

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
    certificates: [
        {
            type: 0,
            path: "m/1852'/1815'/0'/2/0",
        },
        {
            type: 1,
            path: "m/1852'/1815'/0'/2/0",
        },
        {
            type: 2,
            path: "m/1852'/1815'/0'/2/0",
            pool: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
        },
    ],
    withdrawals: [
        {
            path: "m/1852'/1815'/0'/2/0",
            amount: "1000",
        }
    ],
    metadata: "a200a11864a118c843aa00ff01a119012c590100aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    protocolMagic: 764824073,
    networkId: 1,
});
```

### Result
###### [flowtype](../../src/js/types/networks/cardano.js#L105-L108)
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
