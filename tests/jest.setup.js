import { TX_CACHE } from './__txcache__';
import { WS_CACHE } from './__wscache__';

jest.setTimeout(20000);

// picked from utils/pathUtils
const HD_HARDENED = 0x80000000;
const toHardened = n => (n | HD_HARDENED) >>> 0;

const ADDRESS_N = path => {
    const parts = path.toLowerCase().split('/');
    if (parts[0] !== 'm') throw new Error(`PATH_NOT_VALID: ${path}`);
    return parts
        .filter(p => p !== 'm' && p !== '')
        .map(p => {
            let hardened = false;
            if (p.endsWith("'")) {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            let n = parseInt(p, 10);
            if (Number.isNaN(n)) {
                throw new Error(`PATH_NOT_VALID: ${path}`);
            } else if (n < 0) {
                throw new Error(`PATH_NEGATIVE_VALUES: ${path}`);
            }
            if (hardened) {
                // hardened index
                n = toHardened(n);
            }
            return n;
        });
};

// Always mock blockchain-link module unless it's explicitly required not to.
if (process.env.TESTS_USE_WS_CACHE !== 'false') {
    jest.mock('@trezor/blockchain-link', () => {
        let fixtures = {};
        return {
            __esModule: true,
            setFixtures: f => {
                fixtures = f;
            },
            default: class BlockchainLink {
                constructor(args) {
                    this.name = args.name;
                }

                on() {}

                connect() {}

                dispose() {}

                getInfo() {
                    return {
                        url: 'jest-mocked-module',
                        name: this.name,
                        shortcut: this.name,
                        version: '0.0.0',
                        decimals: 0,
                        blockHeight: 10000000,
                        blockHash: 'abcd',
                    };
                }

                getAccountInfo(params) {
                    if (!fixtures.getAccountInfo || !fixtures.getAccountInfo[params.descriptor])
                        return { balance: 'no-fixture' };
                    return fixtures.getAccountInfo[params.descriptor];
                }
            },
        };
    });

    // eslint-disable-next-line global-require
    require('@trezor/blockchain-link').setFixtures(WS_CACHE);
}

global.TestUtils = {
    ADDRESS_N,
    TX_CACHE,
};
