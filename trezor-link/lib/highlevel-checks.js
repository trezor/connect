"use strict";
// input checks for high-level transports
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = exports.acquire = exports.devices = exports.version = exports.info = void 0;
function info(res) {
    if (typeof res !== "object" || res == null) {
        throw new Error("Wrong result type.");
    }
    var version = res.version;
    if (typeof version !== "string") {
        throw new Error("Wrong result type.");
    }
    var configured = !!res.configured;
    return { version: version, configured: configured };
}
exports.info = info;
function version(version) {
    if (typeof version !== "string") {
        throw new Error("Wrong result type.");
    }
    return version.trim();
}
exports.version = version;
function convertSession(r) {
    if (r == null) {
        return null;
    }
    if (typeof r !== "string") {
        throw new Error("Wrong result type.");
    }
    return r;
}
function devices(res) {
    if (typeof res !== "object") {
        throw new Error("Wrong result type.");
    }
    if (!(res instanceof Array)) {
        throw new Error("Wrong result type.");
    }
    return res.map(function (o) {
        if (typeof o !== "object" || o == null) {
            throw new Error("Wrong result type.");
        }
        var path = o.path;
        if (typeof path !== "string") {
            throw new Error("Wrong result type.");
        }
        var pathS = path.toString();
        return {
            path: pathS,
            session: convertSession(o.session),
            debugSession: convertSession(o.debugSession),
            // @ts-ignore
            product: o.product,
            vendor: o.vendor,
            debug: !!o.debug,
        };
    });
}
exports.devices = devices;
function acquire(res) {
    if (typeof res !== "object" || res == null) {
        throw new Error("Wrong result type.");
    }
    var session = res.session;
    if (typeof session !== "string" && typeof session !== "number") {
        throw new Error("Wrong result type.");
    }
    return session.toString();
}
exports.acquire = acquire;
function call(res) {
    if (typeof res !== "object" || res == null) {
        throw new Error("Wrong result type.");
    }
    var type = res.type;
    if (typeof type !== "string") {
        throw new Error("Wrong result type.");
    }
    var message = res.message;
    if (typeof message !== "object" || message == null) {
        throw new Error("Wrong result type.");
    }
    return { type: type, message: message };
}
exports.call = call;
