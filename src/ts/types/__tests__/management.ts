import TrezorConnect from '../index';

export const management = async () => {
    TrezorConnect.resetDevice({
        strength: 1,
        label: 'My Trezor',
        u2f_counter: 0,
        pin_protection: true,
        passphrase_protection: true,
        skip_backup: false,
        no_backup: false,
        backup_type: 0,
    });

    TrezorConnect.wipeDevice({});

    TrezorConnect.applyFlags({
        flags: 1,
    });

    TrezorConnect.applySettings({
        homescreen: 'string',
        display_rotation: 180,
        use_passphrase: true,
        label: 'My Trezor',
    });

    TrezorConnect.backupDevice({});

    TrezorConnect.changePin({
        remove: true,
    });

    TrezorConnect.firmwareUpdate({
        payload: new ArrayBuffer(0),
    });

    TrezorConnect.recoveryDevice({
        passphrase_protection: true,
        pin_protection: true,
        label: 'My Trezor',
        type: 1,
        dry_run: true,
        word_count: 24,
    });
};
