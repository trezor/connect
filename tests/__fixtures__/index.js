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
import ethereumGetAddress from './ethereumGetAddress';
import ethereumGetPublicKey from './ethereumGetPublicKey';
import ethereumSignMessage from './ethereumSignMessage';
import ethereumSignTransaction from './ethereumSignTransaction';

const fixtures = [
    applyFlags,
    applySettings,
    // todo: missing fixtures: BackupDevice.js
    // todo: missing fixtures: BinanceGetAddress.js
    // todo: missing fixtures: BinanceGetPublicKey.js
    binanceSignTransaction,
    cardanoGetAddress,
    cardanoGetPublicKey,
    cardanoSignTransaction,
    // todo: missing fixtures: ChangePin.js
    // todo: missing fixtures: CipherKeyValue.js
    // todo: missing fixtures: ComposeTransaction.js
    // todo: missing fixtures: CustomMessage.js
    eosGetPublicKey,
    eosSignTransaction,
    ethereumGetAddress,
    ethereumGetPublicKey,
    ethereumSignMessage,
    ethereumSignTransaction,
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
    // // // resetDevice, // socket hangup, what? fix
].sort((a,b) => (a.setup.mnemonic > b.setup.mnemonic) ? 1 : ((b.setup.mnemonic > a.setup.mnemonic) ? -1 : 0)); 

export default fixtures;
