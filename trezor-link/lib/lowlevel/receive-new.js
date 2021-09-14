"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveOne = void 0;
var ByteBuffer = require("bytebuffer");
var message_decoder_new_1 = require("./protobuf/message_decoder-new");
function receiveOne(messages, data) {
    var byteBuffer = ByteBuffer.concat([data]);
    var typeId = byteBuffer.readUint16();
    var messageTypes = messages.nested.hw.nested.trezor.nested.messages.nested.MessageType.values;
    var messageType = Object.keys(messageTypes)
        .find(function (type) { return messageTypes[type] === typeId; })
        .replace("MessageType_", "");
    var accessor = "hw.trezor.messages." + messageType;
    var Message = messages.lookupType(accessor);
    byteBuffer.readUint32(); // length, ignoring
    return {
        message: (0, message_decoder_new_1.messageToJSON)(Message.decode(byteBuffer.toBuffer())),
        type: messageType,
    };
}
exports.receiveOne = receiveOne;
