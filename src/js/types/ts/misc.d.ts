/* @flow */

export type CipherKeyValue = {
    path: string | number[];
    key?: string;
    value?: string;
    askOnEncrypt?: boolean;
    askOnDecrypt?: boolean;
    iv?: string;
};

export type CipheredValue = {
    value: string;
};

type LoginChallenge = {
    challengeHidden: string;
    challengeVisual: string;
}

export type RequestLogin =
    | { callback: () => LoginChallenge }
    | LoginChallenge;

export type Login = {
    address: string;
    publicKey: string;
    signature: string;
};

