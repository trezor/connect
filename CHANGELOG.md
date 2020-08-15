# 8.1.12 [unreleased]

#### Changed
- Don't try to validate multisig output scripts (not implemented yet)

# 8.1.11

#### Changed
- Default value of `interactionTimeout` has been increased from 2 minutes to 5 minutes.

#### Fixed
- Allow unhardenended path (compatibility for Casa)
- zcash: don't send `version_group_id` for tx version lower than 3

# 8.1.10

#### Changed
- Cardano Shelley Update #638 #639
- Updated dependencies

# 8.1.9

#### Fixed
- `composeTransaction` - remove unnecessary condition when using `send-max` outputs
#### Added
- `interactionTimeout` property to the initial settings. This will timeout users who stay inactive for a specified amount of time (in seconds).

# 8.1.8

#### Added
- `ButtonRequest_PinEntry`
- `legacyXpub` field in response of `getAccountInfo` (BTC-like coins) used in `metadata` (labeling)
- `n` field of `AccountTransaction:TransactionTarget` (output index) used in `metadata`
- `branch_id` in signTx `TXMETA` (ZCash)
#### Changed
- Improved tests (trezor-user-env)

# 8.1.7

#### Fixed
- `composeTransaction` missing zcash specific fields (in popup mode)
- `firmwareUpdate` default download url (data.trezor.io)
#### Changed
- Updated dependencies
- Typed errors

# 8.1.6

#### Fixed
- `composeTransaction` sequence flag
- Zcash `extra_data` field
#### Added
- Disconnect device during action timeout penalty (to allow u2f login)
#### Changed
- Refactor Bitcoin-like signing

# 8.1.5

#### Fixed
- `estimateFee` fee levels for `DGB`
- `unavailableCapabilities` reload condition
#### Added
- `webextension` example

# 8.1.4

#### Fixed
- `composeTransaction` returns zcash inputs with amount
- update `trezor-common` (`LTC` `minfee_kb`, removed `CPC` and `ZEN`)

# 8.1.3

#### Fixed
- `@trezor/blockchain-link` recv transaction targets
- add missing `type` field to `RequestPin`

# 8.1.2

