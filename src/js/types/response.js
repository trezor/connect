/* @flow */

import type {
    CipheredKeyValue,
    Address,
    Features,
    HDNodeResponse,
    MessageSignature,
    Success,
    TransactionInput,
    TransactionOutput,
    SignedTx,
    DebugLinkState,
} from './trezor';

import type { FeeInfo } from './fee';
import type { AccountInfo } from './account';
import type { GetTransactionResponse } from './transactions';

import type { ConnectSettings } from '../data/ConnectSettings';

export type Unsuccessful$ = {
    success: false,
    payload: {
        error: string,
        code?: number,
    },
}

export type BlockchainDisconnect$ = {
    success: true,
    payload: {
        disconnected: true,
    },
} | Unsuccessful$;

export type BlockchainEstimateFee$ = {
    success: true,
    payload: FeeInfo,
} | Unsuccessful$;

export type BlockchainGetTransactions$ = {
    success: true,
    payload: Array<GetTransactionResponse>,
} | Unsuccessful$;

export type BlockchainSubscribe$ = {
    success: true,
    payload: {
        subscribed: boolean,
    },
} | Unsuccessful$;

export type CipherKeyValue$ = {
    success: true,
    payload: CipheredKeyValue,
} | Unsuccessful$;

export type CipherKeyValue$$ = {
    success: true,
    payload: Array<CipheredKeyValue>,
} | Unsuccessful$;

export type CustomMessage$ = {
    success: true,
    payload: any,
} | Unsuccessful$;

export type DebugLinkDecision$ = {
    success: true,
    payload: {
        debugLink: true,
    },
} | Unsuccessful$;

export type DebugLinkGetState$ = {
    success: true,
    payload: DebugLinkState & {
        debugLink: true,
    },
} | Unsuccessful$;

export type ComposeTransaction$ = {
    success: true,
    payload: SignedTx,
} | Unsuccessful$;

// copy/paste from hd-wallet/buildTx
export type PrecomposedTransaction = {
    type: 'error',
    error: string,
} | {
    type: 'nonfinal',
    max: string,
    totalSpent: string, // all the outputs, no fee, no change
    fee: string,
    feePerByte: string,
    bytes: number,
} | {
    type: 'final',
    max: string,
    totalSpent: string, // all the outputs, no fee, no change
    fee: string,
    feePerByte: string,
    bytes: number,
    transaction: {
        inputs: TransactionInput[],
        outputs: TransactionOutput[],
    },
}

export type ComposeTransaction$$ = {
    success: true,
    payload: PrecomposedTransaction[],
} | Unsuccessful$;

// response for getAccountInfo method

// copy from hd-wallet
export type Utxo = {
    index: number, // index of output IN THE TRANSACTION
    transactionHash: string, // hash of the transaction
    value: number, // how much money sent
    addressPath: [number, number], // path
    height: ?number, // null == unconfirmed
    coinbase: boolean,
    tsize: number, // total size - in case of segwit, total, with segwit data
    vsize: number, // virtual size - segwit concept - same as size in non-segwit
    own: boolean,
};

export type AccountInfoPayload = {
    id: number,
    path: Array<number>,
    serializedPath: string,
    xpub: string,
    xpubSegwit?: ?string,
    address: string,
    addressIndex: number,
    addressPath: Array<number>,
    addressSerializedPath: string,
    balance: string,
    confirmed: string,
    transactions: number,
    utxo: Array<Utxo>,
    usedAddresses: Array<{
        address: string,
        received: string,
    }>,
    unusedAddresses: Array<string>,
}

export type GetAccountInfo$ = {
    success: true,
    payload: AccountInfo,
} | Unsuccessful$;

export type GetAccountInfo$$ = {
    success: true,
    payload: Array<AccountInfo | null>,
} | Unsuccessful$;

export type GetAddress$ = {
    success: true,
    payload: Address,
} | Unsuccessful$;

export type GetAddress$$ = {
    success: true,
    payload: Array<Address>,
} | Unsuccessful$;

export type GetDeviceState$ = {
    success: true,
    payload: {
        state: string,
    },
} | Unsuccessful$;

export type GetFeatures$ = {
    success: true,
    payload: Features,
} | Unsuccessful$;

export type GetPublicKey$ = {
    success: true,
    payload: HDNodeResponse,
} | Unsuccessful$;

export type GetPublicKey$$ = {
    success: true,
    payload: Array<HDNodeResponse>,
} | Unsuccessful$;

export type PushTransaction$ = {
    success: true,
    payload: {
        txid: string,
    },
} | Unsuccessful$;

export type RequestLogin$ = {
    success: true,
    payload: {
        address: string,
        publicKey: string,
        signature: string,
    },
} | Unsuccessful$;

export type ResetDevice$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type SignMessage$ = {
    success: true,
    payload: MessageSignature,
} | Unsuccessful$;

export type SignTransaction$ = {
    success: true,
    payload: SignedTx,
} | Unsuccessful$;

export type VerifyMessage$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type WipeDevice$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type GetSettings$ = {
    success: true,
    payload: ConnectSettings,
} | Unsuccessful$;

export type ApplyFlags$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type ApplySettings$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type BackupDevice$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type ChangePin$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type FirmwareRequest$ = {
    length: number,
    offset: number,
}
export type FirmwareUpload$ = {
    success: true,
    payload: Success,
} | FirmwareRequest$ | Unsuccessful$;

export type RecoveryDevice$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;
