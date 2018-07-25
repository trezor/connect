# Connect v5 tests
Unit tests for connect v5 methods.

## How to run tests
Tests may be ran using an emulator (only TT is supported) or a physical Trezor device. The advantage of using an emulator is that all interaction with the device is automated.

1. Install [Python Trezor library](https://github.com/trezor/python-trezor)
2. Download & build [Trezor emulator](https://github.com/trezor/trezor-core/blob/master/docs/emulator.md)
3. Download & build [Trezor Bridge](https://github.com/trezor/trezord-go)
4. `git clone https://github.com/trezor/connect.git`
5. `cd ./connect && git checkout tpm`
6. Now you can start tests by typing
    ```bash
    yarn test -t "[test-name]"
    ```
7. (Optional) You can specify paths to both emulator & Bridge by typing
    ```bash
    yarn test -t "[test-name]" -e "<emulator-path>" -b "<bridge-path>"
    ```
    The default path (relative to this repo) is `./../trezor-core` & `./../trezord-go` respectively.
8. (Optional) To see all available options type `yarn test`




