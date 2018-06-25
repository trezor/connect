## Export public key

`TrezorConnect.getXPubKey(path, callback)` retrieves BIP32 extended public key
by path. User is presented with a description of the requested key and asked to
confirm the export.

If you want to use this method with altcoins you need to set currency using method:
```javascript
    TrezorConnect.setCurrency(coin);
```
where coin is a string parameter with coin_name, coin_shortcut or coin_label declared in [`coins.json`](https://github.com/trezor/trezor-common/blob/master/coins.json) file.
By default currency is set to Bitcoin.

[Example:](examples/xpubkey.html)

```javascript
var path = "m/44'/0'/0'"; // first BIP44 account

// var path = [44 | 0x80000000,
//             0  | 0x80000000,
//             0  | 0x80000000]; // same, in raw form

TrezorConnect.setCurrency('BTC');
TrezorConnect.getXPubKey(path, function (result) {
    if (result.success) {
        console.log('XPUB:', result.xpubkey); // serialized XPUB
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

If you omit the path, BIP-0044 account discovery is performed and user is
presented with a list of discovered accounts.  Node of selected account is then
exported.  [Example.](examples/xpubkey-discovery.html)
