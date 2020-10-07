
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

### Stake pool registration certificate specifics

Trezor supports signing of stake pool registration certificates as a pool owner. The transaction may contain external inputs (e.g. belonging to the pool operator) and Trezor is not able verify whether they are actually external or not, so if we allowed signing the transaction with a spending key, there is the risk of losing funds from an input that the user did not intend to spend from. Moreover there is the risk of inadvertedly signing a withdrawal in the transaction if there's any. To mitigate those risks, we introduced special validation rules for stake pool registration transactions which are validated on Trezor as well. The validation rules are the following:

1. The transaction must not contain any other certificates, not even another stake pool registration
2. The transaction must not contain any withdrawals
3. The transaction inputs must all be external, i.e. path must be either undefined or null
4. Exactly one owner should be passed as a staking path and the rest of owners should be passed as bech32-encoded reward addresses

### Example


#### Ordinary transaction
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

#### Stake pool registration
```javascript
TrezorConnect.cardanoSignTransaction({
    inputs: [
        {
            // notice no path is provided here
            prev_hash: '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
            prev_index: 0,
        }
    ],
    outputs: {
        address: 'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
        amount: '1000000',
    },
    fee: "300000",
    ttl: "500000000",
    protocolMagic: 764824073,
    networkId: 1,
    certificates: [
        {
            type: 3, // stake pool registration certificate type
            poolParameters: {
                poolId: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
                vrfKeyHash: "198890ad6c92e80fbdab554dda02da9fb49d001bbd96181f3e07f7a6ab0d0640",
                pledge: "500000000", // amount in lovelace
                cost: "340000000", // amount in lovelace
                margin: { // numerator/denominator should be <= 1 which is translated then to a percentage
                    numerator: "1",
                    denominator: "2",
                },
                rewardAccount: "stake1uya87zwnmax0v6nnn8ptqkl6ydx4522kpsc3l3wmf3yswygwx45el", // bech32-encoded stake pool reward account
                owners: [
                    {
                        stakingKeyPath: "m/1852'/1815'/0'/2/0" // this is the path to the owner's key that will be signing the tx on Trezor
                    },
                    {
                        stakingKeyHash: "3a7f09d3df4cf66a7399c2b05bfa234d5a29560c311fc5db4c490711" // other owner
                    }
                ],
                relays: [
                    {
                        type: 0, // single host ip address
                        ipv4Address: "192.168.0.1",
                        ipv6Address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334", // ipv6 address in full form
                        port: 1234
                    },
                    {
                        type: 0,
                        ipv6Address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
                        port: 1234
                    },
                    {
                        type: 0,
                        ipv4Address: "192.168.0.1",
                        port: 1234
                    },
                    {
                        type: 1, // single hostname
                        hostName: "www.test.test",
                        port: 1234
                    },
                    {
                        type: 2, // multiple host names
                        hostName: "www.test2.test" // max 64 characters long
                    }
                ],
                metadata: {
                    url: "https://www.test.test", // max 64 characters long
                    hash: "914c57c1f12bbf4a82b12d977d4f274674856a11ed4b9b95bd70f5d41c5064a6"
                }
            }
        }
    ],
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
