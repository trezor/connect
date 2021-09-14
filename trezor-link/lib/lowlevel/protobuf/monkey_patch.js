"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patch = void 0;
var ProtoBuf = require("protobufjs-old-fixed-webpack");
var ByteBuffer = ProtoBuf.ByteBuffer;
var patched = false;
// monkey-patching ProtoBuf,
// so that bytes are loaded and decoded from hexadecimal
// when we expect bytes and we get string
function patch() {
    if (!patched) {
        // @ts-ignore
        ProtoBuf.Reflect.Message.Field.prototype.verifyValueOriginal =
            ProtoBuf.Reflect.Message.Field.prototype.verifyValue;
        // note: don't rewrite this function to arrow (value, skipRepeated) => ....
        // since I need `this` from the original context
        // @ts-ignore
        ProtoBuf.Reflect.Message.Field.prototype.verifyValue = function (value, skipRepeated) {
            var newValue = value;
            if (this.type === ProtoBuf.TYPES.bytes) {
                if (value != null) {
                    if (typeof value === "string") {
                        // @ts-ignore
                        newValue = ByteBuffer.wrap(value, "hex");
                    }
                }
            }
            return this.verifyValueOriginal(newValue, skipRepeated);
        };
    }
    patched = true;
}
exports.patch = patch;
