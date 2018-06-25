## Request payment

`TrezorConnect.composeAndSignTx(recipients, callback)` requests a payment from
the user's wallet to a set of given recipients.  Internally, a BIP-0044 account
discovery is performed, user is presented with a list of accounts.  After
selecting an account, transaction is composed by internal coin-selection
preferences.  Transaction is then signed and returned in the same format as
`signTx`.  Change output is added automatically, if needed.

If you want to use this method with altcoins you need to set currency using method:
```javascript
    TrezorConnect.setCurrency(coin);
```
where coin is a string parameter with coin_name, coin_shortcut or coin_label declared in [`coins.json`](https://github.com/trezor/trezor-common/blob/master/coins.json) file.
By default currency is set to Bitcoin.

[Example:](examples/composetx.html)

```javascript
var recipients = [{
    address: '18WL2iZKmpDYWk1oFavJapdLALxwSjcSk2',
    amount: 200000
}];

TrezorConnect.composeAndSignTx(recipients, function (result) {
    if (result.success) {
        console.log('Serialized TX:', result.serialized_tx); // tx in hex
        console.log('Signatures:', result.signatures); // array of signatures, in hex
    } else {
        console.error('Error:', result.error); // error message
    }
});

```

You can also push and broadcast the resulting transaction to the Bitcoin network with a call.

[Example:](examples/composetx-push.html)
```javascript
TrezorConnect.composeAndSignTx(outputs, function (result) {
    if (result.success) {
        TrezorConnect.pushTransaction(result.serialized_tx, function (pushResult) {
            if (pushResult.success) {
                console.log('Transaction pushed. Id:', pushResult.txid); // ID of the transaction
            } else {
                console.error('Error:', pushResult.error); // error message
            }
        });
    } else {
        console.error('Error:', result.error); // error message
    }
});

```
