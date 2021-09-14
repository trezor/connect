"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
// This is a simple class that represents information about messages,
// as they are loaded from the protobuf definition,
// so they are understood by both sending and recieving code.
var Messages = /** @class */ (function () {
    function Messages(messages) {
        this.messagesByName = messages;
        var messagesByType = {};
        Object.keys(messages.MessageType).forEach(function (longName) {
            var typeId = messages.MessageType[longName];
            var shortName = longName.split("_")[1];
            // hack hack hack. total lib refactor needed.
            var indexOfDeprecated = longName.indexOf("Deprecated");
            if (indexOfDeprecated >= 0) {
                shortName = longName.substr(indexOfDeprecated);
            }
            messagesByType[typeId] = {
                name: shortName,
                constructor: messages[shortName],
            };
        });
        this.messagesByType = messagesByType;
        this.messageTypes = messages.MessageType;
    }
    return Messages;
}());
exports.Messages = Messages;
