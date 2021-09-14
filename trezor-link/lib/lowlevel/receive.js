"use strict";
// Logic of recieving data from trezor
// Logic of "call" is broken to two parts - sending and receiving
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
exports.receiveAndParse = exports.receiveOne = void 0;
var message_decoder_1 = require("./protobuf/message_decoder");
var protobufjs_old_fixed_webpack_1 = require("protobufjs-old-fixed-webpack");
var MESSAGE_HEADER_BYTE = 0x23;
// input that might or might not be fully parsed yet
var PartiallyParsedInput = /** @class */ (function () {
    function PartiallyParsedInput(typeNumber, length) {
        this.typeNumber = typeNumber;
        this.expectedLength = length;
        this.buffer = new protobufjs_old_fixed_webpack_1.ByteBuffer(length);
    }
    PartiallyParsedInput.prototype.isDone = function () {
        return this.buffer.offset >= this.expectedLength;
    };
    PartiallyParsedInput.prototype.append = function (buffer) {
        this.buffer.append(buffer);
    };
    PartiallyParsedInput.prototype.arrayBuffer = function () {
        var byteBuffer = this.buffer;
        byteBuffer.reset();
        return byteBuffer.toArrayBuffer();
    };
    return PartiallyParsedInput;
}());
// Parses first raw input that comes from Trezor and returns some information about the whole message.
function parseFirstInput(bytes) {
    // convert to ByteBuffer so it's easier to read
    var byteBuffer = protobufjs_old_fixed_webpack_1.ByteBuffer.concat([bytes]);
    // checking first two bytes
    var sharp1 = byteBuffer.readByte();
    var sharp2 = byteBuffer.readByte();
    if (sharp1 !== MESSAGE_HEADER_BYTE || sharp2 !== MESSAGE_HEADER_BYTE) {
        throw new Error("Didn't receive expected header signature.");
    }
    // reading things from header
    var type = byteBuffer.readUint16();
    var length = byteBuffer.readUint32();
    // creating a new buffer with the right size
    var res = new PartiallyParsedInput(type, length);
    res.append(byteBuffer);
    return res;
}
// If the whole message wasn't loaded in the first input, loads more inputs until everything is loaded.
// note: the return value is not at all important since it's still the same parsedinput
function receiveRest(parsedInput, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (parsedInput.isDone()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, receiver()];
                case 1:
                    data = _a.sent();
                    // sanity check
                    if (data == null) {
                        throw new Error("Received no data.");
                    }
                    parsedInput.append(data);
                    return [2 /*return*/, receiveRest(parsedInput, receiver)];
            }
        });
    });
}
// Receives the whole message as a raw data buffer (but without headers or type info)
function receiveBuffer(receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var data, partialInput;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, receiver()];
                case 1:
                    data = _a.sent();
                    partialInput = parseFirstInput(data);
                    return [4 /*yield*/, receiveRest(partialInput, receiver)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, partialInput];
            }
        });
    });
}
function receiveOne(messages, data) {
    var byteBuffer = protobufjs_old_fixed_webpack_1.ByteBuffer.concat([data]);
    var typeId = byteBuffer.readUint16();
    byteBuffer.readUint32(); // length, ignoring
    var decoder = new message_decoder_1.MessageDecoder(messages, typeId, byteBuffer.toArrayBuffer());
    return {
        message: decoder.decodedJSON(),
        type: decoder.messageName(),
    };
}
exports.receiveOne = receiveOne;
// Reads data from device and returns decoded message, that can be sent back to trezor.js
function receiveAndParse(messages, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var received, typeId, buffer, decoder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, receiveBuffer(receiver)];
                case 1:
                    received = _a.sent();
                    typeId = received.typeNumber;
                    buffer = received.arrayBuffer();
                    decoder = new message_decoder_1.MessageDecoder(messages, typeId, buffer);
                    return [2 /*return*/, {
                            message: decoder.decodedJSON(),
                            type: decoder.messageName(),
                        }];
            }
        });
    });
}
exports.receiveAndParse = receiveAndParse;
