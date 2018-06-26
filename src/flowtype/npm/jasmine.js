/* @flow */

declare module 'flowtype/jasmine' {
    declare type DoneFn = () => void;
    declare type ActionFn = (done: DoneFn) => Promise<void> | void;
    declare type AssertionFn = (done: DoneFn) => Promise<void> | void;

    declare export var jasmine: any;

    declare export function describe(description: string, specDef?: () => void): void;

    declare export function beforeAll(action: ActionFn, timeout?: number): void;
    declare export function beforeEach(action: ActionFn, timeout?: number): void;

    declare export function afterAll(action: ActionFn, timeout?: number): void;
    declare export function afterEach(action: ActionFn, timeout?: number): void;

    declare export function it(expectation: string, assertion?: AssertionFn, timeout?: number): void;

    // todo?
    declare export function expect(): any;
}
