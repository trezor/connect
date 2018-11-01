## Reset device
Perform device setup and generate new seed.

ES6
```javascript
const result = await TrezorConnect.resetDevice(params);
```

CommonJS
```javascript
TrezorConnect.resetDevice(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
<br>
* `label` — *optional* `string`
* `strength` — *optional* `number` [128|192|256]
* `u2fCounter` — *optional* `number`
* `pinProtection` — *optional* `boolean`
* `passphraseProtection` — *optional* `boolean`
* `skipBackup` — *optional* `boolean`
* `noBackup` — *optional* `boolean` create a seedless device

### Example
```javascript
TrezorConnect.resetDevice({
    label: 'My fancy Trezor',
});
```

### Result
```javascript
{
    success: true,
    payload: {
        message: 'Device successfully initialized'
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
