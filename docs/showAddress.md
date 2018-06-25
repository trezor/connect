## Show address / get address

`TrezorConnect.getAddress(path, coin, segwit, callback)` shows address on device and returns it to caller

[Example:](examples/accountinfo.html)
```javascript
var path = "m/44'/0'/2'/0/0";
var coin = "Testnet";  // "Bitcoin", "Litecoin", etc
var segwit = true; // segwit makes sense only on Litecoin and Testnet

TrezorConnect.getAddress(path, coin, segwit, function (response) {
    if (result.success) { // success
        console.log('Address: ', result.address);
    } else {
        console.error('Error:', result.error); // error message
    }
});
```

## Ethereum - Show address / get address

`TrezorConnect.ethereumGetAddress(path, callback)` shows address on device and returns it to caller

[Example:](examples/accountinfo.html)
```javascript
var path = "m/44'/60'/0'/0/0"

TrezorConnect.ethereumGetAddress(path, function (response) {
    if (result.success) { // success
        console.log('Address: ', result.address);
    } else {
        console.error('Error:', result.error); // error message
    }
});
```
