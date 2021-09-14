"use strict";
// export is empty, you can import by "trezor-link/parallel", "trezor-link/lowlevel", "trezor-link/bridge"
Object.defineProperty(exports, "__esModule", { value: true });
var v2_1 = require("./bridge/v2");
var v2_new_1 = require("./bridge/v2-new");
var withSharedConnections_1 = require("./lowlevel/withSharedConnections");
var fallback_1 = require("./fallback");
var webusb_1 = require("./lowlevel/webusb");
// node throw error with version 3.0.0
// https://github.com/github/fetch/issues/657
try {
    require("whatwg-fetch");
}
catch (e) {
    // empty
}
if (typeof window === "undefined") {
    // eslint-disable-next-line quotes
    var fetch_1 = require("node-fetch");
    v2_1.default.setFetch(fetch_1, true);
    v2_new_1.default.setFetch(fetch_1, true);
}
else {
    v2_1.default.setFetch(fetch, false);
    v2_new_1.default.setFetch(fetch, false);
}
exports.default = {
    BridgeV2: v2_1.default,
    BridgeV2New: v2_new_1.default,
    Fallback: fallback_1.default,
    Lowlevel: withSharedConnections_1.default,
    WebUsb: webusb_1.default,
};
