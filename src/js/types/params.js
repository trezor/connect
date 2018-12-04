/* @flow */

import type {
    MultisigRedeemScriptType,
} from './trezor';

export type $BlockchainDisconnect = {
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

export type $ComposeTransaction = $Common & {
    outputs: Array<{ amount: string, address: string }>,
    coin: string,
    push?: boolean,
}

export type $CustomMessage = $Common & {
    messages?: JSON,
    message: string,
    params: JSON,
    callback: (request: any) => Promise<?{ message: string, params?: Object }>,
}

export type $GetAccountInfo = $Common & {
    path?: $Path,
    xpub?: string,
    coin: string,
}

export type $GetAddress = {
    path: $Path,
    coin?: string,
    showOnTrezor?: boolean,
    crossChain?: boolean,
}

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

// modified types from trezor/TransactionInput (amount: string)
export type TransactionInput = {
    address_n?: Array<number>,
    prev_hash: string,
    prev_index: number,
    script_sig?: string,
    sequence?: number,
    script_type?: 'SPENDADDRESS' | 'SPENDMULTISIG' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS',
    multisig?: MultisigRedeemScriptType,
    amount?: string, // only with segwit
    decred_tree?: number,
    decred_script_version?: number,
}
// modified types from trezor/TransactionOutput (amount: string)
export type TransactionOutput = {
    address: string,
    amount: string, // in satoshis
    script_type: 'PAYTOADDRESS',
} | {
    address_n: Array<number>,
    amount: string, // in satoshis
    script_type: 'PAYTOADDRESS' | 'PAYTOMULTISIG' | 'PAYTOWITNESS' | 'PAYTOP2SHWITNESS',
} | {
    op_return_data: string,
    amount: '0', // fixed value
    script_type: 'PAYTOOPRETURN',
}

export type $SignTransaction = $Common & {
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    coin: string,
    push?: boolean,
}

export type $VerifyMessage = $Common & {
    address: string,
    coin: string,
    message: string,
    signature: string,
}

export type $WipeDevice = $Common;
