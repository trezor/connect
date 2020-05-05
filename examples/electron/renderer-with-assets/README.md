## Electron renderer process with assets

`trezor-connect` files are hosted inside application filesystem and rendered inside `iframe` element.

This application can be also developed in browser since it doesn't require any electron specific behavior.

### Install

`yarn`

### Build trezor-connect files
This will compile trezor-connect into `./assets/trezor-connect` directory

`yarn build:connect`

### Develop

`yarn dev`

### Build

`yarn build:mac`

`yarn build:linux`

`yarn build:win`