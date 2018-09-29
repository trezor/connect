/* @flow */

// Stellar types from stellar-sdk
// https://github.com/stellar/js-stellar-base

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

type Asset = {
    type: string,
    code?: string,
    issuer?: string,
}

export type CreateAccountOperation = {
    +type: 'createAccount', // Proto: "StellarCreateAccountOp"
    destination: string, // Proto: "new_account",
    source: string, // Proto: "source_account"
    startingBalance: string, // Proto: "starting_balance" > parse to number
}

export type PaymentOperation = {
    +type: 'payment', // Proto: "StellarPaymentOp"
    source: string, // Proto: "source_account"
    destination: string, // Proto: "destination_account"
    asset: Asset, // Proto: ok
    amount: string, // Proto: parse to number
}

export type PathPaymentOperation = {
    +type: 'pathPayment', // Proto: "StellarPathPaymentOp"
    source: string, // Proto: "source_account"
    sendAsset: Asset, // Proto: "send_asset"
    sendMax: number, // Proto: "send_max"
    destination: string, // Proto: "destination_account"
    destAsset?: Asset, // Proto: "destination_asset"
    destAmount?: string, // Proto "destination_amount" > parse to number
    path?: Array<Asset>, // Proto: "paths"
}

export type ManageOfferOperation = {
    +type: 'manageOffer', // Proto: "StellarManageOfferOp"
    source: string, // Proto: "source_account"
    offerId: number, // Proto: "offer_id"
    amount: string, // Proto: parse to number
    buying: Asset, // Proto: "buying_asset"
    selling: Asset, // Proto: "selling_asset"
    price: { n: number, d: number }, // Proto: "price_n" and "price_d"
}

export type PassiveOfferOperation = {
    +type: 'createPassiveOffer', // Proto: "StellarCreatePassiveOfferOp"
    source: string, // Proto: "source_account"
    offerId: number, // Proto: "offer_id"
    amount: string, // Proto: parse to number
    buying: Asset, // Proto: "buying_asset"
    selling: Asset, // Proto: "selling_asset"
    price: { n: number, d: number }, // Proto: "price_n" and "price_d"
}

export type SetOptionsOperation = {
    +type: 'setOptions', // Proto: "StellarSetOptionsOp"
    source: string, // Proto: "source_account"
    signer: {
        type: number, // (?) Missing in stellar API, Proto: "signer_type" 0: accont added/removed; 1: pre-authorized tx added/removed; 2: hash aded/removed
        key?: string, // Proto: "signer_key"
        weight: number, // Proto: "signer_weight"
    },
    clearFlags: number, // Proto: "clear_flags"
    setFlags: number, // Proto: "set_flags"
    masterWeight: number, // Proto: "master_weight"
    lowThreshold: number, // Proto: "low_threshold"
    medThreshold: number, // Proto: "medium_threshold"
    highThreshold: number, // Proto: "high_threshold"
    homeDomain?: string, // Proto: "home_domain"
    inflationDest: string, // Proto: "inflation_destination_account"
}

export type ChangeTrustOperation = {
    +type: 'changeTrust', // Proto: "StellarChangeTrustOp"
    source: string, // Proto: "source_account"
    line?: Asset, // Proto: "asset"
    limit: string, // Proto: parse to number
}

export type AllowTrustOperation = {
    +type: 'allowTrust', // Proto: "StellarAllowTrustOp"
    source: string, // Proto: "source_account"
    trustor: string, // Proto: "trusted_account"
    assetType?: number, // Proto: "asset_type"
    assetCode?: string, // Proto: "asset_code"
    authorize: boolean, // Proto: "is_authorized" > parse to number
}

export type AccountMergeOperation = {
    +type: 'accountMerge', // Proto: "StellarAccountMergeOp"
    source: string, // Proto: "source_account"
    destination: string, // Proto: "destination_account"
}

export type ManageDataOperation = {
    +type: 'manageData', // Proto: "StellarManageDataOp"
    source: string, // Proto: "source_account"
    name: string, // Proto: "key"
    value: string, // Proto: "value"
}

// (?) Missing in stellar API but present in Proto messages
export type BumpSequenceOperation = {
    +type: 'bumpSequence', // Proto: "StellarBumpSequenceOp"
    source: string, // Proto: "source_account"
    to: number, // Proto: "bump_to"
}

// (?) Missing in Proto messages, but present in Stellar API
export type InflationOperation = {
    type: 'inflation',
}

export type Operation = CreateAccountOperation
    | PaymentOperation
    | PathPaymentOperation
    | ManageOfferOperation
    | PassiveOfferOperation
    | SetOptionsOperation
    | ChangeTrustOperation
    | AllowTrustOperation
    | AccountMergeOperation
    | InflationOperation
    | ManageDataOperation
    | BumpSequenceOperation;

export type Transaction = {
    source: string, // Proto: "source_account"
    fee?: number, // Proto: ok
    sequence?: number, // Proto: "sequence_number"
    timebounds?: {
        minTime: number, // Proto: "timebounds_start"
        maxTime: number, // Proto: "timebounds_end"
    },
    memo?: {
        id?: number, // Proto: "memo_id"
        type: number, // Proto: "memo_type"
        text?: string, // Proto: "memo_text"
        hash?: string, // Proto: "memo_hash"
    },
    operations: Array<Operation>, // Proto: calculated array length > "num_operations"
}

export type $StellarSignTransaction = $Common & {
    path: $Path,
    networkPassphrase: string,
    transaction: Transaction,
}

export type StellarSignedTx = {
    publicKey: string,
    signature: string,
}

export type StellarSignTransaction$ = {
    success: true,
    payload: StellarSignedTx,
} | Unsuccessful$;

// get address

export type StellarAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $StellarGetAddress = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type StellarGetAddress$ = {
    success: true,
    payload: StellarAddress,
} | Unsuccessful$;

export type StellarGetAddress$$ = {
    success: true,
    payload: Array<StellarAddress>,
} | Unsuccessful$;
