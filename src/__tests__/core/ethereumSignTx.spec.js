import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';

import { settings, AbstractCoreEventHandler } from './common.js';

class EthereumSignTxHandler extends AbstractCoreEventHandler {
    done: any;

    constructor(core: Core, payload: any, done: any) {
        super(core, payload);
        this.done = done;
    }

    handleResponseEvent(event: any) {
        console.warn(event);
    }
}


const knownErc20TokenSubtest = () => {
    describe('EthereumSignTx', () => {
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

        it('for knownERC20Token', async (done) => {
            // Method id signalizing `transfer(address _to, uint256 _value)` function
            const methodId = 'a9059cbb';
            // 1st function argument (to - the receiver)
            const first = '000000000000000000000000574bbb36871ba6b78e27f4b4dcfb76ea0091880b';
            // 2nd function argument(value - amount to be transferred)
            // 200 000 000 in dec (wei)
            const second = '000000000000000000000000000000000000000000000000000000000bebc200';
            //const second = '0000000000000000000000000000000000000000000000010000000000000000';

            const payload = {
                method: 'ethereumSignTx',
                path: [0, 0],
                nonce: '00',
                //gasPrice: '20',
                gasPrice: '14',
                //gasLimit: '20',
                gasPrice: '14',
                to: 'd0d6d6c5fe4a677d343cc433536bb717bae167dd',
                value: '00',
                data: methodId + first + second,
                chain_id: 1,
            }

            const handler = new EthereumSignTxHandler(core, payload, done);
            handler.startListening();
            await initTransport(settings);
        });
    });

}

export const ethereumSignTxTests = () => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        knownErc20Token: knownErc20TokenSubtest,
        /* unknownErc20Token: unknownErc20TokenSubtest,
        signTxNoData: signTxNoDataSubtest,
        signTxData: signTxDataSubtest,
        signTxMessage: signTxMessageSubtest,
        signTxNewContract: signTxNewContractSubtest,
        sanityChecks: sanityChecksSubtest,
        signTxNoDataEip155: signTxNoDataEip155Subtest,
        signTxDataEip155: signTxDataEip155Subtest, */
    };

    availableSubtests[subtest]();
};
