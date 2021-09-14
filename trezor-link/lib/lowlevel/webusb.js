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
var events_1 = require("events");
var T1HID_VENDOR = 0x534c;
var TREZOR_DESCS = [
    // TREZOR v1
    // won't get opened, but we can show error at least
    { vendorId: 0x534c, productId: 0x0001 },
    // TREZOR webusb Bootloader
    { vendorId: 0x1209, productId: 0x53c0 },
    // TREZOR webusb Firmware
    { vendorId: 0x1209, productId: 0x53c1 },
];
var CONFIGURATION_ID = 1;
var INTERFACE_ID = 0;
var ENDPOINT_ID = 1;
var DEBUG_INTERFACE_ID = 1;
var DEBUG_ENDPOINT_ID = 2;
var WebUsbPlugin = /** @class */ (function () {
    function WebUsbPlugin() {
        this.name = "WebUsbPlugin";
        this.version = __VERSION__;
        this.debug = false;
        this.allowsWriteAndEnumerate = true;
        this.configurationId = CONFIGURATION_ID;
        this.normalInterfaceId = INTERFACE_ID;
        this.normalEndpointId = ENDPOINT_ID;
        this.debugInterfaceId = DEBUG_INTERFACE_ID;
        this.debugEndpointId = DEBUG_ENDPOINT_ID;
        this.unreadableHidDevice = false;
        this.unreadableHidDeviceChange = new events_1.EventEmitter();
        this._lastDevices = [];
        this.requestNeeded = true;
    }
    WebUsbPlugin.prototype.init = function (debug) {
        return __awaiter(this, void 0, void 0, function () {
            var usb;
            return __generator(this, function (_a) {
                this.debug = !!debug;
                usb = navigator.usb;
                if (usb == null) {
                    throw new Error("WebUSB is not available on this browser.");
                }
                else {
                    this.usb = usb;
                }
                return [2 /*return*/];
            });
        });
    };
    WebUsbPlugin.prototype._deviceHasDebugLink = function (device) {
        try {
            var iface = device.configurations[0].interfaces[DEBUG_INTERFACE_ID].alternates[0];
            return (iface.interfaceClass === 255 &&
                iface.endpoints[0].endpointNumber === DEBUG_ENDPOINT_ID);
        }
        catch (e) {
            return false;
        }
    };
    WebUsbPlugin.prototype._deviceIsHid = function (device) {
        return device.vendorId === T1HID_VENDOR;
    };
    WebUsbPlugin.prototype._listDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bootloaderId, devices, trezorDevices, hidDevices, nonHidDevices, oldUnreadableHidDevice;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bootloaderId = 0;
                        return [4 /*yield*/, this.usb.getDevices()];
                    case 1:
                        devices = _a.sent();
                        trezorDevices = devices.filter(function (dev) {
                            var isTrezor = TREZOR_DESCS.some(function (desc) {
                                return dev.vendorId === desc.vendorId && dev.productId === desc.productId;
                            });
                            return isTrezor;
                        });
                        hidDevices = trezorDevices.filter(function (dev) { return _this._deviceIsHid(dev); });
                        nonHidDevices = trezorDevices.filter(function (dev) { return !_this._deviceIsHid(dev); });
                        this._lastDevices = nonHidDevices.map(function (device) {
                            // path is just serial number
                            // more bootloaders => number them, hope for the best
                            var serialNumber = device.serialNumber;
                            var path = serialNumber == null || serialNumber === ""
                                ? "bootloader"
                                : serialNumber;
                            if (path === "bootloader") {
                                bootloaderId++;
                                path += bootloaderId;
                            }
                            var debug = _this._deviceHasDebugLink(device);
                            return { path: path, device: device, debug: debug };
                        });
                        oldUnreadableHidDevice = this.unreadableHidDevice;
                        this.unreadableHidDevice = hidDevices.length > 0;
                        if (oldUnreadableHidDevice !== this.unreadableHidDevice) {
                            this.unreadableHidDeviceChange.emit("change");
                        }
                        return [2 /*return*/, this._lastDevices];
                }
            });
        });
    };
    WebUsbPlugin.prototype.enumerate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._listDevices()];
                    case 1: return [2 /*return*/, (_a.sent()).map(function (info) { return ({
                            path: info.path,
                            debug: info.debug,
                        }); })];
                }
            });
        });
    };
    WebUsbPlugin.prototype._findDevice = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var deviceO;
            return __generator(this, function (_a) {
                deviceO = this._lastDevices.find(function (d) { return d.path === path; });
                if (deviceO == null) {
                    throw new Error("Action was interrupted.");
                }
                return [2 /*return*/, deviceO.device];
            });
        });
    };
    WebUsbPlugin.prototype.send = function (path, data, debug) {
        return __awaiter(this, void 0, void 0, function () {
            var device, newArray, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._findDevice(path)];
                    case 1:
                        device = _a.sent();
                        newArray = new Uint8Array(64);
                        newArray[0] = 63;
                        newArray.set(new Uint8Array(data), 1);
                        if (!!device.opened) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.connect(path, debug, false)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        endpoint = debug ? this.debugEndpointId : this.normalEndpointId;
                        return [2 /*return*/, device.transferOut(endpoint, newArray).then(function () { })];
                }
            });
        });
    };
    WebUsbPlugin.prototype.receive = function (path, debug) {
        return __awaiter(this, void 0, void 0, function () {
            var device, endpoint, res, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._findDevice(path)];
                    case 1:
                        device = _a.sent();
                        endpoint = debug ? this.debugEndpointId : this.normalEndpointId;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        if (!!device.opened) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.connect(path, debug, false)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, device.transferIn(endpoint, 64)];
                    case 5:
                        res = _a.sent();
                        if (res.data.byteLength === 0) {
                            return [2 /*return*/, this.receive(path, debug)];
                        }
                        return [2 /*return*/, res.data.buffer.slice(1)];
                    case 6:
                        e_1 = _a.sent();
                        if (e_1.message === "Device unavailable.") {
                            throw new Error("Action was interrupted.");
                        }
                        else {
                            throw e_1;
                        }
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    WebUsbPlugin.prototype.connect = function (path, debug, first) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, i, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (i) {
                            var _b, e_2;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!(i > 0)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                return setTimeout(function () { return resolve(undefined); }, i * 200);
                                            })];
                                    case 1:
                                        _c.sent();
                                        _c.label = 2;
                                    case 2:
                                        _c.trys.push([2, 4, , 5]);
                                        _b = {};
                                        return [4 /*yield*/, this_1._connectIn(path, debug, first)];
                                    case 3: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                    case 4:
                                        e_2 = _c.sent();
                                        // ignore
                                        if (i === 4) {
                                            throw e_2;
                                        }
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 5)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WebUsbPlugin.prototype._connectIn = function (path, debug, first) {
        return __awaiter(this, void 0, void 0, function () {
            var device, error_1, interfaceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._findDevice(path)];
                    case 1:
                        device = _a.sent();
                        return [4 /*yield*/, device.open()];
                    case 2:
                        _a.sent();
                        if (!first) return [3 /*break*/, 7];
                        return [4 /*yield*/, device.selectConfiguration(this.configurationId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        // reset fails on ChromeOS and windows
                        return [4 /*yield*/, device.reset()];
                    case 5:
                        // reset fails on ChromeOS and windows
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        interfaceId = debug ? this.debugInterfaceId : this.normalInterfaceId;
                        return [4 /*yield*/, device.claimInterface(interfaceId)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WebUsbPlugin.prototype.disconnect = function (path, debug, last) {
        return __awaiter(this, void 0, void 0, function () {
            var device, interfaceId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._findDevice(path)];
                    case 1:
                        device = _a.sent();
                        interfaceId = debug ? this.debugInterfaceId : this.normalInterfaceId;
                        return [4 /*yield*/, device.releaseInterface(interfaceId)];
                    case 2:
                        _a.sent();
                        if (!last) return [3 /*break*/, 4];
                        return [4 /*yield*/, device.close()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WebUsbPlugin.prototype.requestDevice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // I am throwing away the resulting device, since it appears in enumeration anyway
                    return [4 /*yield*/, this.usb.requestDevice({ filters: TREZOR_DESCS })];
                    case 1:
                        // I am throwing away the resulting device, since it appears in enumeration anyway
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WebUsbPlugin;
}());
exports.default = WebUsbPlugin;
