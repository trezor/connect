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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var FallbackTransport = /** @class */ (function () {
    function FallbackTransport(transports) {
        this.name = "FallbackTransport";
        this.activeName = "";
        this.debug = false;
        this.requestNeeded = false;
        this.transports = transports;
    }
    // first one that inits successfuly is the final one; others won't even start initing
    FallbackTransport.prototype._tryInitTransports = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, lastError, _a, _b, transport, e_1, e_2_1;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        res = [];
                        lastError = null;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        _a = __values(this.transports), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 7];
                        transport = _b.value;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, transport.init(this.debug)];
                    case 4:
                        _d.sent();
                        res.push(transport);
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _d.sent();
                        lastError = e_1;
                        return [3 /*break*/, 6];
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        if (res.length === 0) {
                            throw lastError || new Error("No transport could be initialized.");
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    // first one that inits successfuly is the final one; others won't even start initing
    FallbackTransport.prototype._tryConfigureTransports = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var lastError, _a, _b, transport, e_3, e_4_1;
            var e_4, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        lastError = null;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        _a = __values(this._availableTransports), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 7];
                        transport = _b.value;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, transport.configure(data)];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, transport];
                    case 5:
                        e_3 = _d.sent();
                        lastError = e_3;
                        return [3 /*break*/, 6];
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_4_1 = _d.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 10: throw lastError || new Error("No transport could be initialized.");
                }
            });
        });
    };
    FallbackTransport.prototype.init = function (debug) {
        return __awaiter(this, void 0, void 0, function () {
            var transports;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.debug = !!debug;
                        return [4 /*yield*/, this._tryInitTransports()];
                    case 1:
                        transports = _a.sent();
                        this._availableTransports = transports;
                        // a slight hack - configured is always false, so we force caller to call configure()
                        // to find out the actual working transport (bridge falls on configure, not on info)
                        this.version = transports[0].version;
                        this.configured = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    FallbackTransport.prototype.configure = function (signedData) {
        return __awaiter(this, void 0, void 0, function () {
            var pt, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pt = this._tryConfigureTransports(signedData);
                        _a = this;
                        return [4 /*yield*/, pt];
                    case 1:
                        _a.activeTransport = _b.sent();
                        this.configured = this.activeTransport.configured;
                        this.version = this.activeTransport.version;
                        this.activeName = this.activeTransport.name;
                        this.requestNeeded = this.activeTransport.requestNeeded;
                        this.isOutdated = this.activeTransport.isOutdated;
                        return [2 /*return*/];
                }
            });
        });
    };
    // using async so I get Promise.recect on this.activeTransport == null (or other error), not Error
    FallbackTransport.prototype.enumerate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activeTransport.enumerate()];
            });
        });
    };
    FallbackTransport.prototype.listen = function (old) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activeTransport.listen(old)];
            });
        });
    };
    FallbackTransport.prototype.acquire = function (input, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activeTransport.acquire(input, debugLink)];
            });
        });
    };
    FallbackTransport.prototype.release = function (session, onclose, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activeTransport.release(session, onclose, debugLink)];
            });
        });
    };
    FallbackTransport.prototype.call = function (session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activeTransport.call(session, name, data, debugLink)];
            });
        });
    };
    FallbackTransport.prototype.post = function (session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activeTransport.post(session, name, data, debugLink)];
            });
        });
    };
    FallbackTransport.prototype.read = function (session, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activeTransport.read(session, debugLink)];
            });
        });
    };
    FallbackTransport.prototype.requestDevice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // @ts-ignore
                return [2 /*return*/, this.activeTransport.requestDevice()];
            });
        });
    };
    FallbackTransport.prototype.setBridgeLatestUrl = function (url) {
        var e_5, _a;
        try {
            for (var _b = __values(this.transports), _c = _b.next(); !_c.done; _c = _b.next()) {
                var transport = _c.value;
                transport.setBridgeLatestUrl(url);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    FallbackTransport.prototype.setBridgeLatestVersion = function (version) {
        var e_6, _a;
        try {
            for (var _b = __values(this.transports), _c = _b.next(); !_c.done; _c = _b.next()) {
                var transport = _c.value;
                transport.setBridgeLatestVersion(version);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    FallbackTransport.prototype.stop = function () {
        var e_7, _a;
        try {
            for (var _b = __values(this.transports), _c = _b.next(); !_c.done; _c = _b.next()) {
                var transport = _c.value;
                transport.stop();
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    return FallbackTransport;
}());
exports.default = FallbackTransport;
