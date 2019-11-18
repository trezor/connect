import Controller from './python/websocket-client';

const MNEMONICS = {
    'mnemonic_all': 'all all all all all all all all all all all all',
    'mnemonic_12': 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
};

const controller = new Controller({ url: 'ws://localhost:9001/' });

global.JestMocks = {
    controller,
    setup: async (mnemonic) => {
        await controller.connect();
        await controller.send({type: 'bridge-start'});
        await controller.send({type: 'emulator-start'});
        await controller.send({
            type: 'emulator-setup',
            mnemonic: MNEMONICS[mnemonic],
            pin: '',
            passphrase_protection: false,
            label: 'Hello2!',
        });
    },
    teardown: async () => {
        controller.disconnect();
    },
};
