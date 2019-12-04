export default {
    method: 'resetDevice',
    setup: {
        wipe: true,
    },
    // todo: cant run multiple resets, will get already initialized. maybe change beforeAll to beforeEach?
    tests: [
        {
            description: 'Reset device',
            params: {
                skipBackup: true,
            },
            result: {
                message: 'Initialized',
            },
        },
        // {
        //     description: 'Reset device no backup',
        //     params: {
        //         // skipBackup: true,
        //         noBackup: true,
        //     },
        //     result: {
        //         message: 'Initialized',
        //     },
        // },
    ],
};
