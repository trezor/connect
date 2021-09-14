"use strict";
/* @flow */
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
exports.request = exports.setFetch = void 0;
// slight hack to make Flow happy, but to allow Node to set its own fetch
// Request, RequestOptions and Response are built-in types of Flow for fetch API
var _fetch = typeof window === "undefined" ? function () { return Promise.reject(); } : window.fetch;
var _isNode = false;
function setFetch(fetch, isNode) {
    _fetch = fetch;
    _isNode = !!isNode;
}
exports.setFetch = setFetch;
function contentType(body) {
    if (typeof body === "string") {
        if (body === "") {
            return "text/plain";
        }
        return "application/octet-stream";
    }
    return "application/json";
}
function wrapBody(body) {
    if (typeof body === "string") {
        return body;
    }
    return JSON.stringify(body);
}
function parseResult(text) {
    try {
        return JSON.parse(text);
    }
    catch (e) {
        return text;
    }
}
function request(options) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchOptions, res, resText, resJson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchOptions = {
                        method: options.method,
                        body: wrapBody(options.body),
                        credentials: "same-origin",
                        headers: {},
                    };
                    // this is just for flowtype
                    if (options.skipContentTypeHeader == null ||
                        options.skipContentTypeHeader === false) {
                        fetchOptions.headers = __assign(__assign({}, fetchOptions.headers), { "Content-Type": contentType(options.body == null ? "" : options.body) });
                    }
                    // Node applications must spoof origin for bridge CORS
                    if (_isNode) {
                        fetchOptions.headers = __assign(__assign({}, fetchOptions.headers), { Origin: "https://node.trezor.io" });
                    }
                    return [4 /*yield*/, _fetch(options.url, fetchOptions)];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.text()];
                case 2:
                    resText = _a.sent();
                    if (res.ok) {
                        return [2 /*return*/, parseResult(resText)];
                    }
                    resJson = parseResult(resText);
                    if (typeof resJson === "object" && resJson != null && resJson.error != null) {
                        throw new Error(resJson.error);
                    }
                    else {
                        throw new Error(resText);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.request = request;
