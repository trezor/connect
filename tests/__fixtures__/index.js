import applyFlags from './applyFlags';
import applySettings from './applySettings';
import getAddress from './getAddress';
import getPublicKey from './getPublicKey';
import signTransaction from './signTransaction';
import rippleGetAddress from './rippleGetAddress';
// import binanceSignTransaction from './binanceSignTransaction';
import wipeDevice from './wipeDevice';
import resetDevice from './resetDevice';
import cardanoGetAddress from './cardanoGetAddress';
// import cardanoGetPublicKey from './cardanoGetPublicKey';
// import cardanoSignTransation from './cardanoSignTransaction';

export default [
    applyFlags,
    applySettings,
    getAddress,
    getPublicKey,
    signTransaction,
    rippleGetAddress,
    wipeDevice,
    cardanoGetAddress,

    // TODO: yields different results
    // cardanoSignTransation,

    // TODO: yields different results
    // cardanoGetPublicKey,

    // TODO: needs to wipe device beforeEach test
    // resetDevice,

    // TODO: 2.1.4 returns ui-device_firmware_old
    // binanceSignTransaction,
];
