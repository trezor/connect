## Get account info

`TrezorConnect.getAccountInfo(description, callback)` gets an info of an account.

[Example:](examples/accountinfo.html)
```javascript
var description = "m/44'/0'/2'"; // third account (see below)

TrezorConnect.getAccountInfo(description, function (result) {
    if (result.success) { // success
        console.log('Account ID: ', result.id);
        console.log('Account path: ', result.path);
        console.log('Serialized account path: ', result.serializedPath);
        console.log('Xpub', result.xpub);

        console.log('Fresh address (first unused address): ', result.freshAddress);
        console.log('Fresh address ID: ', result.freshAddressId);
        console.log('Fresh address path: ', result.freshAddressPath);
        console.log('Serialized fresh address path: ', result.serializedFreshAddressPath);

        console.log('Balance in satoshis (including unconfirmed):', result.balance);
        console.log('Balance in satoshis (only confirmed):', result.confirmed);
    } else {
        console.error('Error:', result.error); // error message
    }
});

```

Description can be one of the following:

* `null` (or `undefined`) - in that case, the user is presented with his accounts and has to select one
* path - either as a string (`"m/44'/0'/2'`), or as an array (`[44 | 0x80000000, 0 | 0x80000000, 2 | 0x80000000]`)
    * it has to be a BIP44 path for Bitcoin, meaning it has to start with `44'/0'/`.
* id - ID of the account (either as a string or as a number)
    * note that accounts have zero-based IDs, but the numbering on the screen start with "Account #1"; so account with id 2 is "Account #3", etc.
* xpub - xpub of the account
    * the xpub must start with `xpub`, and has to belong to one of the first 10 accounts
* { account_index: 0, account_type: 'legacy' } - An object with account ID and account type legacy/segwit
