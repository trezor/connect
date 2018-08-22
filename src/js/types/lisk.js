/* @flow */
// Lisk types
// https://lisk.io/documentation/lisk-elements/user-guide/transactions

export type DataAsset = {
    data: string,
}

export type VoteAsset = {
    votes: Array<string>,
}

export type SignatureAsset = {
    signature: {
        publicKey: string,
    },
}

export type DelegateAsset = {
    delegate: {
        username: string,
    },
}

export type MultisignatureAsset = {
    multisignature: {
       min: number,
       lifetime: number,
       keysgroup: Array<string>,
    },
}

export type Asset = SignatureAsset | MultisignatureAsset | DelegateAsset | VoteAsset | DataAsset;
export type PreparedAsset = DataAsset | VoteAsset | DelegateAsset |
    { signature: { public_key: string } } |
    { multisignature: { min: number, life_time: number, keys_group: Array<string>}};

export type RawTransaction = {
    type: number,
    fee: string,
    amount: string,
    timestamp: number,
    recipientId?: string,
    senderPublicKey?: string,
    requesterPublicKey?: string,
    signature?: string,
    asset?: Asset,
}

export type PreparedTransaction = {
    type: number,
    fee: number,
    amount: number,
    timestamp: number,
    recipient_id?: string,
    sender_public_key?: string,
    requester_public_key?: string,
    signature?: string,
    asset?: PreparedAsset,
}
