import fixtures from '../__fixtures__/getAddress';

const { setup, initTrezorConnect, teardown, TrezorConnect } = global.Trezor;

describe('TrezorConnect.getAddress', () => {
    beforeAll(async (done) => {
        await setup({
            mnemonic: 'mnemonic_12',
        });
        await initTrezorConnect(TrezorConnect);
        done();
    });

    afterAll(() => {
        teardown();
        TrezorConnect.dispose();
    });

    fixtures.forEach(f => {
        it(f.description, async (done) => {
            const result = await TrezorConnect.getAddress(f.params);
            if (result.success) {
                expect(result).toMatchObject({
                    success: true,
                    payload: f.result,
                });
            } else {
                expect(result).toMatchObject({
                    success: f.result,
                });
            }
            done();
        });
    });
});

