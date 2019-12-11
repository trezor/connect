# 8.0.12
#### Added
- Peercoin support
#### Updated
- ZCash Blossom fork (updated branch_id)

# 8.0.11
#### Added
- React native transport
#### Updated
- TRANSPORT_EVENT "bridge" field send only in browser env. Whole logic moved from Core/DataManager to iframe

# 8.0.10
#### Added
- Jest unit tests
#### Fixed
- Browser validation logic moved from Core to popup, not restricted anymore
- popupMessagePort assignment for browsers without BroadcastChannel support
- multiple eslint/flow fixes
#### Updated
- Update outdated and remove unused node_modules dependencies

# 8.0.9
#### Fixed
- `getAccountInfo` bump @trezor/blockchain-link version with fixed ripple auto reconnection and ripple-lib issue https://github.com/ripple/ripple-lib/issues/1066

# 8.0.8
#### Fixed
- `tezosSignTransaction` Babylon fork update, exclude firmware lower than 2.1.8

# 8.0.7
#### Added
- `stellarSignTransaction` plugin - a tool for transforming StellarSDK.Transaction object into TrezorConnect.StellarTransaction
- `stellarSignTransaction` missing tests
#### Fixed
- `stellarSignTransaction` parameters types (number > string, add required and optional params)
- `blockchainEstimateFee` method (smart fees)
- `cardanoSingTransaction` amount type to string
- `liskSingTransaction` amount type to string
- `rippleSingTransaction` amount type to string

# 8.0.6
#### Added
- `firmwareUpdate` method now emits `ButtonRequest_FirmwareUpdate` event and `ui-firmware-progress` event
- `blockchainGetTransactions` and `blockchainEstimateFee` methods
- `composeTransaction` returns precomposed transaction for account
#### Fixed
- Removed unnecessary error wrapper (core.js)
#### Removed
- removed standalone `firmwareErase` and `firmwareUpload` methods.

# 8.0.5 (server side only)
#### Fixed
- fix `disconnect`-`method response` race condition
- `getAccountInfo` runtime error when using descriptor without path
- Firmware releases channel (beta-wallet)

# 8.0.4 (server side only)
#### Added
- Added `Unobtanium` support
#### Fixed
- `pendingTransport` race condition using lazyLoading and multiple devices connected
- simplified `Core` error rejection
- `BNB` firmware range
#### Updated 
- coins.json

# 8.0.3
#### Added
- Added `Binance Chain (BNB)` support
#### Fixed
- `TrezorConnect.cancel` race condition between device release and returned response
#### Updated 
- protobuf messages
- firmware releases

# 8.0.2
#### Added
- Added `Device.Features.features` field
#### Changed
- `CoinInfo.blockchainLink` field generated from `coins.json:blockbook` for BTC-like and ETH-like
#### Updated 
- supported coins
- protobuf messages

# 8.0.1
#### Added
- Added `TrezorConnect.disableWebUSB` method
#### Fixed
- renamed EOS actions parameters 'buyram': quantity > quant, 'voteproducer': data.account > data.voter

# 8.0.0
#### Breaking changes
- Changed communication process between host, iframe and popup. BroadcastChannel is used as default, postMessage as fallback
- Completely rewritten backend layer. Old way using hd-wallet and bitcore/blockbook-api-v1 is dropped in favour of `@trezor/blockchain-link`
- `BigInteger` support for Bitcoin transactions using `@trezor/utxo-lib` and `hd-wallet@bigint`
- `TrezorConnect.rippleGetAccountInfo` and `TrezorConnect.ethereumGetAccountInfo` merged to `TrezorConnect.getAccountInfo`
- `TrezorConnect.getAccountInfo` parameters

#### Added
- Added nodejs support
- Added `lazyLoad` parameter to `TrezorConnect.init`
- Added bech32 accounts support
- Webextension usb permissions iframe dynamically included into html
- Added correct `script_type` to `TransactionInput` and `TransactionOutput` of Bitcoin-like TxRequest protobuf message
- Added signed transaction validation for Bitcoin `signTransaction` and `composeTransaction` methods
- Added shamir recovery

# 7.0.5
__added__
- Added cloudfront cache invalidation
__fixed__
- Url encoding in `TrezorConnect.manifest`

# 7.0.4
__added__
- Added EOS methods `TrezorConnect.eosGetPublicKey` and `TrezorConnect.eosSignTransaction`
- Added `TrezorConnect.firmwareUpdate` (management method)
- Added new firmware releases
- Added new bridge releases
__fixed__
- Dependencies security vulnerabilities
- Minor fixes in flowtype and tests

# 7.0.3
__added__
- Added management methods `applyFlags`, `applySettings`, `backupDevice`, `changePin`, `firmwareErase`, `firmwareUpload`, `recoveryDevice`

