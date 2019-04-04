/* @flow */

import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction,
    DebugLinkDecision,
} from './trezor';

export type $BlockchainDisconnect = {
    coin: string,
}

export type $BlockchainEstimateFee = {
    coin: string,
}

export type $BlockchainSubscribe = {
    accounts: Array<any>,
    coin: string,
}

export type $Common = {
    device?: {
        path: string,
        instance?: ?number,
        state?: ?string,
    },
    useEmptyPassphrase?: boolean,
    allowSeedlessDevice?: boolean,
    keepSession?: boolean,
}

export type $Path = string | Array<number>;

export type $CipherKeyValue = {
    path: $Path,
    key?: string,
    value?: string,
    encrypt?: boolean,
    askOnEncrypt?: boolean,
    askOnDecrypt?: boolean,
    iv?: string,
}

type ComposeTransactionOutput = {|
    amount: string,
    address: string,
|} | {|
    type: 'send-max',
    address: string,
|} | {|
    type: 'opreturn',
    dataHex: string,
|};

export type $ComposeTransaction = $Common & {
    outputs: Array<ComposeTransactionOutput>,
    coin: string,
    push?: boolean,
}

export type $CustomMessage = $Common & {
    messages?: JSON,
    message: string,
    params: JSON,
    callback: (request: any) => Promise<?{ message: string, params?: Object }>,
}

export type $DebugLinkDecision = DebugLinkDecision & {
    device: {
        path: string,
    },
}

export type $DebugLinkGetState = {
    device: {
        path: string,
    },
}

export type $GetAccountInfo = $Common & {
    path?: $Path,
    xpub?: string,
    coin: string,
}

export type $GetAddress = {|
    path: $Path,
    address?: string,
    coin?: string,
    showOnTrezor?: boolean,
    crossChain?: boolean,
|};

export type $GetDeviceState = $Common;

export type $GetFeatures = $Common;

export type $GetPublicKey = {
    path: $Path,
    coin?: string,
    crossChain?: boolean,
}

export type $PushTransaction = $Common & {
    tx: string,
    coin: string,
};

export type $RequestLogin = $Common & $Exact<{
    challengeHidden: string,
    challengeVisual: string,
}> | $Common & $Exact<{
    callback: () => Promise<?{ challengeHidden: string, challengeVisual: string}>,
}>

export type $ResetDevice = $Common & {
    displayRandom?: boolean,
    strength?: number,
    passphraseProtection?: boolean,
    pinProtection?: boolean,
    language?: string,
    label?: string,
    u2fCounter?: number,
    skipBackup?: boolean,
    noBackup?: boolean,
};

export type $SignMessage = $Common & {
    path: $Path,
    coin: string,
    message: string,
}

export type $SignTransaction = $Common & {
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    refTxs?: Array<RefTransaction>,
    coin: string,
    locktime?: number,
    timestamp?: number,
    version?: number,
    expiry?: number,
    overwintered?: boolean,
    versionGroupId?: number,
    branchId?: number,
    push?: boolean,
}

export type $VerifyMessage = $Common & {
    address: string,
    coin: string,
    message: string,
    signature: string,
}

export type $WipeDevice = $Common;
