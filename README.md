# :warning: Maintenance Mode

Trezor Connect v8 is under maintenance mode, all new development efforts are focused on v9. New integrations are recommended to start with v9, currently in beta.

* [Trezor Connect v9 BETA](https://github.com/trezor/trezor-suite/tree/develop/packages/connect)
* [@trezor/connect NPM](https://www.npmjs.com/package/@trezor/connect)

## New NPM package
NPM package [trezor-connect](https://www.npmjs.com/package/trezor-connect) will not receive any v9 changes. v9 changes are only available at NPM package [@trezor/connect](https://www.npmjs.com/package/@trezor/connect).

# Trezor Connect API version 8.2.11
[![Build Status](https://github.com/trezor/connect/actions/workflows/tests.yml/badge.svg)](https://github.com/trezor/connect/actions/workflows/tests.yml)
[![NPM](https://img.shields.io/npm/v/trezor-connect.svg)](https://www.npmjs.org/package/trezor-connect)
[![Known Vulnerabilities](https://snyk.io/test/github/trezor/connect/badge.svg?targetFile=package.json)](https://snyk.io/test/github/trezor/connect?targetFile=package.json)

Trezor Connect is a platform for easy integration of Trezor into 3rd party services. It provides API with functionality to access public keys, sign transactions and authenticate users. User interface is presented in a secure popup window served from `https://connect.trezor.io/8/popup.html`

* [Integration](docs/index.md)
* [Development](https://wiki.trezor.io/Developers_guide:Trezor_Connect_API)

## Issues
Please report any issues directly in our [Trezor Suite monorepo](https://github.com/trezor/trezor-suite/issues) and apply the `connect` label.

## Versions
We started tagging versions and releasing them to separate URLs, so we don't break any existing (and working) integrations.

Currently, we are at version 8, which has an url https://connect.trezor.io/8/trezor-connect.js. If you would like to find out which version is deployed precisely simply run:

`curl -s https://connect.trezor.io/8/trezor-connect.js | grep VERSION`

With regards to this repo - All updates should go to current version branch, the previous releases are in corresponding branches. The gh-pages is the same older version, that is used at trezor.github.io/connect/connect.js, and it's there for backwards compatibility; please don't touch.

## Tests
For integration testing against trezord and emulator refer to [this document](./tests/README.md).
