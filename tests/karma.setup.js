import { MockedWorker } from './__wscache__/worker';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

// jasmine is missing "toMatchObject" matcher (deeply partial matching)
jasmine.getEnv().beforeAll(() => {
    jasmine.addMatchers({
        toMatchObject: _obj => ({
            compare: (actual, expected) => {
                const success = { pass: true, message: 'passed' };
                if (actual === expected) return success;
                if (expected === null || typeof expected !== 'object') {
                    return {
                        pass: false,
                        message: 'toMatchObject: "expected" is not a object',
                    };
                }

                const nested = obj =>
                    Object.keys(obj).reduce((match, key) => {
                        if (Array.isArray(obj[key])) {
                            match[key] = jasmine.arrayContaining(
                                obj[key].map(item => {
                                    if (typeof item === 'object') {
                                        return jasmine.objectContaining(nested(item));
                                    }
                                    return item;
                                }),
                            );
                        } else if (
                            obj[key] &&
                            typeof obj[key] === 'object' &&
                            typeof obj[key].expectedObject === 'function'
                        ) {
                            // jasmine matcher (used in getFeatures test)
                            match[key] = obj[key];
                        } else if (obj[key] && typeof obj[key] === 'object') {
                            match[key] = jasmine.objectContaining(nested(obj[key]));
                        } else {
                            match[key] = obj[key];
                        }
                        return match;
                    }, {});

                expect(actual).toEqual(jasmine.objectContaining(nested(expected)));
                return success;
            },
        }),
    });
});

// expect is missing "any" matcher
expect.any = jasmine.any;

// catch trezor-connect iframe handshake and override native Worker class with cached responses
// this is possible ONLY because both connect and tests are running from the same origin
window.addEventListener('message', event => {
    // Always mock blockchain-link worker unless it's explicitly required not to.
    if (event.data.type === 'iframe-bootstrap' && process.env.TESTS_USE_WS_CACHE !== 'false') {
        event.currentTarget.Worker = MockedWorker;
    }
});
