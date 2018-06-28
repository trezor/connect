/* @flow */

import { getPublicKey } from './getPublicKey.spec.js';
import { getAddress } from './getAddress.spec.js';
import { getAddressSegwit } from './getAddressSegwit.spec.js';
import { signMessage } from './signMessage.spec.js';
import { signMessageSegwit } from './signMessageSegwit.spec.js';
import { signTx } from './signTx.spec.js';
import { signTxSegwit } from './signTxSegwit.spec.js';
import { signTxBgold } from './signTxBgold.spec.js';
import { signTxBcash } from './signTxBcash.spec.js';
import { signTxMultisig } from './signTxMultisig.spec.js';
import { verifyMessage } from './verifyMessage.spec.js';
import { verifyMessageSegwit } from './verifyMessageSegwit.spec.js';
import { verifyMessageSegwitNative } from './verifyMessageSegwitNative.spec.js';
import { ethereumGetAddress } from './ethereumGetAddress.spec.js';
import { ethereumSignMessage } from './ethereumSignMessage.spec.js';
import { ethereumSignTx } from './ethereumSignTx.spec.js';
import { ethereumVerifyMessage } from './ethereumVerifyMessage.spec.js';
import { nemGetAddress } from './nemGetAddress.spec.js';
/* export { nemSignTransactionMosaicTests } from './nemSignTransactionMosaic.spec.js';
export { nemSignTransactionMultisigTests } from './nemSignTransactionMultisig.spec.js';
export { nemSignTransactionOthersTests } from './nemSignTransactionOthers.spec.js';
export { nemSignTransactionTransfersTests } from './nemSignTransactionTransfers.spec.js'; */
/* export { stellarGetPublicKeyTests } from './stellarGetPublicKey.spec.js'; */

export default {
    getPublicKey,
    getAddress,
    getAddressSegwit,
    signMessage,
    signMessageSegwit,
    signTx,
    signTxSegwit,
    signTxBgold,
    signTxBcash,
    signTxMultisig,
    verifyMessage,
    verifyMessageSegwit,
    verifyMessageSegwitNative,
    ethereumGetAddress,
    ethereumSignMessage,
    ethereumSignTx,
    ethereumVerifyMessage,
    nemGetAddress,
}
