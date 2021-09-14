"use strict";
// Module for loading the protobuf description from serialized description
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfigure = void 0;
var protobuf = require("protobufjs");
// Parse configure data (it has to be already verified)
function parseConfigure(data) {
    return protobuf.Root.fromJSON(data);
}
exports.parseConfigure = parseConfigure;
