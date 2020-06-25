import applyFlags from './applyFlags';
import applySettings from './applySettings';
import getAddress from './getAddress';
import getAddressMultisig from './getAddressMultisig';
import getAddressSegwit from './getAddressSegwit';
import getPublicKey from './getPublicKey';
import signTransaction from './signTransaction';
import rippleGetAddress from './rippleGetAddress';
import rippleSignTransaction from './rippleSignTransaction';
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
import ethereumVerifyMessage from './ethereumVerifyMessage';
import getAccountInfo from './getAccountInfo';
import getFeatures from './getFeatures';
import liskGetAddress from './liskGetAddress';
import liskSignMessage from './liskSignMessage';
import liskSignTransaction from './liskSignTransaction';
import liskVerifyMessage from './liskVerifyMessage';
import nemGetAddress from './nemGetAddress';
import nemSignTransactionMosaic from './nemSignTransactionMosaic';
import nemSignTransactionMultisig from './nemSignTransactionMultisig';
import nemSignTransactionOthers from './nemSignTransactionOthers';
import nemSignTransactionTransfer from './nemSignTransactionTransfer';
import signMessage from './signMessage';
import signMessageSegwit from './signMessageSegwit';
import signTransactionBcash from './signTransactionBcash';
import signTransactionBech32 from './signTransactionBech32';
import signTransactionBgold from './signTransactionBgold';
// deprecated: import signTransactionCapricoin from './signTransactionCapricoin';
import signTransactionDash from './signTransactionDash';
import signTransactionDoge from './signTransactionDoge';
import signTransactionKomodo from './signTransactionKomodo';
import signTransactionMultisig from './signTransactionMultisig';
import signTransactionMultisigChange from './signTransactionMultisigChange';
import signTransactionPeercoin from './signTransactionPeercoin';
import signTransactionSegwit from './signTransactionSegwit';
import signTransactionZcash from './signTransactionZcash';
import stellarGetAddress from './stellarGetAddress';
import stellarSignTransaction from './stellarSignTransaction';
import tezosGetAddress from './tezosGetAddress';
import tezosGetPublicKey from './tezosGetPublicKey';
import verifyMessage from './verifyMessage';
import verifyMessageSegwit from './verifyMessageSegwit';
import verifyMessageSegwitNative from './verifyMessageSegwitNative';

let fixtures = [
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
    ethereumVerifyMessage,
    // todo: probably no way todo: FirmwareUpdate.js
    // todo: ripple worker problem
    getAccountInfo,
    getAddress,
    getAddressMultisig,
    getAddressSegwit,
    // todo: missing fixtures: GetDeviceState.js
    getFeatures,
    getPublicKey,
    // todo: missing fixtures: GetSettings.js
    liskGetAddress,
    // todo: missing fixtures: LiskGetPublicKey.js
    liskSignMessage,
    liskSignTransaction,
    liskVerifyMessage,
    // todo: missing fixtures: LoadDevice.js
    nemGetAddress,
    nemSignTransactionMosaic,
    nemSignTransactionMultisig,
    nemSignTransactionOthers,
    nemSignTransactionTransfer,
    // todo: missing fixtures: PushTransaction.js
    // todo: missing fixtures: RecoveryDevice.js
    // todo: missing fixtures: RequestLogin.js
    // todo: missing fixtures: ResetDevice.js
    rippleGetAddress,
    rippleSignTransaction,
    signMessage,
    signMessageSegwit,
    signTransaction,
    signTransactionBcash,
    signTransactionBech32,
    signTransactionBgold,
    signTransactionDash,
    signTransactionDoge,
    signTransactionKomodo,
    signTransactionMultisig,
    signTransactionMultisigChange,
    signTransactionPeercoin,
    signTransactionSegwit,
    signTransactionZcash,
    stellarGetAddress,
    stellarSignTransaction,
    tezosGetAddress,
    tezosGetPublicKey,
    verifyMessage,
    verifyMessageSegwit,
    verifyMessageSegwitNative
    // todo: wipeDevice,
    // todo: resetDevice,
];

// if env variable TESTS_FIRMWARE, filter out those tests that do not match it
const firmware = process.env.TESTS_FIRMWARE;
if (firmware) {
    const [actualMajor, actualMinor, actualPatch] = firmware.split('.');
    fixtures = fixtures.map(f => {
        f.tests = f.tests.filter(t => {
            if (!t.setup || !t.setup.firmware) {
                return true; 
            }
            return t.setup.firmware.some(firmware => {
                const [fromMajor, fromMinor, fromPatch] = firmware[0].split('.');
                const [toMajor, toMinor, toPatch] = firmware[1].split('.');
                return (
                    actualMajor >= fromMajor &&
                    actualMinor >= fromMinor &&
                    actualPatch >= fromPatch &&
                    actualMajor <= toMajor &&
                    actualMinor <= toMinor &&
                    actualPatch <= toPatch
                )
            })
        });
        return f;
    })
    
}

const includedMethods = process.env.TESTS_INCLUDED_METHODS;
const excludedMethods = process.env.TESTS_EXCLUDED_METHODS;
if (includedMethods) {
    const methodsArr = includedMethods.split(',');
    fixtures = fixtures.filter(f => {
        return methodsArr.some(includedM => includedM === f.method);
    });
    
} else if (excludedMethods) {
    const methodsArr = excludedMethods.split(',');
    fixtures = fixtures.filter(f => {
        return !methodsArr.includes(f.method);
    });
}

// sort by mnemonic to avoid emu re-loading
fixtures = fixtures.sort((a,b) => (a.setup.mnemonic > b.setup.mnemonic) ? 1 : ((b.setup.mnemonic > a.setup.mnemonic) ? -1 : 0)); 

console.log('selected fixtures:')
console.log(fixtures);

export default fixtures;
