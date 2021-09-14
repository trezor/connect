"use strict";
// bridge v2 is half-way between lowlevel and not
// however, it is not doing actual sending in/to the devices
// and it refers enumerate to bridge
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var semver_compare_1 = require("semver-compare");
var http_1 = require("./http");
var check = require("../highlevel-checks");
var send_1 = require("../lowlevel/send");
var parse_protocol_1 = require("../lowlevel/protobuf/parse_protocol");
var receive_1 = require("../lowlevel/receive");
var DEFAULT_URL = "http://127.0.0.1:21325";
var DEFAULT_VERSION_URL = "https://wallet.trezor.io/data/bridge/latest.txt";
var BridgeTransport = /** @class */ (function () {
    function BridgeTransport(url, newestVersionUrl) {
        this.name = "BridgeTransport";
        this.version = "";
        this.debug = false;
        this.configured = false;
        this.stopped = false;
        this.requestNeeded = false;
        this.url = url == null ? DEFAULT_URL : url;
        this.newestVersionUrl =
            newestVersionUrl == null ? DEFAULT_VERSION_URL : newestVersionUrl;
    }
    BridgeTransport.prototype._post = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.stopped) {
                            return [2 /*return*/, Promise.reject("Transport stopped.")];
                        }
                        return [4 /*yield*/, (0, http_1.request)(__assign(__assign({}, options), { method: "POST", url: this.url + options.url, skipContentTypeHeader: true }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BridgeTransport.prototype.init = function (debug) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.debug = !!debug;
                        return [4 /*yield*/, this._silentInit()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BridgeTransport.prototype._silentInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var infoS, info, newVersion, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, http_1.request)({
                            url: this.url,
                            method: "POST",
                        })];
                    case 1:
                        infoS = _d.sent();
                        info = check.info(infoS);
                        this.version = info.version;
                        if (!(typeof this.bridgeVersion === "string")) return [3 /*break*/, 2];
                        _a = this.bridgeVersion;
                        return [3 /*break*/, 4];
                    case 2:
                        _c = (_b = check).version;
                        return [4 /*yield*/, (0, http_1.request)({
                                url: this.newestVersionUrl + "?" + Date.now(),
                                method: "GET",
                            })];
                    case 3:
                        _a = _c.apply(_b, [_d.sent()]);
                        _d.label = 4;
                    case 4:
                        newVersion = _a;
                        this.isOutdated = (0, semver_compare_1.default)(this.version, newVersion) < 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    BridgeTransport.prototype.configure = function (signedData) {
        return __awaiter(this, void 0, void 0, function () {
            var messages;
            return __generator(this, function (_a) {
                messages = (0, parse_protocol_1.parseConfigure)(signedData);
                this.configured = true;
                this._messages = messages;
                return [2 /*return*/];
            });
        });
    };
    BridgeTransport.prototype.listen = function (old) {
        return __awaiter(this, void 0, void 0, function () {
            var devicesS, devices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (old == null) {
                            throw new Error("Bridge v2 does not support listen without previous.");
                        }
                        return [4 /*yield*/, this._post({
                                url: "/listen",
                                body: old,
                            })];
                    case 1:
                        devicesS = _a.sent();
                        devices = check.devices(devicesS);
                        return [2 /*return*/, devices];
                }
            });
        });
    };
    BridgeTransport.prototype.enumerate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var devicesS, devices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._post({ url: "/enumerate" })];
                    case 1:
                        devicesS = _a.sent();
                        devices = check.devices(devicesS);
                        return [2 /*return*/, devices];
                }
            });
        });
    };
    BridgeTransport.prototype._acquireMixed = function (input, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var previousStr, url;
            return __generator(this, function (_a) {
                previousStr = input.previous == null ? "null" : input.previous;
                url = (debugLink ? "/debug" : "") + "/acquire/" + input.path + "/" + previousStr;
                return [2 /*return*/, this._post({ url: url })];
            });
        });
    };
    BridgeTransport.prototype.acquire = function (input, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var acquireS;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._acquireMixed(input, debugLink)];
                    case 1:
                        acquireS = _a.sent();
                        return [2 /*return*/, check.acquire(acquireS)];
                }
            });
        });
    };
    BridgeTransport.prototype.release = function (session, onclose, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        res = this._post({
                            url: (debugLink ? "/debug" : "") + "/release/" + session,
                        });
                        if (onclose) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, res];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BridgeTransport.prototype.call = function (session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, outData, resData, jsonData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._messages == null) {
                            throw new Error("Transport not configured.");
                        }
                        messages = this._messages;
                        outData = (0, send_1.buildOne)(messages, name, data).toString("hex");
                        return [4 /*yield*/, this._post({
                                url: (debugLink ? "/debug" : "") + "/call/" + session,
                                body: outData,
                            })];
                    case 1:
                        resData = _a.sent();
                        if (typeof resData !== "string") {
                            throw new Error("Returning data is not string.");
                        }
                        jsonData = (0, receive_1.receiveOne)(messages, new Buffer(resData, "hex"));
                        return [2 /*return*/, check.call(jsonData)];
                }
            });
        });
    };
    BridgeTransport.prototype.post = function (session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, outData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._messages == null) {
                            throw new Error("Transport not configured.");
                        }
                        messages = this._messages;
                        outData = (0, send_1.buildOne)(messages, name, data).toString("hex");
                        return [4 /*yield*/, this._post({
                                url: (debugLink ? "/debug" : "") + "/post/" + session,
                                body: outData,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BridgeTransport.prototype.read = function (session, debugLink) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, resData, jsonData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._messages == null) {
                            throw new Error("Transport not configured.");
                        }
                        messages = this._messages;
                        return [4 /*yield*/, this._post({
                                url: (debugLink ? "/debug" : "") + "/read/" + session,
                            })];
                    case 1:
                        resData = _a.sent();
                        if (typeof resData !== "string") {
                            throw new Error("Returning data is not string.");
                        }
                        jsonData = (0, receive_1.receiveOne)(messages, new Buffer(resData, "hex"));
                        return [2 /*return*/, check.call(jsonData)];
                }
            });
        });
    };
    BridgeTransport.setFetch = function (fetch, isNode) {
        (0, http_1.setFetch)(fetch, isNode);
    };
    BridgeTransport.prototype.requestDevice = function () {
        return Promise.reject();
    };
    BridgeTransport.prototype.setBridgeLatestUrl = function (url) {
        this.newestVersionUrl = url;
    };
    BridgeTransport.prototype.setBridgeLatestVersion = function (version) {
        this.bridgeVersion = version;
    };
    BridgeTransport.prototype.stop = function () {
        this.stopped = true;
    };
    return BridgeTransport;
}());
exports.default = BridgeTransport;
