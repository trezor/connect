import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';

import { settings, AbstractCoreEventHandler } from './common.js';

class EthereumVerifyMessageHandler extends AbstractCoreEventHandler {
    done: any;

    constructor(core: Core, payload: any, done: any) {
        super(core, payload);
        this.done = done;
    }

    handleResponseEvent(event: any) {
        if (event.success) {
            expect(event.success).toEqual(true);
            this.done();
        }
    }
}

export const ethereumVerifyMessageTests = () => {
    describe('EthereumVerifyMessage', () => {
        let core: Core;

        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });


        const config = {
            address: 'cb3864960e8db1a751212c580af27ee8867d688f',
            vectors: [
                {
                    msg: 'This is an example of a signed message.',
                    sig: 'b7837058907192dbc9427bf57d93a0acca3816c92927a08be573b785f2d72dab65dad9c92fbe03a358acdb455eab2107b869945d11f4e353d9cc6ea957d08a871b',
                },
                {
                    msg: 'VeryLongMessage!'.repeat(64),
                    sig: 'da2b73b0170479c2bfba3dd4839bf0d67732a44df8c873f3f3a2aca8a57d7bdc0b5d534f54c649e2d44135717001998b176d3cd1212366464db51f5838430fb31c'
                },
            ],
        }

        config.vectors.forEach(v => {
            it(`that response is valid for message: "${v.msg}"`, async (done) => {
                const payload = {
                    method: 'ethereumVerifyMessage',
                    address: config.address,
                    signature: v.sig,
                    message: v.msg
                };

                const handler = new EthereumVerifyMessageHandler(core, payload, done);
                handler.startListening();
                await initTransport(settings);
            });
        });
    });
};