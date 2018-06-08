
//import { Core, CORE_EVENT, init as initCore, initTransport } from './src/js/core/Core.js';
//import { parse as parseSettings } from '../entrypoints/ConnectSettings';

import 'babel-polyfill';
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

const settings = {
    configSrc: 'base/src/data/config.json', // constant
    debug: true,
    origin: 'localhost',
    priority: 0,
    trustedHost: true,
    connectSrc: '',
    iframeSrc: `iframe.html`,
    popup: false,
    popupSrc: `popup.html`,
    webusbSrc: `webusb.html`,
    coinsSrc: 'base/src/data/coins.json',
    firmwareReleasesSrc: 'base/src/data/releases-1.json',
    transportConfigSrc: 'base/src/data/messages.json',
    customMessages: [],
    latestBridgeSrc: 'base/src/data/latest.txt',
    transportReconnect: false,
    webusb: true,
    pendingTransportEvent: true,
}

describe('Initializing', async () => {



    const core = await initCore(settings);
    checkBrowser();

    let defaultTimeout;
    beforeEach(() => {
        defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
    });

    const handleEvent = (event) => {
        console.log("CORE EVENT", event);
        if (event.type === 'device__connect') {
            const device = event.payload;

            core.handleMessage({
                type: 'iframe_call',
                id: 1,
                payload: {
                    method: 'getPublicKey',
                    path: "m/46'/60'/0'",
                    useEmptyPassphrase: true
                }
            }, true);
        }

        if (event.type === UI.REQUEST_UI_WINDOW) {
            // popup handshake is resolved automatically
            core.handleMessage({ event: 'UI_EVENT', type: POPUP.HANDSHAKE }, true);
            return;
        }

        if (event.type === 'RESPONSE_EVENT') {
            console.warn("THIS IS RESULT WE NEED TO TEST!", event.payload)
        }
    }


    core.on('CORE_EVENT', handleEvent);
    await initTransport(settings);

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
    });
});
