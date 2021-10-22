## Cardano: get native script hash
Display native script components on Trezor, display the calculated native script hash and return the hash to the caller.

ES6
```javascript
const result = await TrezorConnect.cardanoGetNativeScriptHash(params);
```

CommonJS
```javascript
TrezorConnect.cardanoGetNativeScriptHash(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
##### [flowtype](../../src/js/types/networks/cardano.js#L76-L79)
* `script` — *obligatory* `CardanoNativeScript` see description below.
* `displayFormat` — *obligatory* `CardanoNativeScriptHashDisplayFormat` enum.

#### CardanoNativeScript
###### [flowtype](../../src/js/types/networks/cardano.js#L66-74)
* `type` - *obligatory* `CardanoNativeScriptType`/`number`.
* `scripts` — *optional* `Array` of nested `CardanoNativeScript`s.
* `keyHash` — *optional* `string` hex string of key hash. Used for `CardanoScriptType.PUB_KEY`.
* `keyPath` - *optional* `string | Array<number>` minimum length is `3`. Used for `CardanoScriptType.PUB_KEY`.
* `requiredSignaturesCount` - *optional* `string` used for `CardanoScriptType.N_OF_K`.
* `invalidBefore` - *optional* `string` used for `CardanoScriptType.INVALID_BEFORE`.
* `invalidHereafter` - *optional* `string` used for `CardanoScriptType.INVALID_HEREAFTER`.


### Example
Get native script hash of a simple PUB_KEY script:
```javascript
TrezorConnect.cardanoGetNativeScriptHash({
    script: {
        type: CardanoNativeScriptType.PUB_KEY,
        keyHash: 'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
    },
    displayFormat: CardanoNativeScriptHashDisplayFormat.HIDE,
});
```
Get native script hash of a nested script:
```javascript
TrezorConnect.cardanoGetAddress({
    script: {
        type: CardanoNativeScriptType.ALL,
        scripts: [
            {
                type: CardanoNativeScriptType.PUB_KEY,
                keyHash: 'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
            },
            {
                type: CardanoNativeScriptType.PUB_KEY,
                keyPath: "m/1854'/1815'/0'/0/0",
            },
            {
                type: CardanoNativeScriptType.ANY,
                scripts: [
                    {
                        type: CardanoNativeScriptType.PUB_KEY,
                        keyPath: "m/1854'/1815'/0'/0/0",
                    },
                    {
                        type: CardanoNativeScriptType.PUB_KEY,
                        keyHash:
                            '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
                    },
                ],
            },
            {
                type: CardanoNativeScriptType.N_OF_K,
                requiredSignaturesCount: 2,
                scripts: [
                    {
                        type: CardanoNativeScriptType.PUB_KEY,
                        keyPath: "m/1854'/1815'/0'/0/0",
                    },
                    {
                        type: CardanoNativeScriptType.PUB_KEY,
                        keyHash:
                            '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
                    },
                    {
                        type: CardanoNativeScriptType.PUB_KEY,
                        keyHash:
                            'cecb1d427c4ae436d28cc0f8ae9bb37501a5b77bcc64cd1693e9ae20',
                    },
                ],
            },
            {
                type: CardanoNativeScriptType.INVALID_BEFORE,
                invalidBefore: '100',
            },
            {
                type: CardanoNativeScriptType.INVALID_HEREAFTER,
                invalidHereafter: '200',
            },
        ],
    },
    displayFormat: CardanoNativeScriptHashDisplayFormat.HIDE,
});
```
### Result
```javascript
{
    success: true,
    payload: {
        scriptHash: 'b12ac304f89f4cd4d23f59a2b90d2b2697f7540b8f470d6aa05851b5',
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