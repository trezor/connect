const { setup, initTrezorConnect, Controller, TrezorConnect } = global.Trezor;

let controller;
let currentMnemonic;

describe('TrezorConnect.Timeout', () => {
    beforeAll(async (done) => {
        try {
            if (!controller) {
                controller = new Controller({ url: 'ws://localhost:9001/', name: 'Timeout' });
                controller.on('error', (error) => {
                    controller = undefined;
                    console.log('Controller WS error', error);
                });
                controller.on('disconnect', () => {
                    controller = undefined;
                    console.log('Controller WS disconnected');
                });
            }

            /*
            if (testCase.setup.mnemonic !== currentMnemonic) {
                await setup(controller, testCase.setup);
                currentMnemonic = testCase.setup.mnemonic;
            }
            */

            await initTrezorConnect(controller, {
                interactionTimeout: 10,
            });

            done();
        } catch (error) {
            console.log('Controller WS init error', error);
            done(error);
        }
    }, 40000);

    afterAll(async (done) => {
        TrezorConnect.dispose();
        done();
    });

    /**
     * Test cases
     * - timeout on UI: Should reach the timeout when the user waits too long on a UI state
     * - timeout on device: Should reach the timeout when the user waits too long on the device input state
     * - no timeout: Shouldn't timeout if the user does everything on time
     */
    it('timeout on UI', async (done) => {
        done();
    });

    it('timeout on device', async (done) => {
        jest.setTimeout(20 * 1000);
        done();
    });

    it('no timeout', async (done) => {
        done();
    });

    /*
    tests.forEach(t => {
        it(t.description, async (done) => {
            if (t.customTimeout) {
                jest.setTimeout(t.customTimeout);
            }
            if (!controller) {
                done('Controller not found');
                return;
            }
            controller.options.name = t.description;
            const result = await TrezorConnect['Timeout'](t.params);
            const expected = t.result ? { success: true, payload: t.result } : { success: false };
            expect(result).toMatchObject(expected);
            if (t.customTimeout) {
                jest.setTimeout(20000);
            }
            done();
        });
    });
    */
});
