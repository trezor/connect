import { MESSAGES, RESPONSES } from '@trezor/blockchain-link/lib/constants';

// Mock 'Worker' module to return blockchain-link responses from cache
// Jest implementation: see ./tests/jest.setup.js
// Karma implementation: see ./tests/karma.setup.js

export class MockedWorker {
    constructor() {
        setTimeout(() => {
            this.post({ id: -1, type: MESSAGES.HANDSHAKE });
        }, 1);
    }

    post(data) {
        this.onmessage({ data });
    }

    postMessage(data) {
        if (data.type === MESSAGES.CONNECT) {
            this.post({ id: data.id, type: RESPONSES.CONNECT });
        }
        // eslint-disable-next-line no-undef
        const fixtures = TestUtils.WS_CACHE;
        if (data.type === MESSAGES.GET_ACCOUNT_INFO) {
            this.post({
                id: data.id,
                type: RESPONSES.GET_ACCOUNT_INFO,
                payload: fixtures.getAccountInfo[data.payload.descriptor],
            });
        }
    }

    terminate() {}
}
