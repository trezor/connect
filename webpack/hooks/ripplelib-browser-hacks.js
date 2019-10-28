"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setPrototypeOf(object, prototype) {
    Object.setPrototypeOf ? Object.setPrototypeOf(object, prototype) :
        object.__proto__ = prototype;
}
exports.setPrototypeOf = setPrototypeOf;
function getConstructorName(object) {
    console.warn("getConstructorName1", object.constructor.name, object.constructor);
    if (!object.constructor.name) {
        const constructorString = object.constructor.toString();
        const functionConstructor = constructorString.match(/^function\s+([^(]*)/);
        const classConstructor = constructorString.match(/^class\s([^\s]*)/);
        try {
            return functionConstructor ? functionConstructor[1] : classConstructor[1];
            // return object.constructor.toString().match(/^function\s+([^(]*)/)[1];
        } catch (error) {
            var str = object.constructor.toString();
            console.warn("getConstructorName:str", str);
            console.warn("getConstructorName:match", object.constructor.toString().match(/^function\s+([^(]*)/));
            console.warn("getConstructorName:error", error);
            return "RippledError";
        }
    }
    return object.constructor.name;
}
exports.getConstructorName = getConstructorName;
