# Trezor Connect API version 8.1.16
[![Build Status](https://travis-ci.org/trezor/connect.png?branch=develop)](https://travis-ci.org/trezor/connect)
[![NPM](https://img.shields.io/npm/v/trezor-connect.svg)](https://www.npmjs.org/package/trezor-connect)
[![Known Vulnerabilities](https://snyk.io/test/github/trezor/connect/badge.svg?targetFile=package.json)](https://snyk.io/test/github/trezor/connect?targetFile=package.json)

Trezor Connect is a platform for easy integration of Trezor into 3rd party services. It provides API with functionality to access public keys, sign transactions and authenticate users. User interface is presented in a secure popup window served from `https://connect.trezor.io/8/popup.html`

* [Integration](docs/index.md)
* [Development](https://wiki.trezor.io/Developers_guide:Trezor_Connect_API)


## Versions
We started tagging versions and releasing them to separate URLs, so we don't break any existing (and working) integrations.

Currently, we are at version 8, which has an url https://connect.trezor.io/8/trezor-connect.js.
<br> 
The older version listed below are still working, but new features are not being added.
* https://connect.trezor.io/7/trezor-connect.js,
* https://connect.trezor.io/6/trezor-connect.js,
* https://connect.trezor.io/5/trezor-connect.js,
* https://connect.trezor.io/4/connect.js,
* https://connect.trezor.io/3/connect.js,
* https://connect.trezor.io/2/connect.js
* https://trezor.github.io/connect/connect.js,

With regards to this repo - All updates should go to current version branch, the previous releases are in corresponding branches. The gh-pages is the same older version, that is used at trezor.github.io/connect/connect.js, and it's there for backwards compatibility; please don't touch.

## Tests
For integration testing against trezord and emulator refer to [this document](./tests/README.md). Please note that tests in 
`src/__tests__` are considered deprecated.
