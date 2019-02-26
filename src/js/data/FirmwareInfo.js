/* @flow */

import type { DeviceFirmwareStatus, FirmwareRelease } from '../types';

const releases: Array<FirmwareRelease> = [];

export const parseFirmware = (json: JSON): void => {
    const obj: Object = json;
    Object.keys(obj).forEach(key => {
        const release = obj[key];
        releases.push({ ...release });
    });
};

export const checkFirmware = (fw: Array<number>): DeviceFirmwareStatus => {
    // find all releases for device model
    const modelFirmware = releases.filter(r => r.version[0] === fw[0]);
    // find latest firmware for this model
    const latestFirmware = modelFirmware.filter(r => r.version[1] > fw[1] || (r.version[1] === fw[1] && r.version[2] > fw[2]));
    if (latestFirmware.length > 0) {
        // check if any of releases is required
        const requiredFirmware: ?FirmwareRelease = latestFirmware.find(r => r.required);
        if (requiredFirmware) {
            return 'required';
        } else {
            return 'outdated';
        }
    }
    return 'valid';
};

export const getLatestRelease = (fw: Array<number>): ?FirmwareRelease => {
    // find all releases for device model
    const modelFirmware = releases.filter(r => r.version[0] === fw[0]);
    // find latest firmware for this model
    return modelFirmware.find(r => r.version[1] > fw[1] || (r.version[1] === fw[1] && r.version[2] > fw[2]));
};
