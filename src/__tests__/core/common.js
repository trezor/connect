import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

export const settings = {
  configSrc: 'base/src/data/config.json', // constant
  debug: false,
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

export const callMethod = (core: Core, payload: any) => {
  core.handleMessage({
    type: 'iframe_call',
    id: 1,
    payload
  }, true);
};
