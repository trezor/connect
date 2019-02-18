/* @flow */

import type { DefaultMessageResponse, MessageResponse } from '../../../device/DeviceCommands';
import type { FirmwareRequest$ } from '../../../types/response';
import * as trezor from '../../../types/trezor'; // flowtype only

export const uploadFirmware = async (
    typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    payload: Buffer,
    offset?: number,
    length?: number,
): trezor.Success => {
    let response: MessageResponse<trezor.Success | FirmwareRequest$> = {};
    let chunk: Buffer;
    let type: string = '';
    while (type !== 'Success') {
        response = await typedCall('FirmwareUpload', 'FirmwareRequest|Success', {
            payload: chunk,
        });

        if (response.message) {
            offset = response.message.offset;
            length = response.message.length;
        }

        if (!isNaN(offset) && !isNaN(length)) {
            const start = offset;
            const end = offset + length;
            chunk = payload.slice(start, end);
        } else {
            chunk = payload;
        }

        type = response.type;
    }

    return response.message;
};
