"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var monkey_patch_1 = require("./protobuf/monkey_patch");
var defered_1 = require("../defered");
var parse_protocol_1 = require("./protobuf/parse_protocol");
var send_1 = require("./send");
var receive_1 = require("./receive");
var sharedConnectionWorker_1 = require("./sharedConnectionWorker");
(0, monkey_patch_1.patch)();
// eslint-disable-next-line quotes
var stringify = require("json-stable-stringify");
function stableStringify(devices) {
    if (devices == null) {
        return "null";
    }
    var pureDevices = devices.map(function (device) {
        var path = device.path;
        var session = device.session == null ? null : device.session;
        return { path: path, session: session };
    });
    return stringify(pureDevices);
}
function compare(a, b) {
    if (!isNaN(parseInt(a.path))) {
        return parseInt(a.path) - parseInt(b.path);
    }
    return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}
var ITER_MAX = 60;
var ITER_DELAY = 500;
var LowlevelTransportWithSharedConnections = /** @class */ (function () {
    function LowlevelTransportWithSharedConnections(plugin, sharedWorkerFactory) {
        this.name = "LowlevelTransportWithSharedConnections";
        this.debug = false;
        // path => promise rejecting on release
        this.deferedDebugOnRelease = {};
        this.deferedNormalOnRelease = {};
        this.configured = false;
        this.stopped = false;
        this._lastStringified = "";
        this.requestNeeded = false;
        this.latestId = 0;
        this.defereds = {};
        this.isOutdated = false;
        this.plugin = plugin;
        this.version = plugin.version;
        this._sharedWorkerFactory = sharedWorkerFactory;
        if (!this.plugin.allowsWriteAndEnumerate) {
            // This should never happen anyway
            throw new Error("Plugin with shared connections cannot disallow write and enumerate");
        }
    }
    LowlevelTransportWithSharedConnections.prototype.enumerate = function () {
        return this._silentEnumerate();
    };
    LowlevelTransportWithSharedConnections.prototype._silentEnumerate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devices, sessionsM, debugSessions, normalSessions, devicesWithSessions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendToWorker({ type: "enumerate-intent" })];
                    case 1:
                        _a.sent();
                        devices = [];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 6]);
                        return [4 /*yield*/, this.plugin.enumerate()];
                    case 3:
                        devices = _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.sendToWorker({ type: "enumerate-done" })];
                    case 5:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 6: return [4 /*yield*/, this.sendToWorker({
                            type: "get-sessions-and-disconnect",
                            devices: devices,
                        })];
                    case 7:
                        sessionsM = _a.sent();
                        if (sessionsM.type !== "sessions") {
                            throw new Error("Wrong reply");
                        }
                        debugSessions = sessionsM.debugSessions;
                        normalSessions = sessionsM.normalSessions;
                        devicesWithSessions = devices.map(function (device) {
                            var session = normalSessions[device.path];
                            var debugSession = debugSessions[device.path];
                            return {
                                path: device.path,
                                session: session,
                                debug: device.debug,
                                debugSession: debugSession,
                            };
                        });
                        this._releaseDisconnected(devicesWithSessions);
                        return [2 /*return*/, devicesWithSessions.sort(compare)];
                }
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype._releaseDisconnected = function (devices) {
        var _this = this;
        var connected = {};
        devices.forEach(function (device) {
            if (device.session != null) {
                connected[device.session] = true;
            }
        });
        Object.keys(this.deferedDebugOnRelease).forEach(function (session) {
            if (connected[session] == null) {
                _this._releaseCleanup(session, true);
            }
        });
        Object.keys(this.deferedNormalOnRelease).forEach(function (session) {
            if (connected[session] == null) {
                _this._releaseCleanup(session, false);
            }
        });
    };
    LowlevelTransportWithSharedConnections.prototype.listen = function (old) {
        return __awaiter(this, void 0, void 0, function () {
            var oldStringified, last;
            return __generator(this, function (_a) {
                oldStringified = stableStringify(old);
                last = old == null ? this._lastStringified : oldStringified;
                return [2 /*return*/, this._runIter(0, last)];
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype._runIter = function (iteration, oldStringified) {
        return __awaiter(this, void 0, void 0, function () {
            var devices, stringified;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._silentEnumerate()];
                    case 1:
                        devices = _a.sent();
                        stringified = stableStringify(devices);
                        if (stringified !== oldStringified || iteration === ITER_MAX) {
                            this._lastStringified = stringified;
                            return [2 /*return*/, devices];
                        }
                        return [4 /*yield*/, (0, defered_1.resolveTimeoutPromise)(ITER_DELAY, null)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this._runIter(iteration + 1, stringified)];
                }
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.acquire = function (input, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var messBack, reset, e_1, messBack2, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendToWorker({
                            type: "acquire-intent",
                            path: input.path,
                            previous: input.previous,
                            debug: debugLink,
                        })];
                    case 1:
                        messBack = _a.sent();
                        if (messBack.type === "wrong-previous-session") {
                            throw new Error("wrong previous session");
                        }
                        if (messBack.type !== "other-session") {
                            throw new Error("Strange reply");
                        }
                        reset = messBack.otherSession == null;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.plugin.connect(input.path, debugLink, reset)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        e_1 = _a.sent();
                        return [4 /*yield*/, this.sendToWorker({ type: "acquire-failed" })];
                    case 5:
                        _a.sent();
                        throw e_1;
                    case 6: return [4 /*yield*/, this.sendToWorker({ type: "acquire-done" })];
                    case 7:
                        messBack2 = _a.sent();
                        if (messBack2.type !== "session-number") {
                            throw new Error("Strange reply.");
                        }
                        session = messBack2.number;
                        if (debugLink) {
                            this.deferedDebugOnRelease[session] = (0, defered_1.create)();
                        }
                        else {
                            this.deferedNormalOnRelease[session] = (0, defered_1.create)();
                        }
                        return [2 /*return*/, session];
                }
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.release = function (session, onclose, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var messback, path, otherSession, last, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (onclose && !debugLink) {
                            // if we wait for worker messages, shared worker survives
                            // and delays closing
                            // so we "fake" release
                            this.sendToWorker({ type: "release-onclose", session: session });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.sendToWorker({
                                type: "release-intent",
                                session: session,
                                debug: debugLink,
                            })];
                    case 1:
                        messback = _a.sent();
                        if (messback.type === "double-release") {
                            throw new Error("Trying to double release.");
                        }
                        if (messback.type !== "path") {
                            throw new Error("Strange reply.");
                        }
                        path = messback.path;
                        otherSession = messback.otherSession;
                        last = otherSession == null;
                        this._releaseCleanup(session, debugLink);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.plugin.disconnect(path, debugLink, last)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, this.sendToWorker({ type: "release-done" })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype._releaseCleanup = function (session, debugLink) {
        var table = debugLink
            ? this.deferedDebugOnRelease
            : this.deferedNormalOnRelease;
        if (table[session] != null) {
            table[session].reject(new Error("Device released or disconnected"));
            delete table[session];
        }
    };
    LowlevelTransportWithSharedConnections.prototype.configure = function (signedData) {
        return __awaiter(this, void 0, void 0, function () {
            var messages;
            return __generator(this, function (_a) {
                messages = (0, parse_protocol_1.parseConfigure)(signedData);
                this._messages = messages;
                this.configured = true;
                return [2 /*return*/];
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype._sendLowlevel = function (path, debug) {
        var _this = this;
        return function (data) { return _this.plugin.send(path, data, debug); };
    };
    LowlevelTransportWithSharedConnections.prototype._receiveLowlevel = function (path, debug) {
        var _this = this;
        return function () { return _this.plugin.receive(path, debug); };
    };
    LowlevelTransportWithSharedConnections.prototype.messages = function () {
        if (this._messages == null) {
            throw new Error("Transport not configured.");
        }
        return this._messages;
    };
    LowlevelTransportWithSharedConnections.prototype.doWithSession = function (session, debugLink, inside) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionsM, sessionsMM, path_, path, resPromise, defered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendToWorker({ type: "get-sessions" })];
                    case 1:
                        sessionsM = _a.sent();
                        if (sessionsM.type !== "sessions") {
                            throw new Error("Wrong reply");
                        }
                        sessionsMM = debugLink
                            ? sessionsM.debugSessions
                            : sessionsM.normalSessions;
                        path_ = null;
                        Object.keys(sessionsMM).forEach(function (kpath) {
                            if (sessionsMM[kpath] === session) {
                                path_ = kpath;
                            }
                        });
                        if (path_ == null) {
                            throw new Error("Session not available.");
                        }
                        path = path_;
                        return [4 /*yield*/, inside(path)];
                    case 2:
                        resPromise = _a.sent();
                        defered = debugLink
                            ? this.deferedDebugOnRelease[session]
                            : this.deferedNormalOnRelease[session];
                        return [2 /*return*/, Promise.race([defered.rejectingPromise, resPromise])];
                }
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.call = function (session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var callInside;
            var _this = this;
            return __generator(this, function (_a) {
                callInside = function (path) { return __awaiter(_this, void 0, void 0, function () {
                    var messages, message;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                messages = this.messages();
                                return [4 /*yield*/, (0, send_1.buildAndSend)(messages, this._sendLowlevel(path, debugLink), name, data)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, (0, receive_1.receiveAndParse)(messages, this._receiveLowlevel(path, debugLink))];
                            case 2:
                                message = _a.sent();
                                return [2 /*return*/, message];
                        }
                    });
                }); };
                return [2 /*return*/, this.doWithSession(session, debugLink, callInside)];
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.post = function (session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var callInside;
            var _this = this;
            return __generator(this, function (_a) {
                callInside = function (path) { return __awaiter(_this, void 0, void 0, function () {
                    var messages;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                messages = this.messages();
                                return [4 /*yield*/, (0, send_1.buildAndSend)(messages, this._sendLowlevel(path, debugLink), name, data)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [2 /*return*/, this.doWithSession(session, debugLink, callInside)];
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.read = function (session, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var callInside;
            var _this = this;
            return __generator(this, function (_a) {
                callInside = function (path) { return __awaiter(_this, void 0, void 0, function () {
                    var messages, message;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                messages = this.messages();
                                return [4 /*yield*/, (0, receive_1.receiveAndParse)(messages, this._receiveLowlevel(path, debugLink))];
                            case 1:
                                message = _a.sent();
                                return [2 /*return*/, message];
                        }
                    });
                }); };
                return [2 /*return*/, this.doWithSession(session, debugLink, callInside)];
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.init = function (debug) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.debug = !!debug;
                        this.requestNeeded = this.plugin.requestNeeded;
                        return [4 /*yield*/, this.plugin.init(debug)];
                    case 1:
                        _a.sent();
                        // create the worker ONLY when the plugin is successfully inited
                        if (this._sharedWorkerFactory != null) {
                            this.sharedWorker = this._sharedWorkerFactory();
                            if (this.sharedWorker != null) {
                                this.sharedWorker.port.onmessage = function (e) {
                                    // $FlowIssue
                                    _this.receiveFromWorker(e.data);
                                };
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.requestDevice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.plugin.requestDevice()];
            });
        });
    };
    LowlevelTransportWithSharedConnections.prototype.sendToWorker = function (message) {
        var _this = this;
        if (this.stopped) {
            return Promise.reject("Transport stopped.");
        }
        this.latestId++;
        var id = this.latestId;
        this.defereds[id] = (0, defered_1.create)();
        // when shared worker is not loaded as a shared loader, use it as a module instead
        if (this.sharedWorker != null) {
            this.sharedWorker.port.postMessage({ id: id, message: message });
        }
        else {
            // @ts-ignore
            (0, sharedConnectionWorker_1.postModuleMessage)({ id: id, message: message }, function (m) { return _this.receiveFromWorker(m); });
        }
        return this.defereds[id].promise;
    };
    LowlevelTransportWithSharedConnections.prototype.receiveFromWorker = function (m) {
        this.defereds[m.id].resolve(m.message);
        delete this.defereds[m.id];
    };
    LowlevelTransportWithSharedConnections.prototype.setBridgeLatestUrl = function (url) { };
    LowlevelTransportWithSharedConnections.prototype.setBridgeLatestVersion = function (version) { };
    LowlevelTransportWithSharedConnections.prototype.stop = function () {
        this.stopped = true;
        this.sharedWorker = null;
    };
    return LowlevelTransportWithSharedConnections;
}());
exports.default = LowlevelTransportWithSharedConnections;
