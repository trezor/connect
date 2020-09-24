# 8.1.15 (unreleased)

### Fixed
- `TrezorConnect.cancel` method called during Pin/Passphrase/Word requests.

### Changed
- Removed timestamp from iframe URL.
- Updated dependencies.

# 8.1.14

### Changed
- Added 1.9.3/2.3.3 firmware releases.
- Updated coins.json and protobuf messages.

# 8.1.13

### Fixed
- Exclude `tXRP` from backend verification (There is no rippled setting that defines which network it uses neither mainnet or testnet, see: https://xrpl.org/parallel-networks.html).
- Initial `GetFeatures` message called on bootloader below 1.4.0.
- Cardano double passphrase prompt.
- Validation of `FeeLevel.feePerUnit` loaded from the backend (`blockchainEstimateFee` method).
- `showOnTrezor` parameter for `ethereumGetPublicKey`. 

### Added
- `showOnTrezor` parameter for `getPublicKey` method.

# 8.1.12

#### Added
- Public `getCoinInfo` method.
- iframe errors (timeout/blocked) displayed in popup.

#### Fixed
- `interactionTimeout` moved to a lower block in code.
- `composeTransaction` filter `max = -1` field from the result.
- Skip device state verification on device management methods.

#### Changed
- Using `blockchainSetCustomBackend` method with an empty array of URLs will disable custom backends (reset to default).
- Blockbook will verify that it is connecting to the right coin backend or it will throw an error.
- Don't try to validate multisig output scripts (not implemented yet).

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

#### Removed
- Unnecessary error wrapper (core.js)
- Standalone `firmwareErase` and `firmwareUpload` methods.

# 8.0.5 (server side only)

#### Fixed
- `disconnect`-`method response` race condition
- `getAccountInfo` runtime error when using descriptor without path
- Firmware releases channel (beta-wallet)

# 8.0.4 (server side only)

#### Added
- Unobtanium support

#### Fixed
- `pendingTransport` race condition using lazyLoading and multiple devices connected
- simplified `Core` error rejection
- `BNB` firmware range

#### Updated
- coins.json

# 8.0.3

#### Added
- Binance Chain (BNB) support

#### Fixed
- `TrezorConnect.cancel` race condition between device release and returned response

#### Updated
- protobuf messages
- firmware releases

# 8.0.2

#### Added
- `Device.Features.features` field

#### Changed
- `CoinInfo.blockchainLink` field generated from `coins.json:blockbook` for BTC-like and ETH-like

#### Updated
- supported coins
- protobuf messages

# 8.0.1

#### Added
- `TrezorConnect.disableWebUSB` method

#### Changed
- renamed EOS actions parameters 'buyram': quantity > quant, 'voteproducer': data.account > data.voter

# 8.0.0

#### Breaking changes
- Changed communication process between host, iframe and popup. BroadcastChannel is used as default, postMessage as fallback
- Completely rewritten backend layer. Old way using hd-wallet and bitcore/blockbook-api-v1 is dropped in favour of `@trezor/blockchain-link`
- `BigInteger` support for Bitcoin transactions using `@trezor/utxo-lib` and `hd-wallet@bigint`
- `TrezorConnect.rippleGetAccountInfo` and `TrezorConnect.ethereumGetAccountInfo` merged to `TrezorConnect.getAccountInfo`
- `TrezorConnect.getAccountInfo` parameters

#### Added
- nodejs support
- `lazyLoad` parameter to `TrezorConnect.init`
- bech32 accounts support
- Webextension usb permissions iframe dynamically included into html
- correct `script_type` to `TransactionInput` and `TransactionOutput` of Bitcoin-like TxRequest protobuf message
- signed transaction validation for Bitcoin `signTransaction` and `composeTransaction` methods
- shamir recovery

# 7.0.5

#### Added
- Cloudfront cache invalidation

#### Fixed
- Url encoding in `TrezorConnect.manifest`

# 7.0.4

#### Added
- EOS methods `TrezorConnect.eosGetPublicKey` and `TrezorConnect.eosSignTransaction`
- `TrezorConnect.firmwareUpdate` (management method)
- New firmware releases
- New bridge releases

#### Fixed
- Dependencies security vulnerabilities
- Minor fixes in flowtype and tests

# 7.0.3

#### Added
- Management methods `applyFlags`, `applySettings`, `backupDevice`, `changePin`, `firmwareErase`, `firmwareUpload`, `recoveryDevice`

# 7.0.2

#### Added
- Missing params to `TrezorConnect.signTransaction` method [`version`, `expiry`, `overwintered`, `versionGroupId`, `branchId`, `refTxs`]
- Possibility to use `TrezorConnect.signTransaction` without build-in backend (using `refTxs` field)
- `TrezorConnect.getSettings` method

#### Fixed
- Dash and Zcash special transactions
- `EthereumGetAddress` address validation
- Flowtype for `CardanoInput`

# 7.0.1

#### Added
- `TrezorConnect.manifest` method
- DebugLink (emulator) support: `TrezorConnect.debugLinkDecision` and `TrezorConnect.debugLinkGetState` methods
- `TrezorConnect.ethereumGetPublicKey` method (with fallback for older firmware)
- `TrezorConnect.loadDevice` method
- `Capricoin` support (with required changes in `hd-wallet` and `bitcoinjs-lib-zcash` libs)
- `firmwareRange` to every method (validation if device FW is in range: `min_required_firmware` - `max_compatible_firmware` declared in config.json)
- Conditional protobuf messages (fallback for older FW)
- "device not backed up" confirmation
- `blockchain-link` dependency
- `TrezorConnect.rippleGetAccountInfo` method
- `TrezorConnect.blockchainGetFee` method
- `TrezorConnect.blockchainUnsubscribe` method
- `BlockchainEvent` (connect/error/block/notification)

#### Changed
- Upgrade npm modules (babel@7)
- `network` for `protocol_magic` in `TrezorConnect.cardanoSignTransaction` method

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
- `TrezorConnect.tezosGetAddress` method
- `TrezorConnect.tezosGetPublicKey` method
- `TrezorConnect.tezosSignTransaction` method
- `TrezorConnect.dispose` method
- `TrezorConnect.cancel` method
- new firmware releases
- new bridge releases

#### Changed
- Whitelist `trusted` mode for instances hosted locally
- Send correct `script_type` in `GetPublicKey` message

#### Fixed
- Stellar signTransaction amount validation
- Stellar signer field validation ("StellarSetOptionsOp" operation in "stellarSignTransaction" method)
- Firmware (model) not supported popup screen

# 6.0.2

#### Added
- `TrezorConnect.wipeDevice` method
- `TrezorConnect.resetDevice` method

#### Changed
- Calling method on device with seedless setup is disabled by default
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
- `TrezorConnect.pushTransaction` method with ethereum blockbook support
- `TrezorConnect.ethereumGetAccountInfo` method
- `TrezorConnect.blockchainSubscribe` method
- `TrezorConnect.blockchainDisconnect` method
- `BLOCKCHAIN` events
- `./data/bridge/releases.json`
- Bridge release info in TRANSPORT.START and TRANSPORT.ERROR event

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
- `TrezorConnect.cardanoGetPublicKey` method
- Ability to sign hexed ethereum message
- `network` parameter to `TrezorConnect.cardanoSignTransaction` method

#### Fixed
- TRANSPORT.ERROR event when computer goes to sleep
- finding backend by name instead of urls
- proper FW version for Lisk and Stellar

#### Removed
- `TrezorConnect.cardanoSignMessage` method
- `TrezorConnect.cardanoVerifyMessage` method

# 5.0.31

#### Added
- Support for Cardano
- Support for Ripple
- Support for Lisk
- Exception for not supported firmware when value for "trezor1" or "trezor2" inside coins.json is not set
- Disable customMessage method for devices with official firmware
- New field in `TrezorConnect.signEthereumTransaction` for `Wanchain`

#### Changed
- Separate "getPublicKey" and "getAddress" methods for all coins

#### Fixed
- Device state verification while using multiple instances with the same passphrase
- ConnectSettings sensitive settings verification in DataManager
- removed package-lock.json from repository

# 5.0.30

#### Added
- 'send-max' and 'opreturn' output types to `TrezorConnect.composeTransaction`

#### Fixed
- Handle popup close event while waiting for iframe handshake
- Removed ledgerVersion (`protocol_version`) from StellarSignTransaction method
- One time permissions stored in session in application variable
- `TrezorConnect.ethereumSignTransaction` recompute "v" value if Trezor returns value in range [0,1]
- Webextensions: Handling if popup is called from "normal" window or extension popup
- ConnectSetting default domain

# 5.0.29

#### Fixed
- flowtype for TrezorConnect methods (bundled methods return bundled results)
- renderWebUSBButton method

#### Removed
- "babel-polyfill" from npm and export unminified script https://connect.trezor.io/5/trezor-connect.js

#### Changed
- https://connect.trezor.io/5/trezor-connect.min.js to export with bundled "babel-polyfill"
- Web extensions: open popup tab next to currently used tab

# 5.0.28

#### Added
- Support for WebExtensions (Chrome/Firefox)
- Host icon for whitelisted domains

#### Fixed
- Passphrase input type (revert to password type)
- Popup and iframe timeout handling

# 5.0.27

#### Fixed
- Handling not initialized iframe
- Iframe ad-blocker handling
- Popup views

#### Changed
- Popup as new tab

# 5.0.26

#### Added
- Support for Dogecoin and Vertcoin

#### Fixed
- Handling not initialized device
- SignTransaction: amount as string
- Handle origin of file://

#### Changed
- Default url in connect

# 5.0.25

#### Added
- Documentation

#### Fixed
- filter UI events for popup and trusted apps
- `TrezorConnect.signMessage` and `TrezorConnect.verifyMessage` signature to base64 format

#### Changed
- constants prefix from `__` to `-`

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
- `TrezorConnect.pushTransaction` method
- bundle parameters in `TrezorConnect.cipherKeyValue` method
- bundle parameters in `TrezorConnect.getPublicKey` method
- bundle parameters in `TrezorConnect.getAddress` method
- bundle parameters in `TrezorConnect.ethereumGetAddress` method
- bundle parameters in `TrezorConnect.nemGetAddress` method
- bundle parameters in `TrezorConnect.stellarGetAddress` method
- type conversion from stellar-sdk to protobuf in `TrezorConnect.stellarSignTransaction` method
- Popup warning with outdated firmware and outdated bridge
- Tests with emulator
- '@babel/runtime' to package dependency

#### Fixed
- Device authentication and popup open delay
- Minor fixes in popup view
- Ethereum methods accepts values with '0x' prefix
- Ethereum methods returns checksummed addresses (with different checksum typ for RSK network)
- Ethereum methods returns values prefixed with '0x'

# 5.0.20

#### Added
- Firmware check against CoinInfo.support values
- Outdate firmware warning in popup

#### Fixed
- `TrezorConnect.requestLogin` parameters
- Race condition in `UI.REQUEST_CONFIRMATION`
- `popup.html` buttons click

# 5.0.18

#### Added
- iframe lazy loading

#### Fixed
- Build script for npm module
- Ultimate flow type
- Reorganized files and imports
- Minor fixes in code

# 5.0.17

#### Added
- `TrezorConnect.getAccountInfo` method
- `TrezorConnect.signTransaction` method
- `TrezorConnect.composeTransaction` method
- `TrezorConnect.signMessage` method
- `TrezorConnect.verifyMessage` method
- `TrezorConnect.getAddress` method
- `TrezorConnect.requestLogin` method
- cashaddr support for BCH
- documentation

#### Fixed
- `TrezorConnect.customMessage` logic and security
- `TrezorConnect.stellarSignTransaction` parameters compatible with "js-stellar-base"
- flowtype declarations for all methods. Params and responses

#### Removed
- unnecessary settings from ConnectSettings
- unused methods from TrezorConnect

# 5.0.16

#### Added
- `TrezorConnect.stellarSignTransaction` method

#### Changed
- `TrezorConnect.ethereumSignTransaction` parameters

#### Removed
- type and event fields from RESPONSE

# 5.0.15

#### Fixed
- Library exports

# 5.0.14

#### Added
- `TrezorConnect.nemGetAddress` method
- `TrezorConnect.nemSignTransaction` method
- `TrezorConnect.stellarGetAddress` method
- `TrezorConnect.customMessage` method

#### Fixed
- flowtype

# 5.0.13

#### Added
- messages from json instead of `config_signed.bin`
- popup.html UI/css
- Karma + Jasmine tests

#### Removed
- support for Bridge v1 and chrome extension

# 5.0.10

From this version trezor-connect is used by Trezor Password Manager
