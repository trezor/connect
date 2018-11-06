/* @flow */
'use strict';

import type { DeviceFirmwareStatus } from '../types';

type Release = {
    required: true,
    version: Array<number>,
    min_bridge_version: Array<number>,
    min_firmware_version: Array<number>,
    min_bootloader_version: Array<number>,
    url: string,
    beta: boolean,
    rollout: number,
    fingerprint: string,
    changelog: string,
    notes: string,
};

const releases: Array<Release> = [];

export const parseFirmware = (json: JSON): void => {
    const obj: Object = json;
    Object.keys(obj).forEach(key => {
        const release = obj[key];
        releases.push({ ...release });
    });
};

export const checkFirmware = (fw: Array<number>): DeviceFirmwareStatus => {
    // find all releases for device model
    const modelFirmware: Array<Release> = releases.filter(r => r.version[0] === fw[0]);
    // find latest firmware for this model
    const latestFirmware: Array<Release> = modelFirmware.filter(r => r.version[1] > fw[1] || (r.version[1] === fw[1] && r.version[2] > fw[2]));
    if (latestFirmware.length > 0) {
        // check if any of releases is required
        const requiredFirmware: ?Release = latestFirmware.find(r => r.required);
        if (requiredFirmware) {
            return 'required';
        } else {
            return 'outdated';
        }
    }
    return 'valid';
};

export const getLatestRelease = (fw: Array<number>): ?Release => {
    // find all releases for device model
    const modelFirmware: Array<Release> = releases.filter(r => r.version[0] === fw[0]);
    // find latest firmware for this model
    return modelFirmware.find(r => r.version[1] > fw[1] || (r.version[1] === fw[1] && r.version[2] > fw[2]));
};
