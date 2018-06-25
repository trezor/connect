## Sign transaction

`TrezorConnect.signTx(inputs, outputs, callback)` asks device to sign given
inputs and outputs of pre-composed transaction.  User is asked to confirm all tx
details on TREZOR.

- `inputs`: array of [`TxInputType`](https://github.com/trezor/trezor-common/blob/master/protob/types.proto#L145-L158)
- `outputs`: array of [`TxOutputType`](https://github.com/trezor/trezor-common/blob/master/protob/types.proto#L160-L172)

If you want to use this method with altcoins you need to set currency using method:
```javascript
    TrezorConnect.setCurrency(coin);
```
where coin is a string parameter with coin_name, coin_shortcut or coin_label declared in [`coins.json`](https://github.com/trezor/trezor-common/blob/master/coins.json) file.
By default currency is set to Bitcoin.

[PAYTOADDRESS example:](examples/signtx-paytoaddress.html)

```javascript
// spend one change output
var inputs = [{
    address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 0],
    prev_index: 0,
    prev_hash: 'b035d89d4543ce5713c553d69431698116a822c57c03ddacf3f04b763d1999ac'
}];

// send to 1 address output and one change output
var outputs = [{
    address_n: [44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 1],
    amount: 3181747,
    script_type: 'PAYTOADDRESS'
}, {
    address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
    amount: 200000,
    script_type: 'PAYTOADDRESS'
}];

TrezorConnect.setCurrency('BTC');
TrezorConnect.signTx(inputs, outputs, function (result) {
    if (result.success) {
        console.log('Transaction:', result.serialized_tx); // tx in hex
        console.log('Signatures:', result.signatures); // array of signatures, in hex
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

[SPENDP2SHWITNESS example:](examples/signtx-paytoaddress.html)
```javascript
// spend one segwit change output
var inputs = [{
    address_n: [49 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 0],
    prev_index: 0,
    prev_hash: 'b035d89d4543ce5713c553d69431698116a822c57c03ddacf3f04b763d1999ac'
    amount: 3382047,
    script_type: 'SPENDP2SHWITNESS'
}];

// send to 1 address output and one segwit change output
var outputs = [{
    address_n: [49 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000, 1, 1],
    amount: 3181747,
    script_type: 'PAYTOP2SHWITNESS'
}, {
    address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
    amount: 200000,
    script_type: 'PAYTOADDRESS'
}];

TrezorConnect.setCurrency('BTC');
TrezorConnect.signTx(inputs, outputs, function (result) {
    if (result.success) {
        console.log('Transaction:', result.serialized_tx); // tx in hex
        console.log('Signatures:', result.signatures); // array of signatures, in hex
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

[PAYTOMULTISIG example.](examples/signtx-paytomultisig.html)

## Sign Ethereum transaction

```javascript
TrezorConnect.ethereumSignTx(
  address_n, // address path - either array or string, see example
  nonce,     // nonce - hexadecimal string
  gas_price, // gas price - hexadecimal string
  gas_limit, // gas limit - hexadecimal string
  to,        // address
  value,     // value in wei, hexadecimal string
  data,      // data, hexadecimal string OR null for no data
  chain_id,  // chain id for EIP-155 - is only used in fw 1.4.2 and newer, older will ignore it
  callback)
```

This will return signature in three components - v, r, s - v is number, the rest is hexadecimal string.

All the hexa strings are *without* the '0x' prefix, *including the address*.

[Ethereum example:](examples/signtx-ethereum.html)
