# Connect integration tests

## How to run tests locally
1. To run all tests `./tests/run.sh`
1. To see some options `./test/run.sh -h`;
1. To run tests with graphic output from emulator, use `-g` option. Note that macOS needs some [further configuration](https://medium.com/@nihon_rafy/building-a-dockerized-gui-by-sharing-the-host-screen-with-docker-container-b660835fb722).
1. To limit tests to subset of methods use `-i getPublicKey,getAddress`

## How to add tests
1. Create or modify file in `./__fixtures__`
1. Make sure it is imported in `./__fixtures__/index.js`.
1. Make sure the method you are testing is listed in [travis.yml]('../travis.yml') to make it run in CI 

## How to run tests with custom firmware
1. Build your custom [emulator](https://docs.trezor.io/trezor-firmware/core/build/emulator.html) with debuglink support
1. Save it as `trezor-emu-core-v2.[num].[num]`. For example `trezor-emu-core-v2.9.9`
1. Run tests with `./tests/run.sh -b ~/path-to-emu/trezor-emu-core-v2.9.9 -f 2.9.9`

## Continuous integration
Tests are run with each commit on [travis](https://travis-ci.org/github/trezor/connect)