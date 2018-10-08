# 5.0.34
__fixed__
- Unicode character in regexp, (https://github.com/trezor/connect/pull/229)

# 5.0.33
__fixed__
- `TrezorConnect.ethereumSignMessage` and `TrezorConnect.ethereumVerifyMessage` methods with "hex" parameter
- flowtype for `TrezorConnect.cardanoGetPublicKey` in `TrezorConnect.cardanoSignTransaction` methods

# 5.0.32
__added__
- Added `TrezorConnect.cardanoGetPublicKey` method
- Ability to sign hexed ethereum message
- `network` parameter to `TrezorConnect.cardanoSignTransaction` method
__fixed__
- TRANSPORT.ERROR event when computer goes to sleep
- finding backend by name instead of urls
- proper FW version for Lisk and Stellar
__removed__
- Removed `TrezorConnect.cardanoSignMessage` method
- Removed `TrezorConnect.cardanoVerifyMessage` method

# 5.0.31
__added__
- Support for Cardano
- Support for Ripple
- Support for Lisk
- Exception for not supported firmware when value for "trezor1" or "trezor2" inside coins.json is not set
- Disable customMessage method for devices with official firmware
- Added new field in `TrezorConnect.signEthereumTransaction` for `Wanchain`
__changed__
- Separate "getPublicKey" and "getAddress" methods for all coins
__fixed__
- Device state verification while using multiple instances with the same passphrase
- ConnectSettings sensitive settings verification in DataManager
- removed package-lock.json from repository


# 5.0.30
__added__
- Added 'send-max' and 'opreturn' output types to `TrezorConnect.composeTransaction`
__fixed__
- Handle popup close event while waiting for iframe handshake
- Removed ledgerVersion (protocol_version) from StellarSignTransaction method
- One time permissions stored in session in application variable
- `TrezorConnect.ethereumSignTransaction` recompute "v" value if Trezor returns value in range [0,1]
- Webextensions: Handling if popup is called from "normal" window or extension popup
- ConnectSetting default domain

# 5.0.29
__fixed__
- Fixed flowtype for TrezorConnect methods (bundled methods return bundled results)
- Fixed renderWebUSBButton method
- Removed "babel-polyfill" from npm and export unminified script https://connect.trezor.io/5/trezor-connect.js
- Added https://connect.trezor.io/5/trezor-connect.min.js to export with bundled "babel-polyfill"
- Web extensions: open popup tab next to currently used tab

# 5.0.28
__added__
- Added support for WebExtensions (Chrome/Firefox)
- Added host icon for whitelisted domains
__fixed__
- Fixed passphrase input type (revert to password type)
- Fixed popup and iframe timeout handling

# 5.0.27
__fixed__
- Fixed handling not initialized iframe
- Fixed iframe ad-blocker handling
- Fixed popup views
__changed__
- Popup as new tab

# 5.0.26
__added__
- Added support for Dogecoin and Vertcoin
__fixed__
- Fixed handling not initialized device
- SignTransaction: amount as string
- Handle origin of file://
__changed__
- Default url in connect

# 5.0.25
__added__
- Added documentation
__fixed__
- filter UI events for popup and trusted apps
- Fixed `TrezorConnect.signMessage` and `TrezorConnect.verifyMessage` signature to base64 format
__changed__
- Changed constants prefix from "__" to "-"

# 5.0.24
__fixed__
- removed popup delay if lazy loading
- validation of device state if method is using emptyPassphrase
- retyped Device, distinguished by "type" field
- eslint fixes

# 5.0.23
__fixed__
- npm package dependencies
- Unsupported browser (IE)

# 5.0.21
__added__
- Added `TrezorConnect.pushTransaction` method
- Added bundle parameters in `TrezorConnect.cipherKeyValue` method
- Added bundle parameters in `TrezorConnect.getPublicKey` method
- Added bundle parameters in `TrezorConnect.getAddress` method
- Added bundle parameters in `TrezorConnect.ethereumGetAddress` method
- Added bundle parameters in `TrezorConnect.nemGetAddress` method
- Added bundle parameters in `TrezorConnect.stellarGetAddress` method
- Added type conversion from stellar-sdk to protobuf in `TrezorConnect.stellarSignTransaction` method
- Popup warning with outdated firmware and outdated bridge
- Tests with emulator
- Added '@babel/runtime' to package dependency
__fixed__
- Fixed device authentication and popup open delay
- Minor fixes in popup view
- Ethereum methods accepts values with '0x' prefix
- Ethereum methods returns checksummed addresses (with different checksum typ for RSK network)
- Ethereum methods returns values prefixed with '0x'

# 5.0.20
__added__
- Added firmware check against CoinInfo.support values
- Added outdate firmware warning in popup
__fixed__
- Fixed `TrezorConnect.requestLogin` parameters
- Fixed race condition in UI.REQUEST_CONFIRMATION
- Fixed popup.html buttons click


# 5.0.18
__added__
- Added iframe lazy loading
__fixed__
- Build script for npm module
- Ultimate flow type
- Reorganized files and imports
- Minor fixes in code

# 5.0.17
__added__
- Added `TrezorConnect.getAccountInfo` method
- Added `TrezorConnect.signTransaction` method
- Added `TrezorConnect.composeTransaction` method
- Added `TrezorConnect.signMessage` method
- Added `TrezorConnect.verifyMessage` method
- Added `TrezorConnect.getAddress` method
- Added `TrezorConnect.requestLogin` method
- Added cashaddr support for BCH
- Added documentation
__fixed__
- Fixed `TrezorConnect.customMessage` logic and security
- Fixed `TrezorConnect.stellarSignTransaction` parameters compatible with "js-stellar-base"
- Fixed flowtype declarations for all methods. Params and responses
__removed__
- Removed unnecessary settings from ConnectSettings
- Removed unused methods from TrezorConnect

# 5.0.16
__added__
- Added `TrezorConnect.stellarSignTransaction` method
__changed__
- Changed `TrezorConnect.ethereumSignTransaction` parameters
__removed__
- Removed type and event fields from RESPONSE

# 5.0.15
__fixed__
- Library exports

# 5.0.14
__added__
- Added `TrezorConnect.nemGetAddress` method
- Added `TrezorConnect.nemSignTransaction` method
- Added `TrezorConnect.stellarGetAddress` method
- Added `TrezorConnect.customMessage` method
__fixed__
- Fixed flowtype


# 5.0.13
__added__
- Added messages from json instead of config_signed.bin
- Added popup.html UI/css
- Karma + Jasmine tests
__fixed__
__removed__
- Removed support for Bridge v1 and chrome extension


# 5.0.10
From this version trezor-connect is used by Trezor Password Manager
