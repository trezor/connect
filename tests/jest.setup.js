import { TX_CACHE } from './__txcache__';

jest.setTimeout(20000);

// picked from utils/pathUtils
const HD_HARDENED = 0x80000000;
const toHardened = (n) => (n | HD_HARDENED) >>> 0;

const ADDRESS_N = (path) => {
    const parts = path.toLowerCase().split('/');
    if (parts[0] !== 'm') throw new Error('PATH_NOT_VALID: ' + path);
    return parts.filter(p => p !== 'm' && p !== '')
        .map(p => {
            let hardened = false;
            if (p.endsWith("'")) {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            let n = parseInt(p);
            if (isNaN(n)) {
                throw new Error('PATH_NOT_VALID: ' + path);
            } else if (n < 0) {
                throw new Error('PATH_NEGATIVE_VALUES: ' + path);
            }
            if (hardened) { // hardened index
                n = toHardened(n);
            }
            return n;
        });
};

global.TestUtils = {
    ADDRESS_N,
    TX_CACHE,
};
