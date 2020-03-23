export interface ResetDevice {
    strength?: number;
    label?: string;
    u2f_counter?: number;
    pin_protection?: boolean;
    passphrase_protection?: boolean;
    skip_backup?: boolean;
    no_backup?: boolean;
    backup_type?: 0 | 1;
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

export interface FirmwareUpdateBinary {
    binary: number[];
}

export interface FirmwareUpdate {
    version: number[];
    btcOnly: boolean;
    baseUrl?: string;
}

export interface FirmwareRequest {
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
