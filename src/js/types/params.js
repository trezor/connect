/* @flow */

import type {
    Transaction as EthereumTransaction
} from './ethereum';

import type {
    Transaction as NEMTransaction
} from './nem';

import type {
    Transaction as StellarTransaction
} from './stellar';

import type {
    TransactionInput,
    TransactionOutput
} from './trezor';

declare type $Common = {
    device?: {
        path: string;
        instance?: ?number;
        state?: ?string;
    },
    useEmptyPassphrase?: boolean;
    keepSession?: boolean;
}

declare type $Path = string | Array<number>;

type $CipherKeyValueBatch = {
    path: $Path;
    key?: string;
    value?: string;
    encrypt?: boolean;
    askOnEncrypt?: boolean;
    askOnDecrypt?: boolean;
    iv?: string;
}

export type $CipherKeyValue = $Common & $CipherKeyValueBatch | $Common & { bundle: Array<$CipherKeyValueBatch> }

export type $CustomMessage = $Common & {
    messages?: JSON;
    message: string;
    params: JSON;
    callback: (request: any) => Promise<?{ message: string, params?: Object }>;
}

type ComposeTransactionOutput = {
    type: 'complete',
    address: string,
    amount: number, // in satoshis
} | {
    type: 'send-max', // only one in TX request
    address: string,
} | {
    type: 'opreturn', // this is misnomer, since it doesn't need to have address
    dataHex: string,
} | {
    type: 'noaddress',
    amount: number,
} | {
    type: 'send-max-noaddress',
}

export type $ComposeTransaction = $Common & {
    outputs: Array<ComposeTransactionOutput>;
    coin: string;
}

export type $EthereumGetAddress = $Common & {
    path: $Path;
    showOnTrezor?: boolean;
}

export type $EthereumSignMessage = $Common & {
    path: $Path;
    message: string;
}

export type $EthereumSignTransaction = $Common & {
    path: $Path;
    transaction: EthereumTransaction;
}

export type $EthereumVerifyMessage = $Common & {
    address: string;
    message: string;
    signature: string;
}

export type $GetAccountInfo = $Common & {
    path?: $Path;
    xpub?: string;
    coin: string;
}

export type $GetAddress = $Common & {
    path: $Path;
    coin?: string;
    showOnTrezor?: boolean;
}

export type $GetDeviceState = $Common;

export type $GetFeatures = $Common;

export type $GetPublicKey = $Common & {
    path: $Path;
    coin?: string;
}

export type $RequestLogin = $Common & {
   challengeHidden?: string;
   challengeVisible?: string;
   asyncChallenge?: boolean;
   callback?: () => Promise<?{ hidden: string, visual: string}>;
}

export type $NEMGetAddress = $Common & {
    path: $Path;
    network: number;
    showOnTrezor?: boolean;
}

export type $NEMSignTransaction = $Common & {
    path: $Path;
    transaction: NEMTransaction;
}

export type $SignMessage = $Common & {
    path: $Path;
    coin: string;
    message: string;
}

export type $SignTransaction = $Common & {
    inputs: Array<TransactionInput>;
    outputs: Array<TransactionOutput>;
    coin: string;
}

export type $StellarGetAddress = $Common & {
    path: $Path;
    showOnTrezor?: boolean;
}

export type $StellarSignTransaction = $Common & {
    path?: $Path;
    ledgerVersion?: number;
    networkPassphrase?: string;
    transaction: StellarTransaction;
}

export type $VerifyMessage = $Common & {
    address: string;
    coin: string;
    message: string;
    signature: string;
}