# 7.0.2
__added__
- Added missing params to `TrezorConnect.signTransaction` method [`version`, `expiry`, `overwintered`, `versionGroupId`, `branchId`, `refTxs`]
- Possibility to use `TrezorConnect.signTransaction` without build-in backend (using `refTxs` field)
- Added `TrezorConnect.getSettings` method

__fixed__
- Fixed `Dash` and `Zcash` special transactions
- `EthereumGetAddress` address validation
- Flowtype for `CardanoInput`

# 7.0.1
__added__
- Added `TrezorConnect.manifest` method
- Added DebugLink (emulator) support: `TrezorConnect.debugLinkDecision` and `TrezorConnect.debugLinkGetState` methods
- Added `TrezorConnect.ethereumGetPublicKey` method (with fallback for older firmware)
- Added `TrezorConnect.loadDevice` method
- Added `Capricoin` support (with required changes in `hd-wallet` and `bitcoinjs-lib-zcash` libs)
- Added `firmwareRange` to every method (validation if device FW is in range: min_required_firmware - max_compatible_firmware declared in config.json)
- Added conditional protobuf messages (fallback for older FW)
- Added "device not backed up" confirmation
- Added `blockchain-link` dependency
- Added `TrezorConnect.rippleGetAccountInfo` method
- Added `TrezorConnect.blockchainGetFee` method
- Added `TrezorConnect.blockchainUnsubscribe` method
- Added `BlockchainEvent` (connect/error/block/notification)

__changed__
- Upgrade npm modules (babel@7)
- Changed `network` for `protocol_magic` in `TrezorConnect.cardanoSignTransaction` method

__fixed__
- ComposeTransaction: fees/legacy detection
- test with DebugLink device
- removed "window" references

# 6.0.5
__changed__
- Delay for popup window
- Temporary disable webusb (chrome72 issue)

# 6.0.4
__added__
- Added `UI.ADDRESS_VALIDATION` event

__changed__
- `getAddress`, `cardanoGetAddress`, `ethereumGetAddress`, `liskGetAddress`, `nemGetAddress`, `rippleGetAddress`, `stellarGetAddress`, `tezosGetAddress` methods (allow to handle `UI.ADDRESS_VALIDATION` event)
- refactor `ButtonRequest_Address` view in popup: display address and copy to clipboard button
- extend `getAccountInfo` response (utxo, used addresses, unused addresses)
- Moved flowtype declarations from ./src/flowtype to ./src/js/types
- Refactor CoinInfo to 3 types: BitcoinNetworkInfo, EthereumNetworkInfo and MiscNetworkInfo

__fixed__
- `stellarSignTransaction` with multiple operations

# 6.0.3
__added__
- Added `TrezorConnect.tezosGetAddress` method
- Added `TrezorConnect.tezosGetPublicKey` method
- Added `TrezorConnect.tezosSignTransaction` method
- Added `TrezorConnect.dispose` method
- Added `TrezorConnect.cancel` method
- Added new firmware releases
- Added new bridge releases

__changed__
- Whitelist `trusted` mode for instances hosted locally
- Send correct `script_type` in `GetPublicKey` message

__fixed__
- Stellar signTransaction amount validation
- Stellar signer field validation ("StellarSetOptionsOp" operation in "stellarSignTransaction" method)
- Firmware (model) not supported popup screen

# 6.0.2
__added__
- Added `TrezorConnect.wipeDevice` method
- Added `TrezorConnect.resetDevice` method
- Calling method on device with seedless setup is disabled by default

__changed__
- Post message to window.parent instead of window.top
- Authenticating device using BTC testnet path instead of dummy m/1/0/0

# 6.0.1
__fixed__
- WRONG_PREVIOUS_SESSION race condition when switching between tabs and acquiring device
- removed unnecessary console.logs and build scripts
- Docker build for npm

__changed__
- Renamed directory "dist" to "build"

# 6.0.0
__added__
- Added `TrezorConnect.pushTransaction` method with ethereum blockbook support
- Added `TrezorConnect.ethereumGetAccountInfo` method
- Added `TrezorConnect.blockchainSubscribe` method
- Added `TrezorConnect.blockchainDisconnect` method
- Added `BLOCKCHAIN` events
- Added `./data/bridge/releases.json`
- Added bridge release info in TRANSPORT.START and TRANSPORT.ERROR event

__fixed__
- TRANSPORT.ERROR event when computer goes to sleep
- unexpectedDeviceMode immediately rejects call in trusted mode

__changed__
- coins.json merged as one file (removed data/ethereumNetworks.json)
- License to T-RSL

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

__removed__
- Removed support for Bridge v1 and chrome extension


# 5.0.10
From this version trezor-connect is used by Trezor Password Manager
