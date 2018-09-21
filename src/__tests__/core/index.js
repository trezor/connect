/* @flow */

import type {
    AvailableTestFunctions,
} from 'flowtype/tests';

import { cardanoGetAddress } from './cardanoGetAddress.spec.js';
import { cardanoGetPublicKey } from './cardanoGetPublicKey.spec.js';
import { cardanoSignTransaction } from './cardanoSignTransaction.spec.js';
import { getPublicKey } from './getPublicKey.spec.js';
import { getAddress } from './getAddress.spec.js';
import { getAddressSegwit } from './getAddressSegwit.spec.js';
import { signMessage } from './signMessage.spec.js';
import { signMessageSegwit } from './signMessageSegwit.spec.js';
import { signTransaction } from './signTransaction.spec.js';
import { signTransactionSegwit } from './signTransactionSegwit.spec.js';
import { signTransactionBgold } from './signTransactionBgold.spec.js';
import { signTransactionBcash } from './signTransactionBcash.spec.js';
import { signTransactionMultisig } from './signTransactionMultisig.spec.js';
import { signTransactionMultisigChange } from './signTransactionMultisigChange.spec.js';
import { verifyMessage } from './verifyMessage.spec.js';
import { verifyMessageSegwit } from './verifyMessageSegwit.spec.js';
import { verifyMessageSegwitNative } from './verifyMessageSegwitNative.spec.js';
import { ethereumGetAddress } from './ethereumGetAddress.spec.js';
import { ethereumSignMessage } from './ethereumSignMessage.spec.js';
import { ethereumSignTransaction } from './ethereumSignTransaction.spec.js';
import { ethereumVerifyMessage } from './ethereumVerifyMessage.spec.js';
import { getAccountInfo } from './getAccountInfo.spec.js';
import { nemGetAddress } from './nemGetAddress.spec.js';
import { nemSignTransactionMosaic } from './nemSignTransactionMosaic.spec.js';
import { nemSignTransactionMultisig } from './nemSignTransactionMultisig.spec.js';
import { nemSignTransactionOthers } from './nemSignTransactionOthers.spec.js';
import { nemSignTransactionTransfers } from './nemSignTransactionTransfers.spec.js';
import { passphrase } from './passphrase.spec.js';
import { liskGetAddress } from './liskGetAddress.spec.js';
import { liskSignMessage } from './liskSignMessage.spec.js';
import { liskVerifyMessage } from './liskVerifyMessage.spec.js';
import { liskSignTransaction } from './liskSignTransaction.spec.js';
import { rippleGetAddress } from './rippleGetAddress.spec.js';
import { rippleSignTransaction } from './rippleSignTransaction.spec.js';

export const testFunctions: AvailableTestFunctions = {
    cardanoGetAddress,
    cardanoGetPublicKey,
    cardanoSignTransaction,
    getPublicKey,
    getAddress,
    getAddressSegwit,
    signMessage,
    signMessageSegwit,
    signTransaction,
    signTransactionSegwit,
    signTransactionBgold,
    signTransactionBcash,
    signTransactionMultisig,
    signTransactionMultisigChange,
    verifyMessage,
    verifyMessageSegwit,
    verifyMessageSegwitNative,
    ethereumGetAddress,
    ethereumSignMessage,
    ethereumSignTransaction,
    ethereumVerifyMessage,
    getAccountInfo,
    nemGetAddress,
    nemSignTransactionMosaic,
    nemSignTransactionMultisig,
    nemSignTransactionOthers,
    nemSignTransactionTransfers,
    passphrase,
    liskGetAddress,
    liskSignMessage,
    liskVerifyMessage,
    liskSignTransaction,
    rippleGetAddress,
    rippleSignTransaction,
};
