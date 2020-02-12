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

export type LoginChallenge = {
    challengeHidden: string;
    challengeVisual: string;
}

export type RequestLoginAsync = { callback: () => LoginChallenge };

export type Login = {
    address: string;
    publicKey: string;
    signature: string;
};

export interface ResetDevice {
    strength?: number;
    label?: string;
    u2fCounter?: number;
    pinProtection?: boolean;
    passphraseProtection?: boolean;
    skipBackup?: boolean;
    noBackup?: boolean;
    backupType?: 0 | 1;
}

export interface ApplySettings {
    homescreen?: string;
    display_rotation?: 0 | 90 | 180 | 270;
    use_passphrase?: boolean;
    label?: string;
}

export interface ApplyFlags {
    flags: number;
}

export interface ChangePin {
    remove?: boolean;
}

export interface FirmwareUpdate {
    payload: ArrayBuffer;
}

export type FirmwareRequest = {
    length: number;
    offset: number;
}

export interface RecoveryDevice {
    passphrase_protection?: boolean;
    pin_protection?: boolean;
    label?: string;
    type?: 0 | 1;
    dry_run?: boolean;
    word_count?: 12 | 18 | 24;
    // there are more of them but dont have a valid usecase now
}

