## Common parameters
Every call require an [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) with combination of common and method specified fields.
All common parameters are optional.

* `device` - *optional* `Object`
    - `path` - *obligatory* `string` call to a direct device. Useful when working with multiple connected devices. This value is emitted by [`TrezorConnectEvent`](../events.md)
    - `state` - *optional* `string` sets expected state. This value is emitted by [`TrezorConnectEvent`](../events.md)
    - `instance` - *optional* `number` sets an instance of device. Useful when working with one device and multiple passphrases. This value is emitted by [`TrezorConnectEvent`](../events.md)
* `useEmptyPassphrase` — *optional* `boolean` method will not ask for a passphrase. Default is set to `false`
* `allowSeedlessDevice` — *optional* `boolean` allows to use TrezorConnect methods with device with seedless setup. Default is set to `false`
* `keepSession` — `optional boolean` Advanced feature. After method return a response device session will NOT! be released. Session shoul be released after all calls are performed by calling any method with `keepSession` set to false or `undefined`. Useful when you need to do multiple different calls to TrezorConnect API without releasing. Example sequence loop for 10 account should look like: 
    - TrezorConnect.getPublicKey({ device: { path: "web01"}, keepSession: true, ...otherParams }) for first account,
    - Trezor.getAddress({ device: { path: "web01"}, ...otherParams }) for the same account,
    - looking up for balance in external blockchain
    - loop iteration
    - after last iteration call TrezorConnect.getFeatures({ device: { path: "web01"}, keepSession: false, ...otherParams })
