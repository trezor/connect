/* @flow */
import {
    TRANSPORT,
    TRANSPORT_EVENT,
    UI,
    IFRAME,
    POPUP,
} from '../constants';
import type { ConnectSettings } from './params';
import type { Device } from './trezor/device';
import type { DiscoveryAccount, SelectFeeLevel } from './account';
import type { CoinInfo, BitcoinNetworkInfo } from './networks/coinInfo';

export type TransportInfo = {
    type: string;
    version: string;
    outdated: boolean;
}

export type TransportEvent =
    | {
            event: typeof TRANSPORT_EVENT;
            type: typeof TRANSPORT.START;
            payload: TransportInfo;
        }
    | {
            event: typeof TRANSPORT_EVENT;
            type: typeof TRANSPORT.ERROR;
            payload: string;
        };

/*
* messages to UI emitted as UI_EVENT
*/

export type MessageWithoutPayload = {
    type: typeof UI.REQUEST_UI_WINDOW |
        typeof POPUP.CANCEL_POPUP_REQUEST |
        typeof IFRAME.LOADED |
        typeof POPUP.LOADED |
        typeof UI.TRANSPORT |
        typeof UI.CHANGE_ACCOUNT |
        typeof UI.INSUFFICIENT_FUNDS |
        typeof UI.CLOSE_UI_WINDOW |
        typeof UI.LOGIN_CHALLENGE_REQUEST;
}

export type DeviceMessage = {
    +type: typeof UI.REQUEST_PIN |
        typeof UI.INVALID_PIN |
        typeof UI.REQUEST_PASSPHRASE_ON_DEVICE |
        typeof UI.REQUEST_PASSPHRASE |
        typeof UI.INVALID_PASSPHRASE |
        typeof UI.REQUEST_WORD;
    payload: {
        device: Device;
        type?: string; // todo: better flow enum
    };
};

export type ButtonRequestData = {
    type: 'address';
    serializedPath: string;
    address: string;
};

export type ButtonRequestMessage = {
    type: typeof UI.REQUEST_BUTTON;
    payload: {
        device: Device;
        code: string;
        data: ?ButtonRequestData;
    };
}

export type AddressValidationMessage = {
    type: typeof UI.ADDRESS_VALIDATION;
    payload: ?ButtonRequestData;
}

export type IFrameError = {
    type: typeof IFRAME.ERROR;
    payload: {
        error: string;
    };
}

export type PopupInit = {
    type: typeof POPUP.INIT;
    payload: {
        settings: ConnectSettings; // those are settings from window.opener
    };
}

export type PopupError = {
    type: typeof POPUP.ERROR;
    payload: {
        error: string;
    };
}

export type PopupHandshake = {
    type: typeof POPUP.HANDSHAKE;
    payload?: {
        settings: ConnectSettings; // those are settings from the iframe, they could be different from window.opener settings
        method: ?string;
        transport: ?TransportInfo;
    };
}

export type RequestPermission = {
    type: typeof UI.REQUEST_PERMISSION;
    payload: {
        permissions: Array<string>;
        device: Device;
    };
}

export type RequestConfirmation = {
    type: typeof UI.REQUEST_CONFIRMATION;
    payload: {
        view: string;
        label?: string;
        customConfirmButton?: {
            className: string;
            label: string;
        };
        customCancelButton?: {
            className: string;
            label: string;
        };
    };
}

export type SelectDevice = {
    type: typeof UI.SELECT_DEVICE;
    payload: {
        devices: Array<Device>;
        webusb: boolean;
    };
}

export type UnexpectedDeviceMode = {
    type: typeof UI.BOOTLOADER | typeof UI.NOT_IN_BOOTLOADER | typeof UI.INITIALIZE | typeof UI.SEEDLESS | typeof UI.DEVICE_NEEDS_BACKUP;
    payload: Device;
}

export type FirmwareException = {
    type: typeof UI.FIRMWARE_OLD
        | typeof UI.FIRMWARE_OUTDATED
        | typeof UI.FIRMWARE_NOT_SUPPORTED
        | typeof UI.FIRMWARE_NOT_COMPATIBLE
        | typeof UI.FIRMWARE_NOT_INSTALLED;
    payload: Device;
}

export type SelectAccount = {
    type: typeof UI.SELECT_ACCOUNT;
    payload: {
        type: 'start' | 'progress' | 'end';
        coinInfo: CoinInfo;
        accountTypes?: Array<'normal' | 'segwit' | 'legacy'>;
        accounts?: Array<DiscoveryAccount>;
        preventEmpty?: boolean;
    };
}

export type SelectFee = {
    type: typeof UI.SELECT_FEE;
    payload: {
        coinInfo: BitcoinNetworkInfo;
        feeLevels: Array<SelectFeeLevel>;
    };
}

export type UpdateCustomFee = {
    type: typeof UI.UPDATE_CUSTOM_FEE;
    payload: {
        coinInfo: BitcoinNetworkInfo;
        feeLevels: Array<SelectFeeLevel>;
    };
}

