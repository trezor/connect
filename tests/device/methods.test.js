import fixtures from '../__fixtures__';
const { setup, initTrezorConnect, Controller, TrezorConnect } = global.Trezor;

let controller;

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

                await setup(controller, testCase.setup);
                await initTrezorConnect(controller);

                done();
            } catch (error) {
                console.log('Controller WS init error', error);
                done(error);
            }
        }, 40000);

        afterAll(async (done) => {
            TrezorConnect.dispose();
            if (controller) {
                // there is no need to enable/disable env between tests
                // await controller.send({ type: 'bridge-stop' });
                // await controller.send({ type: 'emulator-stop' });
                // await controller.disconnect();
                // controller = undefined;
            }
            done();
        });

        testCase.tests.forEach(t => {
            it(t.description, async (done) => {
                if (t.customTimeout) {
                    jest.setTimeout(t.customTimeout);
                }
                if (!controller) {
                    done('Controller not found');
                    return;
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
