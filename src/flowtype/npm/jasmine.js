/* @flow */

type DoneFn = () => void;
type ActionFn = (done: DoneFn) => Promise<void> | void;
type AssertionFn = (done: DoneFn) => Promise<void> | void;

type Jasmine = {
    DEFAULT_TIMEOUT_INTERVAL: number;
}

declare var jasmine: Jasmine;

declare function describe(description: string, specDef?: () => void): void;

declare function beforeAll(action: ActionFn, timeout?: number): void;
declare function beforeEach(action: ActionFn, timeout?: number): void;

declare function afterAll(action: ActionFn, timeout?: number): void;
declare function afterEach(action: ActionFn, timeout?: number): void;

declare function it(expectation: string, assertion?: AssertionFn, timeout?: number): void;

// todo?
declare function expect(): any;
