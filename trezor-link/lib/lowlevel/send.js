"use strict";
// Logic of sending data to trezor
//
// Logic of "call" is broken to two parts - sending and recieving
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAndSend = exports.buildOne = void 0;
var protobufjs_old_fixed_webpack_1 = require("protobufjs-old-fixed-webpack");
var HEADER_SIZE = 1 + 1 + 4 + 2;
var MESSAGE_HEADER_BYTE = 0x23;
var BUFFER_SIZE = 63;
// Sends more buffers to device.
function sendBuffers(sender, buffers) {
    return __awaiter(this, void 0, void 0, function () {
        var buffers_1, buffers_1_1, buffer, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    buffers_1 = __values(buffers), buffers_1_1 = buffers_1.next();
                    _b.label = 1;
                case 1:
                    if (!!buffers_1_1.done) return [3 /*break*/, 4];
                    buffer = buffers_1_1.value;
                    return [4 /*yield*/, sender(buffer)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    buffers_1_1 = buffers_1.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// already built PB message
var BuiltMessage = /** @class */ (function () {
    function BuiltMessage(messages, // Builders, generated by reading config
    name, // Name of the message
    data // data as "pure" object, from trezor.js
    ) {
        var Builder = messages.messagesByName[name];
        if (Builder == null) {
            throw new Error("The message name " + name + " is not found.");
        }
        // cleans up stuff from angular and remove "null" that crashes in builder
        cleanupInput(data);
        if (data) {
            this.message = new Builder(data);
        }
        else {
            this.message = new Builder();
        }
        // protobuf lib doesn't know how to work with "(wire_type)" option.
        // NOTE: round brackets are valid protobuf syntax for custom user declared option
        // messages: `TxAckInput`, `TxAckOutput`, `TxAckPrevInput`, `TxAckPrevOutput`, `TxAckPrevMeta`, `TxAckPrevExtraData`
        if (typeof this.message.$type.options["(wire_type)"] === "number") {
            this.type = this.message.$type.options["(wire_type)"];
        }
        else {
            this.type = messages.messageTypes["MessageType_" + name];
        }
    }
    // encodes into "raw" data, but it can be too long and needs to be split into
    // smaller buffers
    BuiltMessage.prototype._encodeLong = function (addTrezorHeaders) {
        var headerSize = HEADER_SIZE; // should be 8
        var bytes = new Uint8Array(this.message.encodeAB());
        var fullSize = (addTrezorHeaders ? headerSize : headerSize - 2) + bytes.length;
        var encodedByteBuffer = new protobufjs_old_fixed_webpack_1.ByteBuffer(fullSize);
        // first encode header
        if (addTrezorHeaders) {
            // 2*1 byte
            encodedByteBuffer.writeByte(MESSAGE_HEADER_BYTE);
            encodedByteBuffer.writeByte(MESSAGE_HEADER_BYTE);
        }
        // 2 bytes
        encodedByteBuffer.writeUint16(this.type);
        // 4 bytes (so 8 in total)
        encodedByteBuffer.writeUint32(bytes.length);
        // then put in the actual message
        encodedByteBuffer.append(bytes);
        // and convert to uint8 array
        // (it can still be too long to send though)
        var encoded = new Uint8Array(encodedByteBuffer.buffer);
        return encoded;
    };
    // encodes itself and splits into "nice" chunks
    BuiltMessage.prototype.encode = function () {
        var bytes = this._encodeLong(true);
        var result = [];
        var size = BUFFER_SIZE;
        // How many pieces will there actually be
        var count = Math.floor((bytes.length - 1) / size) + 1;
        // slice and dice
        for (var i = 0; i < count; i++) {
            var slice = bytes.subarray(i * size, (i + 1) * size);
            var newArray = new Uint8Array(size);
            newArray.set(slice);
            result.push(newArray.buffer);
        }
        return result;
    };
    // encodes itself into one long arraybuffer
    BuiltMessage.prototype.encodeOne = function () {
        var bytes = this._encodeLong(false);
        return Buffer.from(__spreadArray([], __read(bytes), false));
    };
    return BuiltMessage;
}());
// Removes $$hashkey from angular and remove nulls
function cleanupInput(message) {
    // @ts-ignore
    delete message.$$hashKey;
    for (var key in message) {
        var value = message[key];
        if (value == null) {
            delete message[key];
        }
        else {
            if (Array.isArray(value)) {
                value.forEach(function (i) {
                    if (typeof i === "object") {
                        cleanupInput(i);
                    }
                });
            }
            if (typeof value === "object") {
                cleanupInput(value);
            }
        }
    }
}
// Builds buffers to send.
// messages: Builders, generated by reading config
// name: Name of the message
// data: Data to serialize, exactly as given by trezor.js
// Returning buffers that will be sent to Trezor
function buildBuffers(messages, name, data) {
    var message = new BuiltMessage(messages, name, data);
    var encoded = message.encode();
    return encoded;
}
// Sends message to device.
// Resolves iff everything gets sent
function buildOne(messages, name, data) {
    var message = new BuiltMessage(messages, name, data);
    return message.encodeOne();
}
exports.buildOne = buildOne;
// Sends message to device.
// Resolves iff everything gets sent
function buildAndSend(messages, sender, name, data) {
    return __awaiter(this, void 0, void 0, function () {
        var buffers;
        return __generator(this, function (_a) {
            buffers = buildBuffers(messages, name, data);
            return [2 /*return*/, sendBuffers(sender, buffers)];
        });
    });
}
exports.buildAndSend = buildAndSend;
