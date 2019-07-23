Unit tests for connect v5 methods.

# How to run tests
Tests may be ran using an emulator (only TT is supported) or a physical Trezor device. The advantage of using an emulator is that all interaction with the device is automated.

1. Install [Python Trezor library](https://github.com/trezor/trezor-firmware/tree/master/python)
2. Download & build [Trezor emulator](https://github.com/trezor/trezor-firmware/blob/master/core/docs/emulator.md)
3. Download & build [Trezor Bridge](https://github.com/trezor/trezord-go)
4. `git clone https://github.com/trezor/connect.git`
5. `cd ./connect`
6. Now you can start tests by typing
    ```bash
    yarn test -t "[test-name]"
    ```
7. (Optional) You can specify paths to both emulator & Bridge by typing
    ```bash
    yarn test -t "[test-name]" -e "<emulator-path>" -b "<bridge-path>"
    ```
    The default path (relative to this repo) is `./../trezor-firmware/core` & `./../trezord-go` respectively.
8. (Optional) To see all available options type `yarn test`

# Adding custom tests
All tests are tested against a Trezor TT device with no pin and following passphrase
```
alcohol woman abuse must during monitor noble actual mixed trade anger aisle
```

1. Create a separate file describing your test payloads in `src/__tests__/core`. Name it like this `<name>.spec.js`
    - This file should contain one export function. Name of the function must be same as is the name of the file you previously created.
    - The exported function must return following objects
        1. `testPayloads`
            - Array of payloads that are then called by Core.
            - Structure of each payload depends on a method you'd like to test. You can find all methods in `src/js/core/methods`.
            ```javascript
            const testPayloads = [
                {
                    method: 'ethereumGetAddress',
                    path: "'m/44'/43'/0'",
                },
            ];
            ```
        2. `expectedResponses`
            - Array of responses with expected values.
            - Note that the response must be of a same structure as is the actual response you get from Connect. You can omit keys you don't wish to test though.
            ```javascript
            const expectedResponses = [
                {
                    payload: {
                        address: '0x6ae2F16e73Aeac6A2Bbc46cc98a1D2e23661E6Fe',
                    },
                },
            ];
            ```
        3. `testName`
            - Name of your test - the value is arbitrary
            ```javascript
            const testName = 'EthereumGetAddress';
            ```

2. Add previously exported function into `src/__tests__/core/index.js`
    ```javascript
    ...
    import { nameOfExportedFunction } from './<name>.spec.js';

    export const testFunctions: AvailableTestFunctions = {
        ...
        nameOfExportedFunction,
    };
    ```

3. Resolve Flow issues
    - Each Connect method has its own flowtype file in `src/flowtype/tests`
        - Those files contains description for both `testPayloads` object and `expectedResponses` object that you created earlier.
        ```javascript
        declare export type TestEthereumGetAddressPayload = {
            method: string,
            path: string | Array<number>,
        };

        declare export type ExpectedEthereumGetAddressResponse = {
            payload: {
                address: string,
            },
        };
        ```

    - Add types you just created into `src/flowtype/tests/index.js`
        ```javascript
        import type {
            TestEthereumGetAddressPayload,
            ExpectedEthereumGetAddressResponse,
        } from 'flowtype/tests/ethereum-get-address';

        ...

        declare export type TestPayload =
        ...
        | TestEthereumGetAddressPayload;


        declare export type ExpectedResponse =
        ...
        | ExpectedEthereumGetAddressResponse;
        ```
