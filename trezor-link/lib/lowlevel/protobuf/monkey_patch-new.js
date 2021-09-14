"use strict";
/**
 * this does the same thing like legacy monkey_patch. just not by monkey_patching
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.patch = exports._patch = void 0;
var _patch = function (Message, payload) {
    if (payload === void 0) { payload = {}; }
    var patched = {};
    Object.keys(Message.fields).forEach(function (key) {
        if (Message.fields[key].type === "bytes") {
            patched[key] = Buffer.from(payload[key], "hex");
        }
        else {
            patched[key] = payload[key];
        }
    });
    return patched;
};
exports._patch = _patch;
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
var transform = function (fieldType, value) {
    if (fieldType === "bytes") {
        return Buffer.from(value, "hex");
    }
    return value;
};
/*
  Legacy outbound middleware
*/
function patch(Message, payload) {
    if (payload === void 0) { payload = {}; }
    var patched = {};
    if (!Message)
        return payload;
    var _loop_1 = function (key) {
        var field = Message.fields[key];
        var value = payload[key];
        if (!value)
            return "continue";
        if (primitiveTypes.includes(field.type)) {
            if (field.repeated) {
                patched[key] = value.map(function (v, i) { return transform(field.type, value[i]); });
            }
            else {
                patched[key] = transform(field.type, value);
            }
            return "continue";
        }
        else if (field.repeated) {
            patched[key] = payload[key].map(function (i) {
                var RefMessage = Message.lookup(field.type);
                return patch(RefMessage, i);
            });
        }
        else if (typeof value === "object") {
            var RefMessage = Message.lookupType(field.type);
            patched[key] = patch(RefMessage, value);
        }
        // enum
        else if (typeof value !== "object" &&
            !primitiveTypes.includes(field.type)) {
            var RefMessage = Message.lookup(Message.fields[key].type);
            patched[key] = RefMessage.values[value];
        }
        else {
            patched[key] = value;
        }
    };
    for (var key in Message.fields) {
        _loop_1(key);
    }
    return patched;
}
exports.patch = patch;
