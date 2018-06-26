import 'babel-polyfill';
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { getPublicKey } from './getPublicKey.spec.js';
import { getAddress } from './getAddress.spec.js';
import { getAddressSegwit } from './getAddressSegwit.spec.js';
import { signMessage } from './signMessage.spec.js';
import { signMessageSegwit } from './signMessageSegwit.spec.js';
import { signTx } from './signTx.spec.js';
import { signTxSegwit } from './signTxSegwit.spec.js';
import { signTxBgold } from './signTxBgold.spec.js';
import { signTxBcash } from './signTxBcash.spec.js';
import { verifyMessage } from './verifyMessage.spec.js';
import { verifyMessageSegwit } from './verifyMessageSegwit.spec.js';
/* import { verifyMessageSegwitNative } from './verifyMessageSegwitNative.spec.js'; */
import { ethereumGetAddress } from './ethereumGetAddress.spec.js';
import { ethereumSignMessage } from './ethereumSignMessage.spec.js';
import { ethereumSignTx } from './ethereumSignTx.spec.js';
import { ethereumVerifyMessage } from './ethereumVerifyMessage.spec.js';
import { nemGetAddress } from './nemGetAddress.spec.js';
/* import { nemSignTransactionMosaicTests } from './nemSignTransactionMosaic.spec.js';
import { nemSignTransactionMultisigTests } from './nemSignTransactionMultisig.spec.js';
import { nemSignTransactionOthersTests } from './nemSignTransactionOthers.spec.js';
import { nemSignTransactionTransfersTests } from './nemSignTransactionTransfers.spec.js'; */
/* import { stellarGetPublicKeyTests } from './stellarGetPublicKey.spec.js'; */


const testFunctions = {
    getPublicKey,
    getAddress,
    getAddressSegwit,
    signMessage,
    signMessageSegwit,
    signTx,
    signTxSegwit,
    signTxBgold,
    signTxBcash,
    verifyMessage,
    verifyMessageSegwit,
    /* verifyMessageSegwitNative, */
    ethereumGetAddress,
    ethereumSignMessage,
    ethereumSignTx,
    ethereumVerifyMessage,
    nemGetAddress,
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
