## Webextension with inline script

`trezor-connect` running in background script and communicating thru `chrome.runtime.postMessage`

Tested in Chrome and Firefox


### Install

#### Chrome
- rename `manifest-chrome.json` to `manifest.json`
- go to chrome://extensions
- Load unpacked
- Choose `trezor-connect/example/webextension` directory

#### Firefox
- go to settings > Add-ons
- Manage Your Extensions > Debug Add-ons
- Load temporary Add-on
- Choose `trezor-connect/example/webextension/manifest-firefox.json` file