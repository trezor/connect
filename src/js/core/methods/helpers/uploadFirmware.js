/* @flow */

import type { DefaultMessageResponse, MessageResponse } from '../../../device/DeviceCommands';
import type { FirmwareRequest$ } from '../../../types/response';
import * as trezor from '../../../types/trezor'; // flowtype only

export const uploadFirmware = async (
    typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    payload: Buffer,
    offset?: number,
    length?: number,
    model: number,
): trezor.Success => {
    let response: MessageResponse<trezor.Success | FirmwareRequest$> = {};

    if (model === 1) {
        response = await typedCall('FirmwareUpload', 'Success', {
            payload: payload,
        });
        return response.message;
    }

    if (model === 2) {
        response = await typedCall('FirmwareErase', 'FirmwareRequest', {length: payload.byteLength});

        while (response.type !== 'Success') {
            const start = response.message.offset;
            const end = response.message.offset + response.message.length;
            const chunk = payload.slice(start, end);
            response = await typedCall('FirmwareUpload', 'FirmwareRequest|Success', {
                payload: chunk,
            });
        }
        return response.message;
    }
};
