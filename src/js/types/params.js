/* @flow */

import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction,
    DebugLinkDecision,
} from './trezor';
import type { AccountAddresses, AccountUtxo } from './account';

export type $BlockchainDisconnect = {|
    coin: string,
|}

export type $BlockchainEstimateFee = {|
    coin: string,
    request?: {
        blocks?: number[],
        specific?: {
            conservative?: boolean, // btc
            txsize?: number, // btc transaction size
            from?: string, // eth from
            to?: string, // eth to
            data?: string, // eth tx data
        },
        feeLevels?: 'preloaded' | 'smart',
    },
|}

export type SubscriptionAccountInfo = {
    descriptor: string,
    addresses?: AccountAddresses, // bitcoin addresses
}

export type $BlockchainGetTransactions = {|
    coin: string,
    txs: string[],
|}

export type $BlockchainSubscribe = {|
    coin: string,
    accounts: SubscriptionAccountInfo[],
|}

export type $Common = {|
    device?: {
        path: string,
        instance?: ?number,
        state?: ?string,
    },
    useEmptyPassphrase?: boolean,
    allowSeedlessDevice?: boolean,
    keepSession?: boolean,
    skipFinalReload?: boolean,
|}

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
|} | {|
    type: 'noaddress',
    amount: string,
|} | {|
    type: 'send-max-noaddress',
|};

export type $ComposeTransaction = {|
    outputs: Array<ComposeTransactionOutput>,
    coin: string,
    push?: boolean,
|}

export type $$ComposeTransaction = {|
    outputs: Array<ComposeTransactionOutput>,
    coin: string,
    account: {
        path: string,
        addresses: AccountAddresses,
        utxo: AccountUtxo[],
    },
    feeLevels: {
        feePerUnit: string,
    }[],
|}

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

export type $DebugLinkGetState = {|
    device: {
        path: string,
    },
|}

export type $GetAccountInfo = $Common & {
    coin: string,
    path?: string,
    descriptor?: string,
    details?: 'basic' | 'txs',
    tokens?: 'nonzero' | 'used' | 'derived',
    page?: number,
    pageSize?: number,
    from?: number,
    to?: number,
    contractFilter?: string,
    gap?: number,
    marker?: {
        ledger: number,
        seq: number,
    },
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

export type $ApplyFlags = $Common & {
    flags: number,
};

export type $ApplySettings = $Common & {
    language?: string,
    label?: string,
    use_passphrase?: boolean,
    homescreen?: string,
    passhprase_source: number, // todo: enum [0, 1, 2] // ask, device, host
    auto_lock_delay?: number,
    display_rotation?: 0 | 90 | 180 | 270,
};

export type $BackupDevice = $Common;

export type $ChangePin = $Common & {
    remove?: boolean,
}

export type $FirmwareUpload = $Common & {
    payload: string,
    hash?: string,
}

export type $RecoveryDevice = $Common & {
    word_count?: 12 | 18 | 24,
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    language?: string,
    enforce_wordlist?: boolean,
    type?: 0 | 1,
    u2f_counter?: number,
    dry_run?: number,
}
