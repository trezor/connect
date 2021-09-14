"use strict";
/* @flow */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOne = void 0;
// Logic of sending data to trezor
//
// Logic of "call" is broken to two parts - sending and receiving
var ByteBuffer = require("bytebuffer");
var patchNew = require("./protobuf/monkey_patch-new").patch;
var HEADER_SIZE = 1 + 1 + 4 + 2;
// Sends message to device.
// Resolves if everything gets sent
function buildOne(messages, name, data) {
    var accessor = "hw.trezor.messages." + name;
    console.log('messages', messages);
    var messageType = 
    // @ts-ignore
    messages.nested.hw.nested.trezor.nested.messages.nested.MessageType.values["MessageType_" + name];
    // @ts-ignore
    var Message = messages.lookupType(accessor);
    var payload = patchNew(Message, data);
    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    var errMsg = Message.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        // throw Error(errMsg);
    }
    // Create a new message
    var message = Message.fromObject(payload, {
        enums: String,
        longs: String,
        bytes: String,
        defaults: true,
        arrays: true,
        objects: true,
        oneofs: true, // includes virtual oneof fields set to the present field's name
    });
    // Encode a message to an Uint8Array (browser) or Buffer (node)
    var buffer = Message.encode(message).finish();
    var headerSize = HEADER_SIZE; // should be 8
    var bytes = new Uint8Array(buffer);
    var fullSize = headerSize - 2 + bytes.length;
    var encodedByteBuffer = new ByteBuffer(fullSize);
    // 2 bytes
    encodedByteBuffer.writeUint16(messageType);
    // 4 bytes (so 8 in total)
    encodedByteBuffer.writeUint32(bytes.length);
    // then put in the actual message
    encodedByteBuffer.append(bytes);
    // and convert to uint8 array
    // (it can still be too long to send though)
    var encoded = new Uint8Array(encodedByteBuffer.buffer);
    // return bytes;
    return Buffer.from(encoded);
}
exports.buildOne = buildOne;
