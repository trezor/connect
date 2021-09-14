"use strict";
/* @flow */
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageToJSON = exports.MessageDecoder = void 0;
// Helper module for converting Trezor's raw input to
// ProtoBuf's message and from there to regular JSON to trezor.js
var ProtoBuf = require("protobufjs-old-fixed-webpack");
var ByteBuffer = ProtoBuf.ByteBuffer;
var Long = ProtoBuf.Long;
var MessageInfo = /** @class */ (function () {
    function MessageInfo(messageConstructor, name) {
        this.messageConstructor = messageConstructor;
        this.name = name;
    }
    return MessageInfo;
}());
var MessageDecoder = /** @class */ (function () {
    function MessageDecoder(messages, type, data) {
        this.type = type;
        this.data = data;
        this.messages = messages;
    }
    // Returns an info about this message,
    // which includes the constructor object and a name
    MessageDecoder.prototype._messageInfo = function () {
        var r = this.messages.messagesByType[this.type];
        if (r == null) {
            throw new Error("Method type not found - " + this.type);
        }
        return new MessageInfo(r.constructor, r.name);
    };
    // Returns the name of the message
    MessageDecoder.prototype.messageName = function () {
        return this._messageInfo().name;
    };
    // Returns the actual decoded message, as a ProtoBuf.js object
    MessageDecoder.prototype._decodedMessage = function () {
        var constructor = this._messageInfo().messageConstructor;
        return constructor.decode(this.data);
    };
    // Returns the message decoded to JSON, that could be handed back
    // to trezor.js
    MessageDecoder.prototype.decodedJSON = function () {
        var decoded = this._decodedMessage();
        var converted = messageToJSON(decoded);
        return JSON.parse(JSON.stringify(converted));
    };
    return MessageDecoder;
}());
exports.MessageDecoder = MessageDecoder;
// Converts any ProtoBuf message to JSON in Trezor.js-friendly format
function messageToJSON(message) {
    var res = {};
    var meta = message.$type;
    var _loop_1 = function (key) {
        var value = message[key];
        if (typeof value === "function") {
            // ignoring
        }
        else if (value instanceof ByteBuffer) {
            var hex = value.toHex();
            res[key] = hex;
        }
        else if (value instanceof Long) {
            var num = value.toNumber();
            res[key] = num;
        }
        else if (Array.isArray(value)) {
            var decodedArr = value.map(function (i) {
                // was not handled, for example MultisigRedeemScriptType has this:
                //   {
                //     "rule": "repeated",
                //     "options": {},
                //     "type": "bytes",
                //     "name": "signatures",
                //     "id": 2
                // },
                // interesting is that connect sends it as string[] ??
                // if (i instanceof ByteBuffer) {
                //   return i.toHex();
                // }
                if (typeof i === "object") {
                    return messageToJSON(i);
                }
                return i;
            });
            res[key] = decodedArr;
        }
        else if (value instanceof ProtoBuf.Builder.Message) {
            res[key] = messageToJSON(value);
        }
        else if (meta._fieldsByName[key].type.name === "enum") {
            if (value == null) {
                res[key] = null;
            }
            else {
                var enumValues = meta._fieldsByName[key].resolvedType.getChildren();
                res[key] = enumValues.find(function (e) { return e.id === value; }).name;
            }
        }
        else {
            res[key] = value;
        }
    };
    for (var key in message) {
        _loop_1(key);
    }
    return res;
}
exports.messageToJSON = messageToJSON;
