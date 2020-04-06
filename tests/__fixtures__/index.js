import applyFlags from './applyFlags';
import applySettings from './applySettings';
import getAddress from './getAddress';
import getPublicKey from './getPublicKey';
import signTransaction from './signTransaction';
import rippleGetAddress from './rippleGetAddress';
import binanceSignTransaction from './binanceSignTransaction';
// import wipeDevice from './wipeDevice';
// import resetDevice from './resetDevice';
import cardanoGetAddress from './cardanoGetAddress';
import cardanoGetPublicKey from './cardanoGetPublicKey';
import cardanoSignTransaction from './cardanoSignTransaction';
import eosGetPublicKey from './eosGetPublicKey';
import eosSignTransaction from './eosSignTransaction';

export default [
    applyFlags,
    applySettings,
        // // BackupDevice.js
    // // BinanceGetAddress.js
    // // BinanceGetPublicKey.js
    binanceSignTransaction,
    cardanoGetAddress,
    cardanoGetPublicKey,
    cardanoSignTransaction,
        // // ChangePin.js
        // // CipherKeyValue.js
        // // ComposeTransaction.js
        // // CustomMessage.js
    eosGetPublicKey,
    eosSignTransaction,
    // // EthereumGetAddress.js
    // // EthereumGetPublicKey.js
    // // EthereumSignMessage.js
    // // EthereumSignTransaction.js
    // // EthereumVerifyMessage.js
    // // FirmwareUpdate.js
    // // GetAccountInfo.js
    getAddress,
    // // GetDeviceState.js
    // // GetFeatures.js
    getPublicKey,
    // // GetSettings.js
    // // LiskGetAddress.js
    // // LiskGetPublicKey.js
    // // LiskSignMessage.js
    // // LiskSignTransaction.js
    // // LiskVerifyMessage.js
    // // LoadDevice.js
    // // NEMGetAddress.js
    // // NEMSignTransaction.js
    // // PushTransaction.js
    // // RecoveryDevice.js
    // // RequestLogin.js
    // // ResetDevice.js
    rippleGetAddress,
    // // RippleSignTransaction.js
    // // SignMessage.js
    signTransaction,
    // // StellarGetAddress.js
    // // StellarSignTransaction.js
    // // TezosGetAddress.js
    // // TezosGetPublicKey.js
    // // TezosSignTransaction.js
    // // VerifyMessage.js
    // wipeDevice, // some error, will solve later
    // // resetDevice, // socket hangup, what? fix
];
