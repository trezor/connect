/* @flow */

declare type DoneFn = () => void;
declare type ExpectFn = (actual: Object) => any;
type ActionFn = (done: DoneFn) => Promise<void> | void;
type AssertionFn = (done: DoneFn) => Promise<void> | void;

type Jasmine = {
    DEFAULT_TIMEOUT_INTERVAL: number,
    // TODO?
    getEnv(): any,
}

type Expectation = {
    matcherName: string,
    message: string,
    stack: string,
    passed: boolean,
    expected: any,
    actual: any,
};

type SuiteResult = {
    id: number,
    description: string,
    fullName: string,
    failedExpectations: Array<Expectation>,
    deprecationWarnings: Array<Expectation>,
    status: string,
};

type SpecResult = {
    id: number,
    description: string,
    fullName: string,
    failedExpectations: Array<Expectation>,
    passedExpectations: Array<Expectation>,
    deprecationWarnings: Array<Expectation>,
    pendingReason: string,
    status: string,
};

type JasmineDoneInfo = {
    overallStatus: 'passed' | 'failed' | 'incomplete',
    incompleteReason: string,
    failedExpectations: Array<Expectation>,
    deprecationWarnings: Array<Expectation>,
};

declare var jasmine: Jasmine;

declare function describe(description: string, specDef?: () => void): void;

declare function beforeAll(action: ActionFn, timeout?: number): void;
declare function beforeEach(action: ActionFn, timeout?: number): void;

declare function afterAll(action: ActionFn, timeout?: number): void;
declare function afterEach(action: ActionFn, timeout?: number): void;

declare function it(expectation: string, assertion?: AssertionFn, timeout?: number): void;

// todo?
declare function expect(actual: Object): any;

declare type Reporter = {
    jasmineDone?: (suiteInfo: JasmineDoneInfo) => void,
    suiteStarted?: (result: SuiteResult) => void,
    suiteDone?: (result: SuiteResult) => void,
    specStarted?: (result: SpecResult) => void,
    specDone?: (result: SpecResult) => void,
}