export type BundleProgress = {
    +type: typeof UI.BUNDLE_PROGRESS;
    payload: {
        progress: number;
        response: Object;
    };
}

export type FirmwareProgress = {
    +type: typeof UI.FIRMWARE_PROGRESS;
    payload: {
        device: Device;
        progress: number;
    };
}

export type UiEvent =
    MessageWithoutPayload
    | DeviceMessage
    | PopupHandshake
    | RequestPermission
    | RequestConfirmation
    | SelectDevice
    | UnexpectedDeviceMode
    | SelectAccount
    | SelectFee
    | UpdateCustomFee
    | BundleProgress

/*
export type UiEvent =
| {
      type: | typeof UI.REQUEST_PIN
          | typeof UI.INVALID_PIN
          | typeof UI.REQUEST_PASSPHRASE_ON_DEVICE
          | typeof UI.REQUEST_PASSPHRASE
          | typeof UI.INVALID_PASSPHRASE
          | typeof UI.REQUEST_WORD;
      payload: {
          device: Device;
          type?: string;
      };
  }
| {
      type: typeof UI.REQUEST_BUTTON;
      payload: {
          device: Device;
          code: string;
          data?: ButtonRequestData;
      };
  }
| {
      type: typeof UI.REQUEST_PERMISSION;
      payload: {
          permissions: string[];
          device: Device;
      };
  }
| {
      type: typeof UI.REQUEST_CONFIRMATION;
      payload: {
          view: string;
          label?: string;
          customConfirmButton?: {
              className: string;
              label: string;
          };
          customCancelButton?: {
              className: string;
              label: string;
          };
      };
  }
| {
      type: typeof UI.ADDRESS_VALIDATION;
      payload: ButtonRequestData;
  }
| {
      type: | typeof UI.REQUEST_UI_WINDOW
          | typeof POPUP.CANCEL_POPUP_REQUEST
          | typeof IFRAME.LOADED
          | typeof POPUP.LOADED
          | typeof UI.TRANSPORT
          | typeof UI.CHANGE_ACCOUNT
          | typeof UI.INSUFFICIENT_FUNDS
          | typeof UI.CLOSE_UI_WINDOW
          | typeof UI.LOGIN_CHALLENGE_REQUEST;
      payload?: typeof undefined;
  }
| {
      type: typeof UI.BUNDLE_PROGRESS;
      payload: {
            progress: number;
            response: any;
      };
  }
| {
      type: typeof UI.FIRMWARE_PROGRESS;
      payload: {
          progress: number;
      };
  }
| {
    type: typeof UI.SELECT_DEVICE;
    payload: {
        devices: Device[];
        webusb: boolean;
    };
  }
| {
    type: typeof UI.SELECT_ACCOUNT;
    payload: {
        type: 'start' | 'progress' | 'end';
        coinInfo: CoinInfo;
        accountTypes?: Array<'normal' | 'segwit' | 'legacy'>;
        accounts?: Array<DiscoveryAccount>;
        preventEmpty?: boolean;
    };
  }
| {
    type: typeof UI.SELECT_FEE;
    payload: {
        coinInfo: BitcoinNetworkInfo;
        feeLevels: Array<SelectFeeLevel>;
    };
  }
| {
    type: typeof UI.UPDATE_CUSTOM_FEE;
    payload: {
        coinInfo: BitcoinNetworkInfo;
        feeLevels: Array<SelectFeeLevel>;
    };
  };
*/

/*
* messages from UI passed via TrezorConnect.uiResponse
*/
export type UiResponse =
| {
      type: typeof UI.RECEIVE_PERMISSION;
      payload: {
          granted: boolean;
          remember: boolean;
      };
  }
| {
      type: typeof UI.RECEIVE_CONFIRMATION;
      payload: boolean;
  }
| {
      type: typeof UI.RECEIVE_DEVICE;
      payload: {
          device: Device;
          remember: boolean;
      };
  }
| {
      type: typeof UI.RECEIVE_PIN | typeof UI.RECEIVE_WORD;
      payload: string;
  }
| {
      type: typeof UI.RECEIVE_PASSPHRASE;
      payload: {
          save: boolean;
          value: string;
          passphraseOnDevice?: boolean;
      };
  }
| {
      type: typeof UI.INVALID_PASSPHRASE_ACTION;
      payload: boolean;
  }
| {
      type: typeof UI.RECEIVE_ACCOUNT;
      payload: ?number;
  }
| {
      type: typeof UI.RECEIVE_FEE;
      payload: {
          type: 'compose-custom';
          value: number;
      } | {
          type: 'change-account';
      } | {
          type: 'send';
          value: string;
      };
  };

export type CustomMessageRequest = {
    type: typeof UI.CUSTOM_MESSAGE_REQUEST;
    payload: {
        type: string;
        message: Object;
    };
}
