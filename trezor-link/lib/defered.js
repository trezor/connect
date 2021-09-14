"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectTimeoutPromise = exports.resolveTimeoutPromise = exports.create = void 0;
function create() {
    var localResolve = function (t) { };
    var localReject = function (e) { };
    var promise = new Promise(function (resolve, reject) {
        localResolve = resolve;
        localReject = reject;
    });
    var rejectingPromise = promise.then(function () {
        throw new Error("Promise is always rejecting");
    });
    rejectingPromise.catch(function () { });
    return {
        resolve: localResolve,
        reject: localReject,
        promise: promise,
        rejectingPromise: rejectingPromise,
    };
}
exports.create = create;
function resolveTimeoutPromise(delay, result) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(result);
        }, delay);
    });
}
exports.resolveTimeoutPromise = resolveTimeoutPromise;
function rejectTimeoutPromise(delay, error) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(error);
        }, delay);
    });
}
exports.rejectTimeoutPromise = rejectTimeoutPromise;
