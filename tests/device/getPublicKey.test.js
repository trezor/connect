// import TrezorConnect, { UI } from '../../npm-extended';
import TrezorConnect, { UI } from '../../src/js/index';
import fixtures from '../__fixtures__/getPublicKey';

const { setup, teardown, controller } = global.JestMocks;
describe('TrezorConnect.getAddress', () => {
    beforeAll(async () => {
        jest.setTimeout(10000);
        await setup('mnemonic_12');

        await TrezorConnect.init({
            manifest: {
                appUrl: 'a',
                email: 'b',
            },
            webusb: false,
            debug: false,
            pendingTransportEvent: false,
        });

        TrezorConnect.on(UI.REQUEST_CONFIRMATION, () => {
            TrezorConnect.uiResponse({
                type: UI.RECEIVE_CONFIRMATION,
                payload: true,
            });
        });

        TrezorConnect.on(UI.REQUEST_BUTTON, async () => {
            await controller.send({type: 'emulator-decision'});
        });
    });

    afterAll(() => {
        teardown();
        TrezorConnect.dispose();
    });

    fixtures.forEach(f => {
        it(f.description, async () => {
            const result = await TrezorConnect.getPublicKey(f.params);
            if (f.result) {
                expect(result.payload).toMatchObject(f.result);
            } else {
                expect(result).toMatchObject({
                    success: false,
                });
            }
        });
        // expect(result.payload).toMatchObject(f.result);
        // it('add', () => {
        //     expect(1).toBe(1);
        // });
    });
});
