/* @flow */

import { UiMessage } from '../../../message/builder';
import * as UI from '../../../constants/ui';
import * as DEVICE from '../../../constants/device';

import type { TypedCall, MessageResponse, FirmwareUpload } from '../../../types/trezor/protobuf';
import type { CoreMessage } from '../../../types';
import type { IDevice } from '../../../device/Device';

// firmware does not send button message but user still must press button to continue
// with fw update.
const postConfirmationMessage = (device: IDevice) => {
    // only if firmware is already installed. fresh device does not require button confirmation
    if (device.features.firmware_present) {
        device.emit(DEVICE.BUTTON, device, 'ButtonRequest_FirmwareUpdate');
    }
};

const postProgressMessage = (device, progress, postMessage) => {
    postMessage(UiMessage(UI.FIRMWARE_PROGRESS, {
        device: device.toMessageObject(),
        progress,
    }));
};

export const uploadFirmware = async (
    typedCall: TypedCall,
    postMessage: (message: CoreMessage) => void,
    device: IDevice,
    { payload }: FirmwareUpload,
) => {
    let response: MessageResponse<'Success' | 'FirmwareRequest'> = {};

    if (device.features.major_version === 1) {
        postConfirmationMessage(device);
        await typedCall('FirmwareErase', 'Success', {});
        postProgressMessage(device, 0, postMessage);
        const { message } = await typedCall('FirmwareUpload', 'Success', {
            payload,
        });
        postProgressMessage(device, 100, postMessage);
        return message;
    }

    if (device.features.major_version === 2) {
        postConfirmationMessage(device);
        const length = payload.byteLength;
        // $FlowIssue typedCall problem with unions in response, TODO: accept unions
        response = await typedCall('FirmwareErase', 'FirmwareRequest', { length });
        while (response.type !== 'Success') {
            const start = response.message.offset;
            const end = response.message.offset + response.message.length;
            const chunk = payload.slice(start, end);
            // in this moment, device is still displaying 'update firmware dialog', no firmware process is in progress yet
            if (start > 0) {
                postProgressMessage(device, Math.round((start / length) * 100), postMessage);
            }
            // $FlowIssue typedCall problem with unions in response, TODO: accept unions
            response = await typedCall('FirmwareUpload', 'FirmwareRequest|Success', {
                payload: chunk,
            });
        }
        postProgressMessage(device, 100, postMessage);
        // $FlowIssue typedCall problem with unions in response, TODO: accept unions
        return response.message;
    }
};
