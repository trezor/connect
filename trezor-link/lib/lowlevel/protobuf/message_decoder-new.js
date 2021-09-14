"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageToJSON = void 0;
var protobufjs_1 = require("protobufjs");
// todo:
var transform = function (field, value) {
    if (field.type === "bytes") {
        return value.toString("hex");
    }
    if (field.long) {
        return value.toNumber();
    }
    return value;
};
var primitiveTypes = [
    "string",
    "boolean",
    "uint32",
    "uint64",
    "sint32",
    "sint64",
    "bool",
    "bytes",
];
/*
  Legacy outbound middleware
*/
function messageToJSON(input) {
    var $type = input.$type, message = __rest(input, ["$type"]);
    var res = {};
    var _loop_1 = function (key) {
        var field = $type.fields[key];
        var value = message[key];
        if (primitiveTypes.includes(field.type)) {
            if (field.repeated) {
                res[key] = value.map(function (v, i) { return transform(field, value[i]); });
            }
            else {
                res[key] = transform(field, value);
            }
            return "continue";
        }
        else if (field.resolvedType instanceof protobufjs_1.Enum) {
            if (field.repeated) {
                res[key] = value.map(function (v, i) { return v; });
            }
            else {
                res[key] = field.resolvedType.valuesById[value];
            }
        }
        // else if (value instanceof Buffer) {
        //   res[key] = value.toString('hex');
        // } else if (value instanceof Long) {
        //   res[key] = value.toNumber();
        // }
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
        else if (typeof value === "object") {
            res[key] = messageToJSON(value);
        }
        else {
            res[key] = value;
        }
    };
    for (var key in $type.fields) {
        _loop_1(key);
    }
    return res;
}
exports.messageToJSON = messageToJSON;
