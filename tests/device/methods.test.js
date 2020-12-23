import fixtures from '../__fixtures__';
const { setup, skipTest, initTrezorConnect, Controller, TrezorConnect } = global.Trezor;

let controller;
let currentMnemonic;

fixtures.forEach((testCase, i) => {
    describe(`TrezorConnect.${testCase.method}`, () => {
        beforeAll(async (done) => {
            try {
                if (!controller) {
                    controller = new Controller({ url: 'ws://localhost:9001/', name: testCase.method });
                    controller.on('error', (error) => {
                        controller = undefined;
                        console.log('Controller WS error', error);
                    });
                    controller.on('disconnect', () => {
                        controller = undefined;
                        console.log('Controller WS disconnected');
                    });
                }

                if (testCase.setup.mnemonic !== currentMnemonic) {
                    await setup(controller, testCase.setup);
                    currentMnemonic = testCase.setup.mnemonic;
                }

                await initTrezorConnect(controller);

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

        testCase.tests.forEach(t => {
            // check if test should be skipped on current configuration
            const testMethod = skipTest(t.skip) ? it.skip : it;
            testMethod(t.description, async (done) => {
                if (t.customTimeout) {
                    jest.setTimeout(t.customTimeout);
                }
                if (!controller) {
                    done('Controller not found');
                    return;
                }

                if (t.mnemonic && t.mnemonic !== currentMnemonic) {
                    // single test requires different seed, switch it
                    await setup(controller, { mnemonic: t.mnemonic });
                    currentMnemonic = t.mnemonic;
                } else if (!t.mnemonic && testCase.setup.mnemonic !== currentMnemonic) {
                    // restore testCase.setup
                    await setup(controller, testCase.setup);
                    currentMnemonic = testCase.setup.mnemonic;
                }

                controller.options.name = t.description;
                const result = await TrezorConnect[testCase.method](t.params);
                const expected = t.result ? { success: true, payload: t.result } : { success: false };
                expect(result).toMatchObject(expected);
                if (t.customTimeout) {
                    jest.setTimeout(20000);
                }
                done();
            });
        });
    });
});