#### Fixed
- bech32 xpub format in fw < 1.7.2 & 2.0.10
- workaround for pending unread message (trezor/trezord-go#154)
- blockchainSubscribe optional params

# 8.1.1 (npm only)

#### Fixed
- flowtype fix

# 8.1.0

#### Added
- Support for FW 1.9.0 and 2.3.0 (passphrase redesign)
- Typescript types
- `hex` parameter to `signMessage` and `verifyMessage` methods
- Blockchain methods for fiat rates:
    - `TrezorConnect.blockchainGetAccountBalanceHistory`
    - `TrezorConnect.blockchainGetCurrentFiatRates`
    - `TrezorConnect.blockchainGetFiatRatesForTimestamps`
    - `TrezorConnect.blockchainSubscribeFiatRates`
    - `TrezorConnect.blockchainUnsubscribeFiatRates`
- `TrezorConnect.blockchainSetCustomBackend` method
- `TrezorConnect.cancel` is now trying to send (post) 'Cancel' message to acquired device (not working with TrezorBridge < 2.0.29)
- Implement @trezor/rollout module https://github.com/trezor/connect/issues/295

#### Fixed
- General cleanup in flowtype declarations
- disableWebUsb method
- trezor-link protobuf messages overrides
- Fixed race condition in nodejs https://github.com/trezor/connect/issues/504

# 8.0.15 (server side only)

#### Fixed
- `getAccountInfo` Bech32 accounts shouldn't be default #547

# 8.0.14 (server side only)

#### Fixed
- `signtxVerify` P2WSH output #541

# 8.0.13

#### Fixed
- `getAddress` for multisig addresses #509
- `bundle` params spread #514
- promise resolved multiple times #513
- functions used as classes #512

# 8.0.12

#### Added
- Peercoin support

#### Updated
- ZCash Blossom fork (updated `branch_id`)

# 8.0.11

#### Added
- React native transport

#### Updated
- `TRANSPORT_EVENT` "bridge" field send only in browser env. Whole logic moved from Core/DataManager to iframe

# 8.0.10

#### Added
- Jest unit tests

#### Fixed
- Browser validation logic moved from Core to popup, not restricted anymore
- popupMessagePort assignment for browsers without BroadcastChannel support
- multiple eslint/flow fixes

#### Updated
- Update outdated and remove unused `node_modules` dependencies

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

#### Added
- Added cloudfront cache invalidation

#### Fixed
- Url encoding in `TrezorConnect.manifest`

# 7.0.4

#### Added
- Added EOS methods `TrezorConnect.eosGetPublicKey` and `TrezorConnect.eosSignTransaction`
- Added `TrezorConnect.firmwareUpdate` (management method)
- Added new firmware releases
- Added new bridge releases

#### Fixed
- Dependencies security vulnerabilities
- Minor fixes in flowtype and tests

# 7.0.3

#### Added
- Added management methods `applyFlags`, `applySettings`, `backupDevice`, `changePin`, `firmwareErase`, `firmwareUpload`, `recoveryDevice`

# 7.0.2

#### Added
- Added missing params to `TrezorConnect.signTransaction` method [`version`, `expiry`, `overwintered`, `versionGroupId`, `branchId`, `refTxs`]
- Possibility to use `TrezorConnect.signTransaction` without build-in backend (using `refTxs` field)
- Added `TrezorConnect.getSettings` method

#### Fixed
- Fixed `Dash` and `Zcash` special transactions
- `EthereumGetAddress` address validation
- Flowtype for `CardanoInput`

# 7.0.1

#### Added
- Added `TrezorConnect.manifest` method
- Added DebugLink (emulator) support: `TrezorConnect.debugLinkDecision` and `TrezorConnect.debugLinkGetState` methods
- Added `TrezorConnect.ethereumGetPublicKey` method (with fallback for older firmware)
- Added `TrezorConnect.loadDevice` method
- Added `Capricoin` support (with required changes in `hd-wallet` and `bitcoinjs-lib-zcash` libs)
- Added `firmwareRange` to every method (validation if device FW is in range: `min_required_firmware` - `max_compatible_firmware` declared in config.json)
- Added conditional protobuf messages (fallback for older FW)
- Added "device not backed up" confirmation
- Added `blockchain-link` dependency
- Added `TrezorConnect.rippleGetAccountInfo` method
- Added `TrezorConnect.blockchainGetFee` method
- Added `TrezorConnect.blockchainUnsubscribe` method
- Added `BlockchainEvent` (connect/error/block/notification)

#### Changed
- Upgrade npm modules (babel@7)
- Changed `network` for `protocol_magic` in `TrezorConnect.cardanoSignTransaction` method

#### Fixed
- ComposeTransaction: fees/legacy detection
- test with DebugLink device
- removed "window" references

# 6.0.5

#### Changed
- Delay for popup window
- Temporary disable webusb (chrome72 issue)

# 6.0.4

#### Added
- Added `UI.ADDRESS_VALIDATION` event

#### Changed
- `getAddress`, `cardanoGetAddress`, `ethereumGetAddress`, `liskGetAddress`, `nemGetAddress`, `rippleGetAddress`, `stellarGetAddress`, `tezosGetAddress` methods (allow to handle `UI.ADDRESS_VALIDATION` event)
- refactor `ButtonRequest_Address` view in popup: display address and copy to clipboard button
- extend `getAccountInfo` response (utxo, used addresses, unused addresses)
- Moved flowtype declarations from ./src/flowtype to ./src/js/types
- Refactor CoinInfo to 3 types: BitcoinNetworkInfo, EthereumNetworkInfo and MiscNetworkInfo

#### Fixed
- `stellarSignTransaction` with multiple operations

# 6.0.3

#### Added
- Added `TrezorConnect.tezosGetAddress` method
- Added `TrezorConnect.tezosGetPublicKey` method
- Added `TrezorConnect.tezosSignTransaction` method
- Added `TrezorConnect.dispose` method
- Added `TrezorConnect.cancel` method
- Added new firmware releases
- Added new bridge releases

#### Changed
- Whitelist `trusted` mode for instances hosted locally
- Send correct `script_type` in `GetPublicKey` message

#### Fixed
- Stellar signTransaction amount validation
- Stellar signer field validation ("StellarSetOptionsOp" operation in "stellarSignTransaction" method)
- Firmware (model) not supported popup screen

# 6.0.2

#### Added
- Added `TrezorConnect.wipeDevice` method
- Added `TrezorConnect.resetDevice` method
- Calling method on device with seedless setup is disabled by default

#### Changed
- Post message to window.parent instead of window.top
- Authenticating device using BTC testnet path instead of dummy m/1/0/0

# 6.0.1

#### Fixed
- `WRONG_PREVIOUS_SESSION` race condition when switching between tabs and acquiring device
- removed unnecessary console.logs and build scripts
- Docker build for npm

#### Changed
- Renamed directory "dist" to "build"

# 6.0.0

#### Added
- Added `TrezorConnect.pushTransaction` method with ethereum blockbook support
- Added `TrezorConnect.ethereumGetAccountInfo` method
- Added `TrezorConnect.blockchainSubscribe` method
- Added `TrezorConnect.blockchainDisconnect` method
- Added `BLOCKCHAIN` events
- Added `./data/bridge/releases.json`
- Added bridge release info in TRANSPORT.START and TRANSPORT.ERROR event

#### Fixed
- TRANSPORT.ERROR event when computer goes to sleep
- unexpectedDeviceMode immediately rejects call in trusted mode

#### Changed
- coins.json merged as one file (removed data/ethereumNetworks.json)
- License to T-RSL

# 5.0.34

#### Fixed
- Unicode character in regexp, (https://github.com/trezor/connect/pull/229)

# 5.0.33

#### Fixed
- `TrezorConnect.ethereumSignMessage` and `TrezorConnect.ethereumVerifyMessage` methods with "hex" parameter
- flowtype for `TrezorConnect.cardanoGetPublicKey` in `TrezorConnect.cardanoSignTransaction` methods

# 5.0.32

#### Added
- Added `TrezorConnect.cardanoGetPublicKey` method
- Ability to sign hexed ethereum message
- `network` parameter to `TrezorConnect.cardanoSignTransaction` method

#### Fixed
- TRANSPORT.ERROR event when computer goes to sleep
- finding backend by name instead of urls
- proper FW version for Lisk and Stellar

#### Removed
- Removed `TrezorConnect.cardanoSignMessage` method
- Removed `TrezorConnect.cardanoVerifyMessage` method

# 5.0.31

#### Added
- Support for Cardano
- Support for Ripple
- Support for Lisk
- Exception for not supported firmware when value for "trezor1" or "trezor2" inside coins.json is not set
- Disable customMessage method for devices with official firmware
- Added new field in `TrezorConnect.signEthereumTransaction` for `Wanchain`

#### Changed
- Separate "getPublicKey" and "getAddress" methods for all coins


#### Fixed
- Device state verification while using multiple instances with the same passphrase
- ConnectSettings sensitive settings verification in DataManager
- removed package-lock.json from repository

# 5.0.30

#### Added
- Added 'send-max' and 'opreturn' output types to `TrezorConnect.composeTransaction`

#### Fixed
- Handle popup close event while waiting for iframe handshake
- Removed ledgerVersion (`protocol_version`) from StellarSignTransaction method
- One time permissions stored in session in application variable
- `TrezorConnect.ethereumSignTransaction` recompute "v" value if Trezor returns value in range [0,1]
- Webextensions: Handling if popup is called from "normal" window or extension popup
- ConnectSetting default domain

# 5.0.29

#### Fixed
- Fixed flowtype for TrezorConnect methods (bundled methods return bundled results)
- Fixed renderWebUSBButton method
- Removed "babel-polyfill" from npm and export unminified script https://connect.trezor.io/5/trezor-connect.js
- Added https://connect.trezor.io/5/trezor-connect.min.js to export with bundled "babel-polyfill"
- Web extensions: open popup tab next to currently used tab

# 5.0.28

#### Added
- Added support for WebExtensions (Chrome/Firefox)
- Added host icon for whitelisted domains

#### Fixed
- Fixed passphrase input type (revert to password type)
- Fixed popup and iframe timeout handling

# 5.0.27

#### Fixed
- Fixed handling not initialized iframe
- Fixed iframe ad-blocker handling
- Fixed popup views

#### Changed
- Popup as new tab

# 5.0.26

#### Added
- Added support for Dogecoin and Vertcoin

#### Fixed
- Fixed handling not initialized device
- SignTransaction: amount as string
- Handle origin of file://

#### Changed
- Default url in connect

# 5.0.25

#### Added
- Added documentation

#### Fixed
- filter UI events for popup and trusted apps
- Fixed `TrezorConnect.signMessage` and `TrezorConnect.verifyMessage` signature to base64 format

#### Changed
- Changed constants prefix from `__` to `-`

# 5.0.24

#### Fixed
- removed popup delay if lazy loading
- validation of device state if method is using emptyPassphrase
- retyped Device, distinguished by "type" field
- eslint fixes

# 5.0.23

#### Fixed
- npm package dependencies
- Unsupported browser (IE)

# 5.0.21

#### Added
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

#### Fixed
- Fixed device authentication and popup open delay
- Minor fixes in popup view
- Ethereum methods accepts values with '0x' prefix
- Ethereum methods returns checksummed addresses (with different checksum typ for RSK network)
- Ethereum methods returns values prefixed with '0x'

# 5.0.20

#### Added
- Added firmware check against CoinInfo.support values
- Added outdate firmware warning in popup

#### Fixed
- Fixed `TrezorConnect.requestLogin` parameters
- Fixed race condition in `UI.REQUEST_CONFIRMATION`
- Fixed popup.html buttons click

# 5.0.18

#### Added
- Added iframe lazy loading


#### Fixed
- Build script for npm module
- Ultimate flow type
- Reorganized files and imports
- Minor fixes in code

# 5.0.17

#### Added
- Added `TrezorConnect.getAccountInfo` method
- Added `TrezorConnect.signTransaction` method
- Added `TrezorConnect.composeTransaction` method
- Added `TrezorConnect.signMessage` method
- Added `TrezorConnect.verifyMessage` method
- Added `TrezorConnect.getAddress` method
- Added `TrezorConnect.requestLogin` method
- Added cashaddr support for BCH
- Added documentation

#### Fixed
- Fixed `TrezorConnect.customMessage` logic and security
- Fixed `TrezorConnect.stellarSignTransaction` parameters compatible with "js-stellar-base"
- Fixed flowtype declarations for all methods. Params and responses

#### Removed
- Removed unnecessary settings from ConnectSettings
- Removed unused methods from TrezorConnect

# 5.0.16

#### Added
- Added `TrezorConnect.stellarSignTransaction` method

#### Changed
- Changed `TrezorConnect.ethereumSignTransaction` parameters

#### Removed
- Removed type and event fields from RESPONSE

# 5.0.15

#### Fixed
- Library exports

# 5.0.14

#### Added
- Added `TrezorConnect.nemGetAddress` method
- Added `TrezorConnect.nemSignTransaction` method
- Added `TrezorConnect.stellarGetAddress` method
- Added `TrezorConnect.customMessage` method

#### Fixed
- Fixed flowtype

# 5.0.13

#### Added
- Added messages from json instead of `config_signed.bin`
- Added popup.html UI/css
- Karma + Jasmine tests

#### Removed
- Removed support for Bridge v1 and chrome extension

# 5.0.10

From this version trezor-connect is used by Trezor Password Manager
