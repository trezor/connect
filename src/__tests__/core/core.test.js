import 'babel-polyfill';
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { getPublicKeyTests } from './getPublicKey.spec.js';
import { getAddressTests } from './getAddress.spec.js';
import { getAddressSegwitTests } from './getAddressSegwit.spec.js';
import { signMessageTests } from './signMessage.spec.js';
import { signMessageSegwitTests } from './signMessageSegwit.spec.js';
import { signTxTests } from './signTx.spec.js'
import { verifyMessageTests } from './verifyMessage.spec.js';
import { verifyMessageSegwitTests } from './verifyMessageSegwit.spec.js';
import { verifyMessageSegwitNativeTests } from './verifyMessageSegwitNative.spec.js';
import { ethereumGetAddressTests } from './ethereumGetAddress.spec.js';
import { ethereumSignMessageTests } from './ethereumSignMessage.spec.js';
import { ethereumSignTxTests } from './ethereumSignTx.spec.js';
import { ethereumVerifyMessageTests } from './ethereumVerifyMessage.spec.js';
import { nemGetAddressTests } from './nemGetAddress.spec.js';
/* import { nemSignTransactionMosaicTests } from './nemSignTransactionMosaic.spec.js';
import { nemSignTransactionMultisigTests } from './nemSignTransactionMultisig.spec.js';
import { nemSignTransactionOthersTests } from './nemSignTransactionOthers.spec.js';
import { nemSignTransactionTransfersTests } from './nemSignTransactionTransfers.spec.js'; */
/* import { stellarGetPublicKeyTests } from './stellarGetPublicKey.spec.js'; */


const testFunctions = {
    getPublicKey: getPublicKeyTests,
    getAddress: getAddressTests,
    getAddressSegwit: getAddressSegwitTests,
    signMessage: signMessageTests,
    signMessageSegwit: signMessageSegwitTests,
    signTx: signTxTests,
    verifyMessage: verifyMessageTests,
    verifyMessageSegwit: verifyMessageSegwitTests,
    verifyMessageSegwitNative: verifyMessageSegwitNativeTests,
    ethereumGetAddress: ethereumGetAddressTests,
    ethereumSignMessage: ethereumSignMessageTests,
    ethereumSignTx: ethereumSignTxTests,
    ethereumVerifyMessage: ethereumVerifyMessageTests,
    nemGetAddress: nemGetAddressTests,
    /* nemSignTransactionMosaic: nemSignTransactionMosaicTests,
    nemSignTransactionMultisig: nemSignTransactionMultisigTests,
    nemSignTransactionOthers: nemSignTransactionOthersTests,
    nemSignTransactionTransfers: nemSignTransactionTransfersTests, */
    /* stellarGetPublicKey: stellarGetPublicKeyTests, */

};

const testToRun = __karma__.config.test;

describe(`Testing method`, () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 250000;
    testFunctions[testToRun]();
});
