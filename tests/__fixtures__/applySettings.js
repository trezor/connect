export default {
    method: 'applySettings',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'Change label, rotation and passphrase',
            params: {
                label: 'cool label',
                auto_lock_delay: 300,
                display_rotation: 90,
                use_passphrase: false,
            },
            result: {
                message: 'Settings applied',
            },
        },
        {
            description: 'Change auto_lock_delay back',
            setup: {
                firmware: ['2.3.2', '2-master'],
            },
            params: {
                auto_lock_delay: 1000,
                display_rotation: 0,
            },
            result: {
                message: 'Settings applied',
            },
        },
    ],
};
