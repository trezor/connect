"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setPrototypeOf(object, prototype) {
    Object.setPrototypeOf ? Object.setPrototypeOf(object, prototype) :
        object.__proto__ = prototype;
}
exports.setPrototypeOf = setPrototypeOf;
function getConstructorName(object) {
    console.warn("getConstructorName1", object.constructor.name);
    if (!object.constructor.name) {
        try {
            return object.constructor.toString().match(/^function\s+([^(]*)/)[1];
        } catch (error) {
            console.warn("getConstructorName1", object.constructor.toString())
            return "RippledError";
        }
    }
    return object.constructor.name;
}
exports.getConstructorName = getConstructorName;
