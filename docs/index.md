## Installation

### Browser, webextension, electron
Install library as npm module:
```javascript
npm install trezor-connect
```
or
```javascript
yarn add trezor-connect
```
or
Include library as inline script:
```javascript
<script src="https://connect.trezor.io/8/trezor-connect.js"></script>
```

### Node, react-native, electron [TRUSTED MODE]
`You need to handle all UI requests and responses by yourself using`  [Read more about TRUSTED MODE](trusted-mode.md)
```javascript
npm install trezor-connect@-extended
```
or
```javascript
yarn add trezor-connect@-extended
```

## Initialization

ES6
```javascript
import TrezorConnect from 'trezor-connect';
```

CommonJS
```javascript
var TrezorConnect = require('trezor-connect').default;
```

Inline
```javascript
var TrezorConnect = window.TrezorConnect;
```

## Trezor Connect Manifest
Starting with Trezor Connect 7, we have implemented a new feature — Trezor Connect Manifest — which requires that you as a Trezor Connect integrator, to share your e-mail and application url with us.
This provides us with the **ability to reach you in case of any required maintenance.**
This subscription is mandatory. Trezor Connect raises an error that reads "Manifest not set. Read more at https://github.com/trezor/connect/blob/develop/docs/index.md" if manifest is not provided.
```javascript
TrezorConnect.manifest({
    email: 'developer@xyz.com',
    appUrl: 'http://your.application.com'
})
```

## API methods

* [List of methods](methods.md)

## Handling events

* [Events](events.md)

## Running local version (develop/stable)
- clone repository: `git clone git@github.com:trezor/connect.git`
- install node_modules: `yarn`
- run localhost server: `yarn dev`

Initialize in project
```javascript
TrezorConnect.init({
    connectSrc: 'https://localhost:8088/',
    lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
    manifest: {
        email: 'developer@xyz.com',
        appUrl: 'http://your.application.com',
    }
})
```

## Running local version (custom branch)
In order to run a branch which isn't published to npm registry and this branch requires changes (mostly happened when new a method is added to TrezorConnect interface)
- git checkout `custom-feature-branch`
- yarn build:npm

There are two ways to install builded lib in your project:
#### Using `yarn link`
* cd ./npm && yarn link
* Inside your project: `yarn install trezor-connect`
#### Using local files
* Inside your project: `yarn install trezor-connect@file:/[local-path-to-repository]/npm`


