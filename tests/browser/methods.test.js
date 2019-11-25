/* @flow */

import fixtures from '../__fixtures__';
const { setup, initTrezorConnect, Controller, TrezorConnect } = global.Trezor;

let controller;

// jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

let _popup;

// window.addEventListener('message', message => {
//     const { data } = message;
//     console.log("GET MESSAGES", message);
//     if (data && data.type === 'popup-bootstrap') {
//         // console.log("GET MESSAGES", message.source);
//         // _popup.addEventListener('message', (m) => {
//         //     console.log("m1")
//         // })
//         // _popup
//         try {
//             console.log("POP2", _popup.postMessage);
//             console.log("POP3", _popup.location);
//             console.log("POP4", _popup.addEventListener);
//             // console.log("SRC", _popup);
//         } catch (error) {
//             console.log("error", error);
//         }
//     }
// })
// window.open = function (open) {
//     return function (url, name, features) {
//         console.log("WINDOW OPEN", url, name, features)
//         // set name if missing here
//         // name = name || "default_window_name";
//         // _popup = open.call(window, url, name, features)
//         // _popup.fixtures = "FIXBAR";

//         const instance = document.createElement('iframe');
//         instance.onload = () => {
//             console.log("ONLOAD", instance.location)
//             instance.contentWindow.opener = window;
//         }
        
//         instance.setAttribute('src', url);
//         instance.close = () => {
//             document.body.removeChild(instance);
//         }
//         document.body.appendChild(instance);

//         return instance;


//         // _popup.addEventListener('message', () => {
//         //     console.log("m1")
//         // })
//         // _popup.window.addEventListener('message', () => {
//         //     console.log("m1")
//         // })
//         // console.log("CATCH HIS MESS", _popup, _popup.document.body)
//         return _popup;
//     };
// }(window.open);
// window.TrezorConnect = TrezorConnect;

// const { setup, teardown, controller } = global.JestMocks;
// const { KarmaSetup } = global;

fixtures.forEach((testCase, i) => {
    describe(`TrezorConnect.${testCase.method}`, () => {
        beforeAll(async (done) => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
            jasmine.addMatchers({
                toMatchObject: obj => {
                    return {
                        compare: (actual, expected) => {
                            const success = { pass: true, message: 'passed' };
                            if (actual === expected) return success;
                            if (expected === null || typeof expected !== 'object') {
                                return { pass: false, message: 'toMatchObject: "expected" is not a object' };
                            }
                            const nested = Object.keys(expected).reduce((match, key) => {
                                if (typeof expected[key] === 'object') {
                                    match[key] = jasmine.objectContaining(expected[key]);
                                } else {
                                    match[key] = expected[key];
                                }
                                return match;
                            }, {});
                            expect(actual).toEqual(jasmine.objectContaining(nested));
                            return success;
                        },
                    };
                },
            });

            try {
                const c = new Controller({ url: 'ws://localhost:9001/', name: testCase.method });
                await setup(c, testCase.setup);
                await initTrezorConnect(c, { popup: false });
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
        }, 30000);

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
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = t.customTimeout;
                }
                if (!controller) {
                    done(new Error('Controller not found'));
                    return;
                }
                controller.options.name = t.description;
                const result = await TrezorConnect[testCase.method](t.params);
                const expected = t.result ? { success: true, payload: t.result } : { success: false };
                expect(result).toMatchObject(expected);
                if (t.customTimeout) {
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
                }
                done();
            });
        });

        // it('should test window open event', async (done) => {
        //     const result = await TrezorConnect.getPublicKey({
        //         path: "m/0",
        //     });

        //     const p = new Promise(resolve => {
        //         setTimeout(() => {
        //             console.log("RESOLVING!")
        //             // console.log("CATCH HIS MESS", _popup, _popup.document.body)
        //             resolve();
        //         }, 5000)
        //     })

        //     await p;
        //     expect(1).toBe(1);
        //     done();

        //     // const result = 'a';
        //     // console.log("RESULT", result)
        //     // expect(result).toBe('http://www.example.com');
        //     // done();
        // });
    });
});
