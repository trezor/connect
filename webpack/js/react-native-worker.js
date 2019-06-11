module.exports = function (source, map) {
    this.cacheable();
    return `
    var thread = __webpack_require__("react-native-threads").self;
    var onmessage = function() {}; // to override
    thread.onmessage = function onmessage(data) {
      onmessage({
        data: data
      });
    }
    
    var postMessage = function (m) {
      thread.postMessage(m)
    }
    ${source}
    `;
};

module.exports.foo = function (source, map) {
    this.cacheable();
    return `var onmessage = function() {}; // to override
var callbacks = {
    'message': null,
    'error': null
};

var WorkerWrapper = {
    postMessage: function (args) {
        onmessage({ data: args })
    },
    addEventListener: function (event, fn) {
        callbacks[event] = fn;
    },
    onerror: function () {},
    onmessage: null,
    terminate: function () {}
}

var postMessageTries = 0;
var postMessage = function (args) {
    if (postMessageTries >= 3) {
        postMessageTries = 0;
        return;
    }
    var cb = WorkerWrapper.onmessage || callbacks.message;
    if (typeof cb !== "function") {
        setTimeout(function() {
            postMessage(args);
        }, 200);
    } else {
        postMessageTries = 0;
        cb({ data: args });
    }
}
module.exports = function () {
    ${source}
    return WorkerWrapper
}
`;


// __webpack_require__.r(__webpack_exports__);
// __webpack_exports__["default"] = (function () {
//     return WorkerWrapper;
// });


// module.exports = function() {\n return WorkerWrapper; \n};



// var Worker = function () {
    //     return {
    //         postMessage: function (args) {
    //             onmessage(args)
    //         }
    //         addEventListener: function (event, fn) {
    //             if (events.test(event)) {
    //                 global["on" + event] = global.self["on" + event] = fn;
    //             }
    //         }
    //         close: function () {},
    //         terminate: function () {},
    //     }
    // }
    //var thread = __webpack_require__("react-native-threads").self;
    // global.onmessage = () => {};
    // thread.onmessage = function onmessage(data) {
    //   global.onmessage({
    //     data: data
    //   });
    // }
    
    // global.postMessage = function (m) {
    //   thread.postMessage(m)
    // }
    // `;

    // return prepend + '\n' + source;
};

module.exports.pitch = function (request) {};

