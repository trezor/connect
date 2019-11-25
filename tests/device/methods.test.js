import fixtures from '../__fixtures__';
const { setup, initTrezorConnect, Controller, TrezorConnect } = global.Trezor;

let controller;

fixtures.forEach((testCase, i) => {
    describe(`TrezorConnect.${testCase.method}`, () => {
        beforeAll(async (done) => {
            try {
                const c = new Controller({ url: 'ws://localhost:9001/', name: testCase.method });
                await setup(c, testCase.setup);
                await initTrezorConnect(c);
                c.on('error', () => {
                    controller = undefined;
                    console.log("WS error", error)
                });
                c.on('disconnect', () => {
                    controller = undefined;
                    console.log("WS disco")
                });
                controller = c;
                done();
            } catch (error) {
                // controller = undefined;
                console.log("init error", error)
                done(error);
            }
        }, 20000);

        afterAll(async (done) => {
            TrezorConnect.dispose();
            if (controller) {
                // await controller.send({ type: 'bridge-stop', version: '2' });
                // await controller.send({ type: 'emulator-stop', version: '2' });
                await controller.disconnect();
                controller = undefined;
            }
            done();
        });

        testCase.tests.forEach(t => {
            it(t.description, async (done) => {
                if (t.customTimeout) {
                    jest.setTimeout(t.customTimeout);
                }
                if (!controller) {
                    // expect(controller).not.toEqual(undefined);
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
